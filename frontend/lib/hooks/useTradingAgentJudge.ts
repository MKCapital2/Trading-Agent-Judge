"use client";

import { useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import TradingAgentJudge from "@/lib/contracts/TradingAgentJudge";
import { getContractAddress } from "@/lib/genlayer/client";
import { useWallet } from "@/lib/genlayer/wallet";

export function useTradingAgentJudgeContract(): TradingAgentJudge | null {
  const { address } = useWallet();
  const contractAddress = getContractAddress();

  return useMemo(() => {
    if (!contractAddress) {
      return null;
    }

    return new TradingAgentJudge(contractAddress, address);
  }, [contractAddress, address]);
}

export function useBattleResult() {
  const contract = useTradingAgentJudgeContract();

  return useQuery({
    queryKey: ["battleResult"],
    queryFn: async () => {
      if (!contract) {
        return null;
      }

      return contract.getBattleResult();
    },
    enabled: !!contract,
    refetchOnWindowFocus: true,
    staleTime: 3000,
  });
}

export function useInvalidateBattleResult() {
  const queryClient = useQueryClient();

  return useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: ["battleResult"],
    });
  }, [queryClient]);
}