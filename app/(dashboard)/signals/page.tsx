"use client";

import { useSymbol } from "@/components/providers/SymbolProvider";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { SignalRow } from "@/components/signals/SignalRow";
import { SignalDetail } from "@/components/signals/SignalDetail";
import { Doc } from "@/convex/_generated/dataModel";
import { ArrowLeft } from "@phosphor-icons/react";
import Link from "next/link";
import { useHaptic } from "@/hooks/use-haptic";

export default function SignalsPage() {
    const { activeSymbol } = useSymbol();
    const history = useQuery(api.signals.getHistory, { symbol: activeSymbol });
    const { trigger } = useHaptic();

    // Detail State
    const [selectedSignal, setSelectedSignal] = useState<Doc<"signals"> | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const handleSelectSignal = (signal: Doc<"signals">) => {
        trigger('light');
        setSelectedSignal(signal);
        setIsDetailOpen(true);
    };

    return (
        <div className="flex flex-col min-h-full pb-20 lg:pb-0">
            {/* Header (Mobile-like Context) */}
            <div className="px-6 pt-8 pb-4">
                <h1 className="text-2xl font-medium text-white mb-1">
                    Wait for Signal
                </h1>
                <p className="text-sm text-neutral-400">
                    Chronological structural events for <strong className="text-white">{activeSymbol}</strong>.
                </p>
            </div>

            {/* List */}
            <div className="flex-1 bg-neutral-950 border-t border-neutral-800/50">
                {!history ? (
                    // Loading Skeleton
                    <div className="p-4 space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-16 bg-neutral-900/50 rounded-lg animate-pulse" />
                        ))}
                    </div>
                ) : history.length === 0 ? (
                    // Empty State
                    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                        <div className="w-12 h-12 rounded-full bg-neutral-900 flex items-center justify-center mb-4">
                            <span className="text-2xl">💤</span>
                        </div>
                        <h3 className="text-lg font-medium text-white mb-1">No Recent Events</h3>
                        <p className="text-sm text-neutral-500 max-w-xs">
                            The system is monitoring <strong>{activeSymbol}</strong> but no structural events have triggered yet.
                        </p>
                    </div>
                ) : (
                    // Stream
                    <div>
                        {history.map((signal) => (
                            <SignalRow
                                key={signal._id}
                                signal={signal}
                                onClick={() => handleSelectSignal(signal)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Detail View */}
            <SignalDetail
                signal={selectedSignal}
                open={isDetailOpen}
                onOpenChange={setIsDetailOpen}
            />
        </div>
    );
}
