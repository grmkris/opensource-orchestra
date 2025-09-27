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
	ensName: string;
	isOwner: boolean;
}

export function ENSHeaderField({ ensName, isOwner }: ENSHeaderFieldProps) {
	const fieldId = useId();

	// Fetch header data
	const { data: headerUrl, isLoading } = useEnsText({
		name: ensName,
		key: "header",
		query: { enabled: !!ensName },
		chainId: 1,
	});

	// Local state for this field
	const [value, setValue] = useState("");
	const [isSaving, setIsSaving] = useState(false);
	const [saved, setSaved] = useState(false);

	const setTextRecords = useSetTextRecords();

	// Update local state when data loads
	useEffect(() => {
		if (headerUrl) {
			setValue(headerUrl);
		}
	}, [headerUrl]);

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
			setTimeout(() => setSaved(null), 3000);
		} catch (error) {
			console.error("Error saving header:", error);
		} finally {
			setIsSaving(false);
		}
	};

	// Header display (only show if there's a header image)
	const headerDisplay = headerUrl && (
		<div className="relative mb-6 h-32 w-full">
			{isLoading ? (
				<div className="h-32 w-full animate-pulse rounded-t-lg bg-muted" />
			) : (
				<ENSAvatar
					src={headerUrl}
					alt={`${ensName} header`}
					size="lg"
					rounded={false}
					className="h-32 w-full rounded-t-lg"
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
		<div className="space-y-4">
			<div className="flex items-end space-x-2">
				<div className="flex-1">
					<Label htmlFor={fieldId}>Header Image URL</Label>
					<Input
						id={fieldId}
						placeholder="https://example.com/header.jpg"
						value={value}
						onChange={(e) => setValue(e.target.value)}
					/>
				</div>
				<Button size="sm" onClick={handleSave} disabled={isSaving}>
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
