"use client";

import { useState } from 'react';
import type { FormEvent } from 'react';

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setFile(files[0]);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Something went wrong");
      }

      const data = await response.json();
      setSuccess(data.message || "File uploaded successfully!");
      setFile(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <input
          type="file"
          accept="video/*"
          onChange={handleFileChange}
          className="border rounded-lg p-2 w-full"
        />
      </div>
      <button
        type="submit"
        disabled={!file || uploading}
        className="bg-blue-500 text-white px-4 py-2 rounded-lg disabled:bg-gray-400"
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>
      {error && <p className="text-red-500 mt-4">{error}</p>}
      {success && <p className="text-green-500 mt-4">{success}</p>}
    </form>
  );
}
