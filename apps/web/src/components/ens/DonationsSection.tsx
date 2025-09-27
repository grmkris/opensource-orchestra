"use client";

import {
	Calendar,
	DollarSign,
	ExternalLinkIcon,
	Gift,
	TrendingUp,
	User,
} from "lucide-react";
import { type Address, isAddress } from "viem";
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

interface GiftsSectionProps {
	address: Address;
}

function DonationItem({ donation }: { donation: Donation }) {
	const senderDisplay =
		donation.fromEns ||
		`${donation.from.slice(0, 6)}...${donation.from.slice(-4)}`;
	const explorerUrl = getExplorerUrl(
		donation.chainId,
		donation.transactionHash,
	);
	const chainName = getChainName(donation.chainId);

	return (
		<div className="flex items-center justify-between border-muted/50 border-b py-4 last:border-b-0">
			<div className="flex items-center space-x-3">
				<div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
					<Gift className="h-5 w-5 text-green-600 dark:text-green-400" />
				</div>
				<div className="min-w-0 flex-1">
					<div className="flex items-center space-x-2">
						<span className="font-medium text-foreground">{senderDisplay}</span>
						<span className="text-muted-foreground text-xs">
							on {chainName}
						</span>
					</div>
					<div className="flex items-center space-x-4 text-muted-foreground text-sm">
						<span className="flex items-center">
							<Calendar className="mr-1 h-3 w-3" />
							{formatRelativeTime(donation.timestamp)}
						</span>
						{explorerUrl !== "#" && (
							<a
								href={explorerUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center hover:text-foreground hover:underline"
							>
								<ExternalLinkIcon className="mr-1 h-3 w-3" />
								View
							</a>
						)}
					</div>
				</div>
			</div>
			<div className="text-right">
				<div className="font-semibold text-green-600 dark:text-green-400">
					{Number.parseFloat(donation.amount).toFixed(6)} ETH
				</div>
				<div className="text-muted-foreground text-xs">
					${(Number.parseFloat(donation.amount) * 2500).toFixed(2)} USD
				</div>
			</div>
		</div>
	);
}

function DonationsSummary({ donations }: { donations: Donation[] }) {
	const totalEth = donations.reduce(
		(sum, donation) => sum + Number.parseFloat(donation.amount),
		0,
	);
	const totalUsd = totalEth * 2500; // Rough ETH price - in production, use real-time data

	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
			<div className="rounded-lg bg-gradient-to-br from-green-50 to-green-100 p-4 dark:from-green-900/20 dark:to-green-800/20">
				<div className="flex items-center space-x-2">
					<DollarSign className="h-5 w-5 text-green-600" />
					<span className="font-medium text-green-800 dark:text-green-200">
						Total Received
					</span>
				</div>
				<div className="mt-2">
					<div className="font-bold text-2xl text-green-900 dark:text-green-100">
						{totalEth.toFixed(4)} ETH
					</div>
					<div className="text-green-700 text-sm dark:text-green-300">
						≈ ${totalUsd.toFixed(2)} USD
					</div>
				</div>
			</div>

			<div className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 p-4 dark:from-blue-900/20 dark:to-blue-800/20">
				<div className="flex items-center space-x-2">
					<User className="h-5 w-5 text-blue-600" />
					<span className="font-medium text-blue-800 dark:text-blue-200">
						Supporters
					</span>
				</div>
				<div className="mt-2">
					<div className="font-bold text-2xl text-blue-900 dark:text-blue-100">
						{new Set(donations.map((d) => d.from)).size}
					</div>
					<div className="text-blue-700 text-sm dark:text-blue-300">
						unique donors
					</div>
				</div>
			</div>

			<div className="rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 p-4 dark:from-purple-900/20 dark:to-purple-800/20">
				<div className="flex items-center space-x-2">
					<TrendingUp className="h-5 w-5 text-purple-600" />
					<span className="font-medium text-purple-800 dark:text-purple-200">
						Recent Activity
					</span>
				</div>
				<div className="mt-2">
					<div className="font-bold text-2xl text-purple-900 dark:text-purple-100">
						{
							donations.filter(
								(d) => Date.now() - d.timestamp < 7 * 24 * 60 * 60 * 1000,
							).length
						}
					</div>
					<div className="text-purple-700 text-sm dark:text-purple-300">
						last 7 days
					</div>
				</div>
			</div>
		</div>
	);
}

export function GiftsSection({ address }: GiftsSectionProps) {
	const {
		data: donations,
		isLoading,
		error,
	} = useDonations({
		address: isAddress(address) ? address : undefined,
		enabled: !!address && isAddress(address),
	});

	if (isLoading) {
		return (
			<Card className="p-6">
				<div className="flex items-center justify-center space-x-2">
					<Loader className="h-5 w-5" />
					<span className="text-muted-foreground">
						Loading gifts history...
					</span>
				</div>
			</Card>
		);
	}

	if (error) {
		return (
			<Card className="p-6">
				<div className="text-center text-muted-foreground">
					<Gift className="mx-auto mb-2 h-8 w-8" />
					<p>Unable to load gifts history</p>
					<p className="text-sm">Please try again later</p>
				</div>
			</Card>
		);
	}

	if (!donations || donations.length === 0) {
		return (
			<Card className="p-6">
				<div className="text-center text-muted-foreground">
					<Gift className="mx-auto mb-4 h-12 w-12" />
					<h3 className="mb-2 font-semibold text-lg">No donations yet</h3>
					<p className="text-sm">
						This artist hasn't received any donations on-chain yet.
					</p>
					<p className="mt-2 text-sm">Be the first to support them!</p>
				</div>
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			<div>
				<h3 className="mb-4 flex items-center space-x-2 font-semibold text-xl">
					<Gift className="h-5 w-5 text-green-600" />
					<span>Recent Gifts</span>
				</h3>

				<DonationsSummary donations={donations} />
			</div>

			<Card className="overflow-hidden">
				<div className="border-b bg-muted/20 px-6 py-4">
					<h4 className="font-medium text-lg">Recent gifts</h4>
					<p className="text-muted-foreground text-sm">
						Showing recent on-chain donations from Ethereum and Base
					</p>
				</div>

				<div className="max-h-96 overflow-y-auto">
					<div className="p-6">
						{donations.map((donation, index) => (
							<DonationItem
								key={`${donation.transactionHash}-${index}`}
								donation={donation}
							/>
						))}
					</div>
				</div>

				{donations.length >= 50 && (
					<div className="border-t bg-muted/10 px-6 py-4 text-center">
						<Button variant="outline" size="sm">
							Load More Donations
						</Button>
					</div>
				)}
			</Card>
		</div>
	);
}
