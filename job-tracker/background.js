// Service worker: tracks the job-application lifecycle reported by
// content.js, extracts structured job data with Gemini, and writes rows to
// the user's Google Sheet through their Apps Script web app.
//
// Two-phase smart tracking (default):
//   APPLY click   -> job details extracted immediately (the listing page has
//                    the richest text) and held as a pending intent
//   SUBMIT click / "application submitted" text -> the pending row is written
//   No submission within 60 min -> the intent silently expires; abandoning a
//                    form never creates a sheet row
// One-click sites where Apply IS the submission (Naukri, Instahyre) log
// instantly, as does everything when smart-confirm is toggled off.
//
// Resilience model — a confirmed application is never lost:
//   Gemini overloaded  -> retry with backoff, then fall back to a lighter model
//   Gemini fully down  -> heuristic extraction from the page title
//   Sheet unreachable  -> row queued in chrome.storage.local, flushed later
//   Same job again     -> deduped locally (persistent) and in the sheet itself

// Tried in order — if the first model is overloaded (503) or rate-limited
// (429), we retry and then fall back to the next.
const GEMINI_MODELS = ['gemini-2.5-flash', 'gemini-2.5-flash-lite'];

const LOGGED_URLS_CAP = 1000;
const INTENT_TTL_MS = 60 * 60 * 1000;       // pending intents live 1 hour
const CONFIRM_COOLDOWN_MS = 10 * 60 * 1000; // ignore stray Submits after one

// Hosts where clicking Apply submits the application in one step.
const ONE_CLICK_HOSTS = ['naukri.com', 'instahyre.com'];

// In-flight guard: the page and an embedded apply iframe can fire for the
// same job within milliseconds, before storage-based state catches up.
const inFlight = new Set();

const sleep = (ms) => new Promise((r) => setTimeout (r, ms));

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const tabId = sender.tab?.id ?? -1;

  if (message.type === 'APPLY_CLICKED') {
    handleIntent(message.page, tabId)
      .then((result) => sendResponse(result))
      .catch((err) => {
        console.error('Job tracker failed:', err);
        sendResponse({ ok: false, error: String(err) });
      });
    return true;
  }

  if (message.type === 'SUBMIT_CLICKED' || message.type === 'CONFIRMATION_SEEN') {
    handleConfirmation(message.page, tabId, {
      // Submit clicks on a job-ish page can log even with no pending intent
      // (e.g. Greenhouse forms that live directly on the listing page);
      // passive text sightings only ever confirm an existing intent.
      allowFallback: message.type === 'SUBMIT_CLICKED'
    })
      .then((result) => sendResponse(result))
      .catch((err) => {
        console.error('Job tracker failed:', err);
        sendResponse({ ok: false, error: String(err) });
      });
    return true;
  }

  if (message.type === 'MANUAL_LOG') {
    manualLog()
      .then((result) => sendResponse(result))
      .catch((err) => sendResponse({ ok: false, error: String(err.message || err) }));
    return true;
  }

  if (message.type === 'GET_STATS') {
    getStats()
      .then((stats) => sendResponse(stats))
      .catch(() => sendResponse({ ok: false }));
    return true;
  }
});

// After install or reload, old tabs hold orphaned content scripts that can't
// talk to this worker — re-inject so the user never has to refresh tabs.
chrome.runtime.onInstalled.addListener(async () => {
  const tabs = await chrome.tabs.query({ url: ['http://*/*', 'https://*/*'] });
  for (const tab of tabs) {
    chrome.scripting
      .executeScript({
        target: { tabId: tab.id, allFrames: true },
        files: ['content.js']
      })
      .catch(() => {}); // chrome://, Web Store, discarded tabs — fine to skip
  }
});

// Retry queued rows when the browser starts and every 10 minutes; the same
// tick prunes expired pending intents.
chrome.runtime.onStartup.addListener(() => flushPendingQueue());
chrome.alarms.create('flush-pending', { periodInMinutes: 10 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'flush-pending') {
    flushPendingQueue();
    prunePendingIntents();
  }
});

// Keep the badge in sync with the tracking toggle.
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync' && changes.trackingEnabled) {
    if (changes.trackingEnabled.newValue === false) {
      setBadge('OFF', '#5f6368');
    } else {
      chrome.action.setBadgeText({ text: '' });
    }
  }
});

async function getSettings() {
  return chrome.storage.sync.get([
    'geminiApiKey',
    'appsScriptUrl',
    'sheetName',
    'trackingEnabled',
    'smartConfirm'
  ]);
}

