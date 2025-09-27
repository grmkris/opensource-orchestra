"use client";

import {
	Calendar,
	DollarSign,
	ExternalLinkIcon,
	Gift,
	TrendingUp,
	User,
} from "lucide-react";
import Link from "next/link";
import { Loader } from "@/components/loader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
	type Donation,
	formatRelativeTime,
	getChainName,
	getExplorerUrl,
	useDonations,
} from "@/hooks/useDonations";

function DonationFeedItem({ donation }: { donation: Donation }) {
	const senderDisplay =
		donation.fromEns ||
		`${donation.from.slice(0, 6)}...${donation.from.slice(-4)}`;
	const artistDisplay =
		donation.toEns || `${donation.to.slice(0, 6)}...${donation.to.slice(-4)}`;
	const explorerUrl = getExplorerUrl(
		donation.chainId,
		donation.transactionHash,
	);
	const chainName = getChainName(donation.chainId);

	return (
		<div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
			<div className="flex items-start justify-between">
				<div className="flex flex-1 items-center space-x-3">
					<div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
						<Gift className="h-6 w-6 text-green-600" />
					</div>
					<div className="min-w-0 flex-1">
						<div className="flex flex-wrap items-center space-x-2">
							<span className="font-medium text-gray-900">{senderDisplay}</span>
							<span className="text-gray-500 text-sm">gifted</span>
								<Link
									href={`/profile/${donation.toEns || donation.to}`}
								className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
							>
								{artistDisplay}
							</Link>
						</div>
						<div className="mt-1 flex items-center space-x-4 text-gray-500 text-sm">
							<span className="flex items-center">
								<Calendar className="mr-1 h-3 w-3" />
								{formatRelativeTime(donation.timestamp)}
							</span>
							<span className="text-xs">on {chainName}</span>
							{explorerUrl !== "#" && (
								<a
									href={explorerUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center hover:text-blue-600 hover:underline"
								>
									<ExternalLinkIcon className="mr-1 h-3 w-3" />
									View
								</a>
							)}
						</div>
					</div>
				</div>
				<div className="ml-4 text-right">
					<div className="font-bold text-green-600 text-lg">
						{Number.parseFloat(donation.amount).toFixed(4)} ETH
					</div>
					<div className="text-gray-500 text-sm">
						≈${(Number.parseFloat(donation.amount) * 2500).toFixed(0)}
					</div>
				</div>
			</div>
		</div>
	);
}

function GlobalDonationsSummary({ donations }: { donations: Donation[] }) {
	const totalEth = donations.reduce(
		(sum, donation) => sum + Number.parseFloat(donation.amount),
		0,
	);
	const totalUsd = totalEth * 2500; // Rough ETH price
	const uniqueArtists = new Set(donations.map((d) => d.to)).size;
	const uniqueDonors = new Set(donations.map((d) => d.from)).size;

	return (
		<div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
			<div className="text-center">
				<div className="rounded-lg bg-gradient-to-br from-green-50 to-green-100 p-6">
					<DollarSign className="mx-auto mb-2 h-8 w-8 text-green-600" />
					<div className="font-bold text-2xl text-green-900">
						{totalEth.toFixed(2)} ETH
					</div>
					<div className="text-green-700 text-sm">
						≈ ${totalUsd.toFixed(0)} USD raised
					</div>
				</div>
			</div>

			<div className="text-center">
				<div className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 p-6">
					<User className="mx-auto mb-2 h-8 w-8 text-blue-600" />
					<div className="font-bold text-2xl text-blue-900">
						{uniqueArtists}
					</div>
					<div className="text-blue-700 text-sm">artists supported</div>
				</div>
			</div>

			<div className="text-center">
				<div className="rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 p-6">
					<TrendingUp className="mx-auto mb-2 h-8 w-8 text-purple-600" />
					<div className="font-bold text-2xl text-purple-900">
						{uniqueDonors}
					</div>
					<div className="text-purple-700 text-sm">community supporters</div>
				</div>
			</div>
		</div>
	);
}

export function GlobalDonationsFeed() {
	const {
		data: donations,
		isLoading,
		error,
	} = useDonations({
		allArtists: true,
		enabled: true,
	});

	if (isLoading) {
		return (
			<div className="bg-gray-50 py-16">
				<div className="container mx-auto max-w-6xl px-4">
					<div className="text-center">
						<h2 className="mb-8 font-bold text-3xl text-gray-900">
							Community Support Feed
						</h2>
						<div className="flex items-center justify-center space-x-2">
							<Loader className="h-6 w-6" />
							<span className="text-gray-600">Loading recent donations...</span>
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (error || !donations || donations.length === 0) {
		return (
			<div className="bg-gray-50 py-16">
				<div className="container mx-auto max-w-6xl px-4">
					<div className="text-center">
						<h2 className="mb-8 font-bold text-3xl text-gray-900">
							Community Support Feed
						</h2>
						<div className="text-gray-600">
							<Gift className="mx-auto mb-4 h-12 w-12" />
							<p>No donations yet. Be the first to support our artists!</p>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="bg-gray-50 py-16">
			<div className="container mx-auto max-w-6xl px-4">
				<div className="mb-12 text-center">
					<h2 className="mb-4 font-bold text-3xl text-gray-900">
						Community Support Feed
					</h2>
					<p className="mx-auto max-w-2xl text-gray-600 text-lg">
						Real-time donations from our community supporting decentralized
						artists in the Open Source Orchestra
					</p>
				</div>

				<GlobalDonationsSummary donations={donations} />

				<Card className="overflow-hidden">
					<div className="border-b bg-white p-6">
						<h3 className="font-semibold text-gray-900 text-xl">
							Recent Gifts
						</h3>
						<p className="mt-1 text-gray-600 text-sm">
							Latest contributions from Ethereum and Base networks
						</p>
					</div>

					<div className="bg-gray-50 p-6">
						<div className="max-h-96 space-y-4 overflow-y-auto">
							{donations.slice(0, 20).map((donation, index) => (
								<DonationFeedItem
									key={`${donation.transactionHash}-${index}`}
									donation={donation}
								/>
							))}
						</div>

						{donations.length > 20 && (
							<div className="mt-6 text-center">
								<Button variant="outline">Load More Donations</Button>
							</div>
						)}
					</div>
				</Card>

				<div className="mt-8 text-center">
					<p className="text-gray-600 text-sm">
						Musician?{" "}
						<Link
							href="/onboarding"
							className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
						>
							Join the Orchestra
						</Link>{" "}
						to discover and collaborate with amazing musicians.
					</p>
				</div>
			</div>
		</div>
	);
}
