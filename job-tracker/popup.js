const fields = ['geminiApiKey', 'appsScriptUrl', 'sheetName'];
const statusEl = document.getElementById('status');
const logNowBtn = document.getElementById('logNow');
const toggleEl = document.getElementById('trackingEnabled');

function showStatus(text, ok) {
  statusEl.textContent = text;
  statusEl.className = ok ? 'ok' : 'err';
}

const smartEl = document.getElementById('smartConfirm');

// Load saved settings.
chrome.storage.sync.get([...fields, 'trackingEnabled', 'smartConfirm'], (saved) => {
  for (const f of fields) {
    if (saved[f]) document.getElementById(f).value = saved[f];
  }
  toggleEl.checked = saved.trackingEnabled !== false; // default on
  smartEl.checked = saved.smartConfirm !== false;     // default on
});

toggleEl.addEventListener('change', () => {
  chrome.storage.sync.set({ trackingEnabled: toggleEl.checked });
  showStatus(toggleEl.checked ? 'Tracking on' : 'Tracking paused', toggleEl.checked);
});

smartEl.addEventListener('change', () => {
  chrome.storage.sync.set({ smartConfirm: smartEl.checked });
  showStatus(
    smartEl.checked ? 'Logging only confirmed submissions' : 'Logging every Apply click',
    true
  );
});

document.getElementById('save').addEventListener('click', () => {
  const values = {};
  for (const f of fields) {
    values[f] = document.getElementById(f).value.trim();
  }

  if (!values.geminiApiKey || !values.appsScriptUrl) {
    showStatus('Gemini key and Apps Script URL are required.', false);
    return;
  }
  if (!values.appsScriptUrl.startsWith('https://script.google.com/macros/s/')) {
    showStatus('Apps Script URL looks wrong — deploy your script as a web app first.', false);
    return;
  }

  chrome.storage.sync.set(values, () => {
    showStatus('Settings saved', true);
    loadStats();
  });
});

logNowBtn.addEventListener('click', () => {
  logNowBtn.disabled = true;
  showStatus('Reading page & extracting…', true);
  chrome.runtime.sendMessage({ type: 'MANUAL_LOG' }, (res) => {
    logNowBtn.disabled = false;
    if (chrome.runtime.lastError || !res) {
      showStatus('Extension busy — try again.', false);
    } else if (!res.ok) {
      showStatus(res.error || 'Failed.', false);
    } else if (res.duplicate) {
      showStatus('Already in your sheet.', true);
    } else if (res.queued) {
      showStatus('Saved — will sync when online.', true);
    } else {
      showStatus('Logged to your sheet ✓', true);
    }
    loadStats();
  });
});

function loadStats() {
  chrome.runtime.sendMessage({ type: 'GET_STATS' }, (stats) => {
    if (chrome.runtime.lastError || !stats || !stats.ok) return;

    document.getElementById('stats').hidden = false;
    document.getElementById('statTotal').textContent =
      stats.total === null ? '—' : stats.total;
    document.getElementById('statAwaiting').textContent = stats.awaiting ?? 0;
    document.getElementById('statPending').textContent = stats.pending;

    const list = document.getElementById('recentList');
    list.textContent = '';
    if (stats.recent && stats.recent.length) {
      const head = document.createElement('div');
      head.className = 'line muted';
      head.textContent = 'Recent:';
      list.appendChild(head);
      for (const r of stats.recent) {
        const line = document.createElement('div');
        line.className = 'line';
        const name = document.createElement('span');
        name.textContent = [r.role, r.company].filter(Boolean).join(' @ ') || '(untitled)';
        const st = document.createElement('b');
        st.textContent = r.status || '';
        line.append(name, st);
        list.appendChild(line);
      }
    }
  });
}

loadStats();
