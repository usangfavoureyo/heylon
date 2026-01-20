"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { BackButton } from "@/components/BackButton";
import { ContextStripItem, ContextRow } from "@/components/system/Shared";
import { CaretRight } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

import { LoadingScreen } from "@/components/ui/LoadingScreen";

export default function LogsSubPage() {
    const logs = useQuery((api as any).logs.getLogs, { limit: 50 });
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [filterOutcome, setFilterOutcome] = useState("ALL");

    if (!logs) return <LoadingScreen className="bg-white dark:bg-black" />;

    const filtered = (logs as any[]).filter((l: any) => filterOutcome === "ALL" || l.outcome === filterOutcome);

    return (
        <div className="flex flex-col min-h-full bg-white dark:bg-black text-neutral-900 dark:text-neutral-100 p-6 md:p-8 w-full">
            <div className="flex items-center gap-4 mb-8">
                <BackButton />
                <div>
                    <h1 className="text-xl font-medium text-neutral-900 dark:text-white">Learning Logs</h1>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Audit Trail</p>
                </div>
            </div>

            <div className="space-y-6">
                {/* Filter Bar */}
                <div className="flex items-center gap-4 bg-neutral-100 dark:bg-neutral-900/50 p-3 rounded-lg border border-neutral-200 dark:border-neutral-800">
                    <div className="text-xs font-mono text-neutral-500 uppercase">Filters: </div>
                    <select
                        value={filterOutcome}
                        onChange={(e) => setFilterOutcome(e.target.value)}
                        className="bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-200 text-xs rounded px-2 py-1 border border-neutral-300 dark:border-neutral-700 outline-none"
                    >
                        <option value="ALL">All Outcomes</option>
                        <option value="WIN">Wins</option>
                        <option value="LOSS">Losses</option>
                        <option value="NEUTRAL">Neutral</option>
                    </select>
                    <div className="flex-1" />
                    <div className="text-xs text-neutral-600">{(filtered || []).length} Records</div>
                </div>

                {/* List */}
                <div className="space-y-2">
                    {filtered.map(log => (
                        <LogCard
                            key={log._id}
                            log={log}
                            expanded={expandedId === log._id}
                            onToggle={() => setExpandedId(expandedId === log._id ? null : log._id)}
                        />
                    ))}
                    {filtered.length === 0 && <div className="text-center py-12 text-neutral-600 text-sm">No records found.</div>}
                </div>
            </div>
        </div>
    );
}

