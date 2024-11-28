import React, { useEffect, useState } from 'react';
import axios from 'axios';

function UploadAndStatus() {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [jobId, setJobId] = useState(null);
  const [status, setStatus] = useState('pending');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [jobError, setJobError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
    setError("");
    setSuccessMessage("");
  };

  const handleUpload = async () => {
    if (files.length < 3) {
      setError("Please select at least three files.");
      return;
    }

    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setJobId(response.data.job_id);
      setError("");
      setSuccessMessage("Files uploaded successfully. Job ID: " + response.data.job_id);
    } catch (uploadError) {
      console.error('Error uploading files:', uploadError);
      setError('Error uploading files. Please try again.');
    }
  };

  useEffect(() => {
    if (!jobId) return;

    const checkJobStatus = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/jobs/${jobId}`);
        const jobStatus = response.data.status;

        if (jobStatus === 'complete') {
          setStatus('complete');
          setDownloadUrl(`${process.env.REACT_APP_API_URL}/download/${jobId}`);
          clearInterval(interval);
        } else if (jobStatus === 'failed') {
          setStatus('failed');
          setJobError('Job failed. Please try again later.');
          clearInterval(interval);
        }
      } catch (statusError) {
        console.error('Error fetching job status:', statusError);
        setStatus('error');
        setJobError('Error occurred while fetching job status.');
        clearInterval(interval);
      }
    };

    const interval = setInterval(checkJobStatus, 3000);
    return () => clearInterval(interval);
  }, [jobId]);

  const downloadFile = async () => {
    if (!downloadUrl) return;

    setIsDownloading(true);

    try {
      const response = await axios({
        url: downloadUrl,
        method: 'GET',
        responseType: 'blob',
      });

      const disposition = response.headers['content-disposition'];
      let filename = 'downloaded_file.mp4';

      if (disposition) {
        const matches = /filename="(.+)"/.exec(disposition);
        if (matches) {
          filename = matches[1];
        }
      }

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setIsDownloading(false);
    } catch (downloadError) {
      console.error('Error downloading the file:', downloadError);
      setStatus('error');
      setJobError('Error occurred while downloading the file.');
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mb-6">
        <h1 className="text-3xl font-bold mb-4 text-center text-gray-800">Video Processing App</h1>
        <p className="text-center mb-6 text-gray-600">Please select at least three files to upload.</p>
        <input
          type="file"
          multiple
          onChange={handleFileChange}
          accept="video/mp4"
          className="block w-full text-gray-700 p-2 border border-gray-300 rounded mb-4"
        />
        <div className="flex justify-center space-x-4 mb-4">
          <button
            onClick={handleUpload}
            disabled={files.length < 3}
            className={`bg-orange-500 text-white px-4 py-2 rounded-md shadow ${files.length < 3 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-600'}`}
          >
            Upload
          </button>
        </div>
        {error && <div className="text-red-500 text-center mb-4">{error}</div>}
        {successMessage && <div className="text-green-500 text-center mb-4">{successMessage}</div>}
        <div>
          <h2 className="text-xl font-semibold mb-2">Chosen Files:</h2>
          {files.length > 0 ? (
            <ul className="list-disc list-inside pl-4">
              {files.map((file, index) => (
                <li key={index} className="text-gray-700">{file.name}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No files chosen</p>
          )}
        </div>
      </div>

      {jobId && (
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">Job Status: {status}</h2>
          {status === 'downloading' && <p className="text-center text-gray-600">Downloading...</p>}
          {status === 'complete' && !isDownloading && (
            <p className="text-center text-green-500">
              <a
                href={downloadUrl}
                onClick={(e) => {
                  e.preventDefault();
                  downloadFile();
                }}
                className="text-blue-500 hover:underline"
              >
                Click here to download the combined video
              </a>
            </p>
          )}
          {status === 'error' && <p className="text-center text-red-500">{jobError}</p>}
        </div>
      )}
    </div>
  );
}

export default UploadAndStatus;
