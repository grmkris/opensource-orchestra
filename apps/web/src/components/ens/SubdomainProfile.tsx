"use client";

import { CheckIcon, CopyIcon, ExternalLinkIcon, SaveIcon } from "lucide-react";
import Image from "next/image";
import { useId, useState } from "react";
import { useAccount } from "wagmi";
import { Loader } from "@/components/loader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSubdomainData } from "@/hooks/useENSSubdomain";
import { useSetPrimaryName } from "@/hooks/useSetPrimaryName";
import { useSetTextRecords } from "@/hooks/useSetTextRecords";
import type { TextRecordKey } from "@/lib/ens/ens-contracts";

export function SubdomainProfile({ ensName }: { ensName: string }) {
	const { address } = useAccount();
	const subdomainData = useSubdomainData(ensName);
	const [copiedField, setCopiedField] = useState<string | null>(null);
	const setPrimaryName = useSetPrimaryName();

	const isCurrentlyPrimary = false;

	// Form state for editing
	const [formData, setFormData] = useState({
		avatar: subdomainData?.subdomain?.avatar || "",
		description: subdomainData?.subdomain?.description || "",
		display: subdomainData?.subdomain?.display || "",
		twitter: subdomainData?.subdomain?.twitter || "",
		github: subdomainData?.subdomain?.github || "",
		discord: subdomainData?.subdomain?.discord || "",
		telegram: subdomainData?.subdomain?.telegram || "",
		url: subdomainData?.subdomain?.url || "",
		email: subdomainData?.subdomain?.email || "",
	});

	// Individual field save states
	const [savingField, setSavingField] = useState<TextRecordKey | null>(null);
	const [savedField, setSavedField] = useState<TextRecordKey | null>(null);

	const setTextRecords = useSetTextRecords();

	const avatarId = useId();
	const displayId = useId();
	const descriptionId = useId();
	const twitterId = useId();
	const githubId = useId();
	const discordId = useId();
	const telegramId = useId();
	const urlId = useId();
	const emailId = useId();

	const handleCopy = async (text: string, field: string) => {
		try {
			await navigator.clipboard.writeText(text);
			setCopiedField(field);
			setTimeout(() => setCopiedField(null), 2000);
		} catch (err) {
			console.error("Failed to copy:", err);
		}
	};

	const handleSaveField = async (key: TextRecordKey, value: string) => {
		setSavingField(key);
		setSavedField(null);

		try {
			await setTextRecords.mutateAsync({
				label: ensName,
				key,
				value,
			});
			setSavedField(key);
			setTimeout(() => setSavedField(null), 3000);
		} catch (error) {
			console.error(`Error saving ${key}:`, error);
		} finally {
			setSavingField(null);
		}
	};

	const handleSetPrimaryName = () => {
		if (!ensName) return;
		setPrimaryName.mutate(ensName);
	};

	if (subdomainData?.isLoading) {
		return (
			<Card className="p-6">
				<div className="flex items-center justify-center">
					<Loader className="mr-2 h-6 w-6" />
					<span>Loading subdomain...</span>
				</div>
			</Card>
		);
	}

	if (!subdomainData?.subdomain) {
		return (
			<Card className="p-6">
				<div className="text-center text-muted-foreground">
					Subdomain not found or not yet resolved
				</div>
			</Card>
		);
	}

	const isOwner =
		subdomainData.subdomain.address?.toLowerCase() === address?.toLowerCase();

	return (
		<Card className="p-6">
			<div className="space-y-6">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<div className="flex items-center space-x-2">
							<h2 className="font-semibold text-xl">
								{subdomainData.subdomain.name}
							</h2>
							{isCurrentlyPrimary && (
								<span className="rounded-full bg-green-100 px-2 py-1 text-green-800 text-xs">
									Primary Name
								</span>
							)}
						</div>
						<div className="flex items-center space-x-2 text-muted-foreground text-sm">
							<span>Owner: {subdomainData.subdomain.address}</span>
							<Button
								variant="ghost"
								size="sm"
								onClick={() =>
									handleCopy(subdomainData.subdomain?.address || "", "address")
								}
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
								disabled={setPrimaryName.isPending || subdomainData?.isLoading}
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
				<div className="flex justify-center">
					{subdomainData.subdomain.avatar ? (
						<Image
							src={subdomainData.subdomain.avatar}
							alt={`${subdomainData.subdomain.name} avatar`}
							width={96}
							height={96}
							className="h-24 w-24 rounded-full object-cover"
						/>
					) : (
						<div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted text-muted-foreground text-sm">
							No Avatar
						</div>
					)}
				</div>

				{/* Profile Content */}
				<div className="space-y-6">
					{isOwner ? (
						<>
							{/* Identity Section - Editable */}
							<div className="space-y-4">
								<h4 className="font-medium text-sm">Identity</h4>

								<div className="flex items-end space-x-2">
									<div className="flex-1">
										<Label htmlFor="avatar">Avatar URL</Label>
										<Input
											id={avatarId}
											placeholder="https://example.com/avatar.jpg or ipfs://..."
											value={formData.avatar}
											onChange={(e) =>
												setFormData((prev) => ({
													...prev,
													avatar: e.target.value,
												}))
											}
										/>
									</div>
									<Button
										size="sm"
										onClick={() => handleSaveField("avatar", formData.avatar)}
										disabled={savingField === "avatar"}
									>
										{savingField === "avatar" ? (
											<Loader className="h-4 w-4" />
										) : savedField === "avatar" ? (
											<CheckIcon className="h-4 w-4" />
										) : (
											<SaveIcon className="h-4 w-4" />
										)}
									</Button>
								</div>

								<div className="flex items-end space-x-2">
									<div className="flex-1">
										<Label htmlFor="display">Display Name</Label>
										<Input
											id={displayId}
											placeholder="Your display name"
											value={formData.display}
											onChange={(e) =>
												setFormData((prev) => ({
													...prev,
													display: e.target.value,
												}))
											}
										/>
									</div>
									<Button
										size="sm"
										onClick={() => handleSaveField("display", formData.display)}
										disabled={savingField === "display"}
									>
										{savingField === "display" ? (
											<Loader className="h-4 w-4" />
										) : savedField === "display" ? (
											<CheckIcon className="h-4 w-4" />
										) : (
											<SaveIcon className="h-4 w-4" />
										)}
									</Button>
								</div>

								<div className="flex items-end space-x-2">
									<div className="flex-1">
										<Label htmlFor="description">Bio</Label>
										<Input
											id={descriptionId}
											placeholder="Tell us about yourself"
											value={formData.description}
											onChange={(e) =>
												setFormData((prev) => ({
													...prev,
													description: e.target.value,
												}))
											}
										/>
									</div>
									<Button
										size="sm"
										onClick={() =>
											handleSaveField("description", formData.description)
										}
										disabled={savingField === "description"}
									>
										{savingField === "description" ? (
											<Loader className="h-4 w-4" />
										) : savedField === "description" ? (
											<CheckIcon className="h-4 w-4" />
										) : (
											<SaveIcon className="h-4 w-4" />
										)}
									</Button>
								</div>
							</div>

							{/* Social Links Section - Editable */}
							<div className="space-y-4">
								<h4 className="font-medium text-sm">Social Links</h4>

								<div className="space-y-4">
									<div className="flex items-end space-x-2">
										<div className="flex-1">
											<Label htmlFor="twitter">Twitter</Label>
											<Input
												id={twitterId}
												placeholder="username (without @)"
												value={formData.twitter}
												onChange={(e) =>
													setFormData((prev) => ({
														...prev,
														twitter: e.target.value,
													}))
												}
											/>
										</div>
										<Button
											size="sm"
											onClick={() =>
												handleSaveField("com.twitter", formData.twitter)
											}
											disabled={savingField === "com.twitter"}
										>
											{savingField === "com.twitter" ? (
												<Loader className="h-4 w-4" />
											) : savedField === "com.twitter" ? (
												<CheckIcon className="h-4 w-4" />
											) : (
												<SaveIcon className="h-4 w-4" />
											)}
										</Button>
									</div>

									<div className="flex items-end space-x-2">
										<div className="flex-1">
											<Label htmlFor="github">GitHub</Label>
											<Input
												id={githubId}
												placeholder="username"
												value={formData.github}
												onChange={(e) =>
													setFormData((prev) => ({
														...prev,
														github: e.target.value,
													}))
												}
											/>
										</div>
										<Button
											size="sm"
											onClick={() =>
												handleSaveField("com.github", formData.github)
											}
											disabled={savingField === "com.github"}
										>
											{savingField === "com.github" ? (
												<Loader className="h-4 w-4" />
											) : savedField === "com.github" ? (
												<CheckIcon className="h-4 w-4" />
											) : (
												<SaveIcon className="h-4 w-4" />
											)}
										</Button>
									</div>

									<div className="flex items-end space-x-2">
										<div className="flex-1">
											<Label htmlFor="discord">Discord</Label>
											<Input
												id={discordId}
												placeholder="username"
												value={formData.discord}
												onChange={(e) =>
													setFormData((prev) => ({
														...prev,
														discord: e.target.value,
													}))
												}
											/>
										</div>
										<Button
											size="sm"
											onClick={() =>
												handleSaveField("com.discord", formData.discord)
											}
											disabled={savingField === "com.discord"}
										>
											{savingField === "com.discord" ? (
												<Loader className="h-4 w-4" />
											) : savedField === "com.discord" ? (
												<CheckIcon className="h-4 w-4" />
											) : (
												<SaveIcon className="h-4 w-4" />
											)}
										</Button>
									</div>

									<div className="flex items-end space-x-2">
										<div className="flex-1">
											<Label htmlFor="telegram">Telegram</Label>
											<Input
												id={telegramId}
												placeholder="username"
												value={formData.telegram}
												onChange={(e) =>
													setFormData((prev) => ({
														...prev,
														telegram: e.target.value,
													}))
												}
											/>
										</div>
										<Button
											size="sm"
											onClick={() =>
												handleSaveField("com.telegram", formData.telegram)
											}
											disabled={savingField === "com.telegram"}
										>
											{savingField === "com.telegram" ? (
												<Loader className="h-4 w-4" />
											) : savedField === "com.telegram" ? (
												<CheckIcon className="h-4 w-4" />
											) : (
												<SaveIcon className="h-4 w-4" />
											)}
										</Button>
									</div>
								</div>
							</div>

							{/* Contact Section - Editable */}
							<div className="space-y-4">
								<h4 className="font-medium text-sm">Contact</h4>

								<div className="flex items-end space-x-2">
									<div className="flex-1">
										<Label htmlFor="url">Website</Label>
										<Input
											id={urlId}
											placeholder="https://yourwebsite.com"
											value={formData.url}
											onChange={(e) =>
												setFormData((prev) => ({
													...prev,
													url: e.target.value,
												}))
											}
										/>
									</div>
									<Button
										size="sm"
										onClick={() => handleSaveField("url", formData.url)}
										disabled={savingField === "url"}
									>
										{savingField === "url" ? (
											<Loader className="h-4 w-4" />
										) : savedField === "url" ? (
											<CheckIcon className="h-4 w-4" />
										) : (
											<SaveIcon className="h-4 w-4" />
										)}
									</Button>
								</div>

								<div className="flex items-end space-x-2">
									<div className="flex-1">
										<Label htmlFor="email">Email</Label>
										<Input
											id={emailId}
											placeholder="your@email.com"
											value={formData.email}
											onChange={(e) =>
												setFormData((prev) => ({
													...prev,
													email: e.target.value,
												}))
											}
										/>
									</div>
									<Button
										size="sm"
										onClick={() => handleSaveField("email", formData.email)}
										disabled={savingField === "email"}
									>
										{savingField === "email" ? (
											<Loader className="h-4 w-4" />
										) : savedField === "email" ? (
											<CheckIcon className="h-4 w-4" />
										) : (
											<SaveIcon className="h-4 w-4" />
										)}
									</Button>
								</div>
							</div>
						</>
					) : (
						<>
							{/* Read-only view for non-owners */}
							<div className="space-y-4">
								{/* Identity Section */}
								<div className="space-y-2">
									<div>
										<span className="font-medium text-muted-foreground text-sm">
											Display Name:
										</span>
										{subdomainData.subdomain.display ? (
											<h3 className="font-medium">
												{subdomainData.subdomain.display}
											</h3>
										) : (
											<p className="text-muted-foreground italic">Not set</p>
										)}
									</div>

									<div>
										<span className="font-medium text-muted-foreground text-sm">
											Bio:
										</span>
										{subdomainData.subdomain.description ? (
											<p className="text-muted-foreground">
												{subdomainData.subdomain.description}
											</p>
										) : (
											<p className="text-muted-foreground italic">
												No bio added yet
											</p>
										)}
									</div>
								</div>

								{/* Social Links Section */}
								<div className="space-y-2">
									<h4 className="font-medium text-sm">Social Links</h4>
									<div className="grid grid-cols-2 gap-2 text-sm">
										<div className="flex items-center space-x-2">
											<span className="text-muted-foreground">Twitter:</span>
											{subdomainData.subdomain.twitter ? (
												<a
													href={`https://twitter.com/${subdomainData.subdomain.twitter}`}
													target="_blank"
													rel="noopener noreferrer"
													className="flex items-center space-x-1 text-blue-600 hover:underline"
												>
													<span>@{subdomainData.subdomain.twitter}</span>
													<ExternalLinkIcon className="h-3 w-3" />
												</a>
											) : (
												<span className="text-muted-foreground italic">
													Not set
												</span>
											)}
										</div>

										<div className="flex items-center space-x-2">
											<span className="text-muted-foreground">GitHub:</span>
											{subdomainData.subdomain.github ? (
												<a
													href={`https://github.com/${subdomainData.subdomain.github}`}
													target="_blank"
													rel="noopener noreferrer"
													className="flex items-center space-x-1 text-blue-600 hover:underline"
												>
													<span>{subdomainData.subdomain.github}</span>
													<ExternalLinkIcon className="h-3 w-3" />
												</a>
											) : (
												<span className="text-muted-foreground italic">
													Not set
												</span>
											)}
										</div>

										<div className="flex items-center space-x-2">
											<span className="text-muted-foreground">Discord:</span>
											{subdomainData.subdomain.discord ? (
												<span>{subdomainData.subdomain.discord}</span>
											) : (
												<span className="text-muted-foreground italic">
													Not set
												</span>
											)}
										</div>

										<div className="flex items-center space-x-2">
											<span className="text-muted-foreground">Telegram:</span>
											{subdomainData.subdomain.telegram ? (
												<span>{subdomainData.subdomain.telegram}</span>
											) : (
												<span className="text-muted-foreground italic">
													Not set
												</span>
											)}
										</div>
									</div>
								</div>

								{/* Contact Section */}
								<div className="space-y-2">
									<h4 className="font-medium text-sm">Contact</h4>
									<div className="grid grid-cols-2 gap-2 text-sm">
										<div className="flex items-center space-x-2">
											<span className="text-muted-foreground">Website:</span>
											{subdomainData.subdomain.url ? (
												<a
													href={subdomainData.subdomain.url}
													target="_blank"
													rel="noopener noreferrer"
													className="flex items-center space-x-1 text-blue-600 hover:underline"
												>
													<span>Visit</span>
													<ExternalLinkIcon className="h-3 w-3" />
												</a>
											) : (
												<span className="text-muted-foreground italic">
													Not set
												</span>
											)}
										</div>

										<div className="flex items-center space-x-2">
											<span className="text-muted-foreground">Email:</span>
											{subdomainData.subdomain.email ? (
												<a
													href={`mailto:${subdomainData.subdomain.email}`}
													className="text-blue-600 hover:underline"
												>
													{subdomainData.subdomain.email}
												</a>
											) : (
												<span className="text-muted-foreground italic">
													Not set
												</span>
											)}
										</div>
									</div>
								</div>
							</div>
						</>
					)}
				</div>

				{/* Actions */}
				<div className="flex items-center space-x-4 text-muted-foreground text-sm">
					<Button
						variant="ghost"
						size="sm"
						onClick={() =>
							handleCopy(subdomainData.subdomain?.name || "", "name")
						}
					>
						{copiedField === "name" ? (
							<CheckIcon className="mr-1 h-4 w-4" />
						) : (
							<CopyIcon className="mr-1 h-4 w-4" />
						)}
						Copy Name
					</Button>

					<a
						href={`https://basescan.org/address/${subdomainData.subdomain?.address}`}
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
