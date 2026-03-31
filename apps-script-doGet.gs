/**
 * doGet — returns punch data as JSON for the dashboard.
 *
 * Endpoints:
 *   ?action=today              → today's punches
 *   ?action=range&from=ISO&to=ISO → punches in date range
 *   (no action)                → status check
 *
 * Sheet columns: ID | Employee | Type | Type Label | Readable Time | Timestamp | Photo Taken | Photo URL
 *                 1       2       3        4             5              6            7            8
 *
 * Paste this into your existing Code.gs, replacing the current doGet.
 */

function doGet(e) {
  var action = (e.parameter.action || '').toLowerCase();

  if (action === 'today') {
    return jsonResponse(getTodayPunches());
  }

  if (action === 'range') {
    var from = e.parameter.from;
    var to   = e.parameter.to;
    if (!from || !to) {
      return jsonResponse({ success: false, error: 'Missing "from" and/or "to" parameters' });
    }
    return jsonResponse(getRangePunches(new Date(from), new Date(to)));
  }

  // Default: status check
  return jsonResponse({ success: true, status: 'ok', message: 'DS Time Clock backend is running' });
}

/* ── helpers ─────────────────────────────────────────────── */

function getTodayPunches() {
  var now   = new Date();
  var start = new Date(now.getFullYear(), now.getMonth(), now.getDate());          // midnight
  var end   = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);      // next midnight
  return getRangePunches(start, end);
}

function getRangePunches(from, to) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data  = sheet.getDataRange().getValues();
    var punches = [];

    // Row 0 is the header row — skip it
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var ts  = row[5];                                       // column F — Timestamp (ISO or Date)
      if (!ts) continue;

      var rowDate = new Date(ts);
      if (isNaN(rowDate.getTime())) continue;                 // skip bad dates
      if (rowDate < from || rowDate >= to) continue;          // outside range

      punches.push({
        id:        row[0],                                    // A — ID
        employee:  row[1],                                    // B — Employee
        type:      row[2],                                    // C — Type  (clock_in, clock_out, break_start, break_end)
        typeLabel: row[3],                                    // D — Type Label  (Clock In, Clock Out, ...)
        time:      row[4],                                    // E — Readable Time
        timestamp: rowDate.toISOString(),                     // F — Timestamp (normalized to ISO)
        photoTaken:row[6] ? true : false,                     // G — Photo Taken
        photoUrl:  row[7] || ''                               // H — Photo URL
      });
    }

    return { success: true, punches: punches };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
