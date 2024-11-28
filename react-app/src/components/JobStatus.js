import React, { useEffect, useState } from 'react';
import axios from 'axios';

function JobStatus({ jobId }) {
  const [status, setStatus] = useState('pending');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
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
          setError('Job failed. Please try again later.');
          clearInterval(interval);
        }
      } catch (error) {
        console.error('Error fetching job status:', error);
        setStatus('error');
        setError('Error occurred while fetching job status.');
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
    } catch (error) {
      console.error('Error downloading the file:', error);
      setStatus('error');
      setError('Error occurred while downloading the file.');
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
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
        {status === 'error' && <p className="text-center text-red-500">{error}</p>}
      </div>
    </div>
  );
}

export default JobStatus;
