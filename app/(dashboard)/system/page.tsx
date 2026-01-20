"use client";

import Link from "next/link";
import {
    Gear,
    Bell,
    Stack,
    Gavel,
    Scroll,
    CaretRight
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const SECTIONS = [
    { id: "preferences", label: "Preferences", icon: Gear, desc: "Appearance, Session & Engine" },
    { id: "notifications", label: "Notifications", icon: Bell, desc: "Channels & Filters" },
    { id: "layers", label: "Layers", icon: Stack, desc: "Decision Inputs" },
    { id: "consensus", label: "Consensus", icon: Gavel, desc: "Jury Models" },
    { id: "logs", label: "Learning Logs", icon: Scroll, desc: "Audit Trail" },
];

export default function SystemPage() {
    return (
        <div className="flex flex-col min-h-full bg-white dark:bg-black text-neutral-900 dark:text-neutral-100 p-6 md:p-8 w-full">
            <div className="mb-8">
                <h1 className="text-2xl font-light tracking-tight text-neutral-900 dark:text-white mb-2">System</h1>
                <p className="text-sm text-neutral-500 font-medium">Control Surface</p>
            </div>

            <nav className="space-y-2">
                {SECTIONS.map((section) => {
                    const Icon = section.icon;
                    return (
                        <Link
                            key={section.id}
                            href={`/system/${section.id}`}
                            className="bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-white/5 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all active:scale-[0.99] group shadow-sm dark:shadow-none"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-neutral-500 dark:text-neutral-400 group-hover:text-black dark:group-hover:text-white transition-colors">
                                    <Icon size={20} weight="regular" />
                                </div>
                                <div>
                                    <div className="text-base font-medium text-neutral-900 dark:text-white">{section.label}</div>
                                    <div className="text-xs text-neutral-500 group-hover:text-neutral-700 dark:group-hover:text-neutral-400 transition-colors">{section.desc}</div>
                                </div>
                            </div>
                            <CaretRight size={16} className="text-neutral-400 dark:text-neutral-600 group-hover:text-black dark:group-hover:text-white transition-colors" />
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
