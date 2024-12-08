import React, { useState } from 'react';
import { Button, CircularProgress, Stack } from '@mui/material';

const FileUpload = ({ onDataLoad, onClear }) => {
  const [loading, setLoading] = useState(false);
  const [fileUploaded, setFileUploaded] = useState(false);
  const CHUNK_SIZE = 5000; // Number of rows per chunk
  const workerRef = React.useRef(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    const fileReader = new FileReader();

    fileReader.onload = (e) => {
      const fileData = e.target.result;

      console.log('File read successfully. Sending to worker.');

      // Start parsing with Web Worker
      let startIndex = 0;

      workerRef.current = new Worker('/worker.js');
      workerRef.current.postMessage({ fileData, chunkSize: CHUNK_SIZE, startIndex });

      workerRef.current.onmessage = (e) => {
        console.log('Worker sent data:', e.data);
        const chunk = e.data.chunk;
        if (chunk.length > 0) {
          onDataLoad(chunk);
        } else {
          console.log('No more data to process.');
        }

        startIndex += CHUNK_SIZE;

        // Keep fetching chunks until the end of the file
        if (chunk.length > 0) {
          workerRef.current.postMessage({ fileData, chunkSize: CHUNK_SIZE, startIndex });
        } else {
          setLoading(false); // File processing done
          setFileUploaded(true);
          workerRef.current.terminate();
        }
      };

      workerRef.current.onerror = (error) => {
        console.error('Worker error:', error);
      };
    };

    fileReader.readAsArrayBuffer(file);
  };

  const handleClear = () => {
    if (workerRef.current) {
      workerRef.current.terminate(); // Terminate the Web Worker
    }
    setFileUploaded(false);
    setLoading(false);
    onClear(); // Clear data from parent component
  };

  return (
    <Stack direction="row" spacing={2} alignItems="center">
      <label htmlFor="upload-button">
        <input
          accept=".xlsx, .xls"
          type="file"
          id="upload-button"
          style={{ display: 'none' }}
          onChange={handleFileUpload}
        />
        <Button
          variant="contained"
          component="span"
          disabled={loading}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Upload Excel File'
          )}
        </Button>
      </label>
      <Button
        variant="outlined"
        onClick={handleClear}
        disabled={!fileUploaded}
      >
        Clear
      </Button>
    </Stack>
  );
};

export default FileUpload;
