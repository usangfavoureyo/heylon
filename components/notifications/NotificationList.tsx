"use client";

import { Bell, AlertTriangle, ShieldCheck, Zap } from "lucide-react";
import { format } from "date-fns";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { useHaptic } from "@/hooks/use-haptic";

export function NotificationList() {
    const notifications = useQuery(api.notifications.getRecent) || [];
    const markRead = useMutation(api.notifications.markRead);
    const deleteNotification = useMutation(api.notifications.remove);
    const { trigger } = useHaptic();

    // Swipe handlers would go here similar to WatchlistRow mechanism
    // For now, styling the card as requested

    return (
        <div className="space-y-2">
            {notifications.map((note) => (
                <NotificationRow
                    key={note._id}
                    note={note}
                    onMarkRead={() => markRead({ id: note._id })}
                    onDelete={() => deleteNotification({ id: note._id })}
                />
            ))}

            {notifications.length === 0 && (
                <div className="text-center text-neutral-500 py-10 flex flex-col items-center">
                    <p className="text-sm font-medium">All caught up</p>
                    <p className="text-xs opacity-50 mt-1">No new system notifications</p>
                </div>
            )}
        </div>
    );
}

import { motion, PanInfo, useAnimation } from "framer-motion";
import { Trash, Check } from "lucide-react";

import { GlobalCard as Card } from "../ui/GlobalCard";

function NotificationRow({ note, onMarkRead, onDelete }: { note: any, onMarkRead: () => void, onDelete: () => void }) {
    const controls = useAnimation();
    const { trigger } = useHaptic();

    const handleDragEnd = async (event: any, info: PanInfo) => {
        const offset = info.offset.x;
        const threshold = 80;

        if (offset < -threshold) {
            // Swipe Left -> Delete
            trigger('medium');
            onDelete();
            controls.start({ x: 0 }); // In real app, maybe animate out
        } else if (offset > threshold) {
            // Swipe Right -> Mark Read
            trigger('light');
            onMarkRead();
            controls.start({ x: 0 });
        } else {
            controls.start({ x: 0 });
        }
    };

    return (
        <div className="relative group overflow-hidden rounded-xl select-none touch-pan-y">
            {/* Background Actions */}
            <div className="absolute inset-0 flex items-center justify-between px-6 pointer-events-none">
                {/* Right Swipe (Revealed on Left side) -> MARK READ */}
                <div className="flex items-center gap-2 text-emerald-500 font-medium opacity-0 group-active:opacity-100 transition-opacity">
                    <Check className="w-5 h-5" />
                    <span className="text-xs uppercase tracking-wider">Read</span>
                </div>

                {/* Left Swipe (Revealed on Right side) -> DELETE */}
                <div className="flex items-center gap-2 text-red-500 font-medium opacity-0 group-active:opacity-100 transition-opacity">
                    <span className="text-xs uppercase tracking-wider">Delete</span>
                    <Trash className="w-5 h-5" />
                </div>
            </div>

            {/* Foreground Card */}
            <Card
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.1}
                onDragEnd={handleDragEnd}
                animate={controls}
                onClick={() => {
                    if (!note.read) onMarkRead();
                }}
                className={cn(
                    "flex flex-col gap-1 transition-all border shadow-sm dark:shadow-none",
                    !note.read
                        ? "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-white/10"
                        : "bg-neutral-50 dark:bg-neutral-900/40 border-transparent opacity-60"
                )}
                noPadding={false}
            >
                <div className="flex justify-between items-start">
                    <h3 className={cn("text-sm", !note.read ? "font-bold text-neutral-900 dark:text-white" : "font-medium text-neutral-500")}>
                        {note.title}
                    </h3>

                    <div className="flex items-center gap-3">
                        {/* Timestamp */}
                        <span className="text-[10px] text-neutral-500 dark:text-neutral-600 font-mono">
                            {format(note.createdAt, "h:mm a")}
                        </span>

                        {/* Desktop Hover Actions */}
                        <div className="hidden lg:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={(e) => { e.stopPropagation(); onMarkRead(); }} className="p-1 hover:text-white text-neutral-500 transition-colors">
                                <Check className="w-4 h-4" />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1 hover:text-red-500 text-neutral-500 transition-colors">
                                <Trash className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed font-medium pr-8">
                    {note.body}
                </p>
            </Card>
        </div>
    );
}
