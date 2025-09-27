"use client";

import { CheckIcon, CopyIcon, ExternalLinkIcon, LinkIcon } from "lucide-react";
import { useState } from "react";
import { normalize } from "viem/ens";
import { useAccount, useEnsAddress } from "wagmi";
import { ProfileHeaderEditable } from "@/components/ens/ProfileHeaderEditable";
import { ENSTextField } from "@/components/ens/ENSTextField";
import { Loader } from "@/components/loader";

export function SubdomainProfile({ ensName }: { ensName: string }) {
	const { address } = useAccount();
	const [copiedField, setCopiedField] = useState<string | null>(null);

	// Get the ENS name's address to determine ownership
	const { data: ensAddress, isLoading: addressLoading } = useEnsAddress({
		name: normalize(ensName || ""),
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
		<div
			className="overflow-hidden rounded-2xl border-2 border-gray-100 bg-white shadow-sm"
			style={{ fontFamily: "var(--font-roboto)" }}
		>
			{/* Profile Header with Cover Image and Avatar */}
			<ProfileHeaderEditable
				ensName={ensName}
				ensAddress={ensAddress || ""}
				onCopy={handleCopy}
				copiedField={copiedField}
				isOwner={isOwner}
			/>

			<div className="space-y-8 p-8">
				{/* Header Info */}
				<div className="space-y-6">

					{/* Profile Actions */}
					<div className="flex flex-wrap items-center gap-3">
						<button
							type="button"
							onClick={handleCopyProfileLink}
							className="flex items-center space-x-2 rounded-lg border-2 border-gray-200 px-4 py-2 font-medium text-gray-700 transition-all duration-200 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600"
						>
							{copiedField === "profile-link" ? (
								<CheckIcon className="h-4 w-4 text-green-600" />
							) : (
								<LinkIcon className="h-4 w-4" />
							)}
							<span>Copy Profile Link</span>
						</button>

						<button
							type="button"
							onClick={handleOpenProfile}
							className="flex items-center space-x-2 rounded-lg border-2 border-gray-200 px-4 py-2 font-medium text-gray-700 transition-all duration-200 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600"
						>
							<ExternalLinkIcon className="h-4 w-4" />
							<span>View Public Profile</span>
						</button>
					</div>
				</div>

				{/* Profile Fields */}
				<div className="space-y-8">
					{/* Identity Section */}
					<div className="space-y-4">
						<div className="flex items-center space-x-2">
							<div className="h-6 w-1 rounded-full bg-blue-500" />
							<h4 className="font-bold text-gray-900 text-lg">Identity</h4>
						</div>

						<ENSTextField
							ensName={ensName}
							recordKey="description"
							label="Description"
							placeholder="Tell us about yourself"
							isOwner={isOwner}
						/>
					</div>

					{/* Social Links Section */}
					<div className="space-y-4">
						<div className="flex items-center space-x-2">
							<div className="h-6 w-1 rounded-full bg-blue-500" />
							<h4 className="font-bold text-gray-900 text-lg">Social Links</h4>
						</div>

						<div className="space-y-4">
							<ENSTextField
								ensName={ensName}
								recordKey="com.twitter"
								label="Twitter"
								placeholder="username (without @)"
								isOwner={isOwner}
							/>

							<ENSTextField
								ensName={ensName}
								recordKey="com.github"
								label="GitHub"
								placeholder="username"
								isOwner={isOwner}
							/>

							<ENSTextField
								ensName={ensName}
								recordKey="com.discord"
								label="Discord"
								placeholder="username"
								isOwner={isOwner}
							/>

							<ENSTextField
								ensName={ensName}
								recordKey="com.telegram"
								label="Telegram"
								placeholder="username"
								isOwner={isOwner}
							/>

							<ENSTextField
								ensName={ensName}
								recordKey="social.farcaster"
								label="Farcaster"
								placeholder="username or FID"
								isOwner={isOwner}
							/>

							<ENSTextField
								ensName={ensName}
								recordKey="social.lens"
								label="Lens Protocol"
								placeholder="username.lens"
								isOwner={isOwner}
							/>
						</div>
					</div>

					{/* Contact Section */}
					<div className="space-y-4">
						<div className="flex items-center space-x-2">
							<div className="h-6 w-1 rounded-full bg-blue-500" />
							<h4 className="font-bold text-gray-900 text-lg">Contact</h4>
						</div>

						<ENSTextField
							ensName={ensName}
							recordKey="url"
							label="Website"
							placeholder="https://yourwebsite.com"
							isOwner={isOwner}
						/>

						<ENSTextField
							ensName={ensName}
							recordKey="email"
							label="Email"
							placeholder="your@email.com"
							isOwner={isOwner}
						/>
					</div>
				</div>

				{/* Secondary Actions */}
				<div className="flex flex-wrap items-center gap-4 border-gray-100 border-t pt-6">
					<button
						type="button"
						onClick={() => handleCopy(ensName || "", "name")}
						className="flex items-center space-x-2 font-medium text-gray-600 text-sm transition-colors hover:text-blue-600"
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
						className="flex items-center space-x-2 font-medium text-gray-600 text-sm transition-colors hover:text-blue-600"
					>
						<span>View on Basescan</span>
						<ExternalLinkIcon className="h-4 w-4" />
					</a>
				</div>
			</div>
		</div>
	);
}
