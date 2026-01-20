"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { BackButton } from "@/components/BackButton";
import { ToggleRow } from "@/components/system/Shared";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { cn } from "@/lib/utils";
import { Drawer } from "@/components/ui/drawer";
import { Check, ChevronRight, Globe } from "lucide-react";
import { useState } from "react";

export default function PreferencesSubPage() {
    const settings = useQuery(api.settings.getSettings);
    const updateSettings = useMutation(api.settings.updateSettings);

    if (!settings) return <LoadingScreen className="bg-white dark:bg-black" />;

    // Defaults / Fallbacks
    const interaction = settings.interaction || {};
    const trading = settings.trading || { session_presets: "CUSTOM", sessionStart: "14:30", sessionEnd: "22:00", timezone: "Africa/Lagos", auto_wait_outside_session: true };
    const engine = settings.engine || { mss_mode: "MICRO", tap_action_policy: "ADVISORY" };
    const zoning = settings.zoning || { viability_threshold: "BALANCED", untapped_zone_policy: "IGNORE_AFTER_1" };
    const risk = settings.risk || { max_confirm_signals: 1, cooldown_minutes: 0, consecutive_wait_lock: 3 };
    const symbol = settings.symbol || { auto_switch_symbol: false, lock_active_symbol: false, reset_on_switch: true };
    const data = settings.data || { context_refresh: "HYBRID", news_sensitivity: "BALANCED" };
    const safety = settings.safety || { force_wait_killswitch: false, auto_recover: true };

    const update = (key: string, val: any) => updateSettings({ [key]: { ...(settings as any)[key], ...val } });

    return (
        <div className="flex flex-col min-h-full bg-white dark:bg-black text-neutral-900 dark:text-neutral-100 p-6 md:p-8 w-full">
            <div className="flex items-center gap-4 mb-8">
                <BackButton />
                <div>
                    <h1 className="text-xl font-medium text-neutral-900 dark:text-white">Preferences</h1>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">System Configuration</p>
                </div>
            </div>

            <div className="space-y-8 max-w-2xl pb-20">

                {/* 1. APPEARANCE */}
                <Section title="1. Appearance" desc="UI Rendering">
                    <SegmentedControl
                        value={settings.appearance}
                        onChange={(v) => updateSettings({ appearance: v })}
                        options={[
                            { value: "SYSTEM", label: "SYSTEM" },
                            { value: "LIGHT", label: "LIGHT" },
                            { value: "DARK", label: "DARK" },
                        ]}
                    />
                </Section>

                {/* 2. INTERACTION & FEEDBACK */}
                <Section title="2. Interaction & Feedback" desc="Haptics & Motion">
                    <div className="space-y-2">
                        <ToggleRow label="Haptics" desc="Global vibration feedback." checked={interaction.haptics_enabled} onChange={(v) => update("interaction", { haptics_enabled: v })} />
                        <ToggleRow label="Critical Haptics Only" desc="Vibrate only on Confirm/Veto." checked={interaction.haptics_critical_only} onChange={(v) => update("interaction", { haptics_critical_only: v })} />
                        <ToggleRow label="Reduced Motion" desc="Zero latency transitions." checked={interaction.motion_reduced} onChange={(v) => update("interaction", { motion_reduced: v })} />
                    </div>
                </Section>

                {/* 3. TRADING SESSION CONTROL */}
                <Section title="3. Session Control" desc="Time & Automation">
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 mb-2">
                                <TimeZoneDrawer
                                    value={trading.timezone || "Africa/Lagos"}
                                    onChange={(tz) => update("trading", { timezone: tz })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase text-neutral-500">Start (Local)</label>
                                <input type="time" value={trading.sessionStart} onChange={(e) => update("trading", { sessionStart: e.target.value })}
                                    className="w-full bg-black border border-neutral-800 rounded-lg p-3 text-sm text-white outline-none focus:border-neutral-700 font-mono transition-colors" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase text-neutral-500">End (Local)</label>
                                <input type="time" value={trading.sessionEnd} onChange={(e) => update("trading", { sessionEnd: e.target.value })}
                                    className="w-full bg-black border border-neutral-800 rounded-lg p-3 text-sm text-white outline-none focus:border-neutral-700 font-mono transition-colors" />
                            </div>
                        </div>
                        <ToggleRow label="Auto-Wait" desc="Force WAIT outside session." checked={trading.auto_wait_outside_session} onChange={(v) => update("trading", { auto_wait_outside_session: v })} />
                    </div>
                </Section>

                {/* 4. ENTRY LOGIC MODE */}
                <Section title="4. Entry Logic Mode" desc="Core Engine Behavior">
                    <div className="space-y-4">
                        <SegmentedControl
                            value={engine.mss_mode}
                            onChange={(v) => update("engine", { mss_mode: v })}
                            options={[
                                { value: "MICRO", label: "Micro MSS" },
                                { value: "STRUCTURAL", label: "Structural MSS" },
                            ]}
                        />
                        <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">Tap Policy</span>
                            </div>
                            <SegmentedControl
                                value={engine.tap_action_policy}
                                onChange={(v) => update("engine", { tap_action_policy: v })}
                                options={[
                                    { value: "ADVISORY", label: "Advisory" },
                                    { value: "ACTIONABLE", label: "Actionable" },
                                ]}
                            />
                        </div>
                    </div>
                </Section>

                {/* 5. ZONE HANDLING */}
                <Section title="5. Zone Handling" desc="Viability & Expiry">
                    <div className="space-y-4">
                        <SegmentedControl
                            value={zoning.viability_threshold}
                            onChange={(v) => update("zoning", { viability_threshold: v })}
                            options={[
                                { value: "CONSERVATIVE", label: "CONSERVATIVE" },
                                { value: "BALANCED", label: "BALANCED" },
                                { value: "AGGRESSIVE", label: "AGGRESSIVE" },
                            ]}
                        />
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-neutral-600 dark:text-neutral-400">Untapped Policy</div>
                            <div className="w-[200px]">
                                <SegmentedControl
                                    value={zoning.untapped_zone_policy}
                                    onChange={(v) => update("zoning", { untapped_zone_policy: v })}
                                    options={[
                                        { value: "IGNORE_AFTER_1", label: "Ignore +1" },
                                        { value: "ARCHIVE", label: "Archive" },
                                    ]}
                                />
                            </div>
                        </div>
                    </div>
                </Section>

                {/* 6. RISK & DISCIPLINE */}
                <Section title="6. Risk & Discipline" desc="Behavioral Guards">
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-xs mb-1 text-neutral-500"><span>Max Confirm Signals</span> <span>{risk.max_confirm_signals}</span></div>
                            <input type="range" min="1" max="10" value={risk.max_confirm_signals === "UNLIMITED" ? 10 : risk.max_confirm_signals}
                                onChange={(e) => update("risk", { max_confirm_signals: Number(e.target.value) })} className="w-full accent-white dark:accent-white h-1 bg-black rounded-lg appearance-none cursor-pointer border border-neutral-800" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase text-neutral-500">Cooldown (Mins)</label>
                                <input type="number" value={risk.cooldown_minutes} onChange={(e) => update("risk", { cooldown_minutes: Number(e.target.value) })}
                                    className="w-full bg-black border border-neutral-800 rounded-lg p-3 text-xs outline-none font-mono text-white transition-colors focus:border-neutral-700" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase text-neutral-500">Consecutive Wait Lock</label>
                                <input type="number" value={risk.consecutive_wait_lock} onChange={(e) => update("risk", { consecutive_wait_lock: Number(e.target.value) })}
                                    className="w-full bg-black border border-neutral-800 rounded-lg p-3 text-xs outline-none font-mono text-white transition-colors focus:border-neutral-700" />
                            </div>
                        </div>
                    </div>
                </Section>

                {/* 7. SYMBOL CONTROL */}
                <Section title="7. Symbol Control" desc="Watchlist Behavior">
                    <div className="space-y-2">
                        <ToggleRow label="Auto-Switch" desc="Follow active watchlist selection." checked={symbol.auto_switch_symbol} onChange={(v) => update("symbol", { auto_switch_symbol: v })} />
                        <ToggleRow label="Lock Active Symbol" desc="Prevent accidental changes." checked={symbol.lock_active_symbol} onChange={(v) => update("symbol", { lock_active_symbol: v })} />
                        <ToggleRow label="Reset State on Switch" desc="Clear pending bias/zones." checked={symbol.reset_on_switch} onChange={(v) => update("symbol", { reset_on_switch: v })} />
                    </div>
                </Section>

                {/* 8. DATA FRESHNESS */}
                <Section title="8. Data Freshness" desc="Latency Sensitivity">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm">Context Refresh</span>
                            <div className="w-[280px]">
                                <SegmentedControl
                                    value={data.context_refresh}
                                    onChange={(v) => update("data", { context_refresh: v })}
                                    options={[
                                        { value: "REALTIME", label: "Realtime" },
                                        { value: "HYBRID", label: "Hybrid" },
                                        { value: "TIMED", label: "Timed" },
                                    ]}
                                />
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm">News Sensitivity</span>
                            <div className="w-[280px]">
                                <SegmentedControl
                                    value={data.news_sensitivity}
                                    onChange={(v) => update("data", { news_sensitivity: v })}
                                    options={[
                                        { value: "STRICT", label: "Strict" },
                                        { value: "BALANCED", label: "Balanced" },
                                        { value: "LENIENT", label: "Lenient" },
                                    ]}
                                />
                            </div>
                        </div>
                    </div>
                </Section>

                {/* 9. SAFETY */}
                <Section title="9. Safety & Recovery" desc="Emergency Controls">
                    <div className="space-y-4">
                        <div className="p-3 rounded-lg border border-red-500/20 bg-red-500/5 flex items-center justify-between">
                            <div className="text-red-500 text-sm font-medium">FORCE WAIT (Kill Switch)</div>
                            <ToggleRow label="" desc="" checked={safety.force_wait_killswitch} onChange={(v) => update("safety", { force_wait_killswitch: v })} />
                        </div>
                        <ToggleRow label="Auto-Recover State" desc="Restore session on reload." checked={safety.auto_recover} onChange={(v) => update("safety", { auto_recover: v })} />
                    </div>
                </Section>

            </div>
        </div>
    );
}

function Section({ title, desc, children }: { title: string, desc: string, children: React.ReactNode }) {
    return (
        <section className="space-y-3">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-mono text-neutral-500 uppercase">{title}</h3>
                <span className="text-[10px] text-neutral-400">{desc}</span>
            </div>
            <div className="bg-white dark:bg-neutral-900/30 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800/50 shadow-sm">
                {children}
            </div>
        </section>
    );
}

function SegmentedControl({ value, onChange, options }: { value: string, onChange: (val: string) => void, options: { value: string, label: string }[] }) {
    return (
        <div className="grid grid-flow-col auto-cols-auto gap-2 bg-neutral-100 dark:bg-neutral-900 p-1 rounded-lg border border-neutral-200 dark:border-neutral-800">
            {options.map((opt) => (
                <button
                    key={opt.value}
                    onClick={() => onChange(opt.value)}
                    className={cn(
                        "py-2 px-3 text-xs font-medium rounded-md transition-all duration-200 text-center truncate",
                        value === opt.value
                            ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm"
                            : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                    )}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    );
}

function TimeZoneDrawer({ value, onChange }: { value: string, onChange: (tz: string) => void }) {
    const [open, setOpen] = useState(false);
    const timezones = [
        { id: "UTC", label: "UTC (Coordinated Universal Time)", offset: "+0" },
        { id: "Africa/Lagos", label: "Lagos (West Africa Time)", offset: "+1" },
        { id: "Europe/London", label: "London (GMT/BST)", offset: "+0/+1" },
        { id: "America/New_York", label: "New York (EST/EDT)", offset: "-5/-4" },
        { id: "America/Chicago", label: "Chicago (CST/CDT)", offset: "-6/-5" },
        { id: "Asia/Tokyo", label: "Tokyo (JST)", offset: "+9" },
        { id: "Australia/Sydney", label: "Sydney (AEST)", offset: "+10" },
    ];

    const activeLabel = timezones.find(t => t.id === value)?.label || value;

    return (
        <Drawer
            open={open}
            onOpenChange={setOpen}
            className="bg-black border-neutral-900 h-auto max-h-[85vh]" // Override background and height
            trigger={
                <button className="w-full flex items-center justify-between bg-black border border-neutral-800 rounded-xl p-3 text-left hover:bg-neutral-900 transition-colors group">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-neutral-900 flex items-center justify-center border border-neutral-800 group-hover:border-neutral-700">
                            <Globe className="w-4 h-4 text-neutral-400" />
                        </div>
                        <div>
                            <div className="text-xs text-neutral-500 uppercase font-mono mb-0.5">Time Zone</div>
                            <div className="text-sm font-medium text-white">{activeLabel}</div>
                        </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-neutral-600" />
                </button>
            }>
            {/* Direct List Content with padding relative to drawer, no-scrollbar */}
            <div className="flex flex-col h-full bg-black"> {/* Ensure full black background */}
                <div className="p-4 border-b border-neutral-900">
                    <h3 className="text-lg font-medium text-white">Select Time Zone</h3>
                    <p className="text-sm text-neutral-500">Session times will adapt to this zone.</p>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"> {/* Scrollbar Hidden */}
                    {timezones.map((tz) => (
                        <button
                            key={tz.id}
                            onClick={() => { onChange(tz.id); setOpen(false); }}
                            className={cn(
                                "w-full flex items-center justify-between p-4 rounded-xl transition-colors text-left",
                                value === tz.id ? "bg-[#0d0d0d] text-white" : "text-neutral-500 hover:bg-[#0d0d0d] hover:text-neutral-300"
                            )}
                        >
                            <div>
                                <div className={cn("font-medium", value === tz.id ? "text-white" : "text-neutral-300")}>{tz.label}</div>
                                <div className="text-xs text-neutral-500 font-mono mt-0.5">{tz.id} • {tz.offset}</div>
                            </div>
                            {value === tz.id && <Check className="w-4 h-4 text-white" />}
                        </button>
                    ))}
                </div>
            </div>
        </Drawer>
    );
}
