import { useMutation, useQueryClient } from "@tanstack/react-query";
import { parseAbi } from "viem";
import { waitForTransactionReceipt } from "viem/actions";
import { base } from "viem/chains";
import { usePublicClient, useWriteContract } from "wagmi";
import { ENS_CHAIN, ENS_CONTRACTS } from "@/lib/ens/ens-contracts";

const REVERSE_REGISTRAR_ABI = parseAbi([
	"function setName(string memory name) external returns (bytes32)",
	"function setNameForAddr(address addr, string memory name) external returns (bytes32)",
]);

export function useSetPrimaryName() {
	const { writeContractAsync } = useWriteContract();
	const basePublicClient = usePublicClient({ chainId: base.id });
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (name: string) => {
			if (!basePublicClient) {
				throw new Error("Base public client not found");
			}
			// Execute the primary name transaction
			const hash = await writeContractAsync({
				address: ENS_CONTRACTS.BASE_REVERSE_REGISTRAR,
				abi: REVERSE_REGISTRAR_ABI,
				functionName: "setName",
				args: [name],
				chainId: ENS_CHAIN.id,
			});

			const _mined = await waitForTransactionReceipt(basePublicClient, {
				hash,
			});

			// Invalidate all queries to refresh ENS data
			queryClient.invalidateQueries();

			// Return the result data
			return { name, hash };
		},
	});
}