function assertConfigured(settings) {
  if (!settings.geminiApiKey || !settings.appsScriptUrl) {
    throw new Error('Missing Gemini API key or Apps Script URL — open extension settings.');
  }
}

// e.g. boards.greenhouse.io -> greenhouse.io (good enough for matching an
// application flow that hops between subdomains).
function baseDomain(hostname) {
  const parts = (hostname || '').toLowerCase().split('.').filter(Boolean);
  return parts.slice(-2).join('.');
}

function isOneClickHost(hostname) {
  const d = baseDomain(hostname);
  return ONE_CLICK_HOSTS.some((h) => d === h);
}

// Heuristic: does this page look like a job/application page at all? Used to
// stop bare "Submit" buttons on random forms from creating rows.
function looksJobish(page) {
  const probe = `${page.url} ${page.title} ${(page.text || '').slice(0, 4000)}`;
  return /\b(job|jobs|career|careers|position|vacancy|opening|recruit|applicant|application)\b/i.test(probe);
}

// ---------- Apply intent ----------

async function handleIntent(page, tabId) {
  const settings = await getSettings();
  if (settings.trackingEnabled === false) return { ok: true, skipped: 'tracking-off' };
  assertConfigured(settings);

  // Smart-confirm off, or a one-click site: old behavior, log right away.
  if (settings.smartConfirm === false || isOneClickHost(page.hostname)) {
    return instantLog(page);
  }

  if (await isRecentlyLogged(page.url)) return { ok: true, deduped: true };
  if (inFlight.has(page.url)) return { ok: true, deduped: true };

  const pending = await getPendingIntents();
  if (pending[page.url]) {
    // Re-click on the same listing — refresh the clock, don't re-extract.
    pending[page.url].ts = Date.now();
    await setPendingIntents(pending);
    return { ok: true, pending: true };
  }

  inFlight.add(page.url);
  setBadge('...', '#1a73e8');
  try {
    const row = buildRow(page, await extractJob(settings.geminiApiKey, page));
    pending[page.url] = {
      row,
      domain: baseDomain(page.hostname),
      tabId,
      ts: Date.now()
    };
    await setPendingIntents(pending);

    // Armed — waiting for the actual submission.
    setBadge('PND', '#f9ab00');
    return { ok: true, pending: true };
  } finally {
    inFlight.delete(page.url);
    clearBadgeSoon();
  }
}

// ---------- Submission confirmation ----------

async function handleConfirmation(page, tabId, { allowFallback }) {
  const settings = await getSettings();
  if (settings.trackingEnabled === false) return { ok: true, skipped: 'tracking-off' };

  // Smart-confirm off → intents were already logged instantly; a submit
  // click can still be the only signal on pages with no Apply button.
  if (settings.smartConfirm === false && !allowFallback) {
    return { ok: true, ignored: true };
  }

  const pending = await getPendingIntents();
  const now = Date.now();

  // Prefer the newest intent from the same site; a cross-domain ATS hop
  // (career page -> workday form) falls back to the newest intent overall.
  const candidates = Object.entries(pending)
    .filter(([, p]) => now - p.ts < INTENT_TTL_MS)
    .sort((a, b) => b[1].ts - a[1].ts);
  const sameDomain = candidates.find(([, p]) => p.domain === baseDomain(page.hostname));
  const match = sameDomain || candidates[0];

  if (match) {
    const [url, intent] = match;
    delete pending[url];
    await setPendingIntents(pending);
    await rememberConfirmedTab(tabId);
    assertConfigured(settings);
    return deliverRow(settings, intent.row);
  }

  if (!allowFallback) return { ok: true, ignored: true };

  // A Submit click with nothing pending: only log if this looks like a job
  // application at all, and not right after we already confirmed one here
  // (multi-step forms can have several Submit-ish buttons).
  if (!looksJobish(page)) return { ok: true, ignored: true };
  if (await wasTabConfirmedRecently(tabId)) return { ok: true, ignored: true };

  assertConfigured(settings);
  if (await isRecentlyLogged(page.url)) return { ok: true, deduped: true };
  await rememberConfirmedTab(tabId);
  return instantLog(page);
}

// ---------- Shared pipeline ----------

