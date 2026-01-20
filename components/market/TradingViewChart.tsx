"use client";

import { useEffect, useRef, memo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSymbol } from '../providers/SymbolProvider';
import { ArrowsOutSimple, ArrowsInSimple, MagnifyingGlass } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useHaptic } from "@/hooks/use-haptic";

interface TradingViewChartProps {
    interval?: string;
    headerElement?: React.ReactNode;
    onSearchClick?: () => void;
}

function TradingViewChartComponent({ interval = "60", headerElement, onSearchClick }: TradingViewChartProps) {
    const container = useRef<HTMLDivElement>(null);
    const { activeSymbol } = useSymbol();
    const [isMaximized, setIsMaximized] = useState(false);
    const { trigger } = useHaptic();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Mapping for CME Futures to TradingView Symbols
    const getTVSymbol = (s: string) => {
        const sym = s.trim().toUpperCase();
        // Fallback to ETFs/Spot which are universally available on free widgets
        // NQ / MNQ (Nasdaq) -> QQQ (Invesco QQQ Trust)
        if (sym === "NQ" || sym === "MNQ") return "QQQ";

        // ES / MES (S&P 500) -> SPY (SPDR S&P 500 ETF)
        if (sym === "ES" || sym === "MES") return "SPY";

        // YM / MYM (Dow Jones) -> DIA (SPDR Dow Jones ETF)
        if (sym === "YM" || sym === "MYM") return "DIA";

        // RTY / M2K (Russell 2000) -> IWM (iShares Russell 2000 ETF)
        if (sym === "RTY" || sym === "M2K") return "IWM";

        // GC (Gold) -> GLD (SPDR Gold Shares)
        if (sym === "GC") return "GLD";

        // CL (Crude Oil) -> USO (United States Oil Fund)
        if (sym === "CL") return "USO";

        return sym;
    };

    const tvSymbol = getTVSymbol(activeSymbol);

    // Re-initialize chart when symbol/interval/maximize changes
    useEffect(() => {
        if (!container.current) return;

        const script = document.createElement("script");
        script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
        script.type = "text/javascript";
        script.async = true;

        // Use mapped symbol
        script.innerHTML = JSON.stringify({
            "autosize": true,
            "symbol": tvSymbol,
            "interval": interval,
            "timezone": "America/New_York",
            "theme": "dark",
            "style": "1",
            "locale": "en",
            "enable_publishing": false,
            "gridLineColor": "rgba(42, 46, 57, 0.06)",
            "backgroundColor": "rgba(0, 0, 0, 1)",
            "hide_top_toolbar": true,
            "hide_legend": false,
            "save_image": false,
            "calendar": false,
            "hide_volume": true,
            "support_host": "www.tradingview.com",
            "allow_symbol_change": false,
        });

        const currentContainer = container.current;
        currentContainer.innerHTML = '';
        currentContainer.appendChild(script);

        return () => {
            if (currentContainer) {
                currentContainer.innerHTML = '';
            }
        };
    }, [tvSymbol, interval, isMaximized]); // Re-run when maximized to re-render in new container

    const content = (
        <div
            className={cn(
                "bg-black transition-all duration-300 relative flex flex-col",
                isMaximized ? "fixed inset-0 z-[99999] h-[100dvh] w-[100vw]" : "h-full w-full rounded-2xl overflow-hidden border border-white/5"
            )}
        >
            {/* MAXIMIZED HEADER BAR (Visible only when maximized) */}
            {isMaximized && (
                <div className="absolute top-0 left-0 right-0 z-[100000] flex items-center justify-between p-4 bg-black/80 backdrop-blur-md border-b border-white/10 pt-[max(env(safe-area-inset-top),16px)]">
                    <div className="flex items-center gap-3 mr-4 shrink-0">
                        {/* Search Trigger (Maximized) */}
                        <button
                            onClick={() => {
                                trigger("medium");
                                if (onSearchClick) onSearchClick();
                            }}
                            className="w-10 h-10 rounded-full bg-neutral-800 border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white active:scale-95 transition-all"
                        >
                            <MagnifyingGlass weight="bold" className="w-5 h-5" />
                        </button>

                        {/* Symbol Title (Maximized Only) */}
                        <div className="flex flex-col">
                            <span className="text-lg font-bold text-white leading-none">{activeSymbol}</span>
                            <span className="text-[10px] text-neutral-500 font-medium">FUTURES CONTRACT</span>
                        </div>
                    </div>

                    {/* Center: Timeframe Selector */}
                    <div className="flex-1 overflow-x-auto no-scrollbar mr-4">
                        {headerElement}
                    </div>

                    {/* Right: Controls */}
                    <div className="flex items-center gap-2 shrink-0">
                        {/* Deep Link Button */}
                        <button
                            onClick={() => {
                                trigger("medium");
                                import("@/lib/deepLink").then(mod => mod.openTradingViewApp(activeSymbol));
                            }}
                            className="w-9 h-9 rounded-full bg-neutral-800 border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white active:scale-95 transition-all"
                        >
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" />
                            </svg>
                        </button>

                        {/* Minimize Button */}
                        <button
                            onClick={() => {
                                trigger("medium");
                                setIsMaximized(false);
                            }}
                            className="w-9 h-9 rounded-full bg-neutral-800 border border-white/10 flex items-center justify-center text-white active:scale-95 transition-all"
                        >
                            <ArrowsInSimple weight="bold" className="w-5 h-5 text-white" />
                        </button>
                    </div>
                </div>
            )}

            {/* NORMAL MODE CONTROLS (Floating) */}
            {!isMaximized && (
                <div className="absolute top-4 right-4 z-[10] flex items-center gap-2">
                    <button
                        onClick={() => {
                            trigger("medium");
                            import("@/lib/deepLink").then(mod => mod.openTradingViewApp(activeSymbol));
                        }}
                        className="w-8 h-8 rounded-full bg-neutral-900/80 backdrop-blur-md border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white active:scale-95 transition-all shadow-lg"
                    >
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                            <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" />
                        </svg>
                    </button>
                    <button
                        onClick={() => {
                            trigger("medium");
                            setIsMaximized(true);
                        }}
                        className="w-8 h-8 rounded-full bg-neutral-900/80 backdrop-blur-md border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white shadow-lg active:scale-95 transition-all"
                    >
                        <ArrowsOutSimple weight="bold" className="w-5 h-5" />
                    </button>
                </div>
            )}

            {/* Chart Container */}
            <div
                ref={container}
                className={cn(
                    "flex-1 w-full bg-black relative",
                    isMaximized && "mt-[70px] h-[calc(100dvh-70px)]" // Push chart down with Margin instead of Padding to clear header
                )}
            />
        </div>
    );

    if (!mounted) return null;

    if (isMaximized) {
        return createPortal(content, document.body);
    }

    return content;
}

export const TradingViewChart = memo(TradingViewChartComponent);
