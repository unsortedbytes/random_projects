// Watches every page for the job-application lifecycle and reports it to the
// background worker:
//   APPLY_CLICKED      — user clicked an Apply-style button (intent; the job
//                        details are extracted now, but nothing is logged yet)
//   SUBMIT_CLICKED     — user clicked a final Submit-style button
//   CONFIRMATION_SEEN  — the page shows an "application submitted" message
// The background worker writes the sheet row only when a submission is
// confirmed (unless smart-confirm mode is turned off).

(() => {
  // Guard against double-injection (manifest + programmatic re-inject).
  if (window.__jobTrackerLoaded) return;
  window.__jobTrackerLoaded = true;

  const INTENT_PATTERNS = [
    /\beasy apply\b/i,
    /\bquick apply\b/i,
    /\bapply now\b/i,
    /\bapply (today|here|online)\b/i,
    /\bapply for (this )?(job|position|role)\b/i,
    /\bi'?m interested\b/i,
    /\binterested\b/i, // Instahyre
    /^apply$/i // exact-label Apply buttons (Oracle HCM, Workday, Naukri)
  ];

  // Final-step buttons that mean the application was actually sent.
  const SUBMIT_PATTERNS = [
    /^submit$/i,
    /\bsubmit (my |your )?application\b/i,
    /^send application$/i,
    /^finish application$/i,
    /^complete application$/i
  ];

  // Button text that looks apply-ish but isn't a job application.
  const EXCLUDE_PATTERNS = [
    /\bapply (filters?|changes|settings|coupon|code|discount|now and save)\b/i,
    /\balready applied\b/i,
    /\bapplied\b/i
  ];

  // Known apply-button selectors on major job sites — caught even when the
  // visible label is an icon or non-matching text.
  const KNOWN_APPLY_SELECTORS = [
    '.jobs-apply-button',                  // LinkedIn
    'button[data-control-name="jobdetails_topcard_inapply"]', // LinkedIn (old)
    '#apply-button',                        // Naukri
    'button[id*="apply" i]',
    'a[id*="apply" i]',
    'button[data-automation-id*="apply" i]', // Workday
    'a[data-automation-id*="apply" i]'
  ].join(', ');

  // "Application submitted" style success messages.
  const CONFIRM_PATTERNS = [
    /application (?:was |has been |is )?(?:successfully )?(?:submitted|received|sent|completed)/i,
    /your application (?:was|has been|is) (?:submitted|received|sent)/i,
    /thank you for (?:your )?(?:application|applying)/i,
    /you(?:'ve| have) (?:successfully )?applied\b/i,
    /successfully applied\b/i,
    /application sent\b/i
  ];

  // Don't send the same intent twice within this window (multi-step forms
  // fire several apply-ish clicks).
  const DEDUPE_WINDOW_MS = 10 * 60 * 1000;
  let lastIntentUrl = null;
  let lastIntentAt = 0;
  let confirmationSent = false;

  function getLabel(clickable) {
    return (
      clickable.innerText ||
      clickable.value ||
      clickable.getAttribute('aria-label') ||
      clickable.getAttribute('title') ||
      ''
    )
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Returns 'submit', 'intent', or null for a click target.
  function classifyClick(el) {
    // Walk up from the click target to find a button/link, since job sites
    // wrap the label text in spans inside the button.
    const clickable = el.closest(
      'button, a, [role="button"], input[type="submit"], input[type="button"]'
    );
    if (!clickable) return null;

    const text = getLabel(clickable);
    if (text && text.length <= 60) {
      if (SUBMIT_PATTERNS.some((re) => re.test(text))) return 'submit';
      if (EXCLUDE_PATTERNS.some((re) => re.test(text))) return null;
      if (INTENT_PATTERNS.some((re) => re.test(text))) return 'intent';
    }
    if (!text || text.length <= 60) {
      if (clickable.matches(KNOWN_APPLY_SELECTORS)) return 'intent';
    }
    return null;
  }

  function collectPageContent() {
    // Cap the text so huge pages don't blow past Gemini's free-tier limits.
    const MAX_CHARS = 15000;
    let text = document.body ? document.body.innerText : '';
    text = text.replace(/\n{3,}/g, '\n\n').slice(0, MAX_CHARS);

    const isFrame = window !== window.top;
    return {
      // For embedded forms the parent page URL identifies the job better
      // than the iframe's own URL.
      url: isFrame && document.referrer ? document.referrer : location.href,
      title: document.title,
      hostname: location.hostname,
      text
    };
  }

  function send(type, extra) {
    try {
      chrome.runtime.sendMessage(
        { type, page: collectPageContent(), ...extra },
        (res) => {
          if (chrome.runtime.lastError) return; // extension reloaded — ignore
          if (type === 'APPLY_CLICKED' && res && (!res.ok || res.skipped)) {
            // Failed or tracking paused — allow the next click to retry.
            lastIntentUrl = null;
          }
        }
      );
    } catch (e) {
      // Extension was reloaded since this page loaded — ignore.
    }
  }

  // The popup's "Log this page" button asks the top frame for its content.
  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg.type === 'COLLECT_PAGE') {
      sendResponse(collectPageContent());
    }
  });

  document.addEventListener(
    'click',
    (event) => {
      const target = event.target instanceof Element ? event.target : null;
      if (!target) return;

      const kind = classifyClick(target);
      if (!kind) return;

      if (kind === 'submit') {
        // Always forwarded — the background worker decides whether a pending
        // application exists for it.
        send('SUBMIT_CLICKED');
        return;
      }

      const now = Date.now();
      if (location.href === lastIntentUrl && now - lastIntentAt < DEDUPE_WINDOW_MS) {
        return;
      }
      lastIntentUrl = location.href;
      lastIntentAt = now;
      send('APPLY_CLICKED');
    },
    true // capture phase, so we see the click even if the site stops propagation
  );

  // Watch for success messages for a while after load — confirmation pages
  // and SPA modals ("Application sent!") often render late.
  function checkConfirmation() {
    if (confirmationSent || !document.body) return;
    const sample = document.body.innerText.slice(0, 30000);
    if (CONFIRM_PATTERNS.some((re) => re.test(sample))) {
      confirmationSent = true;
      send('CONFIRMATION_SEEN');
    }
  }
  for (const delay of [1500, 4000, 10000, 25000, 45000]) {
    setTimeout(checkConfirmation, delay);
  }
})();
