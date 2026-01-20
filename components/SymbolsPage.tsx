"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { StatusChip } from "./ui/StatusChip";
import {
    Target,
    Trash,
    Plus,
    MagnifyingGlass,
    TrendUp,
    TrendDown,
    BookmarkSimple
} from "@phosphor-icons/react";
import { useState } from "react";
import { motion, PanInfo, useAnimation } from "framer-motion";
import { useHaptic } from "@/hooks/use-haptic";
import { cn } from "@/lib/utils";

// Mock Data for Names/Prices (until real feed integrated)
const SYMBOL_META: Record<string, { name: string, price: string, change: string, isUp: boolean }> = {
    "NQ": { name: "E-mini Nasdaq 100", price: "18,450.25", change: "+1.2%", isUp: true },
    "ES": { name: "E-mini S&P 500", price: "5,210.50", change: "+0.8%", isUp: true },
    "GC": { name: "Gold Futures", price: "2,350.10", change: "-0.4%", isUp: false },
    "CL": { name: "Crude Oil", price: "85.40", change: "+0.1%", isUp: true },
    "RTY": { name: "E-mini Russell 2000", price: "2,050.00", change: "-1.1%", isUp: false },
};

// --- WATCHLIST ROW COMPONENT ---
function WatchlistRow({
    symbol,
    isActive,
    onSetActive,
    onRemove
}: {
    symbol: string,
    isActive: boolean,
    onSetActive: () => void,
    onRemove: () => void
}) {
    const controls = useAnimation();
    const { trigger } = useHaptic();

    // Swipe Handling
    // Swipe Left (x < 0) -> Make Active (Reveals Content on Right)
    // Swipe Right (x > 0) -> Remove (Reveals Content on Left)
    const handleDragEnd = async (event: any, info: PanInfo) => {
        const offset = info.offset.x;
        const threshold = 80;

        if (offset < -threshold) {
            // Swipe Left -> Active
            trigger('medium');
            onSetActive();
            controls.start({ x: 0 });
        } else if (offset > threshold) {
            // Swipe Right -> Remove
            trigger('heavy');
            onRemove();
            controls.start({ x: 0 });
        } else {
            controls.start({ x: 0 });
        }
    };

    const marketData = useQuery(api.market.get, { symbol }) ?? null;
    const meta = marketData
        ? {
            name: "Futures Contract",
            price: marketData.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            change: (marketData.change > 0 ? "+" : "") + marketData.changePercent.toFixed(1) + "%", // Showing % as change string
            isUp: marketData.change >= 0
        }
        : (SYMBOL_META[symbol] || { name: "Futures Contract", price: "---", change: "0.0%", isUp: true });

    return (
        <div className="relative overflow-hidden group mb-1 select-none touch-pan-y">
            {/* Background Actions */}
            <div className="absolute inset-0 flex items-center justify-between px-6 pointer-events-none">
                {/* Left Side (Revealed on Swipe Right) -> REMOVE */}
                <div className="flex items-center gap-2 text-red-500 font-medium opacity-0 group-active:opacity-100 transition-opacity">
                    <Trash className="w-5 h-5" weight="fill" />
                    <span className="text-xs uppercase tracking-wider">Remove</span>
                </div>

                {/* Right Side (Revealed on Swipe Left) -> ACTIVE */}
                <div className="flex items-center gap-2 text-amber-500 font-medium opacity-0 group-active:opacity-100 transition-opacity">
                    <span className="text-xs uppercase tracking-wider">Make Active</span>
                    <Target className="w-5 h-5" weight="fill" />
                </div>
            </div>

            {/* Foreground Row */}
            <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.1}
                onDragEnd={handleDragEnd}
                animate={controls}
                className={cn(
                    "relative flex items-center justify-between p-4 border-b transition-all bg-black",
                    isActive
                        ? "border-amber-500/50 bg-amber-500/5"
                        : "border-white/5 hover:bg-[#0d0d0d]"
                )}
            >
                {/* Left Decorator (Active) - REMOVED per User Request (Use Chip instead) */}
                {/* {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500" />} */}

                <div className="flex items-center gap-3">
                    {/* Left: Icon + Symbol + Name */}
                    <div className="flex items-center gap-4">
                        {/* Ticker Icon */}
                        <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center border shrink-0",
                            isActive ? "bg-amber-500 text-neutral-950 border-amber-500" : "bg-neutral-900 text-neutral-500 border-white/10"
                        )}>
                            <h3 className="text-sm font-bold tracking-wide">{symbol.substring(0, 2)}</h3>
                        </div>

                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <h3 className={cn("text-base font-medium", isActive ? "text-amber-500" : "text-neutral-200")}>{symbol}</h3>
                                {/* refined Active Chip */}
                                {isActive && (
                                    <div className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-bold text-amber-500 tracking-wider">
                                        ACTIVE
                                    </div>
                                )}
                            </div>
                            <p className="text-xs text-neutral-500 font-medium">{meta.name}</p>
                        </div>
                    </div>
                </div>

                {/* Right: Price + Gains + Actions */}
                <div className="flex items-center gap-6">
                    {/* Price Info (Hidden on very small screens if needed, but standard usually) */}
                    <div className="flex flex-col items-end text-right">
                        <span className="text-sm font-mono text-neutral-200">{meta.price}</span>
                        <div className={cn("flex items-center gap-1 text-xs font-medium", meta.isUp ? "text-emerald-500" : "text-red-500")}>
                            {meta.isUp ? <TrendUp className="w-3 h-3" /> : <TrendDown className="w-3 h-3" />}
                            {meta.change}
                        </div>
                    </div>

                    {/* Desktop Hover Actions */}
                    <div className="hidden lg:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pl-4 border-l border-white/5">
                        <button
                            onClick={(e) => { e.stopPropagation(); onSetActive(); }}
                            className="p-2 rounded-lg hover:bg-amber-500/20 text-neutral-500 hover:text-amber-500 transition-colors tooltip tooltip-left"
                            title="Set Active"
                        >
                            <Target className="w-4 h-4" />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onRemove(); }}
                            className="p-2 rounded-lg hover:bg-red-500/20 text-neutral-500 hover:text-red-500 transition-colors"
                            title="Remove"
                        >
                            <Trash className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

