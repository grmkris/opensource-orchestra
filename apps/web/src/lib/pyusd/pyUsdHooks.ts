import { useMutation } from "@tanstack/react-query";
import type { Address } from "viem";
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

export const useArtistBalance = () => {
	const artistBalance = useReadContract({
		abi: PY_USD_ABI,
		address: PY_USD_CONTRACTS.GIFT_SINGLE,
		functionName: "artistBalance",
		chainId: sepolia.id,
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
