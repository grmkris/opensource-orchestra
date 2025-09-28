import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Address } from "viem";
import { erc20Abi } from "viem";
import { waitForTransactionReceipt } from "viem/actions";
import { sepolia } from "viem/chains";
import { usePublicClient, useReadContract, useWriteContract } from "wagmi";
import { PY_USD_ABI } from "./py-usd-abi";
import { PY_USD_CONTRACTS } from "./py-usd-contract";

export const useRegisterArtist = () => {
	const { writeContractAsync } = useWriteContract();
	const publicCLient = usePublicClient();

	const registerAritst = useMutation({
		mutationFn: async (variables: {
			name: string;
			address: Address;
			imageUrl: string;
		}) => {
			if (!publicCLient) {
				throw Error("NO public client");
			}
			const result = await writeContractAsync({
				abi: PY_USD_ABI,
				address: PY_USD_CONTRACTS.GIFT_SINGLE,
				chainId: sepolia.id,
				functionName: "registerArtist",
				args: [variables.address, variables.name, variables.imageUrl],
			});

			const waited = waitForTransactionReceipt(publicCLient, { hash: result });

			return waited;
		},
	});

	return registerAritst;
};

export const useGiftToArtist = () => {
	const { writeContractAsync } = useWriteContract();
	const publicCLient = usePublicClient();

	const giftToArtist = useMutation({
		mutationFn: async (variables: { artist: Address; amount: bigint }) => {
			if (!publicCLient) {
				throw Error("NO public client");
			}
			const result = await writeContractAsync({
				abi: PY_USD_ABI,
				address: PY_USD_CONTRACTS.GIFT_SINGLE,
				functionName: "mint",
				args: [variables.artist, variables.amount],
				chainId: sepolia.id,
			});

			const waited = waitForTransactionReceipt(publicCLient, { hash: result });

			return waited;
		},
	});

	return giftToArtist;
};

export const useArtistBalance = (artistAddress: Address | undefined) => {
	const artistBalance = useReadContract({
		abi: PY_USD_ABI,
		address: PY_USD_CONTRACTS.GIFT_SINGLE,
		functionName: "artistBalance",
		args: artistAddress ? [artistAddress] : undefined,
		chainId: sepolia.id,
		query: { enabled: !!artistAddress },
	});
	return artistBalance;
};

export const useWithdrawForArtist = () => {
	const { writeContractAsync } = useWriteContract();
	const publicCLient = usePublicClient();

	const withdrawForArtist = useMutation({
		mutationFn: async (variables: { artist: Address; amount: bigint }) => {
			if (!publicCLient) {
				throw Error("NO public client");
			}
			const result = await writeContractAsync({
				abi: PY_USD_ABI,
				address: PY_USD_CONTRACTS.GIFT_SINGLE,
				functionName: "withdrawForArtist",
				args: [variables.artist, variables.amount],
				chainId: sepolia.id,
			});

			const waited = waitForTransactionReceipt(publicCLient, { hash: result });

			return waited;
		},
	});

	return withdrawForArtist;
};

export const usePyusdAllowance = (
	owner: Address | undefined,
	spender: Address | undefined,
) => {
	return useReadContract({
		address: PY_USD_CONTRACTS.PYUSD,
		abi: erc20Abi,
		functionName: "allowance",
		args: owner && spender ? [owner, spender] : undefined,
		chainId: sepolia.id,
		query: { enabled: !!(owner && spender) },
	});
};

export const usePyusdApprove = () => {
	const { writeContractAsync } = useWriteContract();
	const publicClient = usePublicClient();
	const queryClient = useQueryClient();
	const approvePyusd = useMutation({
		mutationFn: async (variables: { spender: Address; amount: bigint }) => {
			if (!publicClient) {
				throw Error("NO public client");
			}
			const result = await writeContractAsync({
				address: PY_USD_CONTRACTS.PYUSD,
				abi: erc20Abi,
				functionName: "approve",
				args: [variables.spender, variables.amount],
				chainId: sepolia.id,
			});

			const waited = waitForTransactionReceipt(publicClient, { hash: result });

			queryClient.invalidateQueries();

			return waited;
		},
	});

	return approvePyusd;
};
