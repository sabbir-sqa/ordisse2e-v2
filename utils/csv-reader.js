const csv = require('csv-parser');
const fs = require('fs');

async function readCSV(filePath) {
  const results = [];
  return new Promise((resolve) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results));
  });
}
module.exports = { readCSV };
