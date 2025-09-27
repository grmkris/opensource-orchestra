// L2 Primary Names usually have a few hour propagation delay
// This hook resolves the data instantly, provided the client has access to L1 and L2 clients
import { useQuery } from "@tanstack/react-query";
import { type Address, type Hex, type PublicClient, parseAbi } from "viem";
import { useChains, usePublicClient } from "wagmi";
import { mainnet } from "wagmi/chains";

export function useEnsName({
	address,
	l1ChainId = mainnet.id,
	l2ChainId,
}: {
	address: Hex | undefined;
	l1ChainId?: typeof mainnet.id;
	l2ChainId: number;
}) {
	const wagmiConfigChains = useChains();
	const wagmiConfigChainIds = [
		0,
		...wagmiConfigChains.map((chain) => chain.id),
	];

	if (
		!wagmiConfigChainIds.includes(l1ChainId) ||
		!wagmiConfigChainIds.includes(l2ChainId)
	) {
		throw new Error(
			`ChainId ${l1ChainId} or ${l2ChainId} is not in the wagmi config`,
		);
	}

	if (![mainnet.id].includes(l1ChainId)) {
		throw new Error(`ChainId ${l1ChainId} is not an L1 chain`);
	}

	const l2Client = usePublicClient({ chainId: l2ChainId });
	const l1Client = usePublicClient({ chainId: l1ChainId });

	return useQuery({
		enabled: !!address && !!l1Client && !!l2Client,
		queryKey: ["l2-name", l1ChainId, l2ChainId, address],
		queryFn: async () => {
			if (!address || !l1Client || !l2Client) {
				throw new Error("Missing required parameters");
			}

			if (l2ChainId === 0) {
				// Handle default namespace
				const defaultReverseResolver = await l1Client.getEnsResolver({
					name: "reverse",
				});

				const defaultReverseRegistrar = await l1Client.readContract({
					address: defaultReverseResolver,
					abi: parseAbi(["function defaultRegistrar() view returns (address)"]),
					functionName: "defaultRegistrar",
				});

				return resolveReverseName({
					address,
					l1Client,
					l2Client: l1Client,
					l2ChainId,
					reverseRegistrar: defaultReverseRegistrar,
				});
			}
			if (l2ChainId === 1) {
				return l1Client.getEnsName({ address });
			}
			// Handle L2 namespaces
			const reverseNamespace = `${evmChainIdToCoinType(l2ChainId).toString(16)}.reverse`;
			const chainReverseResolver = await l1Client.getEnsResolver({
				name: reverseNamespace,
			});

			// Note: this will throw on unsupported chains, because `chainReverseResolver` will be the DefaultReverseResolver which doesn't have a `l2Registrar` function
			const l2ReverseRegistrar = await l1Client.readContract({
				address: chainReverseResolver,
				abi: parseAbi(["function l2Registrar() view returns (address)"]),
				functionName: "l2Registrar",
			});

			return resolveReverseName({
				address,
				l1Client,
				l2Client,
				l2ChainId,
				reverseRegistrar: l2ReverseRegistrar,
			});
		},
	});
}

async function resolveReverseName({
	address,
	l1Client,
	l2Client,
	l2ChainId,
	reverseRegistrar,
}: {
	l1Client: PublicClient;
	l2Client: PublicClient;
	address: Hex;
	l2ChainId: number;
	reverseRegistrar: Address;
}) {
	const reverseName = await l2Client.readContract({
		address: reverseRegistrar,
		abi: parseAbi(["function nameForAddr(address) view returns (string)"]),
		functionName: "nameForAddr",
		args: [address],
	});

	const forwardAddr = await l1Client.getEnsAddress({
		name: reverseName,
		coinType: evmChainIdToCoinType(l2ChainId),
	});

	if (forwardAddr?.toLowerCase() === address.toLowerCase()) {
		return reverseName;
	}

	return null;
}

const evmChainIdToCoinType = (chainId: number) => {
	const coinType = (0x80000000 | chainId) >>> 0;
	return BigInt(coinType);
};
