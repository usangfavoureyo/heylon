"use client";

import { GlobalCard } from "@/components/ui/GlobalCard";
import { cn } from "@/lib/utils";
import { Newspaper, CaretDown, CheckCircle } from "@phosphor-icons/react";
import { useState } from "react";

interface NewsSentimentCardProps {
    sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
    confidence: 'LOW' | 'MEDIUM' | 'HIGH';
    themes: string[]; // e.g. ["Inflation fears", "Tech rally"]
}

export function NewsSentimentCard({ sentiment, confidence, themes }: NewsSentimentCardProps) {
    const [expanded, setExpanded] = useState(false);

    const sentimentColor =
        sentiment === 'POSITIVE' ? "text-emerald-500" :
            sentiment === 'NEGATIVE' ? "text-red-500" :
                "text-amber-500";

    return (
        <GlobalCard className="flex flex-col relative" noPadding>
            <div
                className="flex items-center justify-between p-4 cursor-pointer active:bg-white/5 transition-colors"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center gap-3">
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center bg-white/5 border border-white/10", sentimentColor)}>
                        <Newspaper weight="bold" className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-white">News Sentiment</h3>
                        <p className={cn("text-xs font-bold tracking-wide", sentimentColor)}>
                            {sentiment} • {confidence} CONFIDENCE
                        </p>
                    </div>
                </div>
                <CaretDown weight="bold" className={cn("w-4 h-4 text-neutral-600 transition-transform", expanded && "rotate-180")} />
            </div>

            {expanded && (
                <div className="px-4 pb-4 pt-0 border-t border-white/5 animate-in slide-in-from-top-2 fade-in duration-200">
                    <div className="mt-3">
                        <span className="text-[10px] text-neutral-500 uppercase tracking-wider block mb-2">Key Themes</span>
                        <div className="flex flex-wrap gap-2">
                            {themes.map((theme) => (
                                <span key={theme} className="px-2 py-1 rounded-md bg-neutral-800 border border-white/5 text-xs text-neutral-300">
                                    {theme}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </GlobalCard>
    );
}
