"use client";

import { ArrowRight, SkipForward, X as XIcon } from "lucide-react";
import Image from "next/image";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface MediaGalleryData {
	art1?: string;
	art2?: string;
	art3?: string;
	art4?: string;
	art5?: string;
	art6?: string;
	art7?: string;
	art8?: string;
}

interface StepMediaGalleryProps {
	ensName: string;
	onNext: (data?: MediaGalleryData) => void;
	onSkip: () => void;
	initialData?: MediaGalleryData;
}

// Move MediaField outside to prevent recreation on every render
const MediaField = ({
	artKey,
	label,
	mediaData,
	onMediaChange,
	isUploading,
	onUploadingChange,
}: {
	artKey: keyof MediaGalleryData;
	label: string;
	mediaData: MediaGalleryData;
	onMediaChange: (key: keyof MediaGalleryData, value: string) => void;
	isUploading: boolean;
	onUploadingChange: (uploading: boolean) => void;
}) => {
	const fieldId = useId();
	const [uploadError, setUploadError] = useState<string | null>(null);

	const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		onUploadingChange(true);
		setUploadError(null);
		try {
			const formData = new FormData();
			formData.append("file", file);

			// Use the appropriate endpoint based on file type
			const isVideo = file.type.startsWith("video/");
			const endpoint = isVideo ? "/api/upload" : "/api/upload/image";

			const response = await fetch(endpoint, {
				method: "POST",
				body: formData,
			});

			if (!response.ok) {
				throw new Error("Failed to upload file");
			}

			const data = await response.json();

			// Handle different response formats
			if (isVideo) {
				// Video upload returns fileName, construct the URL
				if (data.fileName) {
					const videoUrl = `/api/video/${encodeURIComponent(data.fileName)}`;
					onMediaChange(artKey, videoUrl);
				} else if (data.url) {
					onMediaChange(artKey, data.url);
				}
			} else {
				// Image upload returns url directly
				if (data.url) {
					onMediaChange(artKey, data.url);
				}
			}
		} catch (error) {
			console.error("Error uploading file:", error);
			setUploadError(
				error instanceof Error ? error.message : "Failed to upload file",
			);
		} finally {
			onUploadingChange(false);
		}
	};

	const handleRemove = () => {
		onMediaChange(artKey, "");
	};

	const isVideo = (url: string) => {
		return url.includes("/api/video/") || url.match(/\.(mp4|webm|avi|mov)$/i);
	};

	const value = mediaData[artKey];

	return (
		<div className="space-y-4 rounded-lg border p-4">
			{/* Media Preview */}
			{value && (
				<div className="mb-4 flex justify-center">
					<div className="relative h-32 w-32 overflow-hidden rounded-lg border">
						{isVideo(value) ? (
							<video
								src={value}
								className="h-full w-full object-cover"
								controls
								muted
								playsInline
							/>
						) : (
							<Image
								src={value}
								alt={`${label} media`}
								fill
								className="object-cover"
								unoptimized={value.startsWith("data:")}
							/>
						)}
					</div>
				</div>
			)}

			{/* File Upload */}
			<div className="flex items-end space-x-2">
				<div className="flex-1">
					<Label htmlFor={fieldId}>{label}</Label>
					<Input
						id={fieldId}
						type="file"
						accept="image/*,video/*"
						onChange={handleFileSelect}
						disabled={isUploading}
						className="cursor-pointer"
					/>
					{isUploading && (
						<p className="mt-1 text-muted-foreground text-sm">
							Uploading media...
						</p>
					)}
					{uploadError && (
						<p className="mt-1 text-red-500 text-sm">{uploadError}</p>
					)}
					{value && !isUploading && !uploadError && (
						<p className="mt-1 text-green-600 text-sm">
							Media uploaded successfully
						</p>
					)}
				</div>

				{/* Remove Button */}
				{value && (
					<Button
						size="sm"
						variant="outline"
						onClick={handleRemove}
						disabled={isUploading}
						className=""
					>
						<XIcon className="h-4 w-4 text-red-400" />
					</Button>
				)}
			</div>
		</div>
	);
};

