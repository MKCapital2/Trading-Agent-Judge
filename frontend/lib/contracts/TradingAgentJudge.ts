import { createClient } from "genlayer-js";
import { GENLAYER_CHAIN } from "../genlayer/client";

export interface BattleResult {
  asset: string;
  entry_price: string;
  current_price: string;
  agent_a: {
    name: string;
    prediction: string;
    target: string;
  };
  agent_b: {
    name: string;
    prediction: string;
    target: string;
  };
  winner: string;
  verdict: string;
  total_battles: number;
}

export interface SubmitPredictionsParams {
  asset: string;
  agentAName: string;
  agentAPrediction: string;
  agentATargetPrice: string;
  agentBName: string;
  agentBPrediction: string;
  agentBTargetPrice: string;
}

class TradingAgentJudge {
  private contractAddress: `0x${string}`;
  private client: any;

  constructor(contractAddress: string, address?: string | null) {
    this.contractAddress = contractAddress as `0x${string}`;

    const config: any = {
      chain: GENLAYER_CHAIN,
    };

    if (address) {
      config.account = address as `0x${string}`;
    }

    this.client = createClient(config);
  }

  updateAccount(address: string): void {
    this.client = createClient({
      chain: GENLAYER_CHAIN,
      account: address as `0x${string}`,
    });
  }

  async getBattleResult(): Promise<BattleResult | null> {
    try {
      const result: any = await this.client.readContract({
        address: this.contractAddress,
        functionName: "get_battle_result",
        args: [],
      });

      if (!result) {
        return null;
      }

      const data =
        result instanceof Map
          ? Object.fromEntries(result.entries())
          : result;

      const agentA =
        data.agent_a instanceof Map
          ? Object.fromEntries(data.agent_a.entries())
          : data.agent_a;

      const agentB =
        data.agent_b instanceof Map
          ? Object.fromEntries(data.agent_b.entries())
          : data.agent_b;

      return {
        asset: String(data.asset ?? ""),
        entry_price: String(data.entry_price ?? ""),
        current_price: String(data.current_price ?? ""),
        agent_a: {
          name: String(agentA?.name ?? ""),
          prediction: String(agentA?.prediction ?? ""),
          target: String(agentA?.target ?? ""),
        },
        agent_b: {
          name: String(agentB?.name ?? ""),
          prediction: String(agentB?.prediction ?? ""),
          target: String(agentB?.target ?? ""),
        },
        winner: String(data.winner ?? ""),
        verdict: String(data.verdict ?? ""),
        total_battles: Number(data.total_battles ?? 0),
      };
    } catch (error) {
      console.error("Error fetching battle result:", error);
      throw new Error("Failed to fetch battle result");
    }
  }

  prepareSubmitPredictions(params: SubmitPredictionsParams) {
    return {
      kind: "write" as const,
      address: this.contractAddress,
      method: "submit_predictions",
      args: [
        params.asset,
        params.agentAName,
        params.agentAPrediction,
        params.agentATargetPrice,
        params.agentBName,
        params.agentBPrediction,
        params.agentBTargetPrice,
      ],
    };
  }

  prepareJudgeBattle() {
    return {
      kind: "write" as const,
      address: this.contractAddress,
      method: "fetch_and_judge",
      args: [],
    };
  }
}

export default TradingAgentJudge;