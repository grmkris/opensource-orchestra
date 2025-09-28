"use client";

import { ArrowRight, SkipForward } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ENSTextField } from "../ENSTextField";

interface SocialData {
	twitter?: string;
	github?: string;
	discord?: string;
	telegram?: string;
	farcaster?: string;
	lens?: string;
	website?: string;
	email?: string;
}

interface StepSocialsProps {
	ensName: string;
	onNext: (data?: SocialData) => void;
	onSkip: () => void;
	initialData?: SocialData;
}

// Move InputField outside to prevent recreation on every render
const InputField = ({
	label,
	placeholder,
	field,
	socialData,
	onInputChange,
}: {
	label: string;
	placeholder: string;
	field: keyof SocialData;
	socialData: SocialData;
	onInputChange: (field: keyof SocialData, value: string) => void;
}) => (
	<div className="space-y-2">
		<label
			style={{
				display: "block",
				fontSize: "14px",
				fontWeight: "600",
				color: "#2f3044",
				marginBottom: "8px",
			}}
		>
			{label}
		</label>
		<input
			type="text"
			value={socialData[field] || ""}
			onChange={(e) => onInputChange(field, e.target.value)}
			placeholder={placeholder}
			style={{
				width: "100%",
				padding: "12px 16px",
				fontSize: "14px",
				border: "1px solid #2f304466",
				borderRadius: "6px",
				background: "#ffffff",
				color: "#2f3044",
			}}
		/>
	</div>
);

export function StepSocials({
	ensName,
	onNext,
	onSkip,
	initialData,
}: StepSocialsProps) {
	const [socialData, setSocialData] = useState<SocialData>({
		twitter: initialData?.twitter || "",
		github: initialData?.github || "",
		discord: initialData?.discord || "",
		telegram: initialData?.telegram || "",
		farcaster: initialData?.farcaster || "",
		lens: initialData?.lens || "",
		website: initialData?.website || "",
		email: initialData?.email || "",
	});

	const handleInputChange = (field: keyof SocialData, value: string) => {
		setSocialData((prev) => ({ ...prev, [field]: value }));
	};

	const handleNext = () => {
		onNext(socialData);
	};

	return (
		<div className="space-y-6">
			<div className="text-center">
				<span
					style={{
						display: "block",
						fontSize: "32px",
						fontWeight: "800",
						letterSpacing: "-0.3px",
						marginBottom: "14px",
					}}
				>
					Connect Your Social Presence
				</span>
				<span
					style={{
						display: "block",
						fontSize: "18px",
						fontWeight: "500",
						color: "#2f3044cc",
						marginBottom: "32px",
					}}
				>
					Link your social media accounts so the community can find and connect
					with you.
				</span>
			</div>

			<div className="space-y-6">
				{/* Social Links Section */}
				<div className="space-y-4">
					<div className="flex items-center space-x-2">
						<div
							className="h-6 w-1 rounded-full"
							style={{ backgroundColor: "#2f3044" }}
						/>
						<h4
							style={{
								fontSize: "20px",
								fontWeight: "700",
								color: "#2f3044",
							}}
						>
							Social Media
						</h4>
					</div>

					<div className="space-y-4">
						<InputField
							label="Twitter/X"
							placeholder="username (without @)"
							field="twitter"
							socialData={socialData}
							onInputChange={handleInputChange}
						/>

						<InputField
							label="GitHub"
							placeholder="username"
							field="github"
							socialData={socialData}
							onInputChange={handleInputChange}
						/>

						<InputField
							label="Discord"
							placeholder="username"
							field="discord"
							socialData={socialData}
							onInputChange={handleInputChange}
						/>

						<InputField
							label="Telegram"
							placeholder="username"
							field="telegram"
							socialData={socialData}
							onInputChange={handleInputChange}
						/>

						<InputField
							label="Farcaster"
							placeholder="username or FID"
							field="farcaster"
							socialData={socialData}
							onInputChange={handleInputChange}
						/>

						<InputField
							label="Lens Protocol"
							placeholder="username.lens"
							field="lens"
							socialData={socialData}
							onInputChange={handleInputChange}
						/>
					</div>
				</div>

				{/* Contact Section */}
				<div className="space-y-4">
					<div className="flex items-center space-x-2">
						<div
							className="h-6 w-1 rounded-full"
							style={{ backgroundColor: "#2f3044" }}
						/>
						<h4
							style={{
								fontSize: "20px",
								fontWeight: "700",
								color: "#2f3044",
							}}
						>
							Contact & Web
						</h4>
					</div>

					<div className="space-y-4">
						<InputField
							label="Website"
							placeholder="https://yourwebsite.com"
							field="website"
							socialData={socialData}
							onInputChange={handleInputChange}
						/>

						<InputField
							label="Email"
							placeholder="your@email.com"
							field="email"
							socialData={socialData}
							onInputChange={handleInputChange}
						/>

						<ENSTextField
							ensName={ensName}
							recordKey="livestream.url"
							label="Livestream URL"
							placeholder="https://twitch.tv/yourstream or https://youtube.com/watch?v=..."
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
					style={{
						fontSize: "14px",
						fontWeight: "600",
						color: "#2f3044aa",
						background: "transparent",
						border: "1px solid #2f304466",
						borderRadius: "6px",
						padding: "8px 16px",
					}}
				>
					<SkipForward className="h-4 w-4" />
					<span>Skip for now</span>
				</Button>

				<Button
					onClick={handleNext}
					className="flex items-center space-x-2"
					style={{
						fontSize: "14px",
						fontWeight: "600",
						color: "#ffffff",
						background: "#2f3044",
						border: "1px solid #2f3044",
						borderRadius: "6px",
						padding: "8px 16px",
					}}
				>
					<span>Complete Profile</span>
					<ArrowRight className="h-4 w-4" />
				</Button>
			</div>

			<div className="text-center">
				<p
					style={{
						fontSize: "14px",
						color: "#2f3044aa",
						marginTop: "16px",
					}}
				>
					Your information will be saved when you complete the onboarding.
				</p>
			</div>
		</div>
	);
}
