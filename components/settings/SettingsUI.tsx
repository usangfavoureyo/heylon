"use client";

import { useState } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { OpenAILogo, GeminiLogo, PerplexityLogo } from '../icons/LLMIcons';
import {
    ToggleRight, ToggleLeft, Activity, Brain, Clock,
    Newspaper, SlidersHorizontal, Settings, ShieldAlert, Zap, Layers
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// --- REUSABLE COMPONENTS ---

function SettingsSection({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <section className="bg-card/50 p-6 rounded-2xl border border-border space-y-6">
            <h2 className="text-lg font-medium text-foreground pb-4 border-b border-border flex items-center gap-2">
                {title}
            </h2>
            <div className="space-y-4">
                {children}
            </div>
        </section>
    );
}

function SettingRow({
    label,
    description,
    action
}: {
    label: string,
    description?: string,
    action: React.ReactNode
}) {
    return (
        <div className="flex items-center justify-between py-2">
            <div>
                <div className="font-normal text-foreground text-sm">{label}</div>
                {description && <div className="text-xs text-muted-foreground mt-0.5">{description}</div>}
            </div>
            <div>{action}</div>
        </div>
    );
}

function Toggle({ checked, onChange, disabled = false }: { checked: boolean, onChange: () => void, disabled?: boolean }) {
    return (
        <button
            onClick={onChange}
            disabled={disabled}
            className={cn(
                "transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                checked ? 'text-emerald-500' : 'text-muted-foreground hover:text-foreground'
            )}
        >
            {checked ? (
                <ToggleRight className="w-9 h-9" />
            ) : (
                <ToggleLeft className="w-9 h-9" />
            )}
        </button>
    );
}

// --- MAIN COMPONENT ---


export function SettingsUI() {
    // Convex State
    const settings = useQuery(api.settings.getSettings);
    const updateSettings = useMutation(api.settings.updateSettings);

    // Local UI State
    const [activeTab, setActiveTab] = useState('system');

    const handleTradingChange = (key: string, val: boolean | string) => {
        const currentTrading = settings?.trading || {};
        updateSettings({ trading: { ...currentTrading, [key]: val } });
    };

    function SwitchRow({ label, description, checked, onCheckedChange }: { label: string, description: string, checked: boolean, onCheckedChange: (v: boolean) => void }) {
        return (
            <SettingRow
                label={label}
                description={description}
                action={
                    <Toggle checked={checked} onChange={() => onCheckedChange(!checked)} />
                }
            />
        );
    }

    if (!settings) return <div className="p-8 text-muted-foreground">Loading Configuration...</div>;

    const tabs = [
        { id: 'system', label: 'System', icon: ShieldAlert },
        { id: 'layers', label: 'Layers', icon: Layers },
        { id: 'jury', label: 'Jury', icon: Brain },
        { id: 'notifications', label: 'Alerts', icon: Zap },
    ];

    return (
        <div className="h-full flex gap-8 overflow-hidden">
            {/* Sidebar Navigation */}
            <div className="w-56 shrink-0 space-y-2 py-2">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-normal",
                            activeTab === tab.id
                                ? 'bg-secondary text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                        )}
                    >
                        <tab.icon className={cn("w-4 h-4", activeTab === tab.id ? 'text-foreground' : 'text-muted-foreground')} />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="w-px bg-border my-4" />

            <div className="flex-1 overflow-y-auto pr-4 py-2 custom-scrollbar">

                {/* SYSTEM TAB */}
                {activeTab === 'system' && (
                    <SettingsSection title="System Controls">
                        <div className="p-4 bg-card rounded-xl mb-4 space-y-4 border border-border">
                            <SwitchRow
                                label="Micro MSS (Intraday)"
                                description="Execute on first post-zone candle break."
                                checked={settings?.trading?.microMss ?? true}
                                onCheckedChange={(checked) => handleTradingChange("microMss", checked)}
                            />
                            <SwitchRow
                                label="Structural MSS"
                                description="Execute on standard market structure shifts."
                                checked={settings?.trading?.structuralMss ?? false}
                                onCheckedChange={(checked) => handleTradingChange("structuralMss", checked)}
                            />
                            <SwitchRow
                                label="Force Wait"
                                description="Require manual confirmation before entry"
                                checked={settings?.trading?.forceWait ?? false}
                                onCheckedChange={(checked) => handleTradingChange("forceWait", checked)}
                            />
                            <SwitchRow
                                label="Session Filter"
                                description="Only trade during active sessions"
                                checked={settings?.trading?.sessionFilter ?? true}
                                onCheckedChange={(checked) => handleTradingChange("sessionFilter", checked)}
                            />
                            {(settings?.trading?.sessionFilter ?? true) && (
                                <div className="pl-4 border-l-2 border-border space-y-3">
                                    <div className="flex gap-4">
                                        <div className="flex flex-col gap-1">
                                            <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Start Time</label>
                                            <input
                                                type="time"
                                                value={settings?.trading?.sessionStart || "14:30"}
                                                onChange={(e) => handleTradingChange("sessionStart", e.target.value)}
                                                className="bg-card border border-border rounded-md px-2 py-1 text-sm text-foreground focus:outline-none focus:border-amber-500"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label className="text-[10px] text-muted-foreground uppercase tracking-wider">End Time</label>
                                            <input
                                                type="time"
                                                value={settings?.trading?.sessionEnd || "22:00"}
                                                onChange={(e) => handleTradingChange("sessionEnd", e.target.value)}
                                                className="bg-card border border-border rounded-md px-2 py-1 text-sm text-foreground focus:outline-none focus:border-amber-500"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Timezone</label>
                                        <input
                                            type="text"
                                            value={settings?.trading?.timezone || "Africa/Lagos"}
                                            onChange={(e) => handleTradingChange("timezone", e.target.value)}
                                            className="bg-card border border-border rounded-md px-2 py-1 text-sm text-foreground focus:outline-none focus:border-amber-500 w-full"
                                            placeholder="e.g. Africa/Lagos"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                        <SettingRow
                            label="Appearance"
                            description="UI Theme Preference"
                            action={
                                <div className="flex gap-2">
                                    {['LIGHT', 'DARK', 'SYSTEM'].map((theme) => (
                                        <button
                                            key={theme}
                                            onClick={() => updateSettings({ appearance: theme as any })}
                                            className={cn("px-3 py-1 text-xs rounded border", settings.appearance === theme ? "bg-accent text-foreground border-border" : "border-transparent text-muted-foreground")}
                                        >
                                            {theme}
                                        </button>
                                    ))}
                                </div>
                            }
                        />
                    </SettingsSection>
                )}

                {/* LAYERS TAB */}
                {activeTab === 'layers' && (
                    <SettingsSection title="Decision Layers (Inputs)">
                        {/* Structural Layers */}
                        {['marketStructure', 'volatility', 'zones', 'session', 'market_direction'].map((key) => (
                            settings.layers_structural && key in settings.layers_structural ? (
                                <SettingRow
                                    key={key}
                                    label={displayLabel(key)}
                                    description={`Include ${displayLabel(key)} in decision logic.`}
                                    action={
                                        <Toggle
                                            checked={(settings.layers_structural as any)?.[key] ?? true}
                                            onChange={() => {
                                                const current = settings.layers_structural || {};
                                                updateSettings({ layers_structural: { ...current, [key]: !((current as any)?.[key] ?? true) } });
                                            }}
                                        />
                                    }
                                />) : null
                        ))}
                        {/* Context Layers */}
                        {['macro', 'news'].map((key) => (
                            <SettingRow
                                key={key}
                                label={displayLabel(key)}
                                description={`Include ${displayLabel(key)} in decision logic.`}
                                action={
                                    <Toggle
                                        checked={(settings.layers_context as any)?.[key] ?? true}
                                        onChange={() => {
                                            const current = settings.layers_context || {};
                                            updateSettings({ layers_context: { ...current, [key]: !((current as any)?.[key] ?? true) } });
                                        }}
                                    />
                                }
                            />
                        ))}
                        <SettingRow
                            label="Political (Trump)"
                            description="Include Political Risk (Trump) in decision logic."
                            action={
                                <Toggle
                                    checked={settings.layers_context?.political ?? false}
                                    onChange={() => {
                                        const current = settings.layers_context || {};
                                        updateSettings({ layers_context: { ...current, political: !current.political } });
                                    }}
                                />
                            }
                        />
                    </SettingsSection>
                )}

                {/* JURY TAB */}
                {activeTab === 'jury' && (
                    <SettingsSection title="Jury Members">
                        {[
                            { id: 'openai', name: 'OpenAI', model: 'GPT-4o', icon: OpenAILogo },
                            { id: 'gemini', name: 'Gemini', model: 'Gemini 3 Flash', icon: GeminiLogo },
                            { id: 'perplexity', name: 'Perplexity', model: 'Sonar Pro', icon: PerplexityLogo },
                        ].map((llm) => (
                            <div key={llm.id} className="flex items-center justify-between p-3 rounded-xl bg-card border border-border mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-secondary rounded-lg">
                                        <llm.icon className="w-5 h-5 text-foreground" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-foreground">{llm.name}</div>
                                        <div className="text-[10px] text-muted-foreground">{llm.model}</div>
                                    </div>
                                </div>
                                <Toggle
                                    checked={(settings.consensus_models as any)?.[llm.id] ?? true}
                                    onChange={() => {
                                        const current = settings.consensus_models || {};
                                        updateSettings({ consensus_models: { ...current, [llm.id]: !((current as any)?.[llm.id] ?? true) } });
                                    }}
                                />
                            </div>
                        ))}
                    </SettingsSection>
                )}

                {/* NOTIFICATIONS TAB */}
                {activeTab === 'notifications' && (
                    <SettingsSection title="Notification Channels">
                        {['decision', 'context', 'system'].map((cat) => (
                            <SettingRow
                                key={cat}
                                label={`${cat.charAt(0).toUpperCase() + cat.slice(1)} Alerts`}
                                description={`Receive push alerts for ${cat} events.`}
                                action={
                                    <Toggle
                                        checked={(settings.notif_categories as any)?.[cat]?.push ?? true}
                                        onChange={() => {
                                            const current = settings.notif_categories || {};
                                            const currentCat = current[cat] || { push: true, inapp: true };
                                            updateSettings({
                                                notif_categories: {
                                                    ...current,
                                                    [cat]: { ...currentCat, push: !currentCat.push }
                                                }
                                            });
                                        }}
                                    />
                                }
                            />
                        ))}
                    </SettingsSection>
                )}

            </div>
        </div>
    );
}

function displayLabel(key: string) {
    if (key === 'marketStructure') return 'Market Structure';
    return key.charAt(0).toUpperCase() + key.slice(1);
}
