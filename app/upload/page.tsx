'use client';

import React, { useState, ChangeEvent } from 'react';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage('Please select a file first.');
      return;
    }
  
    setUploading(true);
    setMessage('');
  
    const formData = new FormData();
    formData.append('file', file);
  
    try {
      // Upload file to initial API route
      await fetch('/api/upload', { method: 'POST', body: formData });
  
      // Call Python API to split PDF
      const splitResponse = await fetch('/api/split_pdf', {
        method: 'POST',
        body: file, // send the raw file directly
      });
  
      const splitData = await splitResponse.json();
      setMessage(splitData.message);
    } catch {
      setMessage('Error during upload or splitting.');
    } finally {
      setUploading(false);
    }
  };  

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-4">Upload Executed Document Package</h1>
      <input type="file" accept=".pdf" onChange={handleFileChange} className="mb-4 block" />
      <button
        onClick={handleUpload}
        disabled={uploading}
        className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
      >
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
      {message && <p className="mt-4">{message}</p>}
    </div>
  );
}