export function StepMediaGallery({
	ensName,
	onNext,
	onSkip,
	initialData,
}: StepMediaGalleryProps) {
	const [mediaData, setMediaData] = useState<MediaGalleryData>({
		art1: initialData?.art1 || "",
		art2: initialData?.art2 || "",
		art3: initialData?.art3 || "",
		art4: initialData?.art4 || "",
		art5: initialData?.art5 || "",
		art6: initialData?.art6 || "",
		art7: initialData?.art7 || "",
		art8: initialData?.art8 || "",
	});

	const [isUploading, setIsUploading] = useState(false);

	const handleMediaChange = (key: keyof MediaGalleryData, value: string) => {
		setMediaData((prev) => ({ ...prev, [key]: value }));
	};

	const handleNext = () => {
		onNext(mediaData);
	};

	const galleryFields = [
		{ key: "art1" as keyof MediaGalleryData, label: "Art 1" },
		{ key: "art2" as keyof MediaGalleryData, label: "Art 2" },
		{ key: "art3" as keyof MediaGalleryData, label: "Art 3" },
		{ key: "art4" as keyof MediaGalleryData, label: "Art 4" },
		{ key: "art5" as keyof MediaGalleryData, label: "Art 5" },
		{ key: "art6" as keyof MediaGalleryData, label: "Art 6" },
		{ key: "art7" as keyof MediaGalleryData, label: "Art 7" },
		{ key: "art8" as keyof MediaGalleryData, label: "Art 8" },
	];

	return (
		<div className="space-y-6">
			<div className="text-center">
				<span
					style={{
						display: "block",
						fontSize: "32px",
						fontWeight: "800",
						letterSpacing: "-0.3px",
						marginBottom: "14px",
					}}
				>
					Media Gallery
				</span>
				<span
					style={{
						display: "block",
						fontSize: "18px",
						fontWeight: "500",
						color: "#2f3044cc",
						marginBottom: "32px",
					}}
				>
					Showcase your visual content and creativity. Upload images or videos
					to build your portfolio.
				</span>
			</div>

			<div className="space-y-4">
				<div className="flex items-center space-x-2">
					<div className="h-6 w-1 rounded-full bg-blue-500" />
					<h4 className="font-bold text-gray-900 text-lg">Media Gallery</h4>
				</div>

				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{galleryFields.map((field) => (
						<MediaField
							key={field.key}
							artKey={field.key}
							label={field.label}
							mediaData={mediaData}
							onMediaChange={handleMediaChange}
							isUploading={isUploading}
							onUploadingChange={setIsUploading}
						/>
					))}
				</div>
			</div>

			<div className="flex items-center justify-between pt-4">
				<Button
					variant="ghost"
					onClick={onSkip}
					className="flex items-center space-x-2"
					style={{
						fontSize: "14px",
						fontWeight: "600",
						color: "#2f3044aa",
						background: "transparent",
						border: "1px solid #2f304466",
						borderRadius: "6px",
						padding: "8px 16px",
					}}
				>
					<SkipForward className="h-4 w-4" />
					<span>Skip for now</span>
				</Button>

				<Button
					onClick={handleNext}
					disabled={isUploading}
					className="flex items-center space-x-2"
					style={{
						fontSize: "14px",
						fontWeight: "600",
						color: "#ffffff",
						background: "#2f3044",
						border: "1px solid #2f3044",
						borderRadius: "6px",
						padding: "8px 16px",
					}}
				>
					<span>Continue</span>
					<ArrowRight className="h-4 w-4" />
				</Button>
			</div>

			<div className="text-center">
				<p
					style={{
						fontSize: "14px",
						color: "#2f3044aa",
						marginTop: "16px",
					}}
				>
					Your media will be saved when you complete the onboarding. Supports
					images and videos.
				</p>
			</div>
		</div>
	);
}
