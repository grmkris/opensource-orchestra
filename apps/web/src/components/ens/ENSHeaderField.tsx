"use client";

import Image from "next/image";
import { useId, useState } from "react";
import { useENSFields } from "./ENSFieldsProvider";

interface ENSHeaderFieldProps {
	isOwner: boolean;
	ensName: string;
	headerUrl: string;
}

export function ENSHeaderField({
	isOwner,
	ensName,
	headerUrl,
}: ENSHeaderFieldProps) {
	const fieldId = useId();
	const { getValue, setValue, isLoading } = useENSFields();

	// Local state for uploads only
	const [isUploading, setIsUploading] = useState(false);
	const value = getValue("header");

	const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setIsUploading(true);
		try {
			const formData = new FormData();
			formData.append("file", file);

			const response = await fetch("/api/upload/image", {
				method: "POST",
				body: formData,
			});

			if (!response.ok) {
				throw new Error("Failed to upload image");
			}

			const { url } = await response.json();
			console.log(url, "url");
			setValue("header", url);
		} catch (error) {
			console.error("Error uploading header image:", error);
		} finally {
			setIsUploading(false);
		}
	};

	// Remove individual save - now handled by batch save

	// Clickable header preview for uploading
	const headerDisplay = (
		<div
			className="group relative h-48 w-full cursor-pointer overflow-hidden rounded-t-sm"
			onClick={() => isOwner && document.getElementById(fieldId)?.click()}
			style={{
				background:
					value || headerUrl
						? "transparent"
						: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
			}}
		>
			{isLoading ? (
				<div className="h-48 w-full animate-pulse bg-muted" />
			) : value || headerUrl ? (
				<>
					<Image
						src={value || headerUrl || ""}
						alt={`${ensName} header`}
						fill
						className="object-cover transition-transform duration-300 group-hover:scale-105"
						unoptimized={(value || headerUrl || "").startsWith("data:")}
					/>
					{isOwner && (
						<div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 transition-all duration-300 group-hover:opacity-100">
							<div className="text-center">
								<div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-white bg-opacity-20">
									<svg
										className="h-6 w-6 text-white"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
										/>
									</svg>
								</div>
								<span className="font-semibold text-lg text-white drop-shadow-lg">
									{isUploading ? "Uploading..." : "Change Header"}
								</span>
							</div>
						</div>
					)}
				</>
			) : (
				<div className="flex h-48 w-full items-center justify-center">
					{isOwner ? (
						<div className="text-center text-white">
							<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white bg-opacity-20">
								<svg
									className="h-8 w-8 text-white"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 6v6m0 0v6m0-6h6m-6 0H6"
									/>
								</svg>
							</div>
							<span className="font-semibold text-xl drop-shadow-lg">
								Add Header Image
							</span>
							<p className="mt-1 text-sm opacity-90">
								Click to upload a cover image
							</p>
						</div>
					) : (
						<div className="text-center text-white">
							<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white bg-opacity-20">
								<svg
									className="h-8 w-8 text-white"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
									/>
								</svg>
							</div>
							<span className="font-medium text-lg drop-shadow-lg">
								No Header Image
							</span>
						</div>
					)}
				</div>
			)}
		</div>
	);

	// Hidden file input
	const fileInput = isOwner ? (
		<input
			id={fieldId}
			type="file"
			accept="image/*"
			onChange={handleFileSelect}
			disabled={isUploading}
			className="hidden"
		/>
	) : null;

	return (
		<>
			{headerDisplay}
			{fileInput}
			{isUploading && (
				<div className="px-8 pt-2">
					<p className="text-center text-muted-foreground text-sm">
						Uploading header image...
					</p>
				</div>
			)}
		</>
	);
}
