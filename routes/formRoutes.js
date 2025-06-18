const express = require('express');
const router = express.Router();
const FormData = require('../models/FormData');
const { google } = require('googleapis');
const fs = require('fs');
const os = require('os');
const path = require('path');

// Step 1: Decode Base64 and write temp credentials file
const base64 = process.env.GOOGLE_SHEETS_CREDS_BASE64;

const credsPath = path.join(os.tmpdir(), 'googleSheetsCredentials.json');
try {
  fs.writeFileSync(credsPath, Buffer.from(base64, 'base64'));
} catch (err) {
  console.error('❌ Failed to write credentials file:', err.message);
}

const auth = new google.auth.GoogleAuth({
  keyFile: credsPath,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const SHEET_ID = '1VmtUQuRcFz3OlxXOparPBXNhrcjLV4kYryGwwQ6yHLE';

router.post('/submit', async (req, res) => {
  try {
    const data = req.body;

    // Save to MongoDB
    const newEntry = new FormData(data);
    await newEntry.save();

    // Save to Google Sheet
    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A1',
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
    console.error('❌ Internal error in formRoutes.js:', error);
    res.status(500).json({ message: '❌ Internal Server Error' });
  }
});

module.exports = router;
