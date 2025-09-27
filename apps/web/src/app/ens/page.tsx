"use client";

import { useAccount } from "wagmi";
import { SubdomainProfile } from "@/components/ens/SubdomainProfile";
import { SubdomainRegistration } from "@/components/ens/SubdomainRegistration";
import { Loader } from "@/components/loader";
import { useEnsName } from "@/hooks/useEnsName";
import { ENS_CHAIN } from "@/lib/ens/ens-contracts";

export default function ENSPage() {
	const { address } = useAccount();
	const userSubdomain = useEnsName({
		address,
		l1ChainId: 1,
		l2ChainId: ENS_CHAIN.id,
	});

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

				{userSubdomain.data && (
					<SubdomainProfile ensName={userSubdomain.data} />
				)}

				{!userSubdomain.data && <SubdomainRegistration />}
			</div>
		</div>
	);
}
