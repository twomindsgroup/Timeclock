// =====================================================================
// Deadline Signs — Time Clock Logger
// Paste this entire file into Google Apps Script
//   (Extensions → Apps Script in your Google Sheet)
// Then: Deploy → New deployment → Web app → Anyone → Deploy
// Copy the Web App URL → paste into the kiosk Admin → Settings
// =====================================================================

function doPost(e) {
  try {
    var data  = JSON.parse(e.postData.contents);
    var ss    = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Punches');

    // Create sheet if it doesn't exist
    if (!sheet) {
      sheet = ss.insertSheet('Punches');
    }

    // Add header row if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['ID','Employee','Type','Readable Time','Timestamp (ISO)','Photo Taken','Logged At']);
      var headerRange = sheet.getRange(1,1,1,7);
      headerRange.setFontWeight('bold')
                 .setBackground('#1a1a2e')
                 .setFontColor('#ffffff')
                 .setFontFamily('Arial');
      sheet.setFrozenRows(1);
      sheet.setColumnWidth(1,160);
      sheet.setColumnWidth(2,120);
      sheet.setColumnWidth(3,130);
      sheet.setColumnWidth(4,180);
      sheet.setColumnWidth(5,200);
      sheet.setColumnWidth(6,90);
      sheet.setColumnWidth(7,180);
    }

    // Color-code rows by punch type
    var colors = {
      'clock_in':    '#e6f9ed',
      'clock_out':   '#fde8eb',
      'break_start': '#fff8e1',
      'break_end':   '#e3f0ff'
    };
    var bgColor = colors[data.type] || '#ffffff';

    var rowNum = sheet.getLastRow() + 1;
    sheet.appendRow([
      data.id           || '',
      data.employee     || '',
      data.typeLabel    || data.type || '',
      data.readableTime || '',
      data.timestamp    || '',
      data.photoTaken   || 'No',
      new Date().toLocaleString('en-US',{timeZone:'America/New_York'})
    ]);

    // Color the row
    sheet.getRange(rowNum, 1, 1, 7).setBackground(bgColor);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, row: rowNum }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Health check — test this URL in browser after deploying
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', message: 'Deadline Signs Time Clock is running', time: new Date().toISOString() }))
    .setMimeType(ContentService.MimeType.JSON);
}
