import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import DataTable from './components/DataTable';

const App = () => {
  const [data, setData] = useState([]);

  // This function updates the data displayed in the table
  const handleDataLoad = (newData) => {
    setData((prevData) => [...prevData, ...newData]);
  };

  // This function clears the data
  const handleClear = () => {
    setData([]); // Clear the data state
  };

  return (
    <div>
      <h1>Excel Data Viewer</h1>
      {/* Pass handleDataLoad and handleClear as props to FileUpload */}
      <FileUpload onDataLoad={handleDataLoad} onClear={handleClear} />
      <DataTable data={data} />
    </div>
  );
};

export default App;
