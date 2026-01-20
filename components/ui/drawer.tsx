"use client";

import { Drawer as VaulDrawer } from "vaul";
import { cn } from "@/lib/utils";

export function Drawer({
    children,
    trigger,
    open,
    onOpenChange,
    className,
}: {
    children: React.ReactNode;
    trigger?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    className?: string; // Allow overriding Content styles
}) {
    return (
        <VaulDrawer.Root open={open} onOpenChange={onOpenChange}>
            {trigger && <VaulDrawer.Trigger asChild>{trigger}</VaulDrawer.Trigger>}
            <VaulDrawer.Portal>
                <VaulDrawer.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
                <VaulDrawer.Content className={cn("bg-[#0d0d0d] flex flex-col rounded-t-[10px] mt-24 fixed bottom-0 left-0 right-0 z-50 outline-none border-t border-neutral-800 max-h-[96%]", className)}>
                    {/* Drag Handle - Click to Close */}
                    <div
                        onClick={() => onOpenChange?.(false)}
                        className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-neutral-700 my-4 cursor-pointer hover:bg-neutral-600 transition-colors"
                    />

                    <VaulDrawer.Title className="sr-only">Drawer</VaulDrawer.Title>

                    {/* Render children directly to allow full control of layout/scrollbar */}
                    {children}
                </VaulDrawer.Content>
            </VaulDrawer.Portal>
        </VaulDrawer.Root>
    );
}
