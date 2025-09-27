"use client";

import Image from "next/image";
import { useState } from "react";
import { Loader } from "@/components/loader";

interface ProfileHeaderProps {
	coverImageUrl?: string;
	avatarUrl?: string;
	ensName: string;
	ensAddress: string;
	onCopy: (text: string, field: string) => void;
	copiedField: string | null;
	avatarLoading?: boolean;
	actions?: React.ReactNode;
}

export function ProfileHeader({
	coverImageUrl,
	avatarUrl,
	ensName,
	ensAddress,
	onCopy,
	copiedField,
	avatarLoading = false,
	actions,
}: ProfileHeaderProps) {
	const [coverLoading, setCoverLoading] = useState(true);
	const [coverError, setCoverError] = useState(false);
	const [profileAvatarLoading, setProfileAvatarLoading] = useState(true);
	const [profileAvatarError, setProfileAvatarError] = useState(false);

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

	return (
		<div className="relative">
			{/* Cover Image */}
			<div className="relative h-48 w-full md:h-64">
				{coverImageUrl && !coverError ? (
					<>
						{coverLoading && (
							<div className="absolute inset-0 flex items-center justify-center bg-muted">
								<Loader className="h-6 w-6" />
							</div>
						)}
						<Image
							src={coverImageUrl}
							alt={`${ensName} cover`}
							fill
							className={`object-cover ${coverLoading ? "opacity-0" : "opacity-100"}`}
							onLoad={handleCoverLoad}
							onError={handleCoverError}
							unoptimized={coverImageUrl.startsWith("data:")}
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
						{avatarUrl && !profileAvatarError && !avatarLoading ? (
							<>
								{profileAvatarLoading && (
									<div className="absolute inset-0 flex items-center justify-center rounded-full border-4 border-background bg-muted">
										<Loader className="h-6 w-6" />
									</div>
								)}
								<Image
									src={avatarUrl}
									alt={`${ensName} avatar`}
									fill
									className={`rounded-full border-4 border-background object-cover ${profileAvatarLoading ? "opacity-0" : "opacity-100"}`}
									onLoad={handleAvatarLoad}
									onError={handleAvatarError}
									unoptimized={avatarUrl.startsWith("data:")}
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

					{/* Action Buttons */}
					{actions && (
						<div className="flex flex-wrap items-center gap-3 md:flex-shrink-0">
							{actions}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
