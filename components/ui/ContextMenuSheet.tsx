"use client";

import { Drawer } from "vaul";
import { Copy, FileText, Target, X } from "lucide-react";
import { useHaptic } from "@/hooks/use-haptic";
import { useSymbol } from "../providers/SymbolProvider";

interface ActionItem {
    label: string;
    icon: any;
    onClick: () => void;
    destructive?: boolean;
}

interface ContextMenuSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    contextType?: "SYMBOL" | "ZONE" | "SIGNAL";
    contextId?: string;
}

export function ContextMenuSheet({ open, onOpenChange, contextType = "SYMBOL", contextId }: ContextMenuSheetProps) {
    const { activeSymbol } = useSymbol();
    const { trigger } = useHaptic();

    const handleCopy = () => {
        trigger("light");
        if (contextId) navigator.clipboard.writeText(contextId);
        onOpenChange(false);
    };

    const actions: ActionItem[] = [
        {
            label: "Copy ID",
            icon: Copy,
            onClick: handleCopy
        },
        {
            label: "Jump to Zone",
            icon: Target,
            onClick: () => {
                trigger("medium");
                // TODO: Scroll to Zone logic
                onOpenChange(false);
            }
        },
        {
            label: "View Logs",
            icon: FileText,
            onClick: () => {
                trigger("light");
                // TODO: Navigate to logs
                onOpenChange(false);
            }
        }
    ];

    return (
        <Drawer.Root open={open} onOpenChange={onOpenChange}>
            <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
                <Drawer.Content className="bg-neutral-900 flex flex-col rounded-t-[20px] fixed bottom-0 left-0 right-0 z-50 outline-none border-t border-white/10 pb-8">
                    {/* Handle */}
                    <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-neutral-700 my-4" />

                    <div className="px-6 pb-6">
                        <Drawer.Title className="text-lg font-bold text-white mb-1">
                            {contextType} Options
                        </Drawer.Title>
                        <Drawer.Description className="text-sm text-neutral-500 mb-6">
                            Actions for {activeSymbol} {contextId ? `(${contextId.slice(0, 8)}...)` : ""}
                        </Drawer.Description>

                        <div className="space-y-2">
                            {actions.map((action) => {
                                const Icon = action.icon;
                                return (
                                    <button
                                        key={action.label}
                                        onClick={action.onClick}
                                        className="w-full flex items-center gap-4 p-4 rounded-xl bg-neutral-800/50 hover:bg-neutral-800 border border-white/5 active:scale-[0.98] transition-all text-left"
                                    >
                                        <div className="p-2 bg-neutral-800 rounded-lg text-neutral-300">
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <span className="text-base font-medium text-white">{action.label}</span>
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            onClick={() => onOpenChange(false)}
                            className="w-full mt-4 py-4 text-neutral-500 font-medium active:text-white transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root>
    );
}
