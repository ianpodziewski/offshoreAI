"use client";

import React, { useState, ChangeEvent } from "react";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<string[]>([]); // Array of public Blob URLs

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a file first.");
      return;
    }

    setUploading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      // Step 1: Upload to Blob storage
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        setMessage("Blob upload failed.");
        return;
      }

      // Step 2: Send file directly to Python backend for splitting.
      // The split_pdf endpoint now uploads split PDFs to Vercel Blob and returns their public URLs.
      const fileBuffer = await file.arrayBuffer();
      const splitResponse = await fetch("/api/split_pdf", {
        method: "POST",
        body: fileBuffer,
      });

      const splitData = await splitResponse.json();

      if (splitResponse.ok && splitData.files) {
        setFiles(splitData.files); // Set the array of public Blob URLs
        setMessage(`${data.message} & ${splitData.message}`);
      } else {
        setMessage(splitData.message || "PDF splitting failed.");
      }
    } catch (error) {
      setMessage(`Error: ${error}`);
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
        {uploading ? "Uploading..." : "Upload"}
      </button>

      {message && <p className="mt-4">{message}</p>}

      {files.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-3">Split Documents (Public URLs):</h2>
          <ul className="list-disc ml-6">
            {files.map((url, idx) => (
              <li key={idx}>
                <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  {url.split("/").pop()}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
