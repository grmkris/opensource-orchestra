import type { Address } from "viem";
import { useEnsAddress, useEnsAvatar, useEnsText } from "wagmi";
import { ENS_CHAIN, TEXT_RECORD_KEYS } from "@/lib/ens/ens-contracts";
import { useEnsName } from "./useEnsName";

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
export function useSubdomainData(ensName: string | undefined) {
	const { data: address, isLoading: addressLoading } = useEnsAddress({
		name: ensName,
		query: { enabled: !!ensName },
		chainId: ENS_CHAIN.id,
	});

	const { data: avatar, isLoading: avatarLoading } = useEnsAvatar({
		name: ensName,
		query: { enabled: !!ensName },
		chainId: ENS_CHAIN.id,
	});

	const { data: description, isLoading: descriptionLoading } = useEnsText({
		name: ensName,
		key: TEXT_RECORD_KEYS.DESCRIPTION,
		query: { enabled: !!ensName },
		chainId: ENS_CHAIN.id,
	});

	const { data: display, isLoading: displayLoading } = useEnsText({
		name: ensName,
		key: TEXT_RECORD_KEYS.DISPLAY,
		query: { enabled: !!ensName },
		chainId: ENS_CHAIN.id,
	});

	const { data: twitter, isLoading: twitterLoading } = useEnsText({
		name: ensName,
		key: TEXT_RECORD_KEYS.TWITTER,
		query: { enabled: !!ensName },
		chainId: ENS_CHAIN.id,
	});

	const { data: github, isLoading: githubLoading } = useEnsText({
		name: ensName,
		key: TEXT_RECORD_KEYS.GITHUB,
		query: { enabled: !!ensName },
		chainId: ENS_CHAIN.id,
	});

	const { data: discord, isLoading: discordLoading } = useEnsText({
		name: ensName,
		key: TEXT_RECORD_KEYS.DISCORD,
		query: { enabled: !!ensName },
		chainId: ENS_CHAIN.id,
	});

	const { data: telegram, isLoading: telegramLoading } = useEnsText({
		name: ensName,
		key: TEXT_RECORD_KEYS.TELEGRAM,
		query: { enabled: !!ensName },
		chainId: ENS_CHAIN.id,
	});

	const { data: url, isLoading: urlLoading } = useEnsText({
		name: ensName,
		key: TEXT_RECORD_KEYS.URL,
		query: { enabled: !!ensName },
		chainId: ENS_CHAIN.id,
	});

	const { data: email, isLoading: emailLoading } = useEnsText({
		name: ensName,
		key: TEXT_RECORD_KEYS.EMAIL,
		query: { enabled: !!ensName },
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

	const subdomain: SubdomainData | null = ensName
		? {
				name: ensName,
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

// Hook to check if a user owns any subdomain under catmisha.eth
export function useUserSubdomain(userAddress: Address | undefined) {
	const ensData = useEnsName({
		address: userAddress,
		l1ChainId: 1,
		l2ChainId: ENS_CHAIN.id,
	});

	const subdomainData = useSubdomainData(ensData.data ?? undefined);

	return subdomainData;
}
