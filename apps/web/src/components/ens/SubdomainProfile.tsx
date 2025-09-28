"use client";

import { CheckIcon, CopyIcon, ExternalLinkIcon } from "lucide-react";
import { useState } from "react";
import { normalize } from "viem/ens";
import { useAccount, useEnsAddress, useEnsAvatar, useEnsText } from "wagmi";
import { ENSAvatarField } from "@/components/ens/ENSAvatarField";
import {
	ENSFieldsProvider,
	useENSFields,
} from "@/components/ens/ENSFieldsProvider";
import { ENSGallerySection } from "@/components/ens/ENSGallerySection";
import { ENSHeaderField } from "@/components/ens/ENSHeaderField";
import { ENSLivestreamEmbed } from "@/components/ens/ENSLivestreamEmbed";
import { ENSLivestreamToggle } from "@/components/ens/ENSLivestreamToggle";
import { ENSTextField } from "@/components/ens/ENSTextField";
import { Loader } from "@/components/loader";

// Internal component that uses the ENS fields context
function SubdomainProfileContent({
	ensName,
	ensAddress,
	isOwner,
}: {
	ensName: string;
	ensAddress: string;
	isOwner: boolean;
}) {
	const [copiedField, setCopiedField] = useState<string | null>(null);
	const [activeTab, _setActiveTab] = useState("profile");
	const { saveAllFields, hasChanges, isSaving, saved, getValue } =
		useENSFields();

	// Get livestream data for preview
	const livestreamUrl = getValue("livestream.url");
	const isStreaming = getValue("livestream.active") === "true";

	// Fetch avatar and header from blockchain
	const { data: avatarUrl, isLoading: avatarLoading } = useEnsAvatar({
		name: ensName,
		query: { enabled: !!ensName },
		chainId: 1,
	});

	const { data: headerUrl, isLoading: headerLoading } = useEnsText({
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
		const profileUrl = `${window.location.origin}/profile/${ensName}`;
		handleCopy(profileUrl, "profile-link");
	};

	const handleOpenProfile = () => {
		const profileUrl = `/profile/${ensName}`;
		window.open(profileUrl, "_blank");
	};

	const handleSaveAll = async () => {
		await saveAllFields();
	};

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
				{/* Header Image */}
				<ENSHeaderField
					isOwner={isOwner}
					ensName={ensName}
					headerUrl={headerUrl || ""}
				/>

				{/* Profile Content */}
				<div style={{ padding: "28px 32px 36px" }}>
					{/* Avatar Section */}
					<div style={{ marginBottom: "24px" }}>
						<ENSAvatarField
							isOwner={isOwner}
							ensName={ensName}
							avatarUrl={avatarUrl || ""}
						/>
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

						<button
							type="button"
							onClick={handleOpenProfile}
							style={{
								fontSize: "14px",
								fontWeight: "600",
								color: "#ffffff",
								background: "#156fb3",
								border: "1px solid #156fb3",
								borderRadius: "6px",
								padding: "8px 16px",
								cursor: "pointer",
							}}
						>
							View Public →
						</button>
					</div>
				</div>
			</div>

			{/* Tab Content */}
			<div className="mt-6">
				{activeTab === "profile" && (
					<div className="space-y-6">
						{/* Form Sections with Inline Styles */}
						<div className="grid gap-6 md:grid-cols-2">
							{/* Identity Card */}
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
									For your identity
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
									Tell the world about yourself
								</span>

								<div className="space-y-4">
									<ENSTextField
										recordKey="description"
										label="Description"
										placeholder="Tell us about yourself"
										isOwner={isOwner}
										ensName={ensName}
									/>
								</div>
							</div>

							{/* Contact Card */}
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
									For contact
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
									How people can reach you
								</span>

								<div className="space-y-4">
									<ENSTextField
										recordKey="url"
										label="Website"
										placeholder="https://yourwebsite.com"
										isOwner={isOwner}
										ensName={ensName}
									/>

									<ENSTextField
										recordKey="email"
										label="Email"
										placeholder="your@email.com"
										isOwner={isOwner}
										ensName={ensName}
									/>
								</div>
							</div>
						</div>

						{/* Social Links Card - Full Width */}
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
								For social connections
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
								Connect your social profiles and build your network
							</span>

							<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
								<ENSTextField
									recordKey="com.twitter"
									label="Twitter"
									placeholder="username (without @)"
									isOwner={isOwner}
									ensName={ensName}
								/>

								<ENSTextField
									recordKey="com.github"
									label="GitHub"
									placeholder="username"
									isOwner={isOwner}
									ensName={ensName}
								/>

								<ENSTextField
									recordKey="com.discord"
									label="Discord"
									placeholder="username"
									isOwner={isOwner}
									ensName={ensName}
								/>

								<ENSTextField
									recordKey="com.telegram"
									label="Telegram"
									placeholder="username"
									isOwner={isOwner}
									ensName={ensName}
								/>

								<ENSTextField
									recordKey="social.farcaster"
									label="Farcaster"
									placeholder="username or FID"
									isOwner={isOwner}
									ensName={ensName}
								/>

								<ENSTextField
									recordKey="social.lens"
									label="Lens Protocol"
									placeholder="username.lens"
									isOwner={isOwner}
									ensName={ensName}
								/>
							</div>
						</div>

						{/* Livestream Card */}
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
								For livestreaming
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
								Share your live streams with the community
							</span>

							<div className="space-y-6">
								<ENSTextField
									recordKey="livestream.url"
									label="Livestream URL"
									placeholder="https://twitch.tv/yourstream or https://youtube.com/watch?v=..."
									isOwner={isOwner}
									ensName={ensName}
								/>

								{isOwner && (
									<ENSLivestreamToggle isOwner={isOwner} ensName={ensName} />
								)}
							</div>
						</div>

						{/* Livestream Preview */}
						{livestreamUrl && (
							<ENSLivestreamEmbed
								url={livestreamUrl}
								isStreaming={isStreaming}
								ensName={ensName}
								showPreview={true}
							/>
						)}

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
								For media gallery
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
								Showcase your visual content and creativity
							</span>

							<ENSGallerySection isOwner={isOwner} />
						</div>

						{/* Save All Changes - Card Style Button */}
						{isOwner && (
							<button
								onClick={handleSaveAll}
								disabled={!hasChanges || isSaving}
								style={{
									fontFamily:
										"system-ui, -apple-system, Segoe UI, Roboto, 'Helvetica Neue', Arial, sans-serif",
									background: "#ffffff",
									color: "#2f3044",
									border: "2px solid #2f3044",
									borderBottomWidth: "14px",
									borderRadius: "2px",
									maxWidth: "880px",
									padding: "18px 12px 16px",
									lineHeight: "1.35",
									textAlign: "center",
									cursor: "pointer",
									opacity: !hasChanges || isSaving ? "0.5" : "1",

									display: "block",
								}}
							>
								<span
									style={{
										display: "block",
										textAlign: "center",
										fontSize: "20px",
										fontWeight: "800",
										color: "#156fb3",
									}}
								>
									{isSaving
										? "SAVING..."
										: saved
											? "SAVED!"
											: "SAVE ALL CHANGES"}{" "}
								</span>
							</button>
						)}
					</div>
				)}

				{activeTab === "settings" && (
					<div className="rounded-2xl bg-white p-8 text-center shadow-sm">
						<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
							<div className="h-8 w-8 rounded bg-gray-500" />
						</div>
						<h3 className="mb-2 font-semibold text-gray-900 text-lg">
							Settings
						</h3>
						<p className="text-gray-600">Profile settings and preferences</p>
					</div>
				)}

				{activeTab === "analytics" && (
					<div className="rounded-2xl bg-white p-8 text-center shadow-sm">
						<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
							<div className="h-8 w-8 rounded bg-blue-500" />
						</div>
						<h3 className="mb-2 font-semibold text-gray-900 text-lg">
							Analytics
						</h3>
						<p className="text-gray-600">
							Profile views and engagement metrics
						</p>
					</div>
				)}
			</div>

			{/* Footer Actions */}
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

export function SubdomainProfile({ ensName }: { ensName: string }) {
	const { address } = useAccount();

	// Get the ENS name's address to determine ownership
	const { data: ensAddress, isLoading: addressLoading } = useEnsAddress({
		name: normalize(ensName || ""),
		query: { enabled: !!ensName },
		chainId: 1,
	});

	if (addressLoading) {
		return (
			<div
				className="rounded-2xl border-2 border-gray-100 bg-white p-8 shadow-sm"
				style={{ fontFamily: "var(--font-roboto)" }}
			>
				<div className="flex items-center justify-center">
					<Loader className="mr-3 h-6 w-6 text-blue-500" />
					<span className="font-medium text-gray-700">
						Loading subdomain...
					</span>
				</div>
			</div>
		);
	}

	if (!ensAddress) {
		return (
			<div
				className="rounded-2xl border-2 border-gray-100 bg-white p-8 shadow-sm"
				style={{ fontFamily: "var(--font-roboto)" }}
			>
				<div className="text-center text-gray-600">
					<div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
						<div className="h-6 w-6 rounded bg-gray-300" />
					</div>
					<p className="font-medium">Subdomain not found or not yet resolved</p>
				</div>
			</div>
		);
	}

	const isOwner = ensAddress?.toLowerCase() === address?.toLowerCase();

	return (
		<ENSFieldsProvider ensName={ensName} isOwner={isOwner}>
			<SubdomainProfileContent
				ensName={ensName}
				ensAddress={ensAddress}
				isOwner={isOwner}
			/>
		</ENSFieldsProvider>
	);
}
