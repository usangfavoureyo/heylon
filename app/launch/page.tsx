"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LaunchPage() {
    const router = useRouter();

    useEffect(() => {
        // Minimal delay to ensure splash screen clears smoothly
        // Then let middleware/router handle the flow
        const timer = setTimeout(() => {
            router.replace("/decision"); // Will redirect to login if not auth
        }, 100);

        return () => clearTimeout(timer);
    }, [router]);

    return (
        <div className="fixed inset-0 bg-black flex items-center justify-center">
            <div className="relative w-24 h-24 animate-pulse">
                <Image
                    src="/icons/icon-192x192.png"
                    alt="Heylon"
                    fill
                    className="object-contain"
                    priority
                />
            </div>
        </div>
    );
}
