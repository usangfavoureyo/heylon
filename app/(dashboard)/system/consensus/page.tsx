"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { BackButton } from "@/components/BackButton";
import { ToggleRow } from "@/components/system/Shared";
import { cn } from "@/lib/utils";

import { LoadingScreen } from "@/components/ui/LoadingScreen";

export default function ConsensusSubPage() {
    const settings = useQuery(api.settings.getSettings);
    const updateSettings = useMutation(api.settings.updateSettings);

    if (!settings) return <LoadingScreen className="bg-white dark:bg-black" />;

    const models = settings.consensus_models || {};
    const toggleModel = (key: string) => updateSettings({ consensus_models: { ...models, [key]: !models[key] } });

    return (
        <div className="flex flex-col min-h-full bg-white dark:bg-black text-neutral-900 dark:text-neutral-100 p-6 md:p-8 w-full">
            <div className="flex items-center gap-4 mb-8">
                <BackButton />
                <div>
                    <h1 className="text-xl font-medium text-neutral-900 dark:text-white">Consensus</h1>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Jury Models</p>
                </div>
            </div>

            <div className="space-y-8">
                <section className="bg-white dark:bg-black p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800">
                    <ToggleRow
                        label="Enable LLM Consensus"
                        desc="Allow AI Jury to veto signals."
                        checked={settings.consensus_enabled}
                        onChange={(v) => updateSettings({ consensus_enabled: v })}
                    />
                </section>

                <section className={cn(!settings.consensus_enabled ? "opacity-40 pointer-events-none grayscale" : "transition-opacity duration-300")}>
                    <h3 className="text-xs font-mono text-neutral-500 uppercase mb-4">Seated Jurors</h3>
                    <div className="space-y-4 bg-neutral-50 dark:bg-neutral-900/30 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800/50">
                        <ToggleRow label="OpenAI (GPT-5.2)" desc="The General Magistrate." checked={models.openai} onChange={() => toggleModel("openai")} />
                        <ToggleRow label="Gemini (3 Flash)" desc="The Speed Judge." checked={models.gemini} onChange={() => toggleModel("gemini")} />
                        <ToggleRow label="Perplexity (Sonar)" desc="The Researcher." checked={models.perplexity} onChange={() => toggleModel("perplexity")} />
                    </div>
                    <p className="text-xs text-neutral-500 mt-4 px-2">
                        Verdict Requirement: <strong className="text-neutral-700 dark:text-neutral-300">2/3 MAJORITY</strong>. Single model acts as advisory only.
                    </p>
                </section>
            </div>
        </div>
    );
}
