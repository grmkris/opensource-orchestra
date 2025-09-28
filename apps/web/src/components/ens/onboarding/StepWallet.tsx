"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useEffect } from "react";
import { useAccount } from "wagmi";

interface StepWalletProps {
	onNext: () => void;
}

export function StepWallet({ onNext }: StepWalletProps) {
	const { address } = useAccount();

	useEffect(() => {
		if (address) {
			onNext();
		}
	}, [address, onNext]);

	return (
		<div className="space-y-6 text-center">
			<span
				style={{
					display: "block",
					fontSize: "32px",
					fontWeight: "800",
					letterSpacing: "-0.3px",
					marginBottom: "14px",
				}}
			>
				Welcome to Open Source Orchestra
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
				Connect your wallet to get started with your decentralized identity and
				join the community.
			</span>

			<div className="space-y-4">
				{!address ? (
					<>
						<div className="flex justify-center">
							<ConnectButton />
						</div>
						<p
							style={{
								fontSize: "14px",
								color: "#2f3044aa",
								marginTop: "16px",
							}}
						>
							We'll help you set up your ENS subdomain and profile in just a few
							steps.
						</p>
					</>
				) : (
					<div className="text-center">
						<div
							style={{
								fontSize: "16px",
								fontWeight: "600",
								color: "#22c55e",
								marginBottom: "12px",
							}}
						>
							✅ Wallet connected! Moving to next step...
						</div>
						<p
							style={{
								fontSize: "14px",
								color: "#2f3044aa",
								fontFamily: "monospace",
							}}
						>
							Connected as: {address}
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
