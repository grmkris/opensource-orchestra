import { useMutation } from "@tanstack/react-query";
import type { Address } from "viem";
import { parseAbi } from "viem";
import { useWriteContract } from "wagmi";
import {
	ENS_CHAIN,
	ENS_CONTRACTS,
	getFullSubdomainName,
} from "@/lib/contracts/ens-contracts";

const REVERSE_REGISTRAR_ABI = parseAbi([
	"function setName(string memory name) external returns (bytes32)",
	"function setNameForAddr(address addr, string memory name) external returns (bytes32)",
]);

export function useSetPrimaryName() {
	const { writeContractAsync } = useWriteContract();

	return useMutation({
		mutationFn: async (label: string) => {
			if (!ENS_CONTRACTS.BASE_REVERSE_REGISTRAR) {
				throw new Error("Base Reverse Registrar address not set");
			}

			const fullName = getFullSubdomainName(label);

			// Execute the primary name transaction
			const hash = await writeContractAsync({
				address: ENS_CONTRACTS.BASE_REVERSE_REGISTRAR as Address,
				abi: REVERSE_REGISTRAR_ABI,
				functionName: "setName",
				args: [fullName],
				chainId: ENS_CHAIN.id,
			});

			// Return the result data
			return { name: fullName, hash };
		},
	});
}

export function useSetPrimaryNameForAddress() {
	const { writeContractAsync } = useWriteContract();

	return useMutation({
		mutationFn: async ({
			label,
			address,
		}: {
			label: string;
			address: Address;
		}) => {
			if (!ENS_CONTRACTS.BASE_REVERSE_REGISTRAR) {
				throw new Error("Base Reverse Registrar address not set");
			}

			const fullName = getFullSubdomainName(label);

			// Execute the primary name transaction for specific address
			const hash = await writeContractAsync({
				address: ENS_CONTRACTS.BASE_REVERSE_REGISTRAR as Address,
				abi: REVERSE_REGISTRAR_ABI,
				functionName: "setNameForAddr",
				args: [address, fullName],
				chainId: ENS_CHAIN.id,
			});

			// Return the result data
			return { name: fullName, address, hash };
		},
	});
}
