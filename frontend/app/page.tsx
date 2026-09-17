"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Scale,
  Trophy,
} from "lucide-react";

import {
  GenLayerTransactionPanel,
  type SubmitInput,
  type TrackedStatus,
} from "@genlayer/transaction-kit-react";

import {
  GENLAYER_NETWORK,
  getContractAddress,
} from "@/lib/genlayer/client";

import { useTransactionKit } from "@/lib/genlayer/kit";
import { useWallet } from "@/lib/genlayer/wallet";

import {
  useBattleResult,
  useInvalidateBattleResult,
} from "@/lib/hooks/useTradingAgentJudge";

import { success, error } from "@/lib/utils/toast";

import { Button } from "@/components/ui/button";
import { AccountPanel } from "@/components/AccountPanel";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const EXPLORER_URL =
  "https://explorer-studio-dev.genlayer.com/address/0xD88f201b6A57Efb8920A7c31B2ce34ba4CCD076f";

export default function HomePage() {
  const { address, isConnected, isLoading: walletLoading } = useWallet();

  const kit = useTransactionKit(address);
  const contractAddress = getContractAddress();

  const { data: result, isLoading: resultLoading } = useBattleResult();
  const invalidateResult = useInvalidateBattleResult();

  const [asset, setAsset] = useState("BTC");

  const [agentAName, setAgentAName] = useState("Agent Alpha");
  const [agentAPrediction, setAgentAPrediction] = useState("Bullish");
  const [agentATargetPrice, setAgentATargetPrice] = useState("");

  const [agentBName, setAgentBName] = useState("Agent Beta");
  const [agentBPrediction, setAgentBPrediction] = useState("Bearish");
  const [agentBTargetPrice, setAgentBTargetPrice] = useState("");

  const [activeTx, setActiveTx] = useState<"submit" | "judge" | null>(null);

  const submitTx = useMemo<SubmitInput | null>(() => {
    if (!activeTx || activeTx !== "submit") {
      return null;
    }

    return {
      kind: "write",
      address: contractAddress as `0x${string}`,
      method: "submit_predictions",
      args: [
        asset,
        agentAName,
        agentAPrediction,
        agentATargetPrice,
        agentBName,
        agentBPrediction,
        agentBTargetPrice,
      ],
    };
  }, [
    activeTx,
    contractAddress,
    asset,
    agentAName,
    agentAPrediction,
    agentATargetPrice,
    agentBName,
    agentBPrediction,
    agentBTargetPrice,
  ]);

  const judgeTx = useMemo<SubmitInput | null>(() => {
    if (!activeTx || activeTx !== "judge") {
      return null;
    }

    return {
      kind: "write",
      address: contractAddress as `0x${string}`,
      method: "fetch_and_judge",
      args: [],
    };
  }, [activeTx, contractAddress]);

  const validateWallet = () => {
    if (!isConnected || !address) {
      error("Connect your wallet first");
      return false;
    }

    if (!kit) {
      error("Transaction kit unavailable", {
        description: "Check your MetaMask connection.",
      });
      return false;
    }

    if (!contractAddress) {
      error("Contract address is not configured");
      return false;
    }

    return true;
  };

  const handleSubmit = () => {
    if (!validateWallet()) return;

    if (
      !asset.trim() ||
      !agentAName.trim() ||
      !agentBName.trim() ||
      !agentATargetPrice.trim() ||
      !agentBTargetPrice.trim()
    ) {
      error("Please complete all required fields");
      return;
    }

    if (
      Number.isNaN(Number(agentATargetPrice)) ||
      Number.isNaN(Number(agentBTargetPrice))
    ) {
      error("Target prices must be numbers");
      return;
    }

    setActiveTx("submit");
  };

  const handleJudge = () => {
    if (!validateWallet()) return;

    setActiveTx("judge");
  };

  const handleDone = (status: TrackedStatus) => {
    if (status.successful !== false) {
      invalidateResult();

      if (activeTx === "submit") {
        success("Predictions submitted", {
          description: "The battle is now ready for GenLayer judgment.",
        });
      } else {
        success("Battle judged successfully", {
          description: "The result has been recorded on GenLayer.",
        });
      }

      setActiveTx(null);
      return;
    }

    error("Transaction was not successful");
  };

  const formatPrice = (value?: string) => {
    if (!value) return "—";

    const number = Number(value);

    if (Number.isNaN(number)) return value;

    return `$${number.toLocaleString(undefined, {
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-white/10 sticky top-0 z-40 backdrop-blur-xl bg-black/30">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <Scale className="w-7 h-7 text-accent" />

                <h1 className="text-xl md:text-2xl font-bold">
                  Trading Agent Judge
                </h1>
              </div>

              <p className="text-sm text-muted-foreground mt-1">
                Decentralized AI-agent prediction battles on GenLayer
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <div className="text-xs text-muted-foreground">
                  Network
                </div>

                <div className="text-sm font-semibold text-accent">
                  Studio Next · 61997
                </div>
              </div>

              <div className="flex items-center gap-2">
                <AccountPanel />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow px-4 md:px-6 py-8">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Hero */}
          <section className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-2 text-sm text-accent mb-5">
              <Scale className="w-4 h-4" />
              GenLayer Adjudication
            </div>

            <h2 className="text-4xl md:text-6xl font-bold tracking-tight">
              Trading Agent
              <span className="text-accent"> Judge</span>
            </h2>

            <p className="mt-5 text-lg text-muted-foreground">
              Compare two trading-agent predictions and let a GenLayer
              contract verify which target price is closest to the live
              Bitcoin price.
            </p>
          </section>

          {/* Battle Form */}
          <section className="brand-card p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold">
                  Create a Battle
                </h3>

                <p className="text-sm text-muted-foreground mt-1">
                  Submit two independent agent predictions.
                </p>
              </div>
            </div>

            <div className="space-y-6">

              {/* Asset */}
              <div className="space-y-2">
                <Label>Asset</Label>

                <Input
                  value={asset}
                  onChange={(e) => setAsset(e.target.value)}
                  placeholder="BTC"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Agent A */}
                <div className="rounded-xl border border-white/10 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-lg">
                      Agent A
                    </h4>

                    <span className="text-xs rounded-full border px-2 py-1">
                      Prediction 1
                    </span>
                  </div>

                  <div className="space-y-2">
                    <Label>Agent name</Label>

                    <Input
                      value={agentAName}
                      onChange={(e) => setAgentAName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Prediction</Label>

                    <Input
                      value={agentAPrediction}
                      onChange={(e) =>
                        setAgentAPrediction(e.target.value)
                      }
                      placeholder="Bullish"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Target price (USD)</Label>

                    <Input
                      type="number"
                      value={agentATargetPrice}
                      onChange={(e) =>
                        setAgentATargetPrice(e.target.value)
                      }
                      placeholder="120000"
                    />
                  </div>
                </div>

                {/* Agent B */}
                <div className="rounded-xl border border-white/10 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-lg">
                      Agent B
                    </h4>

                    <span className="text-xs rounded-full border px-2 py-1">
                      Prediction 2
                    </span>
                  </div>

                  <div className="space-y-2">
                    <Label>Agent name</Label>

                    <Input
                      value={agentBName}
                      onChange={(e) => setAgentBName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Prediction</Label>

                    <Input
                      value={agentBPrediction}
                      onChange={(e) =>
                        setAgentBPrediction(e.target.value)
                      }
                      placeholder="Bearish"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Target price (USD)</Label>

                    <Input
                      type="number"
                      value={agentBTargetPrice}
                      onChange={(e) =>
                        setAgentBTargetPrice(e.target.value)
                      }
                      placeholder="85000"
                    />
                  </div>
                </div>
              </div>

              {/* Transaction */}
              <div className="flex flex-col md:flex-row gap-3 pt-2">
                <Button
                  onClick={handleSubmit}
                  disabled={
                    !kit ||
                    walletLoading ||
                    activeTx !== null
                  }
                  variant="gradient"
                  className="flex-1"
                >
                  {activeTx === "submit" ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Preparing transaction...
                    </>
                  ) : (
                    <>
                      Submit Predictions
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleJudge}
                  disabled={
                    !kit ||
                    walletLoading ||
                    activeTx !== null
                  }
                  variant="secondary"
                  className="flex-1"
                >
                  {activeTx === "judge" ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Preparing judgment...
                    </>
                  ) : (
                    <>
                      Run GenLayer Judgment
                      <Scale className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>

              {/* Transaction panel */}
              {activeTx && kit && (
                <div className="rounded-xl border border-accent/20 p-4">
                  <GenLayerTransactionPanel
                    kit={kit}
                    tx={
                      activeTx === "submit"
                        ? submitTx!
                        : judgeTx!
                    }
                    network={GENLAYER_NETWORK.chainName}
                    theme="dark"
                    trackUntil="decided"
                    onDone={handleDone}
                  />
                </div>
              )}
            </div>
          </section>

          {/* Result */}
          <section className="brand-card p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-accent" />
                  Battle Result
                </h3>

                <p className="text-sm text-muted-foreground mt-1">
                  Read directly from the Trading Agent Judge contract.
                </p>
              </div>

              {resultLoading && (
                <Loader2 className="w-5 h-5 animate-spin" />
              )}
            </div>

            {!result ? (
              <div className="rounded-xl border border-white/10 p-8 text-center">
                <p className="text-muted-foreground">
                  No battle result available yet.
                </p>
              </div>
            ) : (
              <div className="space-y-6">

                {/* Prices */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="rounded-xl border border-white/10 p-5">
                    <div className="text-sm text-muted-foreground">
                      Asset
                    </div>

                    <div className="text-2xl font-bold mt-1">
                      {result.asset || "—"}
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 p-5">
                    <div className="text-sm text-muted-foreground">
                      Entry Price
                    </div>

                    <div className="text-2xl font-bold mt-1">
                      {formatPrice(result.entry_price)}
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 p-5">
                    <div className="text-sm text-muted-foreground">
                      Current Price
                    </div>

                    <div className="text-2xl font-bold mt-1">
                      {formatPrice(result.current_price)}
                    </div>
                  </div>
                </div>

                {/* Agents */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-white/10 p-5">
                    <div className="text-sm text-muted-foreground mb-2">
                      Agent A
                    </div>

                    <div className="text-xl font-bold">
                      {result.agent_a.name}
                    </div>

                    <div className="text-sm mt-2">
                      Prediction: {result.agent_a.prediction}
                    </div>

                    <div className="text-sm mt-1">
                      Target: {formatPrice(result.agent_a.target)}
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 p-5">
                    <div className="text-sm text-muted-foreground mb-2">
                      Agent B
                    </div>

                    <div className="text-xl font-bold">
                      {result.agent_b.name}
                    </div>

                    <div className="text-sm mt-2">
                      Prediction: {result.agent_b.prediction}
                    </div>

                    <div className="text-sm mt-1">
                      Target: {formatPrice(result.agent_b.target)}
                    </div>
                  </div>
                </div>

                {/* Verdict */}
                <div className="rounded-xl border border-accent/30 bg-accent/5 p-6">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-accent" />

                    <div>
                      <div className="text-sm text-muted-foreground">
                        Winner
                      </div>

                      <div className="text-2xl font-bold">
                        {result.winner}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="text-sm text-muted-foreground mb-2">
                      GenLayer Verdict
                    </div>

                    <p className="text-sm leading-6">
                      {result.verdict}
                    </p>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  Total battles recorded:{" "}
                  <span className="font-bold text-foreground">
                    {result.total_battles}
                  </span>
                </div>
              </div>
            )}
          </section>

          {/* Verification */}
          <section className="brand-card p-6 md:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h3 className="text-xl font-bold">
                  3. Verify the Result
                </h3>

                <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <p>
                    <span className="font-semibold text-foreground">
                      1.
                    </span>{" "}
                    Submit both agent predictions.
                  </p>

                  <p>
                    <span className="font-semibold text-foreground">
                      2.
                    </span>{" "}
                    Run GenLayer Judgment to fetch and compare the live BTC
                    price.
                  </p>

                  <p>
                    <span className="font-semibold text-foreground">
                      3.
                    </span>{" "}
                    Verify the deployed contract and transactions on Studio
                    Next Explorer.
                  </p>
                </div>

                <div className="mt-4">
                  <div className="text-xs text-muted-foreground">
                    Contract
                  </div>

                  <code className="text-xs break-all">
                    {contractAddress}
                  </code>
                </div>
              </div>

              <Button
                asChild
                variant="gradient"
                className="shrink-0"
              >
                <a
                  href={EXPLORER_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Verify on Studio Next
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </Button>
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t border-white/10 py-5">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-muted-foreground">
          Trading Agent Judge · GenLayer Studio Next · Chain 61997
        </div>
      </footer>
    </div>
  );
}