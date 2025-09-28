"use client";

import { useId, useState } from "react";
import { Label } from "@/components/ui/label";
import { useENSFields } from "./ENSFieldsProvider";

interface ENSLivestreamToggleProps {
	isOwner: boolean;
	ensName: string;
}

export function ENSLivestreamToggle({
	isOwner,
	ensName,
}: ENSLivestreamToggleProps) {
	const fieldId = useId();
	const { getValue, setValue, isLoading } = useENSFields();
	const [isSaving, setIsSaving] = useState(false);

	const isStreaming = getValue("livestream.active") === "true";
	const livestreamUrl = getValue("livestream.url");

	// Loading state
	if (isLoading) {
		return (
			<div className="flex items-center space-x-3">
				<div className="h-6 w-11 animate-pulse rounded-full bg-muted" />
				<div className="h-4 w-20 animate-pulse rounded bg-muted" />
			</div>
		);
	}

	// Read-only view for non-owners
	if (!isOwner) {
		return (
			<div className="flex items-center space-x-3">
				<div
					className={`flex h-6 w-11 items-center rounded-full border-2 ${
						isStreaming
							? "border-red-500 bg-red-500"
							: "border-gray-300 bg-gray-200"
					}`}
				>
					<div
						className={`h-4 w-4 rounded-full bg-white transition-transform ${
							isStreaming ? "translate-x-6" : "translate-x-1"
						}`}
					/>
				</div>
				<span className="text-sm">
					{isStreaming ? (
						<span className="flex items-center text-red-600">
							<span className="mr-1 h-2 w-2 animate-pulse rounded-full bg-red-500" />
							LIVE
						</span>
					) : (
						<span className="text-gray-500">Offline</span>
					)}
				</span>
			</div>
		);
	}

	const handleToggle = () => {
		if (!livestreamUrl && !isStreaming) {
			// Don't allow enabling streaming without a URL
			return;
		}
		
		setIsSaving(true);
		setValue("livestream.active", isStreaming ? "false" : "true");
		setIsSaving(false);
	};

	// Editable view for owners
	return (
		<div className="flex-1">
			<Label htmlFor={fieldId} className="text-sm font-medium">
				Streaming Status
			</Label>
			<div className="mt-2 flex items-center space-x-3">
				<button
					id={fieldId}
					type="button"
					onClick={handleToggle}
					disabled={isSaving || (!livestreamUrl && !isStreaming)}
					className={`flex h-6 w-11 items-center rounded-full border-2 transition-colors ${
						isStreaming
							? "border-red-500 bg-red-500"
							: "border-gray-300 bg-gray-200"
					} ${
						isSaving || (!livestreamUrl && !isStreaming)
							? "opacity-50 cursor-not-allowed"
							: "cursor-pointer"
					}`}
				>
					<div
						className={`h-4 w-4 rounded-full bg-white transition-transform ${
							isStreaming ? "translate-x-6" : "translate-x-1"
						}`}
					/>
				</button>
				<span className="text-sm">
					{isStreaming ? (
						<span className="flex items-center text-red-600 font-medium">
							<span className="mr-1 h-2 w-2 animate-pulse rounded-full bg-red-500" />
							LIVE NOW
						</span>
					) : (
						<span className="text-gray-500">
							{livestreamUrl ? "Ready to stream" : "Add stream URL first"}
						</span>
					)}
				</span>
			</div>
			{!livestreamUrl && (
				<p className="mt-1 text-xs text-gray-500">
					You need to add a livestream URL before you can go live
				</p>
			)}
		</div>
	);
}