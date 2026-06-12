// Paste this entire file into the Apps Script editor of your sheet
// (Extensions → Apps Script), replacing the old code.
//
// IMPORTANT when updating an existing deployment:
//   Deploy → Manage deployments → ✏️ (edit) → Version: "New version" → Deploy
//   (Just saving the file does NOT update the live URL. The URL stays the same.)
//
// First-time deployment: Deploy → New deployment → ⚙ Web app →
//   Execute as: Me | Who has access: Anyone

const HEADER = [
  'Company', 'Role', 'Location', 'Salary', 'Skills Required',
  'Date Applied', 'Source', 'Job URL', 'Status'
];
const URL_COLUMN = 8; // H

function getSheet(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (name) {
    let sheet = ss.getSheetByName(name);
    if (!sheet) {
      // New tab requested from extension settings — create it with the header.
      sheet = ss.insertSheet(name);
      sheet.appendRow(HEADER);
      sheet.setFrozenRows(1);
    }
    return sheet;
  }
  return ss.getSheetByName('Sheet1') || ss.getSheets()[0];
}

// Returns the 1-based row number of an existing row with this URL, or 0.
function findUrlRow(sheet, url) {
  if (!url) return 0;
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return 0;
  const urls = sheet.getRange(2, URL_COLUMN, lastRow - 1, 1).getValues();
  for (let i = 0; i < urls.length; i++) {
    if (String(urls[i][0]).trim() === String(url).trim()) return i + 2;
  }
  return 0;
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = getSheet(data.sheetName);

    // Same job URL already tracked → don't append a second row.
    const existingRow = findUrlRow(sheet, data.url);
    if (existingRow) {
      return jsonOut({ ok: true, duplicate: true, row: existingRow });
    }

    sheet.appendRow([
      data.company     || '',
      data.role        || '',
      data.location    || '',
      data.salary      || '',
      data.skills      || '',
      data.dateApplied || '',
      data.source      || '',
      data.url         || '',
      data.status      || 'Applied'
    ]);

    return jsonOut({ ok: true, row: sheet.getLastRow() });
  } catch (err) {
    return jsonOut({ ok: false, error: err.message });
  }
}

// Stats for the extension popup: GET <url>?sheet=<optional tab name>
function doGet(e) {
  try {
    const sheet = getSheet(e && e.parameter ? e.parameter.sheet : '');
    const lastRow = sheet.getLastRow();
    const total = Math.max(0, lastRow - 1);

    const recent = [];
    if (total > 0) {
      const n = Math.min(3, total);
      const values = sheet.getRange(lastRow - n + 1, 1, n, 9).getValues();
      for (let i = values.length - 1; i >= 0; i--) {
        recent.push({
          company: values[i][0],
          role: values[i][1],
          date: String(values[i][5]),
          status: values[i][8]
        });
      }
    }

    return jsonOut({ ok: true, total: total, recent: recent });
  } catch (err) {
    return jsonOut({ ok: false, error: err.message });
  }
}

function jsonOut(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// Quick test: run this manually in the Apps Script editor to verify it works.
function testAppend() {
  const out = doPost({
    postData: {
      contents: JSON.stringify({
        company: 'Test Company',
        role: 'SDE-2 (delete me)',
        location: 'Bangalore',
        salary: '20-25 LPA',
        skills: 'Go, Kubernetes',
        dateApplied: '12 Jun 2026',
        source: 'Test',
        url: 'https://example.com/test-' + Date.now(),
        status: 'Applied'
      })
    }
  });
  Logger.log(out.getContent());
}
