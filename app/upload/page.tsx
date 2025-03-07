"use client";

import React, { useState, useEffect, ChangeEvent } from "react";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [fileSockets, setFileSockets] = useState<{ [key: string]: string[] }>({});

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

      // Step 2: Send file directly to Python backend for splitting
      const fileBuffer = await file.arrayBuffer();
      const splitResponse = await fetch("/api/split_pdf", {
        method: "POST",
        body: fileBuffer,
      });

      const splitData = await splitResponse.json();

      if (splitResponse.ok) {
        setMessage(`${data.message} & ${splitData.message}`);
        fetchFileSockets(); // Fetch categorized files after processing
      } else {
        setMessage(splitData.message || "PDF splitting failed.");
      }
    } catch (error) {
      setMessage(`Error: ${error}`);
    } finally {
      setUploading(false);
    }
  };

  // Fetch categorized files after processing
  const fetchFileSockets = async () => {
    try {
      const res = await fetch("/api/get-file-sockets");
      const data = await res.json();
      if (res.ok) {
        setFileSockets(data.files);
      }
    } catch (error) {
      console.error("Error fetching file sockets:", error);
    }
  };

  useEffect(() => {
    fetchFileSockets(); // Load categorized files on page load
  }, []);

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

      {/* File Sockets UI */}
      {Object.keys(fileSockets).length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-3">Categorized Documents:</h2>
          {Object.keys(fileSockets).map((category) => (
            <div key={category} className="mb-6 p-4 border border-gray-300 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">{category.toUpperCase()}</h3>
              <ul className="list-disc pl-5">
                {fileSockets[category].map((file, idx) => (
                  <li key={idx}>
                    <a href={`/api/download?file=${file}`} target="_blank" className="text-blue-600 hover:underline">
                      {file.split("/").pop()}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
