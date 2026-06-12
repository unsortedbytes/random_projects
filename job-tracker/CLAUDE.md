# Job Application Tracker — Chrome Extension

Chrome MV3 extension that auto-logs job applications to the user's Google Sheet.
Click Apply on a job site → job details extracted with **Gemini (free tier, NOT Claude — user's explicit choice)** → row appended via a **Google Apps Script web app** (no OAuth).

## Architecture

```
content.js (all pages, all frames)
  ├─ APPLY_CLICKED      → apply-style button clicked (intent only)
  ├─ SUBMIT_CLICKED     → final submit-style button clicked
  ├─ CONFIRMATION_SEEN  → "application submitted" text spotted on page
  └─ COLLECT_PAGE       ← popup's "Log This Page" asks for page content
        ↓ chrome.runtime messages
background.js (service worker)
  ├─ Gemini extraction: gemini-2.5-flash → retry w/ backoff → gemini-2.5-flash-lite
  │    └─ total failure → fallbackExtract() heuristics on page title
  ├─ Two-phase tracking: intent held in storage.local.pendingIntents until
  │    submit/confirmation; expires after 1h (INTENT_TTL_MS); abandoned forms log nothing
  │    └─ ONE_CLICK_HOSTS (naukri, instahyre) + smartConfirm=false → log instantly
  ├─ Dedupe: storage.local.loggedUrls (cap 1000) + in-memory inFlight set
  └─ Sheet write: POST JSON to Apps Script URL (Content-Type: text/plain!)
       └─ failure → storage.local.pendingQueue, flushed by alarm every 10 min
        ↓ HTTPS POST
apps-script.gs (lives in the USER'S sheet, not executed here)
  ├─ doPost: dedupe by Job URL column (H), auto-create tab w/ header, appendRow
  └─ doGet: stats {total, recent[3]} for the popup
```

## Critical gotchas — learned the hard way

- **Apps Script POST must use `Content-Type: text/plain`** — anything else triggers a CORS preflight that Apps Script can't answer.
- **Apps Script returns HTTP 200 even when doPost throws** — always parse the JSON body and check `result.ok`. Responses arrive via 302 redirect to `script.googleusercontent.com` (must stay in host_permissions).
- **Apps Script changes need a redeploy**: Deploy → Manage deployments → ✏️ → "New version" → Deploy. Saving the file alone does nothing. The `/exec` URL never changes.
- **Do NOT use chrome.identity/OAuth for Sheets** — tried it; Google's consent-screen verification + test-user flow blocked the user. The Apps Script web app ("Execute as: Me", "Anyone") replaced it on 2026-06-12.
- **User's Gemini API key starts with `AQ.`** — new AI Studio key format, not the old `AIza…`. Don't "correct" it.
- **Extension reloads orphan content scripts in open tabs** — handled by `onInstalled` re-injection (guarded by `window.__jobTrackerLoaded`). Mid-edit reloads by the user caused stale ReferenceErrors in chrome://extensions before; those error entries persist until "Clear all" and show CURRENT file content beside OLD errors — check timestamps before debugging.
- **JSON manifest**: no trailing commas (broke the extension once).
- **Title fallback splitter**: only split on dashes surrounded by spaces or "SDE-2" becomes role "SDE", company "2 Backend".

## Verification without a browser

No build, no deps, plain JS. Validate with:
```bash
node --check content.js background.js popup.js
python3 -m json.tool manifest.json
```
For behavior: write a Node smoke test that stubs `chrome.*` + `fetch`, loads
`background.js` via `vm.runInThisContext`, and drives the message listener
(APPLY_CLICKED → SUBMIT_CLICKED etc.). This caught real bugs twice; previous
test covered: abandoned intent, submit confirm, stray submits, non-job forms
(`looksJobish` guard), cross-domain hop (LinkedIn JD → Greenhouse form, matched
via `baseDomain` then newest-intent fallback), one-click hosts, smartConfirm
off, confirmation text, stats.

The user's live sheet ("Job Tracker", ID `1y2JdIxRk0K9D01qjIVI2SvHQJdmX0GUL93NPdEsGX4g`)
is readable via the Google Drive MCP tool — useful to verify rows actually landed.
Test rows can be POSTed to the deployed Apps Script URL with curl (text/plain body).

## Conventions / state

- Settings in `chrome.storage.sync`: `geminiApiKey`, `appsScriptUrl`, `sheetName`,
  `trackingEnabled` (default true), `smartConfirm` (default true — only undefined/true/false,
  always compare `=== false`).
- State in `chrome.storage.local`: `pendingIntents`, `pendingQueue`, `loggedUrls`, `confirmedTabs`.
- Sheet columns (order matters, matches user's header row):
  Company | Role | Location | Salary | Skills Required | Date Applied | Source | Job URL | Status
- Badges: `...` working, `PND` armed, `OK` logged, `DUP` duplicate, `QUE` queued offline, `ERR` failed, `OFF` paused.
- Errors must surface: badge + chrome.notifications + thrown message; never fail silently.
- `err.retryable` (5xx/429 → retry) and `err.permanent` (config errors → don't queue) flags drive error handling.
- Icons are generated (PIL script, blue rounded square + white check) — regenerate at 16/32/48/128 if changed.
- The user is not a Chrome-extension expert: README.md carries exact click-by-click setup steps; keep it in sync with behavior changes.
