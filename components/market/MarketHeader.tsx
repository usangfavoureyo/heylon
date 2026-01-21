"use client";

import { cn } from "@/lib/utils";
import { useSymbol } from "../providers/SymbolProvider";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { SearchPage } from "@/components/search/SearchPage";
import { useState } from "react";
import { useHaptic } from "@/hooks/use-haptic";

interface MarketHeaderProps {
    price?: number;
    change?: number; // Absolute change
    changePercent?: number; // Percentage
    isOpen?: boolean; // Market Open state
    className?: string;
}

export function MarketHeader({ price = 0, change = 0, changePercent = 0, isOpen = true, className }: MarketHeaderProps) {
    const { activeSymbol } = useSymbol();

    // Determine color based on net change
    const isPositive = change >= 0;
    const colorClass = isPositive ? "text-green-400" : "text-red-400";
    const sign = isPositive ? "+" : "";

    const [searchOpen, setSearchOpen] = useState(false);
    const { trigger } = useHaptic();

    return (
        <>
            <div className={cn("flex items-center justify-between px-4 py-3 bg-black/80 backdrop-blur-md sticky top-0 z-40 border-b border-white/5", className)}>
                {/* Left: Identity */}
                <div className="flex items-center gap-3">
                    {/* Search Trigger */}
                    <button
                        onClick={() => {
                            trigger("medium");
                            setSearchOpen(true);
                        }}
                        className="lg:hidden w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-neutral-400 hover:text-white active:scale-95 transition-colors"
                    >
                        <MagnifyingGlass className="w-5 h-5" />
                    </button>

                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-medium tracking-tighter text-white">{activeSymbol}</h1>
                            <div className={cn(
                                "w-1.5 h-1.5 rounded-full animate-pulse",
                                isOpen ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-amber-500"
                            )} />
                        </div>
                        <span className="text-[10px] uppercase font-medium text-neutral-500 tracking-wider">
                            {getInstrumentName(activeSymbol)}
                        </span>
                    </div>
                </div>

                {/* Right: Price Data */}
                <div className="flex flex-col items-end">
                    <span className="text-xl font-mono font-medium text-white tracking-tight">
                        {price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <div className={cn("flex items-center gap-1.5 text-[11px] font-mono font-medium", colorClass)}>
                        <span>{sign}{change.toFixed(2)}</span>
                        <span className="opacity-60">|</span>
                        <span>{sign}{changePercent.toFixed(2)}%</span>
                    </div>
                </div>
            </div>

            <SearchPage open={searchOpen} onOpenChange={setSearchOpen} />
        </>
    );
}

// Helper for full names (Mock for now, can move to constants)
function getInstrumentName(symbol: string): string {
    const map: Record<string, string> = {
        "NQ": "E-mini Nasdaq-100",
        "ES": "E-mini S&P 500",
        "YM": "E-mini Dow Jones",
        "RTY": "E-mini Russell 2000",
        "GC": "Gold Futures",
        "CL": "Crude Oil Futures",
    };
    return map[symbol] || "Futures Contract";
}
