"use client";

import { CheckIcon, CopyIcon, SaveIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useId, useState } from "react";
import { useEnsAvatar, useEnsText } from "wagmi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader } from "@/components/loader";
import { useSetTextRecords } from "@/hooks/useSetTextRecords";
import type { TextRecordKey } from "@/lib/ens/ens-contracts";

interface ProfileHeaderEditableProps {
	ensName: string;
	ensAddress: string;
	onCopy: (text: string, field: string) => void;
	copiedField: string | null;
	isOwner: boolean;
}

export function ProfileHeaderEditable({
	ensName,
	ensAddress,
	onCopy,
	copiedField,
	isOwner,
}: ProfileHeaderEditableProps) {
	const headerFieldId = useId();
	const avatarFieldId = useId();

	// Fetch data using wagmi hooks
	const { data: headerUrl, isLoading: headerLoading } = useEnsText({
		name: ensName,
		key: "header",
		query: { enabled: !!ensName },
		chainId: 1,
	});

	const { data: avatarUrl, isLoading: avatarLoading } = useEnsAvatar({
		name: ensName,
		query: { enabled: !!ensName },
		chainId: 1,
	});

	// Local state for images
	const [headerValue, setHeaderValue] = useState("");
	const [avatarValue, setAvatarValue] = useState("");
	
	// Upload and save states
	const [headerUploading, setHeaderUploading] = useState(false);
	const [avatarUploading, setAvatarUploading] = useState(false);
	const [headerSaving, setHeaderSaving] = useState(false);
	const [avatarSaving, setAvatarSaving] = useState(false);
	const [headerSaved, setHeaderSaved] = useState(false);
	const [avatarSaved, setAvatarSaved] = useState(false);

	// Image loading states for display
	const [coverLoading, setCoverLoading] = useState(true);
	const [coverError, setCoverError] = useState(false);
	const [profileAvatarLoading, setProfileAvatarLoading] = useState(true);
	const [profileAvatarError, setProfileAvatarError] = useState(false);

	const setTextRecords = useSetTextRecords();

	// Update local state when data loads
	useEffect(() => {
		if (headerUrl) setHeaderValue(headerUrl);
	}, [headerUrl]);

	useEffect(() => {
		if (avatarUrl) setAvatarValue(avatarUrl);
	}, [avatarUrl]);

	const handleFileUpload = async (
		file: File,
		setUploading: (loading: boolean) => void,
		setValue: (value: string) => void
	) => {
		setUploading(true);
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
			console.error("Error uploading image:", error);
		} finally {
			setUploading(false);
		}
	};

	const handleHeaderFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		await handleFileUpload(file, setHeaderUploading, setHeaderValue);
	};

	const handleAvatarFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		await handleFileUpload(file, setAvatarUploading, setAvatarValue);
	};

	const handleSave = async (key: TextRecordKey, value: string, setSaving: (saving: boolean) => void, setSaved: (saved: boolean) => void) => {
		setSaving(true);
		setSaved(false);

		try {
			await setTextRecords.mutateAsync({
				label: ensName,
				key: key,
				value,
			});
			setSaved(true);
			setTimeout(() => setSaved(false), 3000);
		} catch (error) {
			console.error(`Error saving ${key}:`, error);
		} finally {
			setSaving(false);
		}
	};

	const handleHeaderSave = () => handleSave("header", headerValue, setHeaderSaving, setHeaderSaved);
	const handleAvatarSave = () => handleSave("avatar", avatarValue, setAvatarSaving, setAvatarSaved);

	const handleCoverLoad = () => {
		setCoverLoading(false);
		setCoverError(false);
	};

	const handleCoverError = () => {
		setCoverLoading(false);
		setCoverError(true);
	};

	const handleAvatarLoad = () => {
		setProfileAvatarLoading(false);
		setProfileAvatarError(false);
	};

	const handleAvatarError = () => {
		setProfileAvatarLoading(false);
		setProfileAvatarError(true);
	};

	const displayHeaderUrl = headerValue || headerUrl;
	const displayAvatarUrl = avatarValue || avatarUrl;

	return (
		<div className="relative">
			{/* Cover Image */}
			<div className="relative h-48 w-full md:h-64">
				{displayHeaderUrl && !coverError ? (
					<>
						{coverLoading && (
							<div className="absolute inset-0 flex items-center justify-center bg-muted">
								<Loader className="h-6 w-6" />
							</div>
						)}
						<Image
							src={displayHeaderUrl}
							alt={`${ensName} cover`}
							fill
							className={`object-cover ${coverLoading ? "opacity-0" : "opacity-100"}`}
							onLoad={handleCoverLoad}
							onError={handleCoverError}
							unoptimized={displayHeaderUrl.startsWith("data:")}
						/>
					</>
				) : (
					<div className="h-full w-full bg-gradient-to-br from-blue-500 to-purple-600" />
				)}
			</div>

			{/* Profile Info Section */}
			<div className="-mt-16 md:-mt-20 relative px-6 pb-6">
				<div className="flex flex-col space-y-4 md:flex-row md:items-end md:space-x-6 md:space-y-0">
					{/* Avatar */}
					<div className="relative h-32 w-32 flex-shrink-0 md:h-40 md:w-40">
						{displayAvatarUrl && !profileAvatarError && !avatarLoading ? (
							<>
								{profileAvatarLoading && (
									<div className="absolute inset-0 flex items-center justify-center rounded-full border-4 border-background bg-muted">
										<Loader className="h-6 w-6" />
									</div>
								)}
								<Image
									src={displayAvatarUrl}
									alt={`${ensName} avatar`}
									fill
									className={`rounded-full border-4 border-background object-cover ${profileAvatarLoading ? "opacity-0" : "opacity-100"}`}
									onLoad={handleAvatarLoad}
									onError={handleAvatarError}
									unoptimized={displayAvatarUrl.startsWith("data:")}
								/>
							</>
						) : (
							<div className="flex h-full w-full items-center justify-center rounded-full border-4 border-background bg-muted text-muted-foreground">
								{avatarLoading ? (
									<Loader className="h-6 w-6" />
								) : (
									<span className="text-sm">No Avatar</span>
								)}
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Edit Controls - Only show for owners */}
			{isOwner && (
				<div className="space-y-6 px-6 pb-6">
					{/* Header Upload */}
					<div className="space-y-4">
						<div className="flex items-end space-x-2">
							<div className="flex-1">
								<Label htmlFor={headerFieldId}>Upload Cover Image</Label>
								<Input
									id={headerFieldId}
									type="file"
									accept="image/*"
									onChange={handleHeaderFileSelect}
									disabled={headerUploading}
									className="cursor-pointer"
								/>
								{headerUploading && (
									<p className="mt-1 text-muted-foreground text-sm">
										Uploading cover image...
									</p>
								)}
								{headerValue && !headerUploading && (
									<p className="mt-1 text-muted-foreground text-sm">
										Cover image uploaded successfully
									</p>
								)}
							</div>
							<Button
								size="sm"
								onClick={handleHeaderSave}
								disabled={headerSaving || headerUploading || !headerValue}
							>
								{headerSaving ? (
									<Loader className="h-4 w-4" />
								) : headerSaved ? (
									<CheckIcon className="h-4 w-4" />
								) : (
									<SaveIcon className="h-4 w-4" />
								)}
							</Button>
						</div>
					</div>

					{/* Avatar Upload */}
					<div className="space-y-4">
						<div className="flex items-end space-x-2">
							<div className="flex-1">
								<Label htmlFor={avatarFieldId}>Upload Avatar Image</Label>
								<Input
									id={avatarFieldId}
									type="file"
									accept="image/*"
									onChange={handleAvatarFileSelect}
									disabled={avatarUploading}
									className="cursor-pointer"
								/>
								{avatarUploading && (
									<p className="mt-1 text-muted-foreground text-sm">
										Uploading avatar image...
									</p>
								)}
								{avatarValue && !avatarUploading && (
									<p className="mt-1 text-muted-foreground text-sm">
										Avatar image uploaded successfully
									</p>
								)}
							</div>
							<Button
								size="sm"
								onClick={handleAvatarSave}
								disabled={avatarSaving || avatarUploading || !avatarValue}
							>
								{avatarSaving ? (
									<Loader className="h-4 w-4" />
								) : avatarSaved ? (
									<CheckIcon className="h-4 w-4" />
								) : (
									<SaveIcon className="h-4 w-4" />
								)}
							</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}