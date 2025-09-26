"use client";

import { CheckIcon, CopyIcon, ExternalLinkIcon } from "lucide-react";
import { useId, useState } from "react";
import { useAccount } from "wagmi";
import { Loader } from "@/components/loader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSubdomainData } from "@/hooks/useENSSubdomain";
import { useUpdateProfile } from "@/hooks/useSetTextRecords";
import Image from "next/image";

interface SubdomainProfileProps {
	label: string;
	onProfileUpdate?: () => void;
}

export function SubdomainProfile({
	label,
	onProfileUpdate,
}: SubdomainProfileProps) {
	const { address } = useAccount();
	const { subdomain, isLoading } = useSubdomainData(label);
	const [isEditing, setIsEditing] = useState(false);
	const [copiedField, setCopiedField] = useState<string | null>(null);

	// Form state for editing
	const [formData, setFormData] = useState({
		avatar: "",
		description: "",
		display: "",
		twitter: "",
		github: "",
		discord: "",
		telegram: "",
		url: "",
		email: "",
	});

	const { updateProfile, isPending, isConfirmed } = useUpdateProfile({
		onSuccess: () => {
			setIsEditing(false);
			onProfileUpdate?.();
		},
	});

	// Initialize form data when subdomain loads
	useState(() => {
		if (subdomain) {
			setFormData({
				avatar: subdomain.avatar || "",
				description: subdomain.description || "",
				display: subdomain.display || "",
				twitter: subdomain.twitter || "",
				github: subdomain.github || "",
				discord: subdomain.discord || "",
				telegram: subdomain.telegram || "",
				url: subdomain.url || "",
				email: subdomain.email || "",
			});
		}
	});
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

	const handleSave = () => {
		if (!label) return;
		updateProfile(label, formData);
	};

	const handleCancel = () => {
		// Reset form data
		if (subdomain) {
			setFormData({
				avatar: subdomain.avatar || "",
				description: subdomain.description || "",
				display: subdomain.display || "",
				twitter: subdomain.twitter || "",
				github: subdomain.github || "",
				discord: subdomain.discord || "",
				telegram: subdomain.telegram || "",
				url: subdomain.url || "",
				email: subdomain.email || "",
			});
		}
		setIsEditing(false);
	};

	if (isLoading) {
		return (
			<Card className="p-6">
				<div className="flex items-center justify-center">
					<Loader className="mr-2 h-6 w-6" />
					<span>Loading subdomain...</span>
				</div>
			</Card>
		);
	}

	if (!subdomain) {
		return (
			<Card className="p-6">
				<div className="text-center text-muted-foreground">
					Subdomain not found or not yet resolved
				</div>
			</Card>
		);
	}

	const isOwner = subdomain.address?.toLowerCase() === address?.toLowerCase();

	return (
		<Card className="p-6">
			<div className="space-y-6">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<h2 className="font-semibold text-xl">{subdomain.name}</h2>
						<div className="flex items-center space-x-2 text-muted-foreground text-sm">
							<span>Owner: {subdomain.address}</span>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => handleCopy(subdomain.address!, "address")}
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

					{isOwner && !isEditing && (
						<Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
					)}
				</div>

				{/* Avatar */}
				{subdomain.avatar && (
					<div className="flex justify-center">
						<Image
							src={subdomain.avatar}
							alt={`${subdomain.name} avatar`}
							width={96}
							height={96}
							className="h-24 w-24 rounded-full object-cover"
						/>
					</div>
				)}

				{/* Profile Content */}
				{isEditing && isOwner ? (
					<div className="space-y-4">
						<div>
							<Label htmlFor="avatar">Avatar URL</Label>
							<Input
								id={avatarId}
								placeholder="https://example.com/avatar.jpg or ipfs://..."
								value={formData.avatar}
								onChange={(e) =>
									setFormData((prev) => ({ ...prev, avatar: e.target.value }))
								}
							/>
						</div>

						<div>
							<Label htmlFor="display">Display Name</Label>
							<Input
								id={displayId}
								placeholder="Your display name"
								value={formData.display}
								onChange={(e) =>
									setFormData((prev) => ({ ...prev, display: e.target.value }))
								}
							/>
						</div>

						<div>
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

						<div className="grid grid-cols-2 gap-4">
							<div>
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

							<div>
								<Label htmlFor="github">GitHub</Label>
								<Input
									id={githubId}
									placeholder="username"
									value={formData.github}
									onChange={(e) =>
										setFormData((prev) => ({ ...prev, github: e.target.value }))
									}
								/>
							</div>

							<div>
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

							<div>
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
						</div>

						<div>
							<Label htmlFor="url">Website</Label>
							<Input
								id={urlId}
								placeholder="https://yourwebsite.com"
								value={formData.url}
								onChange={(e) =>
									setFormData((prev) => ({ ...prev, url: e.target.value }))
								}
							/>
						</div>

						<div>
							<Label htmlFor="email">Email</Label>
							<Input
								id={emailId}
								placeholder="your@email.com"
								value={formData.email}
								onChange={(e) =>
									setFormData((prev) => ({ ...prev, email: e.target.value }))
								}
							/>
						</div>

						<div className="flex space-x-2">
							<Button onClick={handleSave} disabled={isPending}>
								{isPending ? (
									<div className="flex items-center space-x-2">
										<Loader className="h-4 w-4" />
										<span>Saving...</span>
									</div>
								) : (
									"Save Profile"
								)}
							</Button>
							<Button
								variant="outline"
								onClick={handleCancel}
								disabled={isPending}
							>
								Cancel
							</Button>
						</div>

						{isConfirmed && (
							<div className="text-green-600 text-sm">
								Profile updated successfully!
							</div>
						)}
					</div>
				) : (
					<div className="space-y-4">
						{/* Display Mode */}
						{subdomain.display && (
							<div>
								<h3 className="font-medium">{subdomain.display}</h3>
							</div>
						)}

						{subdomain.description && (
							<div>
								<p className="text-muted-foreground">{subdomain.description}</p>
							</div>
						)}

						{/* Social Links */}
						<div className="grid grid-cols-2 gap-2 text-sm">
							{subdomain.twitter && (
								<div className="flex items-center space-x-2">
									<span className="text-muted-foreground">Twitter:</span>
									<a
										href={`https://twitter.com/${subdomain.twitter}`}
										target="_blank"
										rel="noopener noreferrer"
										className="flex items-center space-x-1 text-blue-600 hover:underline"
									>
										<span>@{subdomain.twitter}</span>
										<ExternalLinkIcon className="h-3 w-3" />
									</a>
								</div>
							)}

							{subdomain.github && (
								<div className="flex items-center space-x-2">
									<span className="text-muted-foreground">GitHub:</span>
									<a
										href={`https://github.com/${subdomain.github}`}
										target="_blank"
										rel="noopener noreferrer"
										className="flex items-center space-x-1 text-blue-600 hover:underline"
									>
										<span>{subdomain.github}</span>
										<ExternalLinkIcon className="h-3 w-3" />
									</a>
								</div>
							)}

							{subdomain.url && (
								<div className="flex items-center space-x-2">
									<span className="text-muted-foreground">Website:</span>
									<a
										href={subdomain.url}
										target="_blank"
										rel="noopener noreferrer"
										className="flex items-center space-x-1 text-blue-600 hover:underline"
									>
										<span>Visit</span>
										<ExternalLinkIcon className="h-3 w-3" />
									</a>
								</div>
							)}

							{subdomain.email && (
								<div className="flex items-center space-x-2">
									<span className="text-muted-foreground">Email:</span>
									<a
										href={`mailto:${subdomain.email}`}
										className="text-blue-600 hover:underline"
									>
										{subdomain.email}
									</a>
								</div>
							)}
						</div>
					</div>
				)}

				{/* Actions */}
				<div className="flex items-center space-x-4 text-muted-foreground text-sm">
					<Button
						variant="ghost"
						size="sm"
						onClick={() => handleCopy(subdomain.name, "name")}
					>
						{copiedField === "name" ? (
							<CheckIcon className="mr-1 h-4 w-4" />
						) : (
							<CopyIcon className="mr-1 h-4 w-4" />
						)}
						Copy Name
					</Button>

					<a
						href={`https://basescan.org/address/${subdomain.address}`}
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
