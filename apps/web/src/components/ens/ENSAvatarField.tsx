"use client";

import { CheckIcon, SaveIcon } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { useEnsAvatar } from "wagmi";
import { ENSAvatar } from "@/components/ens/ENSAvatar";
import { Loader } from "@/components/loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSetTextRecords } from "@/hooks/useSetTextRecords";

interface ENSAvatarFieldProps {
	ensName: string;
	isOwner: boolean;
}

export function ENSAvatarField({ ensName, isOwner }: ENSAvatarFieldProps) {
	const fieldId = useId();

	// Fetch avatar data using the built-in wagmi hook
	const { data: avatarUrl, isLoading } = useEnsAvatar({
		name: ensName,
		query: { enabled: !!ensName },
		chainId: 1,
	});

	// Local state for this field
	const [value, setValue] = useState("");
	const [isSaving, setIsSaving] = useState(false);
	const [isUploading, setIsUploading] = useState(false);
	const [saved, setSaved] = useState(false);

	const setTextRecords = useSetTextRecords();

	// Update local state when data loads
	useEffect(() => {
		if (avatarUrl) {
			setValue(avatarUrl);
		}
	}, [avatarUrl]);

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
			setValue(url);
		} catch (error) {
			console.error("Error uploading avatar:", error);
		} finally {
			setIsUploading(false);
		}
	};

	const handleSave = async () => {
		setIsSaving(true);
		setSaved(false);
		// alert(value);
		try {
			await setTextRecords.mutateAsync({
				label: ensName,
				key: "avatar",
				value,
			});
			setSaved(true);
			setTimeout(() => setSaved(false), 3000);
		} catch (error) {
			console.error("Error saving avatar:", error);
		} finally {
			setIsSaving(false);
		}
	};

	// Avatar display (always show this)
	const avatarDisplay = (
		<div className="mb-4 flex justify-center">
			{isLoading ? (
				<div className="h-24 w-24 animate-pulse rounded-full bg-muted" />
			) : (
				avatarUrl && (
					<ENSAvatar
						src={avatarUrl || undefined}
						alt={`${ensName} avatar`}
						size="md"
					/>
				)
			)}
		</div>
	);

	// If not owner, just show the avatar
	if (!isOwner) {
		return avatarDisplay;
	}

	// Loading state for the input
	if (isLoading) {
		return (
			<div className="space-y-4">
				{avatarDisplay}
				<div className="flex items-end space-x-2">
					<div className="flex-1">
						<Label>Avatar URL</Label>
						<div className="h-10 w-full animate-pulse rounded-md bg-muted" />
					</div>
					<div className="h-9 w-16 animate-pulse rounded-md bg-muted" />
				</div>
			</div>
		);
	}

	// Editable view for owners
	return (
		<div className="space-y-4">
			{/* Image Preview */}
			<div className="mb-4 flex justify-center">
				{isLoading ? (
					<div className="h-24 w-24 animate-pulse rounded-full bg-muted" />
				) : (
					<ENSAvatar
						src={value || avatarUrl || undefined}
						alt={`${ensName} avatar`}
						size="md"
					/>
				)}
			</div>

			{/* File Upload */}
			<div className="flex items-end space-x-2">
				<div className="flex-1">
					<Label htmlFor={fieldId}>Upload Avatar Image</Label>
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
	);
}
