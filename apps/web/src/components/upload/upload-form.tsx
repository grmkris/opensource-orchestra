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
		<div
			className="mx-auto max-w-2xl space-y-8 px-4 sm:px-6 lg:px-8"
			style={{ fontFamily: "Roboto, sans-serif" }}
		>
			{/* Modern Header Section */}
			<div className="text-center">
				<h1 className="mb-4 font-bold text-4xl text-gray-900 sm:text-5xl">
					UPLOAD VIDEO
				</h1>
				<p className="text-gray-600 text-lg">
					Share your content with the decentralized community
				</p>
			</div>

			{/* Upload Form Card */}
			<div
				style={{
					fontFamily:
						"system-ui, -apple-system, Segoe UI, Roboto, 'Helvetica Neue', Arial, sans-serif",
					background: "#ffffff",
					color: "#2f3044",
					border: "2px solid #2f3044",
					borderBottomWidth: "14px",
					borderRadius: "2px",
					maxWidth: "880px",
					padding: "28px 32px 36px",
					lineHeight: "1.35",
					textAlign: "left",
				}}
			>
				<span
					style={{
						display: "block",
						fontSize: "40px",
						fontWeight: "800",
						letterSpacing: "-0.3px",
						marginBottom: "14px",
					}}
				>
					For video upload
				</span>

				<span
					style={{
						display: "block",
						fontSize: "22px",
						fontWeight: "500",
						color: "#2f3044cc",
						marginBottom: "26px",
					}}
				>
					Select a video file to share with the community
				</span>

				<form onSubmit={handleSubmit} className="space-y-6">
					<div>
						<label className="mb-2 block font-medium text-gray-700 text-sm">
							Choose Video File
						</label>
						<input
							type="file"
							accept="video/*"
							onChange={handleFileChange}
							className="w-full rounded-lg border border-gray-300 p-4 text-gray-700 transition-all duration-200 hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
						/>
						{file && (
							<p className="mt-2 text-gray-600 text-sm">
								Selected: {file.name}
							</p>
						)}
					</div>

					<button
						type="submit"
						disabled={!file || uploading}
						style={{
							display: "block",
							textAlign: "center",
							fontSize: "20px",
							fontWeight: "800",
							color: "#156fb3",
							background: "transparent",
							border: "none",
							cursor: "pointer",
							width: "100%",
							opacity: !file || uploading ? "0.5" : "1",
						}}
					>
						{uploading ? "UPLOADING..." : "UPLOAD VIDEO"}{" "}
						<span aria-hidden="true">→</span>
					</button>

					{error && (
						<div className="rounded-lg border border-red-200 bg-red-50 p-4">
							<p className="font-medium text-red-800">Error</p>
							<p className="text-red-600">{error}</p>
						</div>
					)}

					{success && (
						<div className="rounded-lg border border-green-200 bg-green-50 p-4">
							<p className="font-medium text-green-800">Success</p>
							<p className="text-green-600">{success}</p>
						</div>
					)}
				</form>
			</div>
		</div>
	);
}
