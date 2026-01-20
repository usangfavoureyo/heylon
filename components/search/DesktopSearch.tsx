"use client";

import { useState, useRef, useEffect } from "react";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { useSymbol } from "@/components/providers/SymbolProvider";
import { cn } from "@/lib/utils";
import { useHaptic } from "@/hooks/use-haptic";
import { Star } from "@phosphor-icons/react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function DesktopSearch() {
    const { activeSymbol, setActiveSymbol, AUTHORIZED_SYMBOLS } = useSymbol();

    // State
    const [query, setQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [highlightIndex, setHighlightIndex] = useState(0);

    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Watchlist Data
    const watchlistData = (useQuery(api.watchlist.get) as any) || { symbols: [], active_symbol: "NQ" };
    const watchlist = watchlistData.symbols || [];
    const toggleWatchlist = useMutation(api.watchlist.toggleSymbol);

    // Filtered Results
    const results = AUTHORIZED_SYMBOLS.filter(s =>
        s.toLowerCase().includes(query.toLowerCase())
    );

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) && !inputRef.current?.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Keyboard Nav
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlightIndex(prev => Math.min(prev + 1, results.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlightIndex(prev => Math.max(prev - 1, 0));
        } else if (e.key === "Enter") {
            e.preventDefault();
            const selected = results[highlightIndex];
            if (selected) {
                setActiveSymbol(selected);
                setQuery(""); // Clear or keep? Usually clear or set to symbol
                setIsOpen(false);
            }
        } else if (e.key === "Escape") {
            setIsOpen(false);
        }
    };

    return (
        <div className="relative w-full max-w-sm group">
            {/* Input */}
            <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                    setQuery(e.target.value);
                    setIsOpen(true);
                    setHighlightIndex(0);
                }}
                onFocus={() => setIsOpen(true)}
                onKeyDown={handleKeyDown}
                placeholder="Search symbol (e.g. NQ)..."
                className="w-full bg-card/50 backdrop-blur-md border border-neutral-800 rounded-lg pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-500/50 transition-all font-medium relative z-0"
            />
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors pointer-events-none z-10" />

            {/* Dropdown */}
            {isOpen && results.length > 0 && (
                <div
                    ref={dropdownRef}
                    className="absolute top-full left-0 right-0 mt-2 bg-card backdrop-blur-md border border-neutral-800 rounded-xl shadow-2xl overflow-hidden z-50 py-1"
                >
                    {results.map((symbol, i) => {
                        const isActive = symbol === activeSymbol;
                        const isHighlighted = i === highlightIndex;
                        const isWatchlisted = watchlist.includes(symbol);

                        return (
                            <div
                                key={symbol}
                                className={cn(
                                    "px-4 py-3 flex items-center justify-between cursor-pointer transition-colors",
                                    isHighlighted ? "bg-accent" : "hover:bg-accent",
                                    isActive ? "border-l-2 border-amber-500 bg-amber-500/5" : "border-l-2 border-transparent"
                                )}
                                onClick={() => {
                                    setActiveSymbol(symbol);
                                    setIsOpen(false);
                                    setQuery("");
                                }}
                                onMouseEnter={() => setHighlightIndex(i)}
                            >
                                <div className="flex flex-col">
                                    <span className={cn("text-sm font-bold", isActive ? "text-amber-500" : "text-foreground")}>{symbol}</span>
                                    <span className="text-[10px] text-muted-foreground">CME Futures</span>
                                </div>

                                {/* Hover Actions */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleWatchlist({ symbol });
                                        }}
                                        className={cn(
                                            "p-1.5 rounded-md transition-colors hover:bg-accent",
                                            isWatchlisted ? "text-amber-500" : "text-muted-foreground"
                                        )}
                                    >
                                        <Star weight={isWatchlisted ? "fill" : "regular"} className="w-4 h-4" />
                                    </button>
                                    {/* Tick Removed per Phase 13 */}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
