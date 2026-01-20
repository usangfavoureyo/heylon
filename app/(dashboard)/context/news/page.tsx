"use client";

import { useSymbol } from "@/components/providers/SymbolProvider";
import { BackButton } from "@/components/BackButton";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

export default function NewsPage() {
    const { activeSymbol } = useSymbol();
    // This expects to fetch a list of news articles
    // For now we mock or use existing query if it returns list
    const contextData = useQuery(api.context_query.get, { symbol: activeSymbol });

    if (!contextData) return <LoadingScreen className="bg-black" />;

    return (
        <div className="flex flex-col min-h-full bg-white dark:bg-black text-neutral-900 dark:text-neutral-100 p-6 md:p-8 w-full">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <BackButton />
                <div>
                    <h1 className="text-xl font-medium text-neutral-900 dark:text-white">News Sentiment</h1>
                    <p className="text-sm text-neutral-500">Marketaux Intelligence Feed</p>
                </div>
            </div>

            {/* List */}
            <div className="space-y-4">
                <div className="text-xs font-mono text-neutral-500 uppercase mb-2">Today's Headlines</div>

                {/* Mock List */}
                <NewsItem
                    title="Tech Stocks Rally Ahead of Earnings"
                    source="Bloomberg"
                    time="10:30"
                    sentiment="POSITIVE"
                />
                <NewsItem
                    title="Oil Prices Drop as Demand Concerns Linger"
                    source="Reuters"
                    time="09:15"
                    sentiment="NEGATIVE"
                />
                <NewsItem
                    title="Weekly Jobless Claims Fall More Than Expected"
                    source="CNBC"
                    time="08:30"
                    sentiment="POSITIVE"
                />
            </div>
        </div>
    );
}

function NewsItem({ title, source, time, sentiment }: { title: string, source: string, time: string, sentiment: string }) {
    const color = sentiment === 'POSITIVE' ? 'text-emerald-600 dark:text-emerald-500' : sentiment === 'NEGATIVE' ? 'text-red-600 dark:text-red-500' : 'text-neutral-500';

    return (
        <div className="flex flex-col p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900/30 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors">
            <div className="flex justify-between items-start mb-1">
                <h3 className="text-sm font-medium text-neutral-900 dark:text-white line-clamp-2 w-3/4">{title}</h3>
                <span className="text-xs font-mono text-neutral-500">{time}</span>
            </div>
            <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-neutral-600 dark:text-neutral-500">{source}</span>
                <span className={`text-[10px] font-bold uppercase ${color}`}>{sentiment}</span>
            </div>
        </div>
    );
}
