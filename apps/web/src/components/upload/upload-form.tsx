"use client";

import type { FormEvent } from "react";
import { useState } from "react";

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
					className="w-full rounded-lg border p-2"
				/>
			</div>
			<button
				type="submit"
				disabled={!file || uploading}
				className="rounded-lg bg-blue-500 px-4 py-2 text-white disabled:bg-gray-400"
			>
				{uploading ? "Uploading..." : "Upload"}
			</button>
			{error && <p className="mt-4 text-red-500">{error}</p>}
			{success && <p className="mt-4 text-green-500">{success}</p>}
		</form>
	);
}
