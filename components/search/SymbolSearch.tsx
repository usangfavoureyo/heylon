"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Drawer } from "@/components/ui/drawer";
import { useSymbol } from "@/components/providers/SymbolProvider";
import { cn } from "@/lib/utils";
import { useHaptic } from "@/hooks/use-haptic";

export function SymbolSearch({
    children,
    open: controlledOpen,
    onOpenChange
}: {
    children?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}) {
    const { activeSymbol, setActiveSymbol, AUTHORIZED_SYMBOLS } = useSymbol();
    const [searchQuery, setSearchQuery] = useState("");
    const { trigger } = useHaptic();

    // Internal state if not controlled (optional pattern, but here we likely control it)
    const filteredSymbols = AUTHORIZED_SYMBOLS.filter(s =>
        s.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Drawer open={controlledOpen} onOpenChange={onOpenChange} trigger={children}>
            <div className="flex flex-col h-full bg-neutral-900 rounded-t-[10px]">
                {/* Search Header */}
                <div className="p-4 border-b border-neutral-800">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                        <input
                            type="text"
                            placeholder="Search Symbol (e.g. ES, NQ)"
                            className="w-full bg-neutral-800 text-neutral-200 placeholder:text-neutral-500 rounded-full py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-700"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            autoFocus
                        />
                    </div>
                </div>

                {/* Symbol List */}
                <div className="flex-1 overflow-y-auto p-2">
                    {filteredSymbols.map((symbol) => (
                        <button
                            key={symbol}
                            onClick={() => {
                                trigger('medium'); // Haptic feedback
                                setActiveSymbol(symbol);
                                onOpenChange?.(false);
                            }}
                            className={cn(
                                "w-full flex items-center justify-between p-4 rounded-lg transition-colors group",
                                symbol === activeSymbol
                                    ? "bg-neutral-800/80"
                                    : "hover:bg-neutral-800/40"
                            )}
                        >
                            <div className="flex flex-col items-start gap-1">
                                <span className={cn(
                                    "text-lg font-medium",
                                    symbol === activeSymbol ? "text-white" : "text-neutral-300"
                                )}>
                                    {symbol}
                                </span>
                                <span className="text-xs text-neutral-500 font-normal">
                                    CME Futures
                                </span>
                            </div>

                            {symbol === activeSymbol && (
                                <div className="text-xs bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded-md border border-emerald-500/20">
                                    ACTIVE
                                </div>
                            )}
                        </button>
                    ))}

                    {filteredSymbols.length === 0 && (
                        <div className="p-8 text-center text-neutral-500 text-sm">
                            No authorized symbols found.
                        </div>
                    )}
                </div>
            </div>
        </Drawer>
    );
}
