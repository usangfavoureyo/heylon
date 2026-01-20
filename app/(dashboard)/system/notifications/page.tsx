"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { BackButton } from "@/components/BackButton";
import { ToggleRow } from "@/components/system/Shared";
import { cn } from "@/lib/utils";

import { LoadingScreen } from "@/components/ui/LoadingScreen";

export default function NotificationsSubPage() {
    const settings = useQuery(api.settings.getSettings);
    const updateSettings = useMutation(api.settings.updateSettings);
    const subscribePush = useMutation((api as any).push?.subscribe);
    const sendTestPush = useMutation((api as any).push?.sendTestPush);

    if (!settings) return <LoadingScreen className="bg-white dark:bg-black" />;

    const cats = settings.notif_categories || {};

    const handleMasterPushToggle = async (enabled: boolean) => {
        if (enabled) {
            // 1. Request Permission
            const permission = await Notification.requestPermission();
            if (permission !== "granted") {
                alert("Permission denied. Enable notifications in browser settings.");
                return;
            }

            // 2. Register Service Worker Subscription
            const reg = await navigator.serviceWorker.ready;
            const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

            if (!vapidKey) {
                console.error("NEXT_PUBLIC_VAPID_PUBLIC_KEY missing");
                alert("System Error: VAPID Key missing.");
                // return;
            }

            try {
                const sub = await reg.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(vapidKey || ""),
                });

                // 3. Send to Backend
                const json = sub.toJSON();
                await subscribePush({
                    endpoint: sub.endpoint!,
                    keys: {
                        p256dh: json.keys?.p256dh || "",
                        auth: json.keys?.auth || "",
                    },
                    deviceInfo: navigator.userAgent
                });

                updateSettings({ notif_channel_push: true });
            } catch (e) {
                console.error("Subscription failed", e);
                alert("Failed to subscribe to push service.");
            }
        } else {
            updateSettings({ notif_channel_push: false });
        }
    };

    const toggleCat = (cat: string, channel: "push" | "inapp") => {
        const current = (cats as any)[cat] || { push: false, inapp: false };
        updateSettings({
            notif_categories: {
                ...cats,
                [cat]: { ...current, [channel]: !current[channel] }
            }
        });
    };

    return (
        <div className="flex flex-col min-h-full bg-white dark:bg-black text-neutral-900 dark:text-neutral-100 p-6 md:p-8 w-full">
            <div className="flex items-center gap-4 mb-8">
                <BackButton />
                <div>
                    <h1 className="text-xl font-medium text-neutral-900 dark:text-white">Notifications</h1>
                    <p className="text-sm text-neutral-500">Channels & Filters</p>
                </div>
            </div>

            <div className="space-y-8">
                <section>
                    <h3 className="text-xs font-mono text-neutral-500 uppercase mb-4">Channels</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between py-2">
                            <div>
                                <div className="text-base text-neutral-900 dark:text-neutral-200">Push Notifications</div>
                                <div className="text-xs text-neutral-500">Device-level alerts.</div>
                                {settings.notif_channel_push && (
                                    <button
                                        onClick={() => sendTestPush()}
                                        className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-medium mt-1"
                                    >
                                        Send Test Notification
                                    </button>
                                )}
                            </div>
                            <button
                                onClick={() => handleMasterPushToggle(!settings.notif_channel_push)}
                                className={cn(
                                    "w-12 h-7 rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer",
                                    settings.notif_channel_push ? "bg-neutral-400 dark:bg-neutral-600" : "bg-neutral-200 dark:bg-neutral-800"
                                )}
                            >
                                <div className={cn(
                                    "w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out",
                                    settings.notif_channel_push ? "translate-x-5" : "translate-x-0"
                                )} />
                            </button>
                        </div>
                    </div>

                </section>

                <section>
                    <div className="flex items-center justify-between mb-4 px-2">
                        <h3 className="text-xs font-mono text-neutral-500 uppercase">Routing Matrix</h3>
                        <div className="flex text-[10px] font-mono text-neutral-500 gap-[2.75rem] mr-6">
                            <span>PUSH</span>
                            <span>IN-APP</span>
                        </div>
                    </div>
                    <div className="space-y-4 bg-neutral-50 dark:bg-neutral-900/30 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800/50">
                        <NotifMatrixRow label="Trade Confirmation" desc="MSS & Fill Alerts" cat="trade_confirm" data={cats.trade_confirm} onToggle={toggleCat} />
                        <NotifMatrixRow label="Advisory / Signals" desc="Tap & Setup alerts" cat="advisory" data={cats.advisory} onToggle={toggleCat} />
                        <NotifMatrixRow label="Macro Events" desc="High impact cal" cat="macro" data={cats.macro} onToggle={toggleCat} />
                        <NotifMatrixRow label="Risk Escalation" desc="Veto triggers" cat="risk" data={cats.risk} onToggle={toggleCat} />
                        <NotifMatrixRow label="System Status" desc="Health & Auth" cat="system" data={cats.system} onToggle={toggleCat} />
                    </div>
                </section>
            </div>
        </div>
    );
}

function NotifMatrixRow({ label, desc, cat, data, onToggle }: any) {
    const push = data?.push ?? false;
    const inapp = data?.inapp ?? false;

    return (
        <div className="flex items-center justify-between py-2">
            <div>
                <div className="text-base text-neutral-900 dark:text-neutral-200">{label}</div>
                <div className="text-xs text-neutral-500">{desc}</div>
            </div>
            <div className="flex items-center gap-6">
                {/* Push Toggle */}
                <button onClick={() => onToggle(cat, "push")} className={cn("w-12 h-7 rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer", push ? "bg-neutral-400 dark:bg-neutral-600" : "bg-neutral-200 dark:bg-neutral-800")} >
                    <div className={cn("w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out", push ? "translate-x-5" : "translate-x-0")} />
                </button>
                {/* InApp Toggle */}
                <button onClick={() => onToggle(cat, "inapp")} className={cn("w-12 h-7 rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer", inapp ? "bg-neutral-400 dark:bg-neutral-600" : "bg-neutral-200 dark:bg-neutral-800")} >
                    <div className={cn("w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out", inapp ? "translate-x-5" : "translate-x-0")} />
                </button>
            </div>
        </div>
    );
}

function urlBase64ToUint8Array(base64String: string) {
    const padding = "=".repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, "+")
        .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
