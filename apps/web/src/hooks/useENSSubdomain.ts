import { useQuery } from "@tanstack/react-query";
import { getAddress, type Address } from "viem";
import { normalize } from "viem/ens";
import {
	useEnsAddress,
	useEnsAvatar,
	useEnsText,
	usePublicClient,
} from "wagmi";
import {
	ENS_CHAIN,
	getFullSubdomainName,
	TEXT_RECORD_KEYS,
} from "@/lib/contracts/ens-contracts";
import { useEnsName, useEnsNameOptimistic } from "./useEnsName";

interface SubdomainData {
	name: string;
	address?: Address;
	avatar?: string;
	description?: string;
	display?: string;
	twitter?: string;
	github?: string;
	discord?: string;
	telegram?: string;
	url?: string;
	email?: string;
}

// Hook to get subdomain data by label
export function useSubdomainData(label: string | undefined) {
	const fullName = label ? getFullSubdomainName(label) : undefined;
	const normalizedName = fullName ? normalize(fullName) : undefined;

	const { data: address, isLoading: addressLoading } = useEnsAddress({
		name: normalizedName,
		query: { enabled: !!normalizedName },
		chainId: ENS_CHAIN.id,
	});

	const { data: avatar, isLoading: avatarLoading } = useEnsAvatar({
		name: normalizedName,
		query: { enabled: !!normalizedName },
		chainId: ENS_CHAIN.id,
	});

	const { data: description, isLoading: descriptionLoading } = useEnsText({
		name: normalizedName,
		key: TEXT_RECORD_KEYS.DESCRIPTION,
		query: { enabled: !!normalizedName },
		chainId: ENS_CHAIN.id,
	});

	const { data: display, isLoading: displayLoading } = useEnsText({
		name: normalizedName,
		key: TEXT_RECORD_KEYS.DISPLAY,
		query: { enabled: !!normalizedName },
		chainId: ENS_CHAIN.id,
	});

	const { data: twitter, isLoading: twitterLoading } = useEnsText({
		name: normalizedName,
		key: TEXT_RECORD_KEYS.TWITTER,
		query: { enabled: !!normalizedName },
		chainId: ENS_CHAIN.id,
	});

	const { data: github, isLoading: githubLoading } = useEnsText({
		name: normalizedName,
		key: TEXT_RECORD_KEYS.GITHUB,
		query: { enabled: !!normalizedName },
		chainId: ENS_CHAIN.id,
	});

	const { data: discord, isLoading: discordLoading } = useEnsText({
		name: normalizedName,
		key: TEXT_RECORD_KEYS.DISCORD,
		query: { enabled: !!normalizedName },
		chainId: ENS_CHAIN.id,
	});

	const { data: telegram, isLoading: telegramLoading } = useEnsText({
		name: normalizedName,
		key: TEXT_RECORD_KEYS.TELEGRAM,
		query: { enabled: !!normalizedName },
		chainId: ENS_CHAIN.id,
	});

	const { data: url, isLoading: urlLoading } = useEnsText({
		name: normalizedName,
		key: TEXT_RECORD_KEYS.URL,
		query: { enabled: !!normalizedName },
		chainId: ENS_CHAIN.id,
	});

	const { data: email, isLoading: emailLoading } = useEnsText({
		name: normalizedName,
		key: TEXT_RECORD_KEYS.EMAIL,
		query: { enabled: !!normalizedName },
		chainId: ENS_CHAIN.id,
	});

	const isLoading =
		addressLoading ||
		avatarLoading ||
		descriptionLoading ||
		displayLoading ||
		twitterLoading ||
		githubLoading ||
		discordLoading ||
		telegramLoading ||
		urlLoading ||
		emailLoading;

	const exists = !!address;

	const subdomain: SubdomainData | null = fullName
		? {
				name: fullName,
				address: address || undefined,
				avatar: avatar || undefined,
				description: description || undefined,
				display: display || undefined,
				twitter: twitter || undefined,
				github: github || undefined,
				discord: discord || undefined,
				telegram: telegram || undefined,
				url: url || undefined,
				email: email || undefined,
			}
		: null;

	return {
		subdomain,
		exists,
		isLoading,
	};
}

// Hook to get primary ENS name for an address (reverse resolution)
export function usePrimaryName(address: Address | undefined) {
	const addressFormated = address;
	const { data: name, isLoading } = useEnsNameOptimistic({
		address: addressFormated,
		l1ChainId: 1, // Mainnet
		l2ChainId: ENS_CHAIN.id, // Base,
	});

	console.log("name", name, addressFormated);

	// Check if the resolved name is one of our subdomains
	const isOurSubdomain = name?.endsWith(".catmisha.eth") ?? false;
	const label = isOurSubdomain ? name?.replace(".catmisha.eth", "") : undefined;

	return {
		primaryName: name,
		isOurSubdomain,
		subdomainLabel: label,
		isLoading,
	};
}

// Hook to check if a user owns any subdomain under catmisha.eth
export function useUserSubdomain(userAddress: Address | undefined) {
	const { primaryName, isOurSubdomain, subdomainLabel, isLoading } =
		usePrimaryName(userAddress);

	const { subdomain, exists } = useSubdomainData(subdomainLabel);

	return {
		hasSubdomain: isOurSubdomain && exists,
		subdomainLabel,
		subdomain,
		primaryName,
		isLoading,
	};
}

// Hook for multiple text records at once
export function useTextRecords(label: string | undefined, keys: string[]) {
	const fullName = label ? getFullSubdomainName(label) : undefined;
	const normalizedName = fullName ? normalize(fullName) : undefined;
	const publicClient = usePublicClient({
		chainId: ENS_CHAIN.id,
	});

	const {
		data: textRecords,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["textRecords", normalizedName, keys],
		queryFn: async () => {
			if (!normalizedName || !publicClient) return {};

			const results = await Promise.all(
				keys.map(async (key) => {
					try {
						const value = await publicClient.getEnsText({
							name: normalizedName,
							key,
						});
						return { key, value };
					} catch (error) {
						console.warn(`Failed to fetch text record ${key}:`, error);
						return { key, value: null };
					}
				}),
			);

			return Object.fromEntries(
				results.map(({ key, value }) => [key, value || ""]),
			);
		},
		enabled: !!normalizedName && !!publicClient && keys.length > 0,
		staleTime: 30000, // Consider data stale after 30 seconds
		retry: 2,
	});

	return {
		textRecords: textRecords || {},
		isLoading,
		error,
	};
}