async function instantLog(page) {
  if (await isRecentlyLogged(page.url)) return { ok: true, deduped: true };
  if (inFlight.has(page.url)) return { ok: true, deduped: true };

  inFlight.add(page.url);
  setBadge('...', '#1a73e8');
  try {
    const settings = await getSettings();
    const row = buildRow(page, await extractJob(settings.geminiApiKey, page));
    return await deliverRow(settings, row);
  } finally {
    inFlight.delete(page.url);
    clearBadgeSoon();
  }
}

// Writes a finished row to the sheet (or queue) and handles all UX.
async function deliverRow(settings, row) {
  setBadge('...', '#1a73e8');
  try {
    const sent = await trySendToSheet(settings, row);
    await markLogged(row.url);

    if (sent.duplicate) {
      setBadge('DUP', '#f9ab00');
      notify('Already tracked', `${row.role || 'This job'} is already in your sheet.`);
      return { ok: true, duplicate: true };
    }
    if (sent.queued) {
      setBadge('QUE', '#f9ab00');
      notify('Saved offline', `${label(row)} — will sync to your sheet automatically.`);
      return { ok: true, queued: true };
    }

    setBadge('OK', '#188038');
    notify('Application tracked', label(row));
    return { ok: true };
  } catch (err) {
    setBadge('ERR', '#d93025');
    notify('Job tracker error', String(err.message || err));
    throw err;
  } finally {
    clearBadgeSoon();
  }
}

// Gemini extraction with a title-heuristic fallback so a row always exists.
async function extractJob(apiKey, page) {
  try {
    return await extractJobWithGemini(apiKey, page);
  } catch (err) {
    console.warn('Gemini extraction failed, using title fallback:', err);
    return fallbackExtract(page);
  }
}

// ---------- Pending-intent storage ----------

async function getPendingIntents() {
  const { pendingIntents = {} } = await chrome.storage.local.get('pendingIntents');
  return pendingIntents;
}

async function setPendingIntents(pendingIntents) {
  await chrome.storage.local.set({ pendingIntents });
}

async function prunePendingIntents() {
  const pending = await getPendingIntents();
  const now = Date.now();
  let changed = false;
  for (const [url, p] of Object.entries(pending)) {
    if (now - p.ts >= INTENT_TTL_MS) {
      delete pending[url];
      changed = true;
    }
  }
  if (changed) await setPendingIntents(pending);
}

async function rememberConfirmedTab(tabId) {
  const { confirmedTabs = {} } = await chrome.storage.local.get('confirmedTabs');
  const now = Date.now();
  for (const [t, ts] of Object.entries(confirmedTabs)) {
    if (now - ts > CONFIRM_COOLDOWN_MS) delete confirmedTabs[t];
  }
  confirmedTabs[tabId] = now;
  await chrome.storage.local.set({ confirmedTabs });
}

async function wasTabConfirmedRecently(tabId) {
  const { confirmedTabs = {} } = await chrome.storage.local.get('confirmedTabs');
  const ts = confirmedTabs[tabId];
  return !!ts && Date.now() - ts < CONFIRM_COOLDOWN_MS;
}

// ---------- Gemini extraction ----------

async function extractJobWithGemini(apiKey, page) {
  let lastError;
  for (const model of GEMINI_MODELS) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        return await callGemini(apiKey, model, page);
      } catch (err) {
        lastError = err;
        if (!err.retryable) throw err;
        await sleep(2000 * (attempt + 1)); // 2s, 4s, then next model
      }
    }
  }
  throw lastError;
}

async function callGemini(apiKey, model, page) {
  const prompt = `You are a job posting parser. Below is the text content of a job page the user just applied to. Extract the job details.

Rules:
- "company": the hiring company name (not the job board name).
- "role": the job title, including level if present (e.g. "SDE-2 Backend").
- "location": city and/or "Remote"/"Hybrid". Empty string if not found.
- "salary": the stated compensation range as written (e.g. "18-24 LPA", "$120k-$150k"). Empty string if not stated.
- "skills": comma-separated list of the key technical skills required (max 8).
- Use empty strings for anything you cannot find. Never invent values.

Page URL: ${page.url}
Page title: ${page.title}

Page content:
${page.text}`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0,
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'OBJECT',
            properties: {
              company: { type: 'STRING' },
              role: { type: 'STRING' },
              location: { type: 'STRING' },
              salary: { type: 'STRING' },
              skills: { type: 'STRING' }
            },
            required: ['company', 'role', 'location', 'salary', 'skills']
          }
        }
      })
    }
  );

  if (!res.ok) {
    const body = await res.text();
    const err = new Error(`Gemini API error ${res.status}: ${body}`);
    err.retryable = res.status === 503 || res.status === 429 || res.status >= 500;
    throw err;
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini returned no content.');
  return JSON.parse(text);
}

