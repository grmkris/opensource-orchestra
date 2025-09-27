import { useMutation, useQuery } from "@tanstack/react-query";
import type { Address } from "viem";
import { waitForTransactionReceipt } from "viem/actions";
import { base } from "viem/chains";
import { usePublicClient, useWriteContract } from "wagmi";
import { ENS_CONTRACTS } from "@/lib/ens/ens-contracts";
import { L2_REGISTRAR_ABI } from "@/lib/ens/l2-registrar-abi";

interface RegisterSubdomainParams {
	label: string;
	owner: Address;
}

export function useRegisterSubdomain() {
	const { writeContractAsync } = useWriteContract();
	const basePublicClient = usePublicClient({ chainId: base.id });
	return useMutation({
		mutationFn: async ({ label, owner }: RegisterSubdomainParams) => {
			if (!basePublicClient) {
				throw new Error("Base public client not found");
			}
			// Execute the registration transaction
			const hash = await writeContractAsync({
				address: ENS_CONTRACTS.L2_REGISTRAR,
				abi: L2_REGISTRAR_ABI,
				functionName: "register",
				args: [label, owner],
				chainId: base.id,
			});

			await waitForTransactionReceipt(basePublicClient, {
				hash,
			});

			// Return the result data
			return { label, owner, hash };
		},
	});
}

export function useSubdomainAvailability(props: { label?: string }) {
	const basePublicClient = usePublicClient({ chainId: base.id });
	const data = useQuery({
		queryKey: ["subdomain-availability", props.label],
		enabled: !!props.label && !!basePublicClient,
		queryFn: async () => {
			if (!props.label || !basePublicClient) {
				throw new Error("Missing required parameters");
			}
			const isAvailable = await basePublicClient.readContract({
				address: ENS_CONTRACTS.L2_REGISTRAR,
				abi: L2_REGISTRAR_ABI,
				functionName: "available",
				args: [props.label],
			});

			return isAvailable;
		},
	});

	return data;
}
