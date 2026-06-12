# Job Application Tracker (Chrome Extension)

Click **Apply** on any job site → the page is parsed by Gemini (free tier) → a row is appended to your Google Sheet. No manual input, ever.

## Columns logged

| Company | Role | Location | Salary | Skills Required | Date Applied | Source | Job URL | Status |
|---------|------|----------|--------|-----------------|--------------|--------|---------|--------|

These must be the header row (row 1) of your sheet tab. (New tabs created by the extension get the header automatically.)

## Setup (one time, ~5 min)

### 1. Get a free Gemini API key
https://aistudio.google.com/apikey → Create API key.

### 2. Add the Apps Script to your sheet
1. Open your Google Sheet → **Extensions → Apps Script**
2. Delete the default code, paste the contents of `apps-script.gs`
3. **Deploy → New deployment** → gear icon ⚙ → **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Authorize when prompted, then copy the web app URL (`https://script.google.com/macros/s/.../exec`)

No Google Cloud Console, no OAuth client, no verification needed.

### 3. Load the extension
1. `chrome://extensions` → enable **Developer mode** → **Load unpacked** → select this folder
2. Click the extension icon → paste your Gemini API key and the Apps Script URL → **Save Settings**

Done forever.

## Features

- **Two-phase smart tracking** (default) — clicking Apply only *arms* the tracker (job details are extracted from the listing page right away). The row is written **only when you actually submit**: a final Submit-style click or an "application submitted" confirmation on the page. Abandon a form → nothing is logged; the pending intent silently expires after 1 hour. One-click sites (Naukri quick apply, Instahyre Interested) log instantly. Toggle off in the popup to log every Apply click instead.
- **Automatic detection** of apply buttons across LinkedIn (Easy Apply), Naukri, Instahyre, Indeed, Wellfound, and any company page running Greenhouse / Lever / Workday / Oracle HCM — including apply forms embedded in iframes.
- **Smart dedupe** — the same job URL is never logged twice: checked in the extension (persists across restarts) *and* against the sheet itself, so it holds across devices.
- **Never loses an application:**
  - Gemini overloaded (503/429) → automatic retries with backoff, then fallback from `gemini-2.5-flash` to `gemini-2.5-flash-lite`
  - Gemini fully down → extracts company/role from the page title heuristically and logs anyway
  - Offline / sheet unreachable → row is queued locally and synced automatically (every 10 min and on browser start)
- **Desktop notifications** confirm every tracked application ("SDE-2 @ Google").
- **Tracking toggle** in the popup — pause it while browsing without applying.
- **Log This Page button** — manually log any job page the detector missed (or where you applied by email).
- **Custom sheet tab** — set a tab name in settings (e.g. `June-2026`); it's created automatically with headers.
- **Stats in the popup** — total tracked, rows waiting to sync, and your 3 most recent applications.

## Badge legend

| Badge | Meaning |
|-------|---------|
| `...` | Working — extracting and writing |
| `PND` | Armed — job extracted, waiting for you to submit |
| `OK`  | Row written to your sheet |
| `DUP` | This job is already in your sheet |
| `QUE` | Sheet unreachable — row queued, will auto-sync |
| `ERR` | Something failed (see notification / service worker console) |
| `OFF` | Tracking is paused via the toggle |

## Updating the Apps Script later
If you change the script: **Deploy → Manage deployments → ✏️ edit → Version: New version → Deploy**. Just saving the file does **not** update the live URL. The URL itself never changes, so the extension keeps working.

## Known limitations
- Submission detection relies on Submit-style buttons and confirmation text. On an unusual ATS whose final button says something else entirely, the pending intent may expire unlogged — use **Log This Page** in the popup for those.
- Gemini free tier rate limits are far above any realistic application pace.
