"use client";

import { useParams } from "next/navigation";
import { isAddress } from "viem";
import { normalize } from "viem/ens";
import { useAccount, useEnsAddress, useEnsName } from "wagmi";
import { SubdomainProfile } from "@/components/ens/SubdomainProfile";
import { Loader } from "@/components/loader";
import { Card } from "@/components/ui/card";

function isEnsName(identifier: string): boolean {
	return identifier.includes(".") && !isAddress(identifier);
}

export default function PublicENSProfilePage() {
	const params = useParams();
	const identifier = params.identifier as string;
	const { address: connectedAddress } = useAccount();

	// Determine if identifier is ENS name or address
	const isEns = isEnsName(identifier);

	// If identifier is ENS name, resolve to address
	const {
		data: resolvedAddress,
		isLoading: addressLoading,
		error: addressError,
	} = useEnsAddress({
		name: isEns ? normalize(identifier) : undefined,
		query: { enabled: isEns },
		chainId: 1,
	});

	// If identifier is address, resolve to ENS name
	const {
		data: resolvedEnsName,
		isLoading: ensLoading,
		error: ensError,
	} = useEnsName({
		address:
			!isEns && isAddress(identifier)
				? (identifier as `0x${string}`)
				: undefined,
		query: { enabled: !isEns && isAddress(identifier) },
		chainId: 1,
	});

	// Determine final values
	const finalAddress = isEns
		? resolvedAddress
		: isAddress(identifier)
			? identifier
			: null;
	const finalEnsName = isEns ? identifier : resolvedEnsName;

	// Loading state
	const isLoading = isEns ? addressLoading : ensLoading;

	// Error state
	const hasError =
		addressError || ensError || (!isEns && !isAddress(identifier));

	// Ownership check
	const isOwner =
		connectedAddress && finalAddress
			? connectedAddress.toLowerCase() === finalAddress.toLowerCase()
			: false;

	if (isLoading) {
		return (
			<div className="container mx-auto max-w-2xl px-4 py-8">
				<div className="text-center">
					<Loader className="mx-auto mb-4 h-8 w-8" />
					<h1 className="mb-2 font-semibold text-2xl">Loading Profile...</h1>
					<p className="text-muted-foreground">Resolving {identifier}</p>
				</div>
			</div>
		);
	}

	if (hasError || !finalEnsName) {
		return (
			<div className="container mx-auto max-w-2xl px-4 py-8">
				<Card className="p-6">
					<div className="text-center">
						<h1 className="mb-2 font-semibold text-2xl">Profile Not Found</h1>
						<p className="text-muted-foreground">
							{!isEns && !isAddress(identifier)
								? "Invalid ENS name or wallet address format"
								: "No ENS profile found for this identifier"}
						</p>
						<p className="mt-2 text-muted-foreground text-sm">
							Identifier: {identifier}
						</p>
					</div>
				</Card>
			</div>
		);
	}

	return (
		<div className="container mx-auto max-w-2xl px-4 py-8">
			<div className="space-y-6">
				{/* Header */}
				<div className="text-center">
					<h1 className="mb-4 font-bold text-3xl">
						{isOwner ? "Your ENS Profile" : "ENS Profile"}
					</h1>
					<p className="text-muted-foreground">
						{isOwner
							? "Manage your decentralized identity"
							: "Viewing public ENS profile"}
					</p>
				</div>

				<SubdomainProfile ensName={finalEnsName} />
			</div>
		</div>
	);
}
