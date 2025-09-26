"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { SubdomainProfile } from "@/components/ens/SubdomainProfile";
import { SubdomainRegistration } from "@/components/ens/SubdomainRegistration";
import { Loader } from "@/components/loader";
import { Card } from "@/components/ui/card";
import { useUserSubdomain } from "@/hooks/useENSSubdomain";

export default function ENSPage() {
	const { address, isConnected } = useAccount();
	const { hasSubdomain, subdomainLabel, isLoading } = useUserSubdomain(address);
	const [justRegistered, setJustRegistered] = useState<string | null>(null);

	// Clear just registered state when subdomain detection catches up
	useEffect(() => {
		if (hasSubdomain && justRegistered) {
			setJustRegistered(null);
		}
	}, [hasSubdomain, justRegistered]);

	const handleRegistrationSuccess = (label: string, _fullName: string) => {
		setJustRegistered(label);
		// The subdomain detection should update soon due to ENS resolution
	};

	if (!isConnected) {
		return (
			<div className="container mx-auto max-w-2xl px-4 py-8">
				<div className="space-y-6 text-center">
					<div>
						<h1 className="mb-4 font-bold text-3xl">ENS Subdomains</h1>
						<p className="text-muted-foreground">
							Get your own .catmisha.eth subdomain on Base L2
						</p>
					</div>

					<Card className="p-8">
						<div className="space-y-4">
							<h2 className="font-medium text-xl">Connect Your Wallet</h2>
							<p className="text-muted-foreground">
								Connect your wallet to register or manage your ENS subdomain
							</p>
							<div className="flex justify-center">
								<ConnectButton />
							</div>
						</div>
					</Card>

					<div className="space-y-2 text-muted-foreground text-sm">
						<p>🎵 Join the Open Source Orchestra community</p>
						<p>⚡ Free registration on Base L2</p>
						<p>🌐 Full ENS resolution across all apps</p>
						<p>✨ Set avatar, bio, and social links</p>
					</div>
				</div>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="container mx-auto max-w-2xl px-4 py-8">
				<div className="text-center">
					<Loader className="mx-auto mb-4 h-8 w-8" />
					<h1 className="mb-2 font-semibold text-2xl">Loading...</h1>
					<p className="text-muted-foreground">
						Checking your ENS subdomain status
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto max-w-2xl px-4 py-8">
			<div className="space-y-6">
				{/* Header */}
				<div className="text-center">
					<h1 className="mb-4 font-bold text-3xl">ENS Subdomains</h1>
					<p className="text-muted-foreground">
						Your decentralized identity on the Open Source Orchestra
					</p>
				</div>

				{/* Main Content */}
				{hasSubdomain || justRegistered ? (
					<div className="space-y-6">
						{justRegistered && !hasSubdomain && (
							<Card className="border-green-200 bg-green-50 p-4">
								<div className="text-center">
									<h3 className="mb-2 font-medium text-green-800">
										Registration Successful! 🎉
									</h3>
									<p className="text-green-700 text-sm">
										Your subdomain{" "}
										<span className="font-mono">
											{justRegistered}.catmisha.eth
										</span>{" "}
										has been registered. It may take a moment to appear in the
										profile below.
									</p>
								</div>
							</Card>
						)}

						{subdomainLabel && (
							<SubdomainProfile
								label={subdomainLabel}
								onProfileUpdate={() => {
									// Force refresh of subdomain data
									window.location.reload();
								}}
							/>
						)}

						{justRegistered && !subdomainLabel && (
							<Card className="p-6 text-center">
								<div className="space-y-4">
									<Loader className="mx-auto h-6 w-6" />
									<div>
										<h3 className="mb-2 font-medium">
											Setting up your profile...
										</h3>
										<p className="text-muted-foreground text-sm">
											Your subdomain is being indexed. This usually takes a few
											moments.
										</p>
									</div>
								</div>
							</Card>
						)}
					</div>
				) : (
					<SubdomainRegistration onSuccess={handleRegistrationSuccess} />
				)}

				{/* Info Section */}
				<Card className="bg-muted/50 p-6">
					<div className="space-y-4">
						<h3 className="font-medium">About ENS Subdomains</h3>
						<div className="grid gap-4 text-muted-foreground text-sm md:grid-cols-2">
							<div className="space-y-2">
								<p>
									<strong>🔗 Universal Resolution:</strong> Your subdomain works
									across all ENS-compatible apps
								</p>
								<p>
									<strong>⚡ Layer 2 Benefits:</strong> Fast and cheap
									transactions on Base
								</p>
							</div>
							<div className="space-y-2">
								<p>
									<strong>🎭 Your Identity:</strong> Set avatar, bio, and social
									links
								</p>
								<p>
									<strong>🎵 Community:</strong> Part of the Open Source
									Orchestra ecosystem
								</p>
							</div>
						</div>
					</div>
				</Card>

				{/* Technical Details */}
				<div className="space-y-1 text-center text-muted-foreground text-xs">
					<p>Powered by Durin L2 ENS infrastructure</p>
					<p>Smart contracts deployed on Base • L1 resolution via CCIP Read</p>
					<p className="text-xs">
						Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
					</p>
				</div>
			</div>
		</div>
	);
}
