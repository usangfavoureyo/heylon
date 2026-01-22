"use client";

import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { useSymbol } from "@/components/providers/SymbolProvider";
import { cn } from "@/lib/utils";
import { useHaptic } from "@/hooks/use-haptic";
import { Star } from "@phosphor-icons/react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

interface SearchPageProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SearchPage({ open, onOpenChange }: SearchPageProps) {
    const { activeSymbol, setActiveSymbol, AUTHORIZED_SYMBOLS } = useSymbol();
    const [searchQuery, setSearchQuery] = useState("");
    const { trigger } = useHaptic();

    // Watchlist Data
    const watchlistData = useQuery(api.watchlist.get) || { symbols: [], active_symbol: "NQ" };
    const watchlist = watchlistData.symbols;
    const toggleWatchlist = useMutation(api.watchlist.toggleSymbol);

    // Filter Logic
    const filteredSymbols = AUTHORIZED_SYMBOLS.filter(s =>
        s.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Reset query on open
    useEffect(() => {
        if (open) setSearchQuery("");
    }, [open]);

    // Don't render if not open
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col">
            {/* Header with Close Button */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-800 shrink-0">
                <div className="w-10" /> {/* Spacer for centering */}
                <h1 className="text-lg font-medium text-white">Search Symbol</h1>
                <button
                    onClick={() => {
                        trigger('light');
                        onOpenChange(false);
                    }}
                    className="p-2 -mr-2 text-neutral-400 hover:text-white transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>

            {/* Search Input */}
            <div className="p-4 border-b border-neutral-800 shrink-0">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                    <input
                        type="text"
                        placeholder="Search Symbol (e.g. ES, NQ)"
                        className="w-full bg-black text-white placeholder:text-neutral-500 rounded-xl py-4 pl-12 pr-4 text-lg font-medium focus:outline-none focus:ring-1 focus:ring-[#0d0d0d] focus:border-[#0d0d0d] border border-neutral-800"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoFocus
                    />
                </div>
            </div>

            {/* Symbol List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {filteredSymbols.map((symbol) => (
                    <SymbolRow
                        key={symbol}
                        symbol={symbol}
                        isActive={symbol === activeSymbol}
                        isWatchlisted={watchlist.includes(symbol)}
                        onSelect={() => {
                            trigger('medium');
                            setActiveSymbol(symbol);
                            onOpenChange(false);
                        }}
                        onToggleWatchlist={() => {
                            trigger('light');
                            toggleWatchlist({ symbol });
                        }}
                    />
                ))}

                {filteredSymbols.length === 0 && (
                    <div className="p-8 text-center text-neutral-500 text-sm">
                        No authorized symbols found.
                    </div>
                )}
            </div>
        </div>
    );
}

function SymbolRow({ symbol, isActive, isWatchlisted, onSelect, onToggleWatchlist }: {
    symbol: string,
    isActive: boolean,
    isWatchlisted: boolean,
    onSelect: () => void,
    onToggleWatchlist: () => void
}) {
    return (
        <div
            onClick={onSelect}
            className={cn(
                "relative w-full flex items-center justify-between p-4 rounded-xl transition-all overflow-hidden cursor-pointer active:bg-neutral-900",
                isActive ? "bg-black border border-neutral-800 text-white" : "bg-black border border-neutral-800 text-neutral-400 hover:bg-[#0d0d0d]"
            )}
        >
            <div className="flex items-center gap-3">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <span className={cn("text-lg font-bold tracking-wide", isActive ? "text-white" : "text-neutral-300")}>
                            {symbol}
                        </span>
                        {isActive && (
                            <div className="px-2 py-0.5 rounded-full bg-amber-500/10 text-[10px] font-bold text-amber-500 tracking-wider">
                                ACTIVE
                            </div>
                        )}
                    </div>
                    <span className="text-xs text-neutral-600">CME Futures</span>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleWatchlist();
                    }}
                    className="p-2 -m-2"
                >
                    <Star
                        weight={isWatchlisted ? "fill" : "regular"}
                        className={cn("w-5 h-5 transition-colors", isWatchlisted ? "text-amber-500" : "text-neutral-700")}
                    />
                </button>
            </div>
        </div>
    );
}