function LogCard({ log, expanded, onToggle }: { log: any, expanded: boolean, onToggle: () => void }) {
    const updateOutcome = useMutation((api as any).logs.updateOutcome);

    // Derived Styles
    const outcomeColor = log.outcome === "WIN" ? "text-emerald-500 dark:text-emerald-400 border-emerald-500/30 dark:border-emerald-900/30"
        : log.outcome === "LOSS" ? "text-amber-500 dark:text-amber-400 border-amber-500/30 dark:border-amber-900/30"
            : "text-slate-500 dark:text-slate-400 border-neutral-300 dark:border-neutral-800";

    const verdictColor = log.verdict === "BUY" ? "text-blue-500 dark:text-blue-400"
        : log.verdict === "SELL" ? "text-purple-500 dark:text-purple-400"
            : "text-neutral-500 dark:text-neutral-400";

    return (
        <div className={cn(
            "rounded-lg border transition-all duration-200 overflow-hidden",
            expanded ? "border-neutral-300 dark:border-neutral-700 shadow-lg bg-neutral-100 dark:bg-neutral-900/40" : "bg-neutral-50/50 dark:bg-neutral-900/20 border-neutral-200 dark:border-neutral-800/50 hover:border-neutral-300 dark:hover:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-900/30"
        )}>
            {/* COLLAPSED HEADER */}
            <div onClick={onToggle} className="flex flex-col cursor-pointer bg-neutral-100/50 dark:bg-neutral-900/10">
                <div className="flex items-center justify-between p-4 pb-2">
                    {/* 1. Identity */}
                    <div className="flex items-center gap-4 w-1/4">
                        <span className="font-mono text-neutral-900 dark:text-white font-bold text-lg">{log.symbol}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">{log.trigger}</span>
                    </div>

                    {/* 2. Decision */}
                    <div className="flex items-center justify-center gap-4 w-1/3">
                        <span className={cn("font-bold tracking-tight", verdictColor)}>{log.verdict}</span>
                        {log.outcome && (
                            <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded border bg-opacity-10", outcomeColor.replace('text-', 'bg-'))}>
                                {log.outcome}
                            </span>
                        )}
                    </div>

                    {/* 3. Meta */}
                    <div className="flex items-center justify-end gap-6 w-1/3">
                        <div className="text-right">
                            <div className="text-[10px] text-neutral-500 uppercase">Confidence</div>
                            <div className="flex items-center justify-end gap-2">
                                <div className="text-xs text-neutral-800 dark:text-white font-mono">{(log.confidence * 100).toFixed(0)}%</div>
                                <div className="w-12 h-1 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500" style={{ width: `${log.confidence * 100}%` }} />
                                </div>
                            </div>
                        </div>
                        <div className="text-right w-20">
                            <div className="text-[10px] text-neutral-500 uppercase">Time</div>
                            <div className="text-xs text-neutral-600 dark:text-neutral-300 font-mono">
                                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                        <CaretRight size={16} className={cn("text-neutral-600 transition-transform", expanded ? "rotate-90" : "")} />
                    </div>
                </div>

                {/* BOTTOM STRIP (Compact Context) */}
                <div className="flex items-center gap-6 px-4 pb-3">
                    <ContextStripItem label="MACRO" risk={log.context.macro_risk} />
                    <ContextStripItem label="NEWS" risk={log.context.news_risk || "LOW"} />
                    <ContextStripItem label="VOL" risk={log.context.volatility_regime === "HIGH" ? "HIGH" : "LOW"} />
                    <div className="w-px h-3 bg-neutral-200 dark:bg-neutral-800" />
                    <div className="text-[10px] font-mono text-neutral-500">
                        JURY: <span className="text-neutral-600 dark:text-neutral-400">{getJurySplit(log.jury.votes)}</span>
                    </div>
                </div>
            </div>

            {/* EXPANDED DETAILS */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-neutral-200 dark:border-neutral-800 bg-neutral-100/50 dark:bg-black/20"
                    >
                        <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-8">

                            {/* SECTION 1: JURY */}
                            <div className="md:col-span-1">
                                <h4 className="text-[10px] font-mono text-neutral-500 uppercase mb-3 border-b border-neutral-200 dark:border-neutral-800 pb-1">Jury Consensus</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-neutral-500 font-normal">OpenAI</span>
                                        <span className="text-neutral-700 dark:text-neutral-300 font-mono">{log.jury.votes.openai}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-neutral-500 font-normal">Gemini</span>
                                        <span className="text-neutral-700 dark:text-neutral-300 font-mono">{log.jury.votes.gemini}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-neutral-500 font-normal">Perplexity</span>
                                        <span className="text-neutral-700 dark:text-neutral-300 font-mono">{log.jury.votes.perplexity}</span>
                                    </div>
                                    <div className="mt-2 pt-2 border-t border-neutral-200 dark:border-neutral-800 flex justify-between font-bold">
                                        <span className="text-neutral-400">Final</span>
                                        <span className={verdictColor}>{log.jury.consensus}</span>
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 2: CONTEXT */}
                            <div className="md:col-span-1">
                                <h4 className="text-[10px] font-mono text-neutral-500 uppercase mb-3 border-b border-neutral-200 dark:border-neutral-800 pb-1">Context Snapshot</h4>
                                <div className="space-y-1 text-xs">
                                    <ContextRow label="Direction" val={log.context.market_direction} />
                                    <ContextRow label="Structure" val={log.context.structure_state} />
                                    <ContextRow label="Volatility" val={log.context.volatility_regime} />
                                    <ContextRow label="Macro Risk" val={log.context.macro_risk} alert={log.context.macro_risk === "HIGH"} />
                                </div>
                            </div>

                            {/* SECTION 4: FACTORS (New) */}
                            <div className="md:col-span-1">
                                <h4 className="text-[10px] font-mono text-neutral-500 uppercase mb-3 border-b border-neutral-200 dark:border-neutral-800 pb-1">Key Factors</h4>
                                <div className="space-y-3">
                                    <div>
                                        <div className="text-[9px] text-emerald-600 dark:text-emerald-500/70 mb-1 uppercase tracking-wider">Supporting</div>
                                        <ul className="text-xs text-neutral-600 dark:text-neutral-400 space-y-1">
                                            {(log.factors?.supporting?.length > 0) ? log.factors.supporting.map((f: string, i: number) => (
                                                <li key={i} className="flex gap-2">
                                                    <span className="text-emerald-600 dark:text-emerald-500">•</span> {f}
                                                </li>
                                            )) : <li>None</li>}
                                        </ul>
                                    </div>
                                    <div>
                                        <div className="text-[9px] text-amber-600 dark:text-amber-500/70 mb-1 uppercase tracking-wider">Blocking</div>
                                        <ul className="text-xs text-neutral-600 dark:text-neutral-400 space-y-1">
                                            {(log.factors?.blocking?.length > 0) ? log.factors.blocking.map((f: string, i: number) => (
                                                <li key={i} className="flex gap-2">
                                                    <span className="text-amber-600 dark:text-amber-500">•</span> {f}
                                                </li>
                                            )) : <li>None</li>}
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 3: OUTCOME TAGGING */}
                            <div className="md:col-span-1">
                                <h4 className="text-[10px] font-mono text-neutral-500 uppercase mb-3 border-b border-neutral-200 dark:border-neutral-800 pb-1">Post-Trade Attribution</h4>
                                <div className="space-y-3">
                                    <div className="flex gap-2">
                                        <button onClick={(e) => { e.stopPropagation(); updateOutcome({ id: log._id, outcome: "WIN" }); }} className={cn("flex-1 py-1 text-xs rounded border", log.outcome === "WIN" ? "bg-emerald-100 dark:bg-emerald-900/50 border-emerald-500 text-emerald-700 dark:text-white" : "border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800")}>WIN</button>
                                        <button onClick={(e) => { e.stopPropagation(); updateOutcome({ id: log._id, outcome: "LOSS" }); }} className={cn("flex-1 py-1 text-xs rounded border", log.outcome === "LOSS" ? "bg-amber-100 dark:bg-amber-900/50 border-amber-500 text-amber-700 dark:text-white" : "border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800")}>LOSS</button>
                                        <button onClick={(e) => { e.stopPropagation(); updateOutcome({ id: log._id, outcome: "NEUTRAL" }); }} className={cn("flex-1 py-1 text-xs rounded border", log.outcome === "NEUTRAL" ? "bg-slate-200 dark:bg-slate-700 border-slate-400 dark:border-slate-500 text-slate-700 dark:text-white" : "border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800")}>NEUTRAL</button>
                                    </div>
                                    <div onClick={e => e.stopPropagation()}>
                                        <textarea
                                            placeholder="Add forensic notes..."
                                            className="w-full bg-white dark:bg-black/40 border border-neutral-200 dark:border-neutral-800 rounded p-2 text-xs text-neutral-700 dark:text-neutral-300 focus:border-blue-500 dark:focus:border-blue-900 outline-none resize-none h-20"
                                            defaultValue={log.user_notes}
                                            onBlur={(e) => updateOutcome({ id: log._id, outcome: log.outcome || "NEUTRAL", notes: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function getJurySplit(votes: any) {
    if (!votes) return "0-0";
    let b = 0, s = 0, w = 0;
    if (votes.openai === "BUY") b++; else if (votes.openai === "SELL") s++; else w++;
    if (votes.gemini === "BUY") b++; else if (votes.gemini === "SELL") s++; else w++;
    if (votes.perplexity === "BUY") b++; else if (votes.perplexity === "SELL") s++; else w++;

    // Naive split display
    return `${Math.max(b, s)}-${Math.min(b, s) === 0 ? w : Math.min(b, s)}`; // e.g. 3-0 or 2-1
}
