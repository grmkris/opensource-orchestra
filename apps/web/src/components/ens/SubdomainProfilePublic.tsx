"use client";

import { CheckIcon, CopyIcon, ExternalLinkIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { normalize } from "viem/ens";
import { useEnsAddress, useEnsAvatar, useEnsText } from "wagmi";
import { ENSAvatar } from "@/components/ens/ENSAvatar";
import { ENSGalleryPublic } from "@/components/ens/ENSGalleryPublic";
import { GiftPopover } from "@/components/ens/GiftPopover";
import { PyusdGiftPopover } from "@/components/ens/PyusdGiftPopover";
import { Loader } from "@/components/loader";
import { Card } from "@/components/ui/card";

interface ENSField {
	key: string;
	label: string;
	isUrl?: boolean;
	isEmail?: boolean;
	prefix?: string;
}

const _ENS_FIELDS: ENSField[] = [
	{ key: "description", label: "Description" },
	{ key: "url", label: "Website", isUrl: true },
	{ key: "email", label: "Email", isEmail: true },
	{ key: "com.twitter", label: "Twitter", prefix: "https://twitter.com/" },
	{ key: "com.github", label: "GitHub", prefix: "https://github.com/" },
	{ key: "com.discord", label: "Discord" },
	{ key: "com.telegram", label: "Telegram", prefix: "https://t.me/" },
];

function ENSFieldDisplay({
	ensName,
	field,
}: {
	ensName: string;
	field: ENSField;
}) {
	const { data, isLoading } = useEnsText({
		name: ensName,
		key: field.key,
		query: { enabled: !!ensName },
		chainId: 1,
	});

	if (isLoading) {
		return (
			<div className="animate-pulse">
				<div className="mb-1 h-4 w-16 rounded bg-muted" />
				<div className="h-5 w-32 rounded bg-muted" />
			</div>
		);
	}

	if (!data) return null;

	const renderValue = () => {
		if (field.isUrl || field.isEmail) {
			const href = field.isEmail ? `mailto:${data}` : data;
			return (
				<a
					href={href}
					target="_blank"
					rel="noopener noreferrer"
					className="flex items-center text-blue-600 hover:text-blue-800 hover:underline"
				>
					<span>{data}</span>
					<ExternalLinkIcon className="ml-1 h-3 w-3" />
				</a>
			);
		}

		if (field.prefix) {
			return (
				<a
					href={`${field.prefix}${data}`}
					target="_blank"
					rel="noopener noreferrer"
					className="flex items-center text-blue-600 hover:text-blue-800 hover:underline"
				>
					<span>{data}</span>
					<ExternalLinkIcon className="ml-1 h-3 w-3" />
				</a>
			);
		}

		return <span className="text-foreground">{data}</span>;
	};

	return (
		<div>
			<span className="font-medium text-muted-foreground text-sm">
				{field.label}:
			</span>
			<div className="mt-1">{renderValue()}</div>
		</div>
	);
}

export function SubdomainProfilePublic({ ensName }: { ensName: string }) {
	const [copiedField, setCopiedField] = useState<string | null>(null);

	// Get the ENS name's address
	const { data: ensAddress, isLoading: addressLoading } = useEnsAddress({
		name: normalize(ensName || ""),
		query: { enabled: !!ensName },
		chainId: 1,
	});

	// Get header image
	const { data: headerUrl } = useEnsText({
		name: ensName,
		key: "header",
		query: { enabled: !!ensName },
		chainId: 1,
	});

	const handleCopy = async (text: string, field: string) => {
		try {
			await navigator.clipboard.writeText(text);
			setCopiedField(field);
			setTimeout(() => setCopiedField(null), 2000);
		} catch (err) {
			console.error("Failed to copy:", err);
		}
	};

	const handleCopyProfileLink = () => {
		const profileUrl = `${window.location.origin}/ens/${ensName}`;
		handleCopy(profileUrl, "profile-link");
	};

	// Fetch avatar data using the built-in wagmi hook
	const { data: avatarUrl, isLoading } = useEnsAvatar({
		name: ensName,
		query: { enabled: !!ensName },
		chainId: 1,
	});

	if (addressLoading) {
		return (
			<Card className="p-6">
				<div className="flex items-center justify-center">
					<Loader className="mr-2 h-6 w-6" />
					<span>Loading profile...</span>
				</div>
			</Card>
		);
	}

	if (!ensAddress) {
		return (
			<Card className="p-6">
				<div className="text-center text-muted-foreground">
					Profile not found or not yet resolved
				</div>
			</Card>
		);
	}

	return (
		<div
			className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8"
			style={{ fontFamily: "Roboto, sans-serif" }}
		>
			{/* Avatar Card with Header and Profile Picture */}
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
					lineHeight: "1.35",
					textAlign: "left",
					overflow: "hidden",
				}}
			>
				{/* Header Section */}
				<div style={{ position: "relative" }}>
					{/* Header Image */}
					<div
						className="relative h-48 w-full overflow-hidden rounded-t-sm"
						style={{
							background: headerUrl
								? "transparent"
								: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
						}}
					>
						{headerUrl ? (
							<Image
								src={headerUrl}
								alt={`${ensName} header`}
								fill
								className="object-cover"
								unoptimized={headerUrl.startsWith("data:")}
							/>
						) : (
							<div className="flex h-48 w-full items-center justify-center">
								<div className="text-center text-white">
									<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white bg-opacity-20">
										<svg
											aria-hidden="true"
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
							</div>
						)}
					</div>
				</div>

				{/* Profile Content */}
				<div style={{ padding: "28px 32px 36px" }}>
					{/* Avatar Section */}
					<div style={{ marginBottom: "24px" }}>
						<div className="mb-4 flex justify-center">
							<ENSAvatar
								src={avatarUrl || undefined}
								alt={`${ensName} avatar`}
								size="md"
							/>
						</div>
					</div>

					{/* Profile Name and Verification */}
					<div style={{ marginBottom: "16px", textAlign: "center" }}>
						<span
							style={{
								display: "inline-block",
								fontSize: "32px",
								fontWeight: "800",
								letterSpacing: "-0.3px",
								marginRight: "8px",
							}}
						>
							{ensName}
						</span>
						<span
							style={{
								display: "inline-block",
								width: "24px",
								height: "24px",
								borderRadius: "50%",
								background: "#156fb3",
								color: "#ffffff",
								fontSize: "14px",
								fontWeight: "800",
								textAlign: "center",
								lineHeight: "24px",
							}}
						>
							✓
						</span>
					</div>

					{/* Action Buttons */}
					<div
						style={{
							display: "flex",
							gap: "12px",
							justifyContent: "center",
						}}
					>
						<button
							type="button"
							onClick={handleCopyProfileLink}
							style={{
								fontSize: "14px",
								fontWeight: "600",
								color: "#156fb3",
								background: "transparent",
								border: "1px solid #156fb3",
								borderRadius: "6px",
								padding: "8px 16px",
								cursor: "pointer",
							}}
						>
							{copiedField === "profile-link" ? "✓ Copied" : "Copy Link"}
						</button>

						<GiftPopover
							recipientAddress={ensAddress}
							recipientName={ensName}
						/>

						<PyusdGiftPopover
							recipientAddress={ensAddress}
							recipientName={ensName}
						/>
					</div>

					<ENSFieldDisplay
						ensName={ensName}
						field={{ key: "com.discord", label: "Discord" }}
					/>

					<ENSFieldDisplay
						ensName={ensName}
						field={{
							key: "com.telegram",
							label: "Telegram",
							prefix: "https://t.me/",
						}}
					/>
				</div>
			</div>

			{/* Media Gallery Card */}
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
					Media Gallery
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
					Visual content and creativity
				</span>

				<ENSGalleryPublic ensName={ensName} />
			</div>
			<div className="mt-8 flex flex-wrap justify-center gap-4 border-gray-200 border-t pt-6">
				<button
					type="button"
					onClick={() => handleCopy(ensName || "", "name")}
					className="flex items-center space-x-2 rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-600 transition-all duration-200 hover:bg-gray-50"
				>
					{copiedField === "name" ? (
						<CheckIcon className="h-4 w-4 text-green-600" />
					) : (
						<CopyIcon className="h-4 w-4" />
					)}
					<span>Copy Name</span>
				</button>

				<a
					href={`https://basescan.org/address/${ensAddress}`}
					target="_blank"
					rel="noopener noreferrer"
					className="flex items-center space-x-2 rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-600 transition-all duration-200 hover:bg-gray-50"
				>
					<span>View on Basescan</span>
					<ExternalLinkIcon className="h-4 w-4" />
				</a>
			</div>
		</div>
	);
}
