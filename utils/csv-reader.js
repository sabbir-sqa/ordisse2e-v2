// utils/csv-reader.js
const fs = require('fs').promises; // Using promises API for async/await support
const path = require('path'); // Path module for handling file paths

async function readCSV(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    const records = parse(data, {
      columns: true, // Assuming the CSV has headers
      skip_empty_lines: true,
      trim: true,
    });
    return records;
  } catch (error) {
    throw new Error(`Filed to read CSV ${filePath}: ${error.message}`);
  }
}

module.exports = { readCSV };
