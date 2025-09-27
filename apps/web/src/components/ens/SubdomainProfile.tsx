"use client";

import { CheckIcon, CopyIcon, ExternalLinkIcon } from "lucide-react";
import { useState } from "react";
import { normalize } from "viem/ens";
import { useAccount, useEnsAddress } from "wagmi";
import { ENSAvatarField } from "@/components/ens/ENSAvatarField";
import { ENSHeaderField } from "@/components/ens/ENSHeaderField";
import { ENSTextField } from "@/components/ens/ENSTextField";
import { Loader } from "@/components/loader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSetPrimaryName } from "@/hooks/useSetPrimaryName";

export function SubdomainProfile({ ensName }: { ensName: string }) {
	const { address } = useAccount();
	const [copiedField, setCopiedField] = useState<string | null>(null);
	const setPrimaryName = useSetPrimaryName();

	const isCurrentlyPrimary = false;

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

	const handleSetPrimaryName = () => {
		if (!ensName) return;
		setPrimaryName.mutate(ensName);
	};

	if (addressLoading) {
		return (
			<Card className="p-6">
				<div className="flex items-center justify-center">
					<Loader className="mr-2 h-6 w-6" />
					<span>Loading subdomain...</span>
				</div>
			</Card>
		);
	}

	if (!ensAddress) {
		return (
			<Card className="p-6">
				<div className="text-center text-muted-foreground">
					Subdomain not found or not yet resolved
				</div>
			</Card>
		);
	}

	const isOwner = ensAddress?.toLowerCase() === address?.toLowerCase();

	return (
		<Card className="overflow-hidden">
			{/* Header Image - only shows if owner has set one */}
			<ENSHeaderField ensName={ensName} isOwner={isOwner} />

			<div className="space-y-6 p-6">
				{/* Header Info */}
				<div className="flex items-center justify-between">
					<div>
						<div className="flex items-center space-x-2">
							<h2 className="font-semibold text-xl">{ensName}</h2>
							{isCurrentlyPrimary && (
								<span className="rounded-full bg-green-100 px-2 py-1 text-green-800 text-xs">
									Primary Name
								</span>
							)}
						</div>
						<div className="flex items-center space-x-2 text-muted-foreground text-sm">
							<span>Owner: {ensAddress}</span>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => handleCopy(ensAddress || "", "address")}
								className="h-6 w-6 p-0"
							>
								{copiedField === "address" ? (
									<CheckIcon className="h-3 w-3" />
								) : (
									<CopyIcon className="h-3 w-3" />
								)}
							</Button>
						</div>
					</div>

					<div className="flex space-x-2">
						{isOwner && !isCurrentlyPrimary && (
							<Button
								variant="outline"
								size="sm"
								onClick={handleSetPrimaryName}
								disabled={setPrimaryName.isPending}
							>
								{setPrimaryName.isPending ? (
									<div className="flex items-center space-x-2">
										<Loader className="h-3 w-3" />
										<span>Setting...</span>
									</div>
								) : (
									"Set as Primary"
								)}
							</Button>
						)}
					</div>
				</div>

				{/* Primary Name Status & Errors */}
				{setPrimaryName.error && (
					<div className="text-red-600 text-sm">
						Error setting primary name: {setPrimaryName.error.message}
					</div>
				)}

				{setPrimaryName.isSuccess && (
					<div className="text-green-600 text-sm">
						Primary name set successfully! It may take a few moments to update.
					</div>
				)}

				{/* Avatar */}
				<ENSAvatarField ensName={ensName} isOwner={isOwner} />

				{/* Profile Fields */}
				<div className="space-y-6">
					{/* Identity Section */}
					<div className="space-y-4">
						<h4 className="font-medium text-sm">Identity</h4>

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
						<h4 className="font-medium text-sm">Social Links</h4>

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
						</div>
					</div>

					{/* Contact Section */}
					<div className="space-y-4">
						<h4 className="font-medium text-sm">Contact</h4>

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

				{/* Actions */}
				<div className="flex items-center space-x-4 text-muted-foreground text-sm">
					<Button
						variant="ghost"
						size="sm"
						onClick={() => handleCopy(ensName || "", "name")}
					>
						{copiedField === "name" ? (
							<CheckIcon className="mr-1 h-4 w-4" />
						) : (
							<CopyIcon className="mr-1 h-4 w-4" />
						)}
						Copy Name
					</Button>

					<a
						href={`https://basescan.org/address/${ensAddress}`}
						target="_blank"
						rel="noopener noreferrer"
						className="flex items-center space-x-1 hover:underline"
					>
						<span>View on Basescan</span>
						<ExternalLinkIcon className="h-3 w-3" />
					</a>
				</div>
			</div>
		</Card>
	);
}
