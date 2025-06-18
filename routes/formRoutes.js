const express = require('express');
const router = express.Router();
const FormData = require('../models/FormData');
const path = require('path');
const { google } = require('googleapis');

// Load Google Sheets credentials
const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, '../config/googleSheetsCredentials.json'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

// ✅ Replace with your actual Google Spreadsheet ID
const SHEET_ID = '1VmtUQuRcFz3OlxXOparPBXNhrcjLV4kYryGwwQ6yHLE';

router.post('/submit', async (req, res) => {
  try {
    const data = req.body;

    // 1️⃣ Save to MongoDB
    const newEntry = new FormData(data);
    await newEntry.save();

    // 2️⃣ Save to Google Sheets
    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A1', // Adjust if you rename the sheet
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [[
          data.studentName,
          data.fatherName,
          data.email,
          data.phone,
          data.address,
          data.service,
          data.message,
          new Date().toLocaleString()
        ]]
      }
    });

    res.status(200).json({ message: '✅ Form submitted and saved successfully!' });

  } catch (error) {
  console.error('❌ Internal error:', error);
  res.status(500).json({ message: '❌ Internal Server Error' });
}

});

module.exports = router;
