"use client";

import { StatusChip } from "@/components/ui/StatusChip";
import { ConsensusCard } from "@/components/ConsensusCard";
import { MarketFeed } from "@/components/MarketFeed";
import { MetricCard } from "@/components/MetricCard";
import { TrendingUp, Zap, AlertTriangle } from "lucide-react";

import { useSymbol } from "@/components/providers/SymbolProvider";

export default function Dashboard() {
    const { activeSymbol } = useSymbol();

    return (
        <div className="flex flex-col h-full gap-6 p-4 lg:p-6 overflow-y-auto min-h-screen">

            {/* Top Grid: System State */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title={`${activeSymbol} Direction`}
                    value="BULLISH"
                    subtext="HTF Bias: Long (4H Structure)"
                    status="bullish"
                    icon={TrendingUp}
                />
                <MetricCard
                    title="Market Structure"
                    value="TRENDING"
                    subtext={`Cleaner swings detected on ${activeSymbol}`}
                    status="bullish"
                    icon={TrendingUp}
                />
                <MetricCard
                    title="Active MSS"
                    value="3"
                    subtext="Waiting for candle close"
                    status="neutral"
                    icon={Zap}
                />
                <MetricCard
                    title="System Risk"
                    value="MODERATE"
                    subtext="CPI Release in 2 hours"
                    status="medium"
                    icon={AlertTriangle}
                />
            </div>

            {/* Main Content Area */}
            <div className="flex flex-col lg:flex-row gap-6 h-full min-h-[500px]">

                {/* Left: Chart & Analysis (Flex Grow) */}
                <div className="flex-1 flex flex-col gap-6">
                    {/* Placeholder for Chart */}
                    <div className="relative flex-1 min-h-[400px] flex items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900/30 backdrop-blur-sm overflow-hidden">
                        {/* Mock Chart Background */}
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>

                        <div className="text-neutral-600 text-sm font-mono z-10">TradingView Chart ({activeSymbol}) Integration Area</div>

                        {/* Overlay Chips */}
                        <div className="absolute top-4 left-4 flex gap-2 z-20">
                            <StatusChip status="bullish" label={`${activeSymbol}: Bullish`} />
                            <StatusChip status="pre-market" />
                        </div>
                    </div>

                    {/* System Activity Log (Simplified for now) */}
                    <div className="h-[200px] p-6 rounded-xl border border-neutral-800 bg-neutral-900/30 hidden lg:block">
                        <h3 className="text-sm font-medium text-neutral-500 mb-4 uppercase tracking-widest">System Activity</h3>
                        <div className="space-y-3 text-xs text-neutral-400 font-mono">
                            <div className="flex justify-between border-b border-neutral-800/50 py-2">
                                <span>10:30:45</span>
                                <span className="text-emerald-500">MSS Detected on NQ (1H)</span>
                            </div>
                            <div className="flex justify-between border-b border-neutral-800/50 py-2">
                                <span>10:15:22</span>
                                <span className="text-amber-500">Zone Tapped on ES (4H Demand)</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Live Feed & Consensus (Fixed Width on Desktop) */}
                <div className="lg:w-[350px] xl:w-[400px] flex flex-col gap-6 shrink-0">
                    <ConsensusCard />
                    <MarketFeed />
                </div>
            </div>
        </div>
    );
}
