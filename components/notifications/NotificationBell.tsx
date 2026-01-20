"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { useHaptic } from "@/hooks/use-haptic";

export function NotificationBell({ hasUnread = true }: { hasUnread?: boolean }) {
    const { trigger } = useHaptic();

    return (
        <Link
            href="/notifications"
            onClick={() => trigger('light')}
            className="relative p-2 text-neutral-400 hover:text-white transition-colors"
        >
            <Bell className="w-5 h-5" />
            {hasUnread && (
                <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-neutral-950 animate-pulse" />
            )}
        </Link>
    );
}
