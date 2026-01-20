"use client";

import { useSymbol } from "@/components/providers/SymbolProvider";
import { BackButton } from "@/components/BackButton";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

export default function MacroPage() {
    const { activeSymbol } = useSymbol();
    const contextData = useQuery(api.context_query.get, { symbol: activeSymbol });

    if (!contextData) return <LoadingScreen className="bg-black" />;

    return (
        <div className="flex flex-col min-h-full bg-white dark:bg-black text-neutral-900 dark:text-neutral-100 p-6 md:p-8 w-full">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <BackButton />
                <div>
                    <h1 className="text-xl font-medium text-neutral-900 dark:text-white">Macro Risk</h1>
                    <p className="text-sm text-neutral-500">Economic Calendar (High Impact)</p>
                </div>
            </div>

            {/* Calendar List */}
            <div className="space-y-4">
                <div className="text-xs font-mono text-neutral-500 uppercase mb-2">Today</div>

                {/* Mock Data */}
                <EventRow time="08:30" currency="USD" event="CPI m/m" impact="HIGH" actual="0.4%" forecast="0.3%" />
                <EventRow time="08:30" currency="USD" event="Core CPI m/m" impact="HIGH" actual="0.3%" forecast="0.3%" />
                <EventRow time="14:00" currency="USD" event="Fed Chair Powell Speaks" impact="HIGH" actual="--" forecast="--" />
            </div>
        </div>
    );
}

function EventRow({ time, currency, event, impact, actual, forecast }: any) {
    return (
        <div className="flex items-center justify-between p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900/30 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors">
            <div className="flex items-center gap-4">
                <div className="flex flex-col items-center min-w-[40px]">
                    <span className="text-sm font-medium text-neutral-900 dark:text-white">{time}</span>
                    <span className="text-[10px] text-neutral-500">{currency}</span>
                </div>
                <div>
                    <div className="text-sm font-medium text-neutral-900 dark:text-white">{event}</div>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-600 dark:text-red-500 border border-red-500/20 text-[10px] font-bold uppercase">{impact}</span>
                    </div>
                </div>
            </div>
            <div className="text-right">
                <div className="text-xs text-neutral-500 dark:text-neutral-400">Act: <span className="text-neutral-900 dark:text-white">{actual}</span></div>
                <div className="text-[10px] text-neutral-500 dark:text-neutral-600">Fcst: {forecast}</div>
            </div>
        </div>
    );
}
