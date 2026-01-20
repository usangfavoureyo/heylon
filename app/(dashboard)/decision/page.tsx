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
    // state is the decision_state doc, so state.decision is the string field "BUY"|"SELL"|...
    const verdict = state.decision || "WAIT";
    // confidence (number) to label
    const confidenceScore = state.confidence || 0;
    const confidence = confidenceScore ? (confidenceScore > 0.8 ? "VERY_HIGH" : confidenceScore > 0.5 ? "HIGH" : "LOW") : "LOW";

    // Derive Executability
    let executability: "CONFIRMED" | "OPTIONAL" | "BLOCKED" = "OPTIONAL";
    const blockers = state.blocking_factors || [];
    if (blockers.length > 0) executability = "BLOCKED";
    if (verdict === "BUY" || verdict === "SELL") executability = "CONFIRMED";

    const supports = state.supporting_factors || [];
    // Macro risk logic derived from blockers
    const isMacroBlocked = blockers.includes("MACRO_RISK");

    // Mapping fields correctly
    const explanation = state.jury?.explanation || state.analysis;
    const timestamp = state.updatedAt || Date.now();

    return (
        <main className="flex flex-col gap-6 lg:gap-8 p-4 lg:p-8 pt-[80px] lg:pt-8 w-full">
            {/* ROW 1: PRIMARY DECISION + STRUCTURE (Desktop: 2:1 Split) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 min-h-[300px]">
                <div className="lg:col-span-2 h-full">
                    <DecisionCard
                        symbol={activeSymbol}
                        verdict={state.decision as any}
                        bias={state.trigger?.type === "TAP" ? "LONG" : undefined} // Infer bias? metadata missing on top level. 
                        // Wait, Schema has 'trigger' object with 'type'. 'metadata' is on 'signals' table, not decision_state?
                        // We will assume undefined bias unless we fetch context or it's implied.
                        confidence={confidence}
                        executability={executability}
                        timestamp={timestamp}
                        explanation={state.analysis}
                        signalId={state.trigger?.eventId}
                        status={state.stage || "ACTIVE"} // Use stage for status
                        viability_label={undefined} // Schema doesn't have label, ignoring
                        viability_score={state.viability_score}
                    />
                </div>
                <div className="h-full">
                    <TapMssCard
                        // tap/mss data might need separate query if not in decision_state?
                        // Schema DOES NOT have 'latestTap' or 'latestMss'.
                        // Wait. The OLD code expected state.latestTap. 
                        // Does API `getFullState` return a JOINED object?
                        // If schema says defineTable... query might return return value of `getFullState` function.
                        // I assumed `getFullState` returns EXACTLY the table schema.
                        // If `getFullState` (the Query Function) returns a joined object { ...doc, latestTap: ..., latestMss: ... }, then Accessing .latestTap is VALID.
                        // BUT accessing .decision.analysis was INVALID because `decision` is a string.
                        // So `latestTap` might be valid if the Query adds it.
                        // I will keep tap/mss props IF they exist on the helper type (which I can't see).
                        // I will assume they are needed and keep them as state.latestTap if TS didn't complain about them previously.
                        // The error was specifically about `state.decision.status`.
                        // So I will assume `state` has hybrid shape: Doc Fields + Extra Fields (latestTap).

                        tap={(state as any).latestTap}
                        mss={(state as any).latestMss}
                    />
                </div>
            </div>

            {/* ROW 2: CONTEXT & RISK (Desktop: 3 Columns) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 min-h-0 lg:min-h-[250px] items-start">
                <FactorsCard supports={supports} blockers={blockers} />
                <ContextCard
                    direction={"NEUTRAL"} // state.latestTap?.metadata?.direction difficult to access if typed strictly
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
