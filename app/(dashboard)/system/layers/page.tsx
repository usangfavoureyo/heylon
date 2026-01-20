"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { BackButton } from "@/components/BackButton";
import { ToggleRow } from "@/components/system/Shared";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { useState } from "react";
import { X, Plus } from "lucide-react";

export default function LayersSubPage() {
    const settings = useQuery(api.settings.getSettings);
    const updateSettings = useMutation(api.settings.updateSettings);

    if (!settings) return <LoadingScreen className="bg-white dark:bg-black" />;

    const struct = settings.layers_structural || {};
    const context = settings.layers_context || {};
    const keywords = settings.political_risk_keywords || [];

    const toggleStruct = (key: string) => updateSettings({ layers_structural: { ...struct, [key]: !struct[key] } });
    const toggleContext = (key: string) => updateSettings({ layers_context: { ...context, [key]: !context[key] } });

    const addKeyword = (newKeyword: string) => {
        if (!newKeyword || keywords.includes(newKeyword)) return;
        updateSettings({ political_risk_keywords: [...keywords, newKeyword] });
    };

    const removeKeyword = (keywordToRemove: string) => {
        updateSettings({ political_risk_keywords: keywords.filter((k: string) => k !== keywordToRemove) });
    };

    return (
        <div className="flex flex-col min-h-full bg-white dark:bg-black text-neutral-900 dark:text-neutral-100 p-6 md:p-8 w-full">
            <div className="flex items-center gap-4 mb-8">
                <BackButton />
                <div>
                    <h1 className="text-xl font-medium text-neutral-900 dark:text-white">Layers</h1>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Decision Inputs</p>
                </div>
            </div>

            <div className="space-y-8">
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-mono text-neutral-500 uppercase">Structural Layers</h3>
                        <span className="text-[10px] text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-900 px-2 py-1 rounded border border-neutral-200 dark:border-neutral-800">DECISION ENGINE</span>
                    </div>
                    <div className="space-y-4 bg-neutral-50 dark:bg-neutral-900/30 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800/50">
                        <ToggleRow label="Market Direction (HTF)" desc="High Timeframe Bias influence." checked={struct.market_direction} onChange={() => toggleStruct("market_direction")} />
                        <ToggleRow label="Market Structure" desc="Trend / Range definition." checked={struct.market_structure} onChange={() => toggleStruct("market_structure")} />
                        <ToggleRow label="Supply & Demand Zones" desc="Zone Taps and interactions." checked={struct.zones} onChange={() => toggleStruct("zones")} />
                        <ToggleRow label="Volatility Regime" desc="Compression / Expansion logic." checked={struct.volatility} onChange={() => toggleStruct("volatility")} />
                        <ToggleRow label="Session State" desc="RTH / Overnight differentiation." checked={struct.session} onChange={() => toggleStruct("session")} />
                    </div>
                </section>

                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-mono text-neutral-500 uppercase">Context Layers</h3>
                        <span className="text-[10px] text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-900 px-2 py-1 rounded border border-neutral-200 dark:border-neutral-800">RISK OVERLAY</span>
                    </div>
                    <div className="space-y-4 bg-neutral-50 dark:bg-neutral-900/30 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800/50">
                        <ToggleRow label="News Sentiment" desc="Marketaux Feed integration." checked={context.news} onChange={() => toggleContext("news")} />
                        <ToggleRow label="Macro Events" desc="Economic Calendar impact." checked={context.macro} onChange={() => toggleContext("macro")} />

                        <div>
                            <ToggleRow label="Political Risk" desc="Truth Social sentiment." checked={context.political} onChange={() => toggleContext("political")} />

                            {/* Keyword Manager - Only visible if Political Risk is enabled or always? User said "underneath it" */}
                            {/* Assuming always visible or conditionally? Let's keep it always visible for configuration, or indented if enabled. But configuration should likely be accessible always. */}
                            <div className="mt-3 pl-0 md:pl-0">
                                <KeywordManager keywords={keywords} onAdd={addKeyword} onRemove={removeKeyword} />
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

function KeywordManager({ keywords, onAdd, onRemove }: { keywords: string[], onAdd: (val: string) => void, onRemove: (val: string) => void }) {
    const [input, setInput] = useState("");

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (input.trim()) {
                onAdd(input.trim());
                setInput("");
            }
        }
    };

    return (
        <div className="bg-neutral-100 dark:bg-neutral-900/50 rounded-lg p-3 border border-neutral-200 dark:border-neutral-800">
            <div className="text-[10px] font-mono text-neutral-500 uppercase mb-2">Monitor Keywords</div>

            <div className="flex flex-wrap gap-2 mb-3">
                {keywords.map((keyword) => (
                    <div key={keyword} className="flex items-center gap-1 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs px-2 py-1 rounded-md border border-neutral-200 dark:border-neutral-700">
                        <span>{keyword}</span>
                        <button onClick={() => onRemove(keyword)} className="hover:text-red-500 transition-colors">
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                ))}
            </div>

            <div className="relative">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Add keyword..."
                    className="w-full bg-black text-sm px-3 py-2 pr-8 rounded-md border border-neutral-800 text-white focus:outline-none focus:border-neutral-700 transition-colors placeholder:text-neutral-500"
                />
                <button
                    onClick={() => { if (input.trim()) { onAdd(input.trim()); setInput(""); } }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
