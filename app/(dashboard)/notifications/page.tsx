"use client";

import { NotificationList } from "@/components/notifications/NotificationList";
import { BackButton } from "@/components/BackButton";

export default function NotificationsPage() {
    return (
        <div className="flex flex-col min-h-full bg-white dark:bg-black text-neutral-900 dark:text-neutral-100 p-6 md:p-8 w-full">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <BackButton />
                <div>
                    <h1 className="text-xl font-medium text-neutral-900 dark:text-white">Notifications</h1>
                    <p className="text-sm text-neutral-500">View your latest system and market alerts</p>
                </div>
            </div>

            {/* Content */}
            <div className="w-full max-w-2xl">
                <NotificationList />
            </div>
        </div>
    );
}
