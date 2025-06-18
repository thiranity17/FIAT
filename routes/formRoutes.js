const express = require('express');
const router = express.Router();
const FormData = require('../models/FormData');
const { google } = require('googleapis');

const base64 = require('base-64');

// Load credentials from Base64-encoded .env string
const credentialsJSON = JSON.parse(
  Buffer.from(process.env.GOOGLE_SHEETS_CREDS_BASE64, 'base64').toString('utf8')
);

// Set up Google Sheets API auth
const auth = new google.auth.GoogleAuth({
  credentials: credentialsJSON,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const SHEET_ID = '1VmtUQuRcFz3OlxXOparPBXNhrcjLV4kYryGwwQ6yHLE';
 // 🔁 Replace this with your actual sheet ID
const SHEET_NAME = 'Sheet1'; 
 // Or 'Sheet1', depending on your sheet

router.post('/submit', async (req, res) => {
  try {
    const data = req.body;

    // Save to MongoDB
    const newEntry = new FormData(data);
    await newEntry.save();

    // Authorize Google Sheets
    const sheets = google.sheets({ version: 'v4', auth });

    // Append to Google Sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A1`, // Appends to first available row
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
    console.error('❌ Internal error in formRoutes.js:', error.message, error.stack);
    res.status(500).json({ message: '❌ Internal Server Error' });
  }
});

module.exports = router;
