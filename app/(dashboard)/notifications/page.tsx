"use client";

import { NotificationList } from "@/components/notifications/NotificationList";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useHaptic } from "@/hooks/use-haptic";

export default function NotificationsPage() {
    const router = useRouter();
    const { trigger } = useHaptic();

    return (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col lg:relative lg:z-auto lg:bg-white lg:dark:bg-black">
            {/* Header - Mobile style like SearchPage */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-800 shrink-0 lg:hidden">
                <div className="w-10" /> {/* Spacer for centering */}
                <h1 className="text-lg font-medium text-white">Notifications</h1>
                <button
                    onClick={() => {
                        trigger('light');
                        router.back();
                    }}
                    className="p-2 -mr-2 text-neutral-400 hover:text-white transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>

            {/* Desktop Header */}
            <div className="hidden lg:block p-6 md:p-8">
                <h1 className="text-2xl font-medium text-neutral-900 dark:text-white mb-2">Notifications</h1>
                <p className="text-sm text-neutral-500">View your latest system and market alerts</p>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 lg:px-8 lg:pb-8">
                <div className="w-full max-w-2xl">
                    <NotificationList />
                </div>
            </div>
        </div>
    );
}

