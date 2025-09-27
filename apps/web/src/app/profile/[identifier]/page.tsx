"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { isAddress } from "viem";
import { normalize } from "viem/ens";
import { useEnsAddress, useEnsName } from "wagmi";
import { SubdomainProfilePublic } from "@/components/ens/SubdomainProfilePublic";
import { Loader } from "@/components/loader";
import { Card } from "@/components/ui/card";

function isEnsName(identifier: string): boolean {
	return identifier.includes(".") && !isAddress(identifier);
}

export default function PublicENSProfilePage() {
	const params = useParams();
	const identifier = params.identifier as string;
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
	const finalEnsName = isEns ? identifier : resolvedEnsName;

	// Loading state
	const isLoading = isEns ? addressLoading : ensLoading;

	// Error state
	const hasError =
		addressError || ensError || (!isEns && !isAddress(identifier));

	if (isLoading) {
		return (
			<div className="min-h-screen bg-gray-50 py-12">
				<div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
					<div className="mb-8 flex items-center justify-between">
						<Link href="/">
							<button
								type="button"
								className="flex items-center space-x-2 rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-600 transition-all duration-200 hover:bg-gray-50 hover:shadow-md"
							>
								<ArrowLeft className="h-4 w-4" />
								<span>Back to Orchestra</span>
							</button>
						</Link>

						{/* Wallet Button */}
						<ConnectButton />
					</div>

					<div className="container mx-auto max-w-2xl px-4 py-8">
						<div className="text-center">
							<Loader className="mx-auto mb-4 h-8 w-8" />
							<h1 className="mb-2 font-semibold text-2xl">
								Loading Profile...
							</h1>
							<p className="text-muted-foreground">Resolving {identifier}</p>
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (hasError || !finalEnsName) {
		return (
			<div className="min-h-screen bg-gray-50 py-12">
				<div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
					<div className="mb-8 flex items-center justify-between">
						<Link href="/">
							<button
								type="button"
								className="flex items-center space-x-2 rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-600 transition-all duration-200 hover:bg-gray-50 hover:shadow-md"
							>
								<ArrowLeft className="h-4 w-4" />
								<span>Back to Orchestra</span>
							</button>
						</Link>

						{/* Wallet Button */}
						<ConnectButton />
					</div>

					<div className="container mx-auto max-w-2xl px-4 py-8">
						<Card className="p-6">
							<div className="text-center">
								<h1 className="mb-2 font-semibold text-2xl">
									Profile Not Found
								</h1>
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
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 py-12">
			<div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
				<div className="mb-8 flex items-center justify-between">
					<Link href="/">
						<button
							type="button"
							className="flex items-center space-x-2 rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-600 transition-all duration-200 hover:bg-gray-50 hover:shadow-md"
						>
							<ArrowLeft className="h-4 w-4" />
							<span>Back to Orchestra</span>
						</button>
					</Link>

					{/* Wallet Button */}
					<ConnectButton />
				</div>

				<SubdomainProfilePublic ensName={finalEnsName} />
			</div>
		</div>
	);
}
