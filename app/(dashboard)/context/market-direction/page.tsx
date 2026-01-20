"use client";

import { useSymbol } from "@/components/providers/SymbolProvider";
import { BackButton } from "@/components/BackButton";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

export default function MarketDirectionPage() {
    const { activeSymbol } = useSymbol();
    // In real app, fetch more detailed state or reuse context query
    const contextData = useQuery(api.context_query.get, { symbol: activeSymbol });

    // Mock detailed state for now if API doesn't allow deep dive yet
    const data = contextData || {
        market: { bias: 'NEUTRAL', structure: 'RANGING' }
    };

    if (!contextData && !data) return <LoadingScreen className="bg-black" />;

    return (
        <div className="flex flex-col min-h-full bg-white dark:bg-black text-neutral-900 dark:text-neutral-100 p-6 md:p-8 w-full">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <BackButton />
                <div>
                    <h1 className="text-xl font-medium text-neutral-900 dark:text-white">Market Direction</h1>
                    <p className="text-sm text-neutral-500">HTF Bias & Alignment</p>
                </div>
            </div>

            {/* Content Audit Trail */}
            <div className="space-y-6">
                <div className="p-6 rounded-xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800">
                    <h2 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider mb-4">Current Bias Logic</h2>
                    <div className="space-y-4">
                        <LogicRow label="Daily Structure" value="BULLISH" />
                        <LogicRow label="4H Structure" value="BEARISH" />
                        <LogicRow label="1H Structure" value="RANGING" />
                        <div className="h-px bg-neutral-200 dark:bg-neutral-800 my-4" />
                        <div className="flex justify-between items-center">
                            <span className="text-neutral-500 dark:text-neutral-400">Resulting Bias</span>
                            <span className="px-3 py-1 rounded-md bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-mono text-sm">NEUTRAL</span>
                        </div>
                    </div>
                </div>

                <div className="p-6 rounded-xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800">
                    <h2 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider mb-2">Algorithm Note</h2>
                    <p className="text-neutral-600 dark:text-neutral-500 text-sm leading-relaxed">
                        Market is currently in a conflicting state (Daily Bullish vs 4H Bearish).
                        System mandates a NEUTRAL bias until 1H aligns with at least one HTF timeframe.
                        Tap Actions are restricted to Setup A+ only.
                    </p>
                </div>
            </div>
        </div>
    );
}

function LogicRow({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex justify-between items-center text-sm">
            <span className="text-neutral-500">{label}</span>
            <span className="text-neutral-900 dark:text-white font-medium">{value}</span>
        </div>
    );
}
