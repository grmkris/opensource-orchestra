import { useMutation, useQuery } from "@tanstack/react-query";
import type { Address } from "viem";
import { createPublicClient, http } from "viem";
import { base } from "viem/chains";
import { useWriteContract } from "wagmi";
import { L2_REGISTRAR_ABI } from "@/lib/contracts/ens-abi";
import {
	ENS_CONTRACTS,
	getFullSubdomainName,
} from "@/lib/contracts/ens-contracts";

// Base-specific public client for contract reads
const basePublicClient = createPublicClient({
	chain: base,
	transport: http(),
});

interface RegisterSubdomainParams {
	label: string;
	owner: Address;
}

export function useRegisterSubdomain() {
	const { writeContractAsync } = useWriteContract();

	return useMutation({
		mutationFn: async ({ label, owner }: RegisterSubdomainParams) => {
			if (!ENS_CONTRACTS.L2_REGISTRAR) {
				throw new Error("L2 Registrar address not set");
			}

			// Execute the registration transaction
			const hash = await writeContractAsync({
				address: ENS_CONTRACTS.L2_REGISTRAR as Address,
				abi: L2_REGISTRAR_ABI,
				functionName: "register",
				args: [label, owner],
				chainId: base.id,
			});

			// Return the result data
			return { label, owner, hash };
		},
	});
}

export function useSubdomainAvailability(label: string | undefined) {
	const { data, isLoading, error } = useQuery({
		queryKey: ["subdomain-availability", label, ENS_CONTRACTS.L2_REGISTRAR],
		queryFn: async () => {
			if (!label || label.length < 3 || !ENS_CONTRACTS.L2_REGISTRAR) {
				return {
					isAvailable: false,
					isValidLength: (label?.length ?? 0) >= 3,
					fullName: label ? getFullSubdomainName(label) : undefined,
				};
			}

			try {
				const isAvailable = await basePublicClient.readContract({
					address: ENS_CONTRACTS.L2_REGISTRAR,
					abi: L2_REGISTRAR_ABI,
					functionName: "available",
					args: [label],
				});

				return {
					isAvailable: !!isAvailable,
					isValidLength: true,
					fullName: getFullSubdomainName(label),
				};
			} catch (error) {
				console.warn("Failed to check availability:", error);
				return {
					isAvailable: false,
					isValidLength: true,
					fullName: getFullSubdomainName(label),
				};
			}
		},
		enabled: !!label && !!ENS_CONTRACTS.L2_REGISTRAR,
		staleTime: 5000,
		retry: 2,
		refetchOnMount: true,
	});

	return {
		isAvailable: data?.isAvailable ?? false,
		isLoading,
		fullName: data?.fullName,
		isValidLength: data?.isValidLength ?? (label?.length ?? 0) >= 3,
		error,
	};
}

// Hook for batch availability checking
export function useMultipleAvailability(labels: string[]) {
	const {
		data: results,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["multiple-availability", labels, ENS_CONTRACTS.L2_REGISTRAR],
		queryFn: async () => {
			if (!ENS_CONTRACTS.L2_REGISTRAR || labels.length === 0) {
				return [];
			}

			const validLabels = labels.filter((label) => label.length >= 3);

			const results = await Promise.all(
				validLabels.map(async (label) => {
					try {
						const isAvailable = await basePublicClient.readContract({
							address: ENS_CONTRACTS.L2_REGISTRAR as Address,
							abi: L2_REGISTRAR_ABI,
							functionName: "available",
							args: [label],
						});

						return {
							label,
							isAvailable: !!isAvailable,
							fullName: getFullSubdomainName(label),
							error: null,
						};
					} catch (error) {
						console.warn(`Failed to check availability for ${label}:`, error);
						return {
							label,
							isAvailable: false,
							fullName: getFullSubdomainName(label),
							error: error as Error,
						};
					}
				}),
			);

			return results;
		},
		enabled: !!ENS_CONTRACTS.L2_REGISTRAR && labels.length > 0,
		staleTime: 5000,
		retry: 1,
	});

	return {
		results: results || [],
		isLoading,
		error,
	};
}
