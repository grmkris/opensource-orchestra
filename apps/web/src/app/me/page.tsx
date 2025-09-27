"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { getAddress } from "viem";
import { useAccount } from "wagmi";
import { SubdomainProfile } from "@/components/ens/SubdomainProfile";
import { Loader } from "@/components/loader";
import { useEnsName } from "@/hooks/useEnsName";
import { ENS_CHAIN } from "@/lib/ens/ens-contracts";

export default function MePage() {
	const router = useRouter();
	const { address } = useAccount();

	const userSubdomain = useEnsName({
		address: getAddress(
			address || "0x0000000000000000000000000000000000000000",
		),
		l1ChainId: 1,
		l2ChainId: ENS_CHAIN.id,
	});

	// Redirect to /onboarding if user doesn't have a subdomain
	useEffect(() => {
		if (!userSubdomain.isLoading && !userSubdomain.data && address) {
			router.push("/onboarding");
		}
	}, [userSubdomain.data, userSubdomain.isLoading, address, router]);

	// Redirect to wallet connection if no wallet connected
	useEffect(() => {
		if (!userSubdomain.isLoading && !address) {
			router.push("/onboarding");
		}
	}, [address, userSubdomain.isLoading, router]);

	if (userSubdomain.isLoading) {
		return (
			<div className="container mx-auto max-w-2xl px-4 py-8">
				<div className="text-center">
					<Loader className="mx-auto mb-4 h-8 w-8" />
					<h1 className="mb-2 font-semibold text-2xl">Loading...</h1>
					<p className="text-muted-foreground">Loading your profile</p>
				</div>
			</div>
		);
	}

	// Don't render if redirecting
	if (!userSubdomain.data || !address) {
		return null;
	}

	return (
		<div
			className="min-h-screen bg-white"
			style={{ fontFamily: "var(--font-roboto)" }}
		>
			<div className="container mx-auto max-w-4xl px-4 py-8">
				<div className="space-y-8">
					{/* Navigation Bar */}
					<div className="flex items-center justify-between">
						{/* Back to Home Button */}
						<Link href="/">
							<button
								type="button"
								className="flex items-center space-x-2 rounded-lg border-2 border-gray-200 px-4 py-2 text-gray-600 transition-all duration-200 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600"
							>
								<ArrowLeft className="h-4 w-4" />
								<span className="font-medium">Back to Orchestra</span>
							</button>
						</Link>

						{/* Wallet Button */}
						<ConnectButton />
					</div>

					{/* Header */}
					<div className="space-y-4 text-center">
						<div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100">
							<div className="h-8 w-8 rounded-lg bg-blue-500" />
						</div>
						<h1 className="font-bold text-4xl text-gray-900">{userSubdomain.data}</h1>
					</div>

					{/* Profile */}
					<SubdomainProfile ensName={userSubdomain.data} />
				</div>
			</div>
		</div>
	);
}