// Best-effort extraction from the tab title when Gemini is unreachable.
// Titles usually look like "Role - Company | LinkedIn" or "Role at Company".
function fallbackExtract(page) {
  const SITE_WORDS = /\b(linkedin|naukri|indeed|instahyre|glassdoor|wellfound|greenhouse|lever|workday|careers?|jobs?|hiring)\b/i;

  let title = (page.title || '')
    .replace(/^\(\d+\)\s*/, '') // "(3) Role …" unread-count prefix
    .trim();

  const atMatch = title.match(/^(.{3,80}?)\s+at\s+(.{2,60}?)(\s*[|\-–—].*)?$/i);
  if (atMatch) {
    return { company: atMatch[2].trim(), role: atMatch[1].trim(), location: '', salary: '', skills: '' };
  }

  // Split on "|" or on dashes only when spaced, so "SDE-2" stays intact.
  const parts = title
    .split(/\s+[-–—]\s+|\s*\|\s*/)
    .map((p) => p.trim())
    .filter((p) => p && !SITE_WORDS.test(p));

  return {
    company: parts[1] || '',
    role: parts[0] || '',
    location: '',
    salary: '',
    skills: ''
  };
}

// ---------- Sheet writing + offline queue ----------

function buildRow(page, job) {
  const dateApplied = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  return {
    company: job.company || '',
    role: job.role || '',
    location: job.location || '',
    salary: job.salary || '',
    skills: job.skills || '',
    dateApplied,
    source: sourceFromHostname(page.hostname),
    url: page.url,
    status: 'Applied'
  };
}

// Returns { duplicate } on success, { queued: true } if the sheet was
// unreachable and the row was stored for later.
async function trySendToSheet(settings, row) {
  try {
    const result = await postToSheet(settings, row);
    flushPendingQueue(); // good moment to drain anything queued earlier
    return { duplicate: !!result.duplicate };
  } catch (err) {
    // Config errors won't fix themselves — surface them instead of queueing.
    if (err.permanent) throw err;
    await queueRow(settings, row);
    return { queued: true };
  }
}

async function postToSheet(settings, row) {
  const payload = { ...row, sheetName: settings.sheetName || '' };

  const res = await fetch(settings.appsScriptUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    // Apps Script doPost reads e.postData.contents — must use text/plain to
    // avoid a CORS preflight that Apps Script doesn't handle.
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    throw new Error(`Apps Script error ${res.status}: ${await res.text()}`);
  }

  // Apps Script returns HTTP 200 even when doPost throws — the error is in
  // the JSON body, so check it.
  const body = await res.text();
  let result;
  try {
    result = JSON.parse(body);
  } catch {
    // Non-JSON body usually means the URL is a login/permission page —
    // the deployment isn't set to "Anyone".
    const err = new Error(
      'Apps Script did not return JSON. Redeploy the web app with access set to "Anyone".'
    );
    err.permanent = true;
    throw err;
  }
  if (!result.ok) {
    const err = new Error(`Sheet write failed: ${result.error}`);
    err.permanent = true;
    throw err;
  }
  return result;
}

async function queueRow(settings, row) {
  const { pendingQueue = [] } = await chrome.storage.local.get('pendingQueue');
  pendingQueue.push({ row, sheetName: settings.sheetName || '', queuedAt: Date.now() });
  await chrome.storage.local.set({ pendingQueue });
}

let flushing = false;
async function flushPendingQueue() {
  if (flushing) return;
  flushing = true;
  try {
    const { pendingQueue = [] } = await chrome.storage.local.get('pendingQueue');
    if (!pendingQueue.length) return;

    const settings = await chrome.storage.sync.get(['appsScriptUrl', 'sheetName']);
    if (!settings.appsScriptUrl) return;

    const remaining = [];
    for (const item of pendingQueue) {
      try {
        await postToSheet(
          { appsScriptUrl: settings.appsScriptUrl, sheetName: item.sheetName },
          item.row
        );
      } catch (err) {
        if (!err.permanent) remaining.push(item); // still offline — keep it
      }
    }
    await chrome.storage.local.set({ pendingQueue: remaining });

    const flushed = pendingQueue.length - remaining.length;
    if (flushed > 0) {
      notify('Synced', `${flushed} queued application${flushed > 1 ? 's' : ''} written to your sheet.`);
    }
  } finally {
    flushing = false;
  }
}

