"use client";

import { useSymbol } from "@/components/providers/SymbolProvider";
import { BackButton } from "@/components/BackButton";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

export default function PoliticalRiskPage() {
    const { activeSymbol } = useSymbol();
    // This would fetch the filtered tweet list
    const contextData = useQuery(api.context_query.get, { symbol: activeSymbol });

    if (!contextData) return <LoadingScreen className="bg-black" />;

    return (
        <div className="flex flex-col min-h-full bg-white dark:bg-black text-neutral-900 dark:text-neutral-100 p-6 md:p-8 w-full">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <BackButton />
                <div>
                    <h1 className="text-xl font-medium text-neutral-900 dark:text-white">Political Risk</h1>
                    <p className="text-sm text-neutral-500">Truth Social Sentiment Analysis</p>
                </div>
            </div>

            {/* Keyword Filter Info */}
            <div className="mb-6 flex gap-2">
                <span className="text-xs text-neutral-500 uppercase self-center mr-2">Monitored Keywords:</span>
                {['TARIFF', 'CHINA', 'POWELL', 'FED'].map(k => (
                    <span key={k} className="px-2 py-1 rounded bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 text-[10px] uppercase">{k}</span>
                ))}
            </div>

            {/* Post Feed */}
            <div className="space-y-4">
                {/* Mock Data */}
                <PostItem
                    timestamp={Date.now() - 3600000}
                    content="If China does not stop flooding our markets with cheap goods, we will impose massive TARIFFS immediately! America First!"
                    impact="HIGH"
                    keyword="TARIFF"
                />
                <PostItem
                    timestamp={Date.now() - 7200000}
                    content="The FED is making a huge mistake keeping rates this high. They are killing the economy. Sad!"
                    impact="MEDIUM"
                    keyword="FED"
                />
            </div>
        </div>
    );
}

function PostItem({ timestamp, content, impact, keyword }: { timestamp: number, content: string, impact: string, keyword: string }) {
    return (
        <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900/30 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors">
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-neutral-500">{new Date(timestamp).toLocaleTimeString()}</span>
                    <span className="px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-white text-[10px] font-bold">{keyword}</span>
                </div>
                <span className={impact === 'HIGH' ? "text-amber-600 dark:text-amber-500 text-xs font-bold" : "text-neutral-500 text-xs"}>{impact} IMPACT</span>
            </div>
            <p className="text-neutral-700 dark:text-neutral-300 text-sm leading-relaxed font-normal">
                "{content}"
            </p>
        </div>
    );
}
