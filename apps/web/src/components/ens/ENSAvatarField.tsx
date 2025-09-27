"use client";

import { useId, useState } from "react";
import { ENSAvatar } from "@/components/ens/ENSAvatar";
import { useENSFields } from "@/components/ens/ENSFieldsProvider";

interface ENSAvatarFieldProps {
	isOwner: boolean;
	ensName: string;
	avatarUrl: string;
}

export function ENSAvatarField({
	isOwner,
	ensName,
	avatarUrl,
}: ENSAvatarFieldProps) {
	const fieldId = useId();
	const { getValue, setValue, isLoading } = useENSFields();

	// Local state for uploads only
	const [isUploading, setIsUploading] = useState(false);
	const value = getValue("avatar");

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
			setValue("avatar", url);
		} catch (error) {
			console.error("Error uploading avatar:", error);
		} finally {
			setIsUploading(false);
		}
	};

	// Remove individual save - now handled by batch save

	// Clickable avatar preview for uploading
	const avatarDisplay = (
		<div className="mb-4 flex justify-center">
			{isLoading ? (
				<div className="h-24 w-24 animate-pulse rounded-full bg-muted" />
			) : (
				<div
					className="group relative cursor-pointer"
					onClick={() => isOwner && document.getElementById(fieldId)?.click()}
				>
					<ENSAvatar
						src={value || avatarUrl || undefined}
						alt={`${ensName} avatar`}
						size="md"
					/>
					{isOwner && (
						<div className="absolute inset-0 flex items-center justify-center rounded-full bg-black bg-opacity-50 opacity-0 transition-opacity group-hover:opacity-100">
							<span className="font-medium text-sm text-white">
								{isUploading ? "Uploading..." : "Click to change"}
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
		<div className="space-y-4">
			{avatarDisplay}
			{fileInput}
			{isUploading && (
				<p className="text-center text-muted-foreground text-sm">
					Uploading image...
				</p>
			)}
		</div>
	);
}
