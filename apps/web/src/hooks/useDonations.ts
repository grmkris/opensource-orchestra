import { useQuery } from "@tanstack/react-query";
import type { Address } from "viem";
import { base, mainnet } from "wagmi/chains";

export interface Donation {
	from: Address;
	fromEns?: string;
	to: Address;
	toEns?: string;
	amount: string;
	timestamp: number;
	blockNumber: bigint;
	transactionHash: string;
	chainId: number;
}

interface UseDonationsParams {
	address?: Address | undefined;
	enabled?: boolean;
	allArtists?: boolean;
}

// Mock data for donations
const MOCK_ARTISTS = [
	{
		address: "0x1234567890123456789012345678901234567890" as Address,
		ens: "plswork.catmisha.eth",
	},
	{
		address: "0x2345678901234567890123456789012345678901" as Address,
		ens: "vibes.catmisha.eth",
	},
	{
		address: "0x3456789012345678901234567890123456789012" as Address,
		ens: "beats.catmisha.eth",
	},
	{
		address: "0x4567890123456789012345678901234567890123" as Address,
		ens: "melody.catmisha.eth",
	},
	{
		address: "0x5678901234567890123456789012345678901234" as Address,
		ens: "harmony.catmisha.eth",
	},
];

const MOCK_DONORS = [
	{
		address: "0xABCDEF1234567890123456789012345678901234" as Address,
		ens: "supporter.eth",
	},
	{
		address: "0xBCDEF12345678901234567890123456789012345" as Address,
		ens: "musiclover.eth",
	},
	{
		address: "0xCDEF123456789012345678901234567890123456" as Address,
		ens: "patron.eth",
	},
	{
		address: "0xDEF1234567890123456789012345678901234567" as Address,
		ens: "fan.eth",
	},
	{
		address: "0xEF12345678901234567890123456789012345678" as Address,
		ens: undefined,
	},
	{
		address: "0xF123456789012345678901234567890123456789" as Address,
		ens: "collector.eth",
	},
];

function generateMockDonations(targetAddress?: Address): Donation[] {
	const donations: Donation[] = [];
	const now = Date.now();

	// Generate donations for all artists or specific artist
	const artists = targetAddress
		? MOCK_ARTISTS.filter(
				(a) => a.address.toLowerCase() === targetAddress.toLowerCase(),
			).slice(0, 1)
		: MOCK_ARTISTS;

	// If no matching artist found but targetAddress provided, use it as is
	if (targetAddress && artists.length === 0) {
		artists.push({
			address: targetAddress,
			ens: `${targetAddress.slice(0, 6)}...${targetAddress.slice(-4)}.catmisha.eth`,
		});
	}

	artists.forEach((artist) => {
		// Generate 3-8 donations per artist
		const donationCount = Math.floor(Math.random() * 6) + 3;

		for (let i = 0; i < donationCount; i++) {
			const donor = MOCK_DONORS[Math.floor(Math.random() * MOCK_DONORS.length)];
			const daysAgo = Math.random() * 30; // Random time in last 30 days
			const hoursAgo = daysAgo * 24;
			const timestamp = now - hoursAgo * 60 * 60 * 1000;

			// Random amount between 0.0001 and 0.5 ETH
			const amount = (Math.random() * 0.4999 + 0.0001).toFixed(6);

			donations.push({
				from: donor.address,
				fromEns: donor.ens,
				to: artist.address,
				toEns: artist.ens,
				amount: amount,
				timestamp: Math.floor(timestamp),
				blockNumber: BigInt(Math.floor(18000000 + Math.random() * 100000)),
				transactionHash:
					`0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}` as `0x${string}`,
				chainId: Math.random() > 0.5 ? mainnet.id : base.id,
			});
		}
	});

	// Sort by timestamp (newest first)
	return donations.sort((a, b) => b.timestamp - a.timestamp);
}

export function useDonations({
	address,
	enabled = true,
	allArtists = false,
}: UseDonationsParams) {
	return useQuery({
		queryKey: ["donations", address, allArtists],
		enabled: enabled,
		queryFn: async (): Promise<Donation[]> => {
			// Simulate network delay
			await new Promise((resolve) => setTimeout(resolve, 500));

			if (allArtists) {
				// Return donations for all artists (for homepage)
				return generateMockDonations();
			}
			if (address) {
				// Return donations for specific artist
				return generateMockDonations(address);
			}
			return [];
		},
		refetchInterval: 60000, // Refetch every minute
		staleTime: 30000, // Data is fresh for 30 seconds
	});
}

// Helper function to get chain name
export function getChainName(chainId: number): string {
	switch (chainId) {
		case mainnet.id:
			return "Ethereum";
		case base.id:
			return "Base";
		default:
			return `Chain ${chainId}`;
	}
}

// Helper function to get block explorer URL
export function getExplorerUrl(chainId: number, txHash: string): string {
	switch (chainId) {
		case mainnet.id:
			return `https://etherscan.io/tx/${txHash}`;
		case base.id:
			return `https://basescan.org/tx/${txHash}`;
		default:
			return "#";
	}
}

// Helper function to format relative time
export function formatRelativeTime(timestamp: number): string {
	const now = Date.now();
	const diff = now - timestamp;
	const seconds = Math.floor(diff / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);

	if (days > 0) {
		return `${days} day${days !== 1 ? "s" : ""} ago`;
	}
	if (hours > 0) {
		return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
	}
	if (minutes > 0) {
		return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
	}
	return `${seconds} second${seconds !== 1 ? "s" : ""} ago`;
}
