"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSymbol } from "@/components/providers/SymbolProvider";
import { DecisionCard } from "@/components/decision/DecisionCard";
import { TapMssCard } from "@/components/decision/TapMssCard";
import { FactorsCard } from "@/components/decision/FactorsCard";
import { ContextCard } from "@/components/decision/ContextCard";
import { RiskCard } from "@/components/decision/RiskCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function DecisionPage() {
    const { activeSymbol } = useSymbol();

    // Fetch Aggregated State
    const state = useQuery(api.decision.getFullState, { symbol: activeSymbol });

    if (!state) {
        return <DecisionPageSkeleton />;
    }

    // Default Fallbacks
    // state is { decision: Doc, ... }
    const decisionDoc = state.decision;
    const verdict = decisionDoc?.decision || "WAIT";

    // confidence (number) to label
    const confidenceScore = decisionDoc?.confidence || 0;
    const confidence = confidenceScore ? (confidenceScore > 0.8 ? "VERY_HIGH" : confidenceScore > 0.5 ? "HIGH" : "LOW") : "LOW";

    // Derive Executability
    let executability: "CONFIRMED" | "OPTIONAL" | "BLOCKED" = "OPTIONAL";
    const blockers = decisionDoc?.blocking_factors || [];
    if (blockers.length > 0) executability = "BLOCKED";
    if (verdict === "BUY" || verdict === "SELL") executability = "CONFIRMED";

    const supports = decisionDoc?.supporting_factors || [];
    const isMacroBlocked = blockers.includes("MACRO_RISK");

    // Mapping fields correctly using optional chaining on decisionDoc
    const explanation = decisionDoc?.jury?.explanation || decisionDoc?.analysis;
    const timestamp = decisionDoc?.updatedAt || Date.now();

    return (
        <main className="flex flex-col gap-6 lg:gap-8 p-4 lg:p-8 pt-[80px] lg:pt-8 w-full">
            {/* ROW 1: PRIMARY DECISION + STRUCTURE (Desktop: 2:1 Split) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 min-h-[300px]">
                <div className="lg:col-span-2 h-full">
                    <DecisionCard
                        symbol={activeSymbol}
                        verdict={decisionDoc?.decision as any}
                        bias={decisionDoc?.trigger?.type === "TAP" ? "LONG" : undefined}
                        confidence={confidence}
                        executability={executability}
                        timestamp={timestamp}
                        explanation={decisionDoc?.analysis}
                        signalId={decisionDoc?.trigger?.eventId}
                        status={decisionDoc?.stage || "ACTIVE"} // Use stage for status
                        viability_label={undefined}
                        viability_score={decisionDoc?.viability_score}
                    />
                </div>
                <div className="h-full">
                    <TapMssCard
                        tap={state.latestTap}
                        mss={state.latestMss}
                    />
                </div>
            </div>

            {/* ROW 2: CONTEXT & RISK (Desktop: 3 Columns) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 min-h-0 lg:min-h-[250px] items-start">
                <FactorsCard supports={supports} blockers={blockers} />
                <ContextCard
                    direction={state.latestTap?.metadata?.direction || "NEUTRAL"}
                    volatility="NORMAL"
                    session="RTH"
                    macroRisk={isMacroBlocked ? "HIGH" : "LOW"}
                    newsRisk={"LOW"}
                />
                <RiskCard
                    macroRisk={isMacroBlocked ? "HIGH" : "LOW"}
                    newsRisk={"LOW"}
                    socialRisk="LOW"
                    blockers={blockers}
                />
            </div>

            <div className="h-10 lg:hidden" /> {/* Spacer */}
        </main>
    );
}

function DecisionPageSkeleton() {
    return (
        <main className="h-full p-4 lg:p-8 flex flex-col gap-6 lg:gap-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[300px]">
                <Skeleton className="lg:col-span-2 h-[300px] rounded-3xl bg-white/5" />
                <Skeleton className="h-[300px] rounded-3xl bg-white/5" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Skeleton className="h-[200px] rounded-3xl bg-white/5" />
                <Skeleton className="h-[200px] rounded-3xl bg-white/5" />
                <Skeleton className="h-[200px] rounded-3xl bg-white/5" />
            </div>
        </main>
    );
}
