import { useMutation, useQueryClient } from "@tanstack/react-query";
import { namehash } from "viem";
import { waitForTransactionReceipt } from "viem/actions";
import { base } from "viem/chains";
import { usePublicClient, useWriteContract } from "wagmi";
import {
  ENS_CHAIN,
  ENS_CONTRACTS,
  type TextRecordKey,
} from "@/lib/ens/ens-contracts";
import { L2_REGISTRY_ABI } from "@/lib/ens/l2-registry-abi";

export function useSetTextRecords() {
  const queryClient = useQueryClient();

  const { writeContractAsync } = useWriteContract();
  const basePublicClient = usePublicClient({ chainId: base.id });

  const setTextRecordMutation = useMutation({
    mutationFn: async ({
      label,
      key,
      value,
    }: {
      label: string;
      key: TextRecordKey;
      value: string;
    }) => {
      if (!basePublicClient) {
        throw new Error("Base public client not found");
      }
      const node = namehash(label);

      const result = await writeContractAsync({
        address: ENS_CONTRACTS.L2_REGISTRY,
        abi: L2_REGISTRY_ABI,
        functionName: "setText",
        args: [node, key, value],
        chainId: ENS_CHAIN.id,
      });

      const mined = await waitForTransactionReceipt(basePublicClient, {
        hash: result,
      });

      queryClient.invalidateQueries();

      return mined;
    },
  });

  return setTextRecordMutation;
}

// Hook for clearing a text record (setting it to empty string)
export function useClearTextRecord({
  label,
  key,
}: {
  label: string;
  key: TextRecordKey;
}) {
  const { mutateAsync } = useSetTextRecords();

  const clearTextRecord = useMutation({
    mutationFn: async () => {
      await mutateAsync({ label, key, value: "" });
    },
  });

  return clearTextRecord;
}
