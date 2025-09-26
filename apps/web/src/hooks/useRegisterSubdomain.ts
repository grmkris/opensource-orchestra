import { useCallback, useEffect, useState } from "react";
import type { Address } from "viem";
import {
	usePublicClient,
	useWaitForTransactionReceipt,
	useWriteContract,
} from "wagmi";
import { useQuery } from "@tanstack/react-query";
import {
	ENS_CHAIN,
	ENS_CONTRACTS,
	getFullSubdomainName,
	L2_REGISTRAR_ABI,
} from "@/lib/contracts/ens-contracts";

interface UseRegisterSubdomainProps {
	onSuccess?: (label: string, owner: Address) => void;
	onError?: (error: Error) => void;
}

export function useRegisterSubdomain({
	onSuccess,
	onError,
}: UseRegisterSubdomainProps = {}) {
	const [isPending, setIsPending] = useState(false);
	const [lastTxHash, setLastTxHash] = useState<`0x${string}` | undefined>();

	const { writeContract, data: txHash, error: writeError } = useWriteContract();

	const { isLoading: isConfirming, isSuccess: isConfirmed } =
		useWaitForTransactionReceipt({
			hash: lastTxHash,
		});

	// Update pending state based on transaction status
	useEffect(() => {
		if (txHash) {
			setLastTxHash(txHash);
			setIsPending(true);
		}
	}, [txHash]);

	useEffect(() => {
		if (isConfirmed) {
			setIsPending(false);
		}
	}, [isConfirmed]);

	// Handle errors
	useEffect(() => {
		if (writeError) {
			setIsPending(false);
			onError?.(writeError);
		}
	}, [writeError, onError]);

	const register = useCallback(
		(label: string, owner: Address) => {
			if (!ENS_CONTRACTS.L2_REGISTRAR) {
				throw new Error("L2 Registrar address not set");
			}

			try {
				writeContract({
					address: ENS_CONTRACTS.L2_REGISTRAR as Address,
					abi: L2_REGISTRAR_ABI,
					functionName: "register",
					args: [label, owner],
					chainId: ENS_CHAIN.id,
				});

				// Call success callback when confirmed
				if (isConfirmed && onSuccess) {
					onSuccess(label, owner);
				}
			} catch (error) {
				onError?.(error as Error);
			}
		},
		[writeContract, onSuccess, onError, isConfirmed],
	);

	return {
		register,
		isPending: isPending || isConfirming,
		isConfirmed,
		txHash: lastTxHash,
		error: writeError,
	};
}

// Hook to check subdomain availability
export function useSubdomainAvailability(label: string | undefined) {
	const publicClient = usePublicClient();

	const { data, isLoading, error } = useQuery({
		queryKey: ["subdomain-availability", label, ENS_CONTRACTS.L2_REGISTRAR],
		queryFn: async () => {
			if (!label || label.length < 3 || !ENS_CONTRACTS.L2_REGISTRAR || !publicClient) {
				return {
					isAvailable: false,
					isValidLength: (label?.length ?? 0) >= 3,
					fullName: label ? getFullSubdomainName(label) : undefined,
				};
			}

			try {
				const isAvailable = await publicClient.readContract({
					address: ENS_CONTRACTS.L2_REGISTRAR as Address,
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
		enabled: !!label && !!ENS_CONTRACTS.L2_REGISTRAR && !!publicClient,
		staleTime: 5000, // Consider data stale after 5 seconds
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
	const publicClient = usePublicClient();

	const { data: results, isLoading, error } = useQuery({
		queryKey: ["multiple-availability", labels, ENS_CONTRACTS.L2_REGISTRAR],
		queryFn: async () => {
			if (!ENS_CONTRACTS.L2_REGISTRAR || !publicClient || labels.length === 0) {
				return [];
			}

			const validLabels = labels.filter(label => label.length >= 3);
			
			const results = await Promise.all(
				validLabels.map(async (label) => {
					try {
						const isAvailable = await publicClient.readContract({
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
				})
			);

			return results;
		},
		enabled: !!ENS_CONTRACTS.L2_REGISTRAR && !!publicClient && labels.length > 0,
		staleTime: 5000,
		retry: 1,
	});

	return {
		results: results || [],
		isLoading,
		error,
	};
}
