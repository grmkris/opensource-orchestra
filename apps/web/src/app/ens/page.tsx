"use client";

import { useAccount } from "wagmi";
import { SubdomainRegistration } from "@/components/ens/SubdomainRegistration";
import { Loader } from "@/components/loader";
import { Card } from "@/components/ui/card";
import { useUserSubdomain } from "@/hooks/useENSSubdomain";

export default function ENSPage() {
	const { address } = useAccount();
	const userSubdomain = useUserSubdomain(address);

	if (userSubdomain.isLoading) {
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

				<SubdomainRegistration />

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
						Connected: {userSubdomain.subdomain?.address?.slice(0, 6)}...
						{userSubdomain.subdomain?.address?.slice(-4)}
					</p>
				</div>
			</div>
		</div>
	);
}
