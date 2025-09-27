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
		<div
			className="rounded-2xl border-2 border-gray-100 bg-white p-8 shadow-sm"
			style={{ fontFamily: "var(--font-roboto)" }}
		>
			<div className="space-y-6 text-center">
				<div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100">
					<div className="h-8 w-8 rounded-lg bg-blue-500" />
				</div>
				
				<div>
					<h2 className="mb-2 font-bold text-2xl text-gray-900">
						Welcome to Open Source Orchestra
					</h2>
					<p className="mx-auto max-w-md text-gray-600">
						Connect your wallet to get started with your decentralized identity and join the community.
					</p>
				</div>

				<div className="space-y-4">
					{!address ? (
						<>
							<ConnectButton />
							<p className="text-gray-500 text-sm">
								We'll help you set up your ENS subdomain and profile in just a few steps.
							</p>
						</>
					) : (
						<div className="text-center">
							<div className="text-green-600 text-sm font-medium">
								✅ Wallet connected! Moving to next step...
							</div>
							<p className="mt-2 text-gray-600 text-sm">
								Connected as: <span className="font-mono text-xs">{address}</span>
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}