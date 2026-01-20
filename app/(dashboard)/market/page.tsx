"use client";

import { useState, useCallback } from "react";
import { motion, PanInfo } from "framer-motion";
import { TradingViewChart } from "@/components/market/TradingViewChart";
import { MarketHeader } from "@/components/market/MarketHeader";
import { TimeframeSelector, TIMEFRAMES, TimeframeValue } from "@/components/market/TimeframeSelector";
import { MarketStatsCards } from "@/components/market/MarketStatsCards";
import { LiveFeedStrip } from "@/components/market/LiveFeedStrip";
import { useHaptic } from "@/hooks/use-haptic";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSymbol } from "@/components/providers/SymbolProvider";

import { SearchOverlay } from "@/components/search/SearchOverlay";


const mockSession = {
    high: 18500.25,
    low: 18350.00,
    open: 18400.00,
    prevClose: 18380.50
};

const mockVolatility = {
    atr: 45.5,
    volume: 1.2,
    rangePercent: 0.85
};

const mockStructure = {
    bias: "BULLISH" as const,
    mss: "BULLISH" as const,
    zone: "DEMAND" as const
};

export default function MarketPage() {
    const { activeSymbol } = useSymbol();
    const [interval, setInterval] = useState<TimeframeValue>("60"); // Default 1H
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const { trigger } = useHaptic();

    // Data Fetching
    const marketData = useQuery(api.market.get, { symbol: activeSymbol });

    // Fallback Mock (if null)
    const price = marketData?.price ?? 18420.50;
    const change = marketData?.change ?? 0;
    const changePercent = marketData?.changePercent ?? 0;

    return (
        <div className="flex flex-col min-h-full bg-black">
            {/* 1. Header (Sticky) */}
            <MarketHeader
                price={price}
                change={change}
                changePercent={changePercent}
            />

            {/* Content Area - Now flows naturally within AppShell's scroll container */}
            <div className="flex-1 p-3 pb-20 space-y-4">

                {/* 2. Chart Container with Gestures */}
                <div className="flex flex-col gap-2 h-[50vh] min-h-[400px]">
                    <div className="flex justify-between items-center px-1">
                        <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                            Chart • {TIMEFRAMES.find(tf => tf.value === interval)?.label}
                        </span>
                        {/* Selector visible in normal flow */}
                        <TimeframeSelector value={interval} onChange={setInterval} className="w-[70%]" />
                    </div>

                    <div className="flex-1 relative z-0">
                        {/* Pass Selector Cloned for Maximized View */}
                        <TradingViewChart
                            interval={interval}
                            onSearchClick={() => setIsSearchOpen(true)}
                            headerElement={
                                <div className="p-1 rounded-xl bg-black/60 backdrop-blur-md">
                                    <TimeframeSelector value={interval} onChange={setInterval} />
                                </div>
                            }
                        />
                    </div>
                </div>

                {/* 3. Stats Cards */}
                <MarketStatsCards
                    session={mockSession}
                    volatility={mockVolatility}
                    structure={mockStructure}
                />

                {/* Spacing for bottom nav */}
                <div className="h-4" />
            </div>

            {/* Global Search Overlay (Controlled by Page State) */}
            <SearchOverlay open={isSearchOpen} onOpenChange={setIsSearchOpen} />

            {/* 4. Live Feed (Sticky Bottom) - Note: Might need adjustment if global scroll is used 
                But User requested scroll-to-top which implies standard flow. 
                LiveFeed was sticky, now it will just be at the bottom of content. 
                If it needs to be fixed to viewport bottom, it should be outside this flow. 
                For now, keeping it at bottom of flow is safer for scrolling.
            */}
            <div className="z-20">
                <LiveFeedStrip
                    lastTap={Date.now() - 1000 * 60 * 5}
                    lastMss={Date.now() - 1000 * 60 * 60}
                    lastZone={Date.now() - 1000 * 60 * 120}
                    lastPriceUpdate={Date.now() - 1000 * 5}
                />
            </div>
        </div>
    );
}
