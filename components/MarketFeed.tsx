"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Megaphone, Newspaper } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Drawer } from "./ui/drawer";
import { useHaptic } from "@/hooks/use-haptic";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSymbol } from "@/components/providers/SymbolProvider";

interface Signal {
    id: string;
    source: 'PINESCRIPT_TAP' | 'MSS_LABEL' | 'NEWS' | 'SOCIAL';
    symbol: string;
    timestamp: string;
    sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    detail: string;
}

export function MarketFeed() {
    const { activeSymbol } = useSymbol();
    // Fetch History
    const history = useQuery(api.signals.getHistory, { symbol: activeSymbol || "NQ" });

    // Map to Feed Format
    const signals: Signal[] = (history || []).map(s => ({
        id: s._id,
        source: s.type === "TAP" ? "PINESCRIPT_TAP" : s.type === "MSS" ? "MSS_LABEL" : "NEWS",
        symbol: s.symbol,
        timestamp: new Date(s.createdAt).toISOString(),
        sentiment: s.type === "MSS" ? "BULLISH" : "NEUTRAL", // simplified mapping, ideally from metadata
        detail: s.summary || s.type // Use summary if available
    }));

    const getIcon = (source: string, sentiment: string) => {
        if (source === 'NEWS') return <Newspaper className="w-4 h-4 text-blue-400" />;
        if (source === 'SOCIAL') return <Megaphone className="w-4 h-4 text-orange-400" />;
        return sentiment === 'BULLISH' ? <TrendingUp className="w-4 h-4 text-emerald-500" /> : <TrendingDown className="w-4 h-4 text-red-500" />;
    };

    const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null);
    const { trigger } = useHaptic();

    return (
        <>
            <Card className="h-full border-none bg-transparent shadow-none p-0">
                <CardHeader className="px-0 pt-0 pb-4">
                    <CardTitle className="text-base text-neutral-400">Signal Feed</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="w-full text-sm">
                        <div className="grid grid-cols-12 gap-4 px-2 py-2 text-neutral-600 text-[10px] uppercase font-medium tracking-wider border-b border-neutral-800">
                            <div className="col-span-2">Time</div>
                            <div className="col-span-2">Sym</div>
                            <div className="col-span-5">Detail</div>
                            <div className="col-span-3 text-right">Sentiment</div>
                        </div>
                        {signals.map((signal) => (
                            <div
                                key={signal.id}
                                onClick={() => {
                                    trigger('medium');
                                    setSelectedSignal(signal);
                                }}
                                className="grid grid-cols-12 gap-4 items-center px-2 py-3 border-b border-neutral-900 last:border-0 hover:bg-neutral-900/40 transition-colors rounded-lg group cursor-pointer active:scale-[0.99] duration-100"
                            >
                                <div className="col-span-2 text-neutral-500 font-mono text-xs group-hover:text-neutral-300 transition-colors">
                                    {format(new Date(signal.timestamp), 'HH:mm')}
                                </div>
                                <div className="col-span-2 font-normal text-neutral-300 tracking-wide text-xs">
                                    {signal.symbol}
                                </div>
                                <div className="col-span-5 flex items-center gap-2 text-neutral-400 min-w-0">
                                    {getIcon(signal.source, signal.sentiment)}
                                    <span className="truncate text-xs group-hover:text-neutral-200 transition-colors">{signal.detail}</span>
                                </div>
                                <div className={cn(
                                    "col-span-3 text-right font-normal text-[10px]",
                                    signal.sentiment === 'BULLISH' ? 'text-emerald-500' :
                                        signal.sentiment === 'BEARISH' ? 'text-red-500' : 'text-neutral-500'
                                )}>
                                    {signal.sentiment}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Drawer
                open={!!selectedSignal}
                onOpenChange={(open) => !open && setSelectedSignal(null)}
            >
                {selectedSignal && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                            <div>
                                <h3 className="text-lg font-medium text-neutral-200 flex items-center gap-2">
                                    {selectedSignal.symbol}
                                    <span className="text-xs bg-neutral-800 px-2 py-0.5 rounded text-neutral-400 font-normal">
                                        {format(new Date(selectedSignal.timestamp), 'HH:mm:ss')}
                                    </span>
                                </h3>
                                <p className="text-sm text-neutral-500 mt-1">{selectedSignal.detail}</p>
                            </div>
                            {getIcon(selectedSignal.source, selectedSignal.sentiment)}
                        </div>

                        <div className="space-y-2">
                            <div className="text-xs uppercase tracking-wider text-neutral-500 font-medium">Analysis</div>
                            <div className="p-4 bg-neutral-800/50 rounded-lg border border-neutral-800 text-sm text-neutral-300 leading-relaxed">
                                Signal detected from <strong>{selectedSignal.source}</strong> indicates a
                                <span className={cn(
                                    "mx-1 font-medium",
                                    selectedSignal.sentiment === 'BULLISH' ? "text-emerald-500" : "text-red-500"
                                )}>
                                    {selectedSignal.sentiment}
                                </span>
                                bias.
                                <br /><br />
                                Structure aligned with HTF bias. Waiting for candle close confirmation before execution.
                            </div>
                        </div>

                        <button
                            onClick={() => setSelectedSignal(null)}
                            className="w-full py-3 bg-neutral-800 rounded-lg text-sm font-medium text-neutral-300 hover:bg-neutral-700 transition-colors"
                        >
                            Dismiss
                        </button>
                    </div>
                )}
            </Drawer>
        </>
    )
}
