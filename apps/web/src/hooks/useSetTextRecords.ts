import { useCallback, useEffect, useState } from "react";
import type { Address } from "viem";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	ENS_CHAIN,
	ENS_CONTRACTS,
	getSubdomainNamehash,
	getFullSubdomainName,
	L2_REGISTRY_ABI,
	type TextRecordKey,
} from "@/lib/contracts/ens-contracts";

interface TextRecord {
	key: TextRecordKey;
	value: string;
}

interface UseSetTextRecordsProps {
	onSuccess?: (records: TextRecord[]) => void;
	onError?: (error: Error) => void;
}

export function useSetTextRecords({
	onSuccess,
	onError,
}: UseSetTextRecordsProps = {}) {
	const [lastTxHash, setLastTxHash] = useState<`0x${string}` | undefined>();
	const queryClient = useQueryClient();

	const { writeContract, data: txHash, error: writeError } = useWriteContract();

	const { isLoading: isConfirming, isSuccess: isConfirmed } =
		useWaitForTransactionReceipt({
			hash: lastTxHash,
		});

	// Update transaction hash
	useEffect(() => {
		if (txHash) {
			setLastTxHash(txHash);
		}
	}, [txHash]);

	// Invalidate cache and call success when confirmed
	useEffect(() => {
		if (isConfirmed && lastTxHash) {
			// Invalidate relevant queries to refetch data
			queryClient.invalidateQueries({
				queryKey: ["textRecords"],
			});
			queryClient.invalidateQueries({
				queryKey: ["subdomainData"],
			});
			
			onSuccess?.([]);
		}
	}, [isConfirmed, lastTxHash, queryClient, onSuccess]);

	// Handle errors
	useEffect(() => {
		if (writeError) {
			onError?.(writeError);
		}
	}, [writeError, onError]);

	const setTextRecordMutation = useMutation({
		mutationFn: async ({ label, key, value }: { label: string; key: TextRecordKey; value: string }) => {
			const node = getSubdomainNamehash(label);
			
			return new Promise<void>((resolve, reject) => {
				try {
					writeContract({
						address: ENS_CONTRACTS.L2_REGISTRY as Address,
						abi: L2_REGISTRY_ABI,
						functionName: "setText",
						args: [node, key, value],
						chainId: ENS_CHAIN.id,
					});
					resolve();
				} catch (error) {
					reject(error);
				}
			});
		},
		onSuccess: () => {
			// Optimistically update cache
			const fullName = getFullSubdomainName("");
			queryClient.invalidateQueries({
				queryKey: ["textRecords"],
			});
		},
		onError: (error) => {
			onError?.(error as Error);
		},
	});

	const setTextRecord = useCallback(
		(label: string, key: TextRecordKey, value: string) => {
			setTextRecordMutation.mutate({ label, key, value });
		},
		[setTextRecordMutation],
	);

	const setMultipleTextRecords = useCallback(
		async (label: string, records: TextRecord[]) => {
			const validRecords = records.filter(
				(record) => record.value.trim() !== "",
			);

			if (validRecords.length === 0) return;

			// For now, set the first record
			// TODO: Implement multicall for batch operations
			const firstRecord = validRecords[0];
			setTextRecord(label, firstRecord.key, firstRecord.value);
		},
		[setTextRecord],
	);

	return {
		setTextRecord,
		setMultipleTextRecords,
		isPending: setTextRecordMutation.isPending || isConfirming,
		isConfirmed,
		txHash: lastTxHash,
		error: writeError,
		pendingRecords: [], // Legacy support
	};
}

// Hook for clearing a text record (setting it to empty string)
export function useClearTextRecord({
	onSuccess,
	onError,
}: UseSetTextRecordsProps = {}) {
	const { setTextRecord, ...rest } = useSetTextRecords({
		onSuccess,
		onError,
	});

	const clearTextRecord = useCallback(
		(label: string, key: TextRecordKey) => {
			setTextRecord(label, key, "");
		},
		[setTextRecord],
	);

	return {
		clearTextRecord,
		...rest,
	};
}

// Helper hook for common profile updates
export function useUpdateProfile({
	onSuccess,
	onError,
}: UseSetTextRecordsProps = {}) {
	const { setMultipleTextRecords, ...rest } = useSetTextRecords({
		onSuccess,
		onError,
	});

	const updateProfile = useCallback(
		(
			label: string,
			profile: {
				avatar?: string;
				description?: string;
				display?: string;
				twitter?: string;
				github?: string;
				discord?: string;
				telegram?: string;
				url?: string;
				email?: string;
			},
		) => {
			const records: TextRecord[] = [];

			if (profile.avatar !== undefined) {
				records.push({ key: "avatar", value: profile.avatar });
			}
			if (profile.description !== undefined) {
				records.push({ key: "description", value: profile.description });
			}
			if (profile.display !== undefined) {
				records.push({ key: "display", value: profile.display });
			}
			if (profile.twitter !== undefined) {
				records.push({ key: "com.twitter", value: profile.twitter });
			}
			if (profile.github !== undefined) {
				records.push({ key: "com.github", value: profile.github });
			}
			if (profile.discord !== undefined) {
				records.push({ key: "com.discord", value: profile.discord });
			}
			if (profile.telegram !== undefined) {
				records.push({ key: "com.telegram", value: profile.telegram });
			}
			if (profile.url !== undefined) {
				records.push({ key: "url", value: profile.url });
			}
			if (profile.email !== undefined) {
				records.push({ key: "email", value: profile.email });
			}

			setMultipleTextRecords(label, records);
		},
		[setMultipleTextRecords],
	);

	return {
		updateProfile,
		...rest,
	};
}
