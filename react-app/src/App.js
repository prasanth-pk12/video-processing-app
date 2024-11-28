import React, { useState } from 'react';
import UploadForm from './components/UploadForm';
import JobStatus from './components/JobStatus';

function App() {
  const [jobId, setJobId] = useState(null);

  return (
    <div className="App">
      <UploadForm setJobId={setJobId} />
      {/* {jobId && <JobStatus jobId={jobId} />} */}
    </div>
  );
}

export default App;