// ---------- Persistent dedupe ----------

async function isRecentlyLogged(url) {
  const { loggedUrls = {} } = await chrome.storage.local.get('loggedUrls');
  return !!loggedUrls[url];
}

async function markLogged(url) {
  const { loggedUrls = {} } = await chrome.storage.local.get('loggedUrls');
  loggedUrls[url] = Date.now();

  const entries = Object.entries(loggedUrls);
  if (entries.length > LOGGED_URLS_CAP) {
    entries.sort((a, b) => a[1] - b[1]);
    for (const [u] of entries.slice(0, entries.length - LOGGED_URLS_CAP)) {
      delete loggedUrls[u];
    }
  }
  await chrome.storage.local.set({ loggedUrls });
}

// ---------- Manual logging & stats (popup) ----------

async function manualLog() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) throw new Error('No active tab.');

  // Ask the content script first; if it's missing/orphaned, read the page
  // directly via the scripting API.
  let page = await new Promise((resolve) => {
    chrome.tabs.sendMessage(tab.id, { type: 'COLLECT_PAGE' }, { frameId: 0 }, (res) => {
      if (chrome.runtime.lastError || !res) resolve(null);
      else resolve(res);
    });
  });

  if (!page) {
    try {
      const [{ result }] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => ({
          url: location.href,
          title: document.title,
          hostname: location.hostname,
          text: (document.body ? document.body.innerText : '')
            .replace(/\n{3,}/g, '\n\n')
            .slice(0, 15000)
        })
      });
      page = result;
    } catch {
      throw new Error('Cannot read this page (browser pages and the Web Store are off-limits).');
    }
  }

  const settings = await getSettings();
  assertConfigured(settings);

  // Manual = the user explicitly wants it logged now; skip the local dedupe
  // (the sheet itself still blocks true duplicates) and any pending intent
  // for this URL is consumed.
  const pending = await getPendingIntents();
  if (pending[page.url]) {
    const row = pending[page.url].row;
    delete pending[page.url];
    await setPendingIntents(pending);
    return deliverRow(settings, row);
  }

  const row = buildRow(page, await extractJob(settings.geminiApiKey, page));
  return deliverRow(settings, row);
}

async function getStats() {
  const { pendingQueue = [] } = await chrome.storage.local.get('pendingQueue');
  const pendingIntents = await getPendingIntents();
  const settings = await chrome.storage.sync.get(['appsScriptUrl', 'sheetName']);

  let total = null;
  let recent = [];
  if (settings.appsScriptUrl) {
    try {
      const url = `${settings.appsScriptUrl}?sheet=${encodeURIComponent(settings.sheetName || '')}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.ok) {
        total = data.total;
        recent = data.recent || [];
      }
    } catch {
      // Old script version or offline — stats are optional.
    }
  }

  const now = Date.now();
  const awaiting = Object.values(pendingIntents).filter(
    (p) => now - p.ts < INTENT_TTL_MS
  ).length;

  return { ok: true, total, recent, pending: pendingQueue.length, awaiting };
}

// ---------- Helpers ----------

function label(row) {
  if (row.role && row.company) return `${row.role} @ ${row.company}`;
  return row.role || row.company || row.url;
}

function sourceFromHostname(hostname) {
  const h = (hostname || '').toLowerCase();
  if (h.includes('linkedin')) return 'LinkedIn';
  if (h.includes('naukri')) return 'Naukri';
  if (h.includes('instahyre')) return 'Instahyre';
  if (h.includes('greenhouse')) return 'Greenhouse';
  if (h.includes('lever.co')) return 'Lever';
  if (h.includes('myworkday')) return 'Workday';
  if (h.includes('wellfound') || h.includes('angel.co')) return 'Wellfound';
  if (h.includes('indeed')) return 'Indeed';
  return 'Company Site';
}

function setBadge(text, color) {
  chrome.action.setBadgeText({ text });
  chrome.action.setBadgeBackgroundColor({ color });
}

function clearBadgeSoon() {
  setTimeout(() => {
    chrome.action.getBadgeText({}, (t) => {
      if (t !== 'OFF' && t !== '...') chrome.action.setBadgeText({ text: '' });
    });
  }, 6000);
}

function notify(title, message) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: chrome.runtime.getURL('icons/icon128.png'),
    title,
    message: String(message).slice(0, 300)
  });
}
