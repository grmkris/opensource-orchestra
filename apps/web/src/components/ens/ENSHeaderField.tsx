"use client";

import { CheckIcon, SaveIcon } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { useEnsText } from "wagmi";
import { ENSAvatar } from "@/components/ens/ENSAvatar";
import { Loader } from "@/components/loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSetTextRecords } from "@/hooks/useSetTextRecords";

interface ENSHeaderFieldProps {
	isOwner: boolean;
}

export function ENSHeaderField({ isOwner }: ENSHeaderFieldProps) {
	const fieldId = useId();
	const { getValue, setValue, isLoading } = useENSFields();

	// Local state for uploads only
	const [isSaving, setIsSaving] = useState(false);
	const [isUploading, setIsUploading] = useState(false);
	const [saved, setSaved] = useState(false);

	const setTextRecords = useSetTextRecords();
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
			setValue(url);
		} catch (error) {
			console.error("Error uploading header image:", error);
		} finally {
			setIsUploading(false);
		}
	};

	const handleSave = async () => {
		setIsSaving(true);
		setSaved(false);

		try {
			await setTextRecords.mutateAsync({
				label: ensName,
				key: "header",
				value,
			});
			setSaved(true);
			setTimeout(() => setSaved(false), 3000);
		} catch (error) {
			console.error("Error saving header:", error);
		} finally {
			setIsSaving(false);
		}
	};

	// Header display (only show if there's a header image)
	const headerDisplay = (headerUrl || value) && (
		<div className="h-48 w-full">
			{isLoading ? (
				<div className="h-48 w-full animate-pulse bg-muted" />
			) : (
				<ENSAvatar
					src={value || headerUrl || undefined}
					alt={`${ensName} header`}
					size="lg"
					rounded={false}
					className="h-48 w-full object-cover"
				/>
			)}
		</div>
	);

	// If not owner, just show the header if it exists
	if (!isOwner) {
		return headerDisplay || null;
	}

	// Loading state for the input
	if (isLoading) {
		return (
			<div className="space-y-4">
				<div className="flex items-end space-x-2">
					<div className="flex-1">
						<Label>Header Image URL</Label>
						<div className="h-10 w-full animate-pulse rounded-md bg-muted" />
					</div>
					<div className="h-9 w-16 animate-pulse rounded-md bg-muted" />
				</div>
			</div>
		);
	}

	// Editable view for owners
	return (
		<>
			{/* Image Preview - Full Width */}
			{headerDisplay}

			{/* File Upload - In padded area */}
			<div className="space-y-4 px-8 pt-4">
				<div className="flex items-end space-x-2">
					<div className="flex-1">
						<Label htmlFor={fieldId}>Upload Header Image</Label>
						<Input
							id={fieldId}
							type="file"
							accept="image/*"
							onChange={handleFileSelect}
							disabled={isUploading}
							className="cursor-pointer"
						/>
						{isUploading && (
							<p className="mt-1 text-muted-foreground text-sm">
								Uploading image...
							</p>
						)}
						{value && !isUploading && (
							<p className="mt-1 text-muted-foreground text-sm">
								Image uploaded successfully
							</p>
						)}
					</div>
					<Button
						size="sm"
						onClick={handleSave}
						disabled={isSaving || isUploading || !value}
					>
						{isSaving ? (
							<Loader className="h-4 w-4" />
						) : saved ? (
							<CheckIcon className="h-4 w-4" />
						) : (
							<SaveIcon className="h-4 w-4" />
						)}
					</Button>
				</div>
			</div>
		</>
	);
}
