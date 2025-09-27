"use client";

import { ArrowRight, SkipForward } from "lucide-react";
import { ENSAvatarField } from "@/components/ens/ENSAvatarField";
import { ENSHeaderField } from "@/components/ens/ENSHeaderField";
import { Button } from "@/components/ui/button";

interface StepVisualsProps {
	ensName: string;
	onNext: () => void;
	onSkip: () => void;
}

export function StepVisuals({ ensName, onNext, onSkip }: StepVisualsProps) {
	return (
		<div
			className="rounded-2xl border-2 border-gray-100 bg-white p-8 shadow-sm"
			style={{ fontFamily: "var(--font-roboto)" }}
		>
			<div className="space-y-6">
				<div className="text-center">
					<div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100">
						<div className="h-8 w-8 rounded-lg bg-blue-500" />
					</div>
					<h2 className="mb-2 font-bold text-2xl text-gray-900">
						Visual Identity
					</h2>
					<p className="text-gray-600">
						Upload a profile picture and header image to personalize your profile.
					</p>
				</div>

				<div className="space-y-8">
					{/* Avatar Section */}
					<div className="space-y-4">
						<div className="flex items-center space-x-2">
							<div className="h-6 w-1 rounded-full bg-blue-500" />
							<h4 className="font-bold text-gray-900 text-lg">Profile Picture</h4>
						</div>
						
						<ENSAvatarField ensName={ensName} isOwner={true} />
					</div>

					{/* Header Image Section */}
					<div className="space-y-4">
						<div className="flex items-center space-x-2">
							<div className="h-6 w-1 rounded-full bg-blue-500" />
							<h4 className="font-bold text-gray-900 text-lg">Cover Image</h4>
						</div>
						
						<ENSHeaderField ensName={ensName} isOwner={true} />
					</div>
				</div>

				<div className="flex items-center justify-between pt-4">
					<Button
						variant="ghost"
						onClick={onSkip}
						className="flex items-center space-x-2"
					>
						<SkipForward className="h-4 w-4" />
						<span>Skip for now</span>
					</Button>

					<Button
						onClick={onNext}
						className="flex items-center space-x-2"
					>
						<span>Continue</span>
						<ArrowRight className="h-4 w-4" />
					</Button>
				</div>

				<div className="text-center">
					<p className="text-gray-500 text-sm">
						Images are stored on IPFS and linked to your ENS name on-chain.
					</p>
				</div>
			</div>
		</div>
	);
}