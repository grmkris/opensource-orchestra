import type { Address } from "viem";
import { normalize } from "viem/ens";
import { useEnsAddress, useEnsAvatar, useEnsText } from "wagmi";
import { TEXT_RECORD_KEYS } from "@/lib/ens/ens-contracts";

interface SubdomainData {
	name: string;
	address?: Address;
	avatar?: string;
	description?: string;
	twitter?: string;
	github?: string;
	discord?: string;
	telegram?: string;
	url?: string;
	email?: string;
	header?: string;
}

// Hook to get subdomain data by label
export function useSubdomainData(ensName: string | undefined) {
	const { data: address, isLoading: addressLoading } = useEnsAddress({
		name: normalize(ensName || ""),
		query: { enabled: !!ensName },
		chainId: 1,
	});

	const { data: avatar, isLoading: avatarLoading } = useEnsAvatar({
		name: ensName,
		query: { enabled: !!ensName },
		chainId: 1,
	});

	const { data: description, isLoading: descriptionLoading } = useEnsText({
		name: ensName,
		key: TEXT_RECORD_KEYS.DESCRIPTION,
		query: { enabled: !!ensName },
		chainId: 1,
	});

	const { data: twitter, isLoading: twitterLoading } = useEnsText({
		name: ensName,
		key: TEXT_RECORD_KEYS.TWITTER,
		query: { enabled: !!ensName },
	});

	const { data: github, isLoading: githubLoading } = useEnsText({
		name: ensName,
		key: TEXT_RECORD_KEYS.GITHUB,
		query: { enabled: !!ensName },
		chainId: 1,
	});

	const { data: discord, isLoading: discordLoading } = useEnsText({
		name: ensName,
		key: TEXT_RECORD_KEYS.DISCORD,
		query: { enabled: !!ensName },
		chainId: 1,
	});

	const { data: telegram, isLoading: telegramLoading } = useEnsText({
		name: ensName,
		key: TEXT_RECORD_KEYS.TELEGRAM,
		query: { enabled: !!ensName },
		chainId: 1,
	});

	const { data: url, isLoading: urlLoading } = useEnsText({
		name: ensName,
		key: TEXT_RECORD_KEYS.URL,
		query: { enabled: !!ensName },
		chainId: 1,
	});

	const { data: email, isLoading: emailLoading } = useEnsText({
		name: ensName,
		key: TEXT_RECORD_KEYS.EMAIL,
		query: { enabled: !!ensName },
		chainId: 1,
	});

	const { data: header, isLoading: headerLoading } = useEnsText({
		name: ensName,
		key: TEXT_RECORD_KEYS.HEADER,
		query: { enabled: !!ensName },
		chainId: 1,
	});

	const isLoading =
		addressLoading ||
		avatarLoading ||
		descriptionLoading ||
		twitterLoading ||
		githubLoading ||
		discordLoading ||
		telegramLoading ||
		urlLoading ||
		emailLoading ||
		headerLoading;

	const exists = !!address;

	const subdomain: SubdomainData | null = ensName
		? {
				name: ensName,
				address: address || undefined,
				avatar: avatar || undefined,
				description: description || undefined,
				twitter: twitter || undefined,
				github: github || undefined,
				discord: discord || undefined,
				telegram: telegram || undefined,
				url: url || undefined,
				email: email || undefined,
				header: header || undefined,
			}
		: null;

	return {
		subdomain,
		exists,
		isLoading,
	};
}
