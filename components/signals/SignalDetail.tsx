"use client";

import { Drawer } from "@/components/ui/drawer";
import { Sheet } from "@/components/ui/Sheet";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Target, CheckCircle, XCircle } from "@phosphor-icons/react";
import { Doc } from "@/convex/_generated/dataModel";
import { useMediaQuery } from "@/hooks/use-media-query";

interface SignalDetailProps {
    signal: Doc<"signals"> | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SignalDetail({ signal, open, onOpenChange }: SignalDetailProps) {
    const isDesktop = useMediaQuery("(min-width: 1024px)");

    if (!signal) return null;

    // Derived Colors based on signal type (the only valid field)
    let statusColor = "text-neutral-500";
    let bgStatusColor = "bg-neutral-500/10";
    let borderStatusColor = "border-neutral-500/20";

    if (signal.type === "TAP" || signal.type === "ZONE_CREATED") {
        statusColor = "text-amber-500";
        bgStatusColor = "bg-amber-500/10";
        borderStatusColor = "border-amber-500/20";
    } else if (signal.type === "MSS" || signal.type === "SETUP") {
        statusColor = "text-emerald-500";
        bgStatusColor = "bg-emerald-500/10";
        borderStatusColor = "border-emerald-500/20";
    } else if (signal.type === "ZONE_BROKEN") {
        statusColor = "text-red-500";
        bgStatusColor = "bg-red-500/10";
        borderStatusColor = "border-red-500/20";
    }

    // Shared Content Component
    const Content = () => (
        <>
            {/* Header */}
            <div className="p-6 border-b border-neutral-800 shrink-0">
                <div className="flex items-center justify-between mb-2">
                    <span className={cn("text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-md border", bgStatusColor, statusColor, borderStatusColor)}>
                        {signal.type}
                    </span>
                    <span className="text-xs font-mono text-neutral-500">
                        {format(signal.createdAt, "HH:mm:ss")} • {format(signal.createdAt, "dd MMM")}
                    </span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                    {signal.type === "TAP" && "Zone Tapped"}
                    {signal.type === "MSS" && "MSS Confirmed"}
                    {signal.type === "ZONE_CREATED" && "Zone Created"}
                    {signal.type === "SETUP" && "Setup Detected"}
                    {signal.type === "ZONE_BROKEN" && "Zone Broken"}
                </h2>
                <div className="flex items-center gap-2 text-neutral-400 text-sm">
                    <span className="font-bold text-white">{signal.symbol}</span>
                    <span>•</span>
                    <span>{signal.timeframe || "1H"} Structure</span>
                </div>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
                {/* Summary */}
                <div className="space-y-2">
                    <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Reasoning</h3>
                    <p className="text-sm text-neutral-300 leading-relaxed font-medium">
                        {signal.summary}
                    </p>
                </div>

                {/* Structural Context */}
                <div className="space-y-3">
                    <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Structural Context</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-neutral-800/50 p-3 rounded-lg border border-neutral-800">
                            <span className="block text-xs text-neutral-500 mb-1">Zone Type</span>
                            <div className="flex items-center gap-2">
                                <Target className="w-4 h-4 text-neutral-400" />
                                <span className="font-bold text-sm text-white">{signal.metadata?.zoneType || signal.type || "---"}</span>
                            </div>
                        </div>
                        <div className="bg-neutral-800/50 p-3 rounded-lg border border-neutral-800">
                            <span className="block text-xs text-neutral-500 mb-1">Timeframe</span>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-white">{signal.timeframe || "---"}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </>
            );

            if (isDesktop) {
        return (
            <Sheet open={open} onOpenChange={onOpenChange}>
                <Content />
            </Sheet>
            );
    }

            return (
            <Drawer open={open} onOpenChange={onOpenChange}>
                <div className="flex flex-col h-[75vh] bg-neutral-900 rounded-t-[20px] overflow-hidden">
                    <Content />
                </div>
            </Drawer>
            );
}
