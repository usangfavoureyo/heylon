"use client";

import { ContextRouterItem } from "@/components/context/ContextRouterItem";
import { useSymbol } from "@/components/providers/SymbolProvider";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

export default function ContextPage() {
    const { activeSymbol } = useSymbol();

    // Wire to Real Backend Data
    const contextData = useQuery(api.context_query.get, { symbol: activeSymbol });
    const isLoading = contextData === undefined;

    // --- MOCK / FALLBACK (If loading or data missing) ---
    const defaultData = {
        market: { bias: 'NEUTRAL', structure: 'RANGING', structure_state: 'RANGING' },
        macro: { nextEvent: null, riskState: 'LOW' },
        news: { sentiment: 'NEUTRAL', confidence: 'LOW', themes: [] },
        session: { quality: 'DISTRIBUTION', name: 'GLO' },
        volatility: { regime: 'NORMAL', liquidity: 'NORMAL' },
        politics: { risk: 'NEUTRAL', score: 0, keyword: false },
        lastUpdated: Date.now()
    };

    const data = contextData || defaultData;

    if (isLoading) {
        return <LoadingScreen className="bg-black" />;
    }

    return (
        <div className="flex flex-col min-h-full bg-white dark:bg-black text-neutral-900 dark:text-neutral-100 p-6 md:p-8 w-full">

            {/* 1. Header Row (Left-Right Alignment) */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-neutral-200 dark:border-neutral-900">
                {/* LEFT: Active Symbol */}
                <div className="flex flex-col">
                    <h1 className="text-3xl font-medium tracking-tight text-neutral-900 dark:text-white">{activeSymbol}</h1>
                    <span className="text-sm text-neutral-500 font-medium">Context Snapshot</span>
                </div>

                {/* RIGHT: Metadata */}
                <div className="flex flex-col items-end">
                    <div className="text-xs text-neutral-500 font-mono">
                        UPDATED &lt; 1 MIN AGO
                    </div>
                </div>
            </div>

            {/* 2. Navigation List */}
            <div className="flex flex-col w-full">

                {/* 1. Market Direction */}
                <ContextRouterItem
                    href="/context/market-direction"
                    label="Market Direction"
                    // @ts-ignore
                    status={data.market.bias}
                    // @ts-ignore
                    description={data.market.bias === 'NEUTRAL' ? 'Awaiting Alignment' : 'Trend Alignment'}
                    updatedAt={Date.now()}
                />

                {/* 2. Market Structure */}
                <ContextRouterItem
                    href="/context/market-structure"
                    label="Market Structure"
                    // @ts-ignore
                    status={data.market.structure || 'RANGING'}
                    description="Order Flow State"
                    updatedAt={Date.now()}
                />

                {/* 3. Macro Risk */}
                <ContextRouterItem
                    href="/context/macro"
                    label="Macro Risk"
                    // @ts-ignore
                    status={data.macro.riskState === 'HIGH' ? 'RISK' : 'NEUTRAL'}
                    // @ts-ignore
                    description={data.macro.nextEvent ? `Next: ${data.macro.nextEvent.title}` : 'No High Impact events'}
                    updatedAt={Date.now()}
                />

                {/* 4. News Sentiment */}
                <ContextRouterItem
                    href="/context/news"
                    label="News Sentiment"
                    // @ts-ignore
                    status={data.news.sentiment}
                    // @ts-ignore
                    description="Marketaux Feed Integration"
                    updatedAt={Date.now()}
                />

                {/* 5. Political Risk */}
                <ContextRouterItem
                    href="/context/political"
                    label="Political Risk"
                    // @ts-ignore
                    status={data.politics.risk === 'HIGH' ? 'RISK' : 'NEUTRAL'}
                    // @ts-ignore
                    description="Truth Social Sentiment"
                    updatedAt={Date.now()}
                />

                {/* 6. Volatility Regime */}
                <ContextRouterItem
                    href="/context/volatility"
                    label="Volatility Regime"
                    // @ts-ignore
                    status={data.volatility.regime}
                    // @ts-ignore
                    description={`Liquidity: ${data.volatility.liquidity}`}
                    updatedAt={Date.now()}
                />

                {/* 7. Session State */}
                <ContextRouterItem
                    href="/context/session"
                    label="Session State"
                    // @ts-ignore
                    status={'NEUTRAL'} // Session usually neutral/active
                    // @ts-ignore
                    description={`Current: ${data.session.name || 'GLO'}`}
                    updatedAt={Date.now()}
                />

            </div>
        </div>
    );
}
