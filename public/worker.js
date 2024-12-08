/* eslint-disable no-restricted-globals */
/* eslint-disable no-undef */
// public/worker.js

// Importing the xlsx library in the web worker
// public/worker.js

importScripts('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.17.1/xlsx.full.min.js');

self.onmessage = function (e) {
  console.log('Worker received message');
  
  const { fileData, chunkSize, startIndex } = e.data;

  try {
    const data = new Uint8Array(fileData);
    const workbook = XLSX.read(data, { type: 'array' });

    // Log workbook and sheet details
    console.log('Workbook:', workbook);
    
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Log sheet contents
    console.log('Sheet:', sheet);

    // Parse the data to JSON
    const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });

    // Filter out empty rows
    const nonEmptyData = jsonData.filter(row => row.some(cell => cell !== ""));
    console.log('Filtered non-empty data:', nonEmptyData);

    // Slice the data into chunks
    const chunk = nonEmptyData.slice(startIndex, startIndex + chunkSize);

    console.log(`Sending chunk with ${chunk.length} rows`);

    // Post the chunk back to the main thread
    self.postMessage({ chunk });

  } catch (error) {
    console.error('Error in Web Worker:', error);
  }
};