export function SymbolsPage() {
    const watchlist = useQuery(api.watchlist.get) || { symbols: [], active_symbol: "" };
    const setActive = useMutation(api.watchlist.setActiveSymbol);
    const toggle = useMutation(api.watchlist.toggleSymbol);
    const { trigger } = useHaptic();

    // Keeping a minimal add function
    const [searchQuery, setSearchQuery] = useState("");

    const handleAdd = () => {
        if (!searchQuery.trim()) return;
        const sym = searchQuery.toUpperCase().trim();
        toggle({ symbol: sym });
        setSearchQuery("");
        trigger('light');
    };

    return (
        <div className="flex flex-col h-full max-w-7xl mx-auto p-0 lg:p-8 w-full">
            {/* Header / Title */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 lg:gap-0 px-6 lg:px-0 pt-8 lg:pt-0 mb-4 lg:mb-8">
                <div>
                    <h1 className="text-2xl font-medium tracking-tight text-white mb-1">Watchlist</h1>
                    <p className="text-sm text-neutral-500">Manage your active decision universe.</p>
                </div>
                <div className="text-xs text-neutral-600 bg-neutral-900 border border-white/5 px-3 py-1.5 rounded-full">
                    {watchlist.symbols.length} / 10 Symbols Used
                </div>
            </div>

            {/* List Area */}
            <div className="flex-1 overflow-y-auto no-scrollbar">
                {watchlist.symbols.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-neutral-600 gap-4 mt-12">
                        <MagnifyingGlass className="w-8 h-8 opacity-20" />
                        <span className="text-sm">Watchlist is empty. Add a symbol.</span>
                    </div>
                ) : (
                    watchlist.symbols.map((sym: string) => (
                        <WatchlistRow
                            key={sym}
                            symbol={sym}
                            isActive={sym === watchlist.active_symbol}
                            onSetActive={() => setActive({ symbol: sym })}
                            onRemove={() => toggle({ symbol: sym })}
                        />
                    ))
                )}

                {/* Minimal Inline Add (Fallback) */}
                <div className="p-4 border-t border-white/5 border-dashed mt-2">
                    <div className="relative group max-w-sm mx-auto">
                        <Plus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                        <input
                            type="text"
                            placeholder="Add Symbol..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                            className="w-full bg-transparent border-b border-white/10 py-2 pl-9 pr-4 text-sm text-white placeholder:text-neutral-700 focus:outline-none focus:border-amber-500/50 transition-all font-mono uppercase"
                        />
                    </div>
                </div>
            </div>

            {/* Mobile Hint - Subtle Footer */}
            <div className="lg:hidden p-4 text-center pointer-events-none opacity-40">
                <p className="text-xs text-neutral-600 font-medium">Swipe Left to Activate • Right to Remove</p>
            </div>
        </div>
    );
}

export default SymbolsPage;
