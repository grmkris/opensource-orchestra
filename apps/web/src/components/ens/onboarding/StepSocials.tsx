"use client";

import { ArrowRight, SkipForward } from "lucide-react";
import { ENSTextField } from "@/components/ens/ENSTextField";
import { Button } from "@/components/ui/button";

interface StepSocialsProps {
	ensName: string;
	onNext: () => void;
	onSkip: () => void;
}

export function StepSocials({ ensName, onNext, onSkip }: StepSocialsProps) {
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
						Connect Your Social Presence
					</h2>
					<p className="text-gray-600">
						Link your social media accounts so the community can find and
						connect with you.
					</p>
				</div>

				<div className="space-y-6">
					{/* Social Links Section */}
					<div className="space-y-4">
						<div className="flex items-center space-x-2">
							<div className="h-6 w-1 rounded-full bg-blue-500" />
							<h4 className="font-bold text-gray-900 text-lg">Social Media</h4>
						</div>

						<div className="space-y-4">
							<ENSTextField
								ensName={ensName}
								recordKey="com.twitter"
								label="Twitter/X"
								placeholder="username (without @)"
								isOwner={true}
							/>

							<ENSTextField
								ensName={ensName}
								recordKey="com.github"
								label="GitHub"
								placeholder="username"
								isOwner={true}
							/>

							<ENSTextField
								ensName={ensName}
								recordKey="com.discord"
								label="Discord"
								placeholder="username"
								isOwner={true}
							/>

							<ENSTextField
								ensName={ensName}
								recordKey="com.telegram"
								label="Telegram"
								placeholder="username"
								isOwner={true}
							/>

							<ENSTextField
								ensName={ensName}
								recordKey="social.farcaster"
								label="Farcaster"
								placeholder="username or FID"
								isOwner={true}
							/>

							<ENSTextField
								ensName={ensName}
								recordKey="social.lens"
								label="Lens Protocol"
								placeholder="username.lens"
								isOwner={true}
							/>
						</div>
					</div>

					{/* Contact Section */}
					<div className="space-y-4">
						<div className="flex items-center space-x-2">
							<div className="h-6 w-1 rounded-full bg-blue-500" />
							<h4 className="font-bold text-gray-900 text-lg">Contact & Web</h4>
						</div>

						<div className="space-y-4">
							<ENSTextField
								ensName={ensName}
								recordKey="url"
								label="Website"
								placeholder="https://yourwebsite.com"
								isOwner={true}
							/>

							<ENSTextField
								ensName={ensName}
								recordKey="email"
								label="Email"
								placeholder="your@email.com"
								isOwner={true}
							/>
						</div>
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

					<Button onClick={onNext} className="flex items-center space-x-2">
						<span>Complete Profile</span>
						<ArrowRight className="h-4 w-4" />
					</Button>
				</div>

				<div className="text-center">
					<p className="text-gray-500 text-sm">
						Each field saves individually when you update it. You can always add
						more links later.
					</p>
				</div>
			</div>
		</div>
	);
}
