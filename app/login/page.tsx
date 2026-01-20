"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useHaptic } from "@/hooks/use-haptic";
import { GlobalCard } from "@/components/ui/GlobalCard";
import { cn } from "@/lib/utils";
import { Eye, EyeSlash, LockKey, CircleNotch, SignIn } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

import { useTheme } from "next-themes";

function ThemeLogoLogin() {
    const { theme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    if (!mounted) return null;

    const activeTheme = theme === "system" ? resolvedTheme : theme;
    const src = activeTheme === "dark" ? "/logo-white.png" : "/logo-black.png";

    return (
        <Image
            src={src}
            alt="Heylon Logo"
            fill
            className="object-contain"
            priority
        />
    );
}

export default function LoginPage() {
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [keepSignedIn, setKeepSignedIn] = useState(true);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);

    const router = useRouter();
    const verify = useAction(api.auth.verifyPassword);
    const { trigger } = useHaptic();
    const inputRef = useRef<HTMLInputElement>(null);
    const { theme } = useTheme();

    // Auto-focus logic
    useEffect(() => {
        if (inputRef.current) inputRef.current.focus();
    }, []);

    const handleLogin = async () => {
        if (!password) return;

        trigger("medium");
        setLoading(true);
        setError(false);

        try {
            const result = await verify({ password });

            if (result.success) {
                trigger("success");
                const maxAge = keepSignedIn ? 31536000 : 86400;
                document.cookie = `auth_token=valid; path=/; max-age=${maxAge}; SameSite=Strict`;
                router.push("/decision");
            } else {
                trigger("error");
                setError(true);
                setLoading(false);
                if (inputRef.current) {
                    inputRef.current.select();
                }
            }
        } catch (e) {
            trigger("error");
            setError(true);
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleLogin();
        }
    };

    return (
        <div className="h-screen w-screen fixed inset-0 bg-white dark:bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden selection:bg-amber-500/30 selection:text-amber-500 transition-colors duration-500">
            {/* Background Ambient */}
            <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-neutral-200/50 dark:from-neutral-900/20 to-transparent pointer-events-none transition-colors duration-500" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-sm relative z-10"
            >
                {/* Logo Section */}
                <div className="flex flex-col items-center mb-4">
                    <div className="w-[300px] h-20 relative mb-2">
                        <ThemeLogoLogin />
                    </div>
                </div>

                {/* Login Card */}
                <GlobalCard className={cn("p-1 transition-colors duration-300", error ? "border-red-500/50" : "border-neutral-200 dark:border-white/10")}>
                    <div className="bg-white/80 dark:bg-neutral-950/80 rounded-[10px] p-6 space-y-6 backdrop-blur-xl transition-colors">

                        {/* Password Input */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider ml-1">Password</label>
                            <div className="relative group">
                                <LockKey className={cn("absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors", error ? "text-red-500" : "text-neutral-400 dark:text-neutral-500 group-focus-within:text-black dark:group-focus-within:text-white")} />

                                <input
                                    ref={inputRef}
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        setError(false);
                                        if (e.target.value.length % 2 === 0) trigger("light"); // Subtle typing haptic
                                    }}
                                    onKeyDown={handleKeyDown}
                                    className="w-full bg-neutral-100 dark:bg-neutral-900/50 border border-neutral-200 dark:border-white/5 rounded-xl py-3.5 pl-12 pr-12 text-black dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:outline-none focus:border-amber-500/50 focus:bg-white dark:focus:bg-neutral-900 transition-all font-medium text-lg tracking-wide [&::-ms-reveal]:hidden"
                                    placeholder="••••••••"
                                />

                                <button
                                    onClick={() => {
                                        trigger("light");
                                        setShowPassword(!showPassword);
                                    }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-neutral-400 hover:text-black dark:text-neutral-500 dark:hover:text-white transition-colors rounded-lg active:scale-95"
                                >
                                    {showPassword ? <EyeSlash className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>

                            <AnimatePresence>
                                {error && (
                                    <motion.p
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="text-xs text-red-500 font-medium ml-1"
                                    >
                                        Incorrect password. Please try again.
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Keep Signed In */}
                        <div
                            className="flex items-center justify-between cursor-pointer group"
                            onClick={() => {
                                trigger("light");
                                setKeepSignedIn(!keepSignedIn);
                            }}
                        >
                            <span className="text-sm text-neutral-500 dark:text-neutral-400">Keep me signed in</span>
                            <div className={cn(
                                "w-11 h-6 rounded-full transition-colors relative",
                                keepSignedIn ? "bg-neutral-800 dark:bg-neutral-600" : "bg-neutral-300 dark:bg-neutral-800"
                            )}>
                                <div className={cn(
                                    "absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200",
                                    keepSignedIn ? "left-6" : "left-1"
                                )} />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            onClick={handleLogin}
                            disabled={loading || !password}
                            className={cn(
                                "w-full py-4 rounded-xl font-bold text-base tracking-wide flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98]",
                                loading || !password
                                    ? "bg-neutral-200 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500 cursor-not-allowed"
                                    : "bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
                            )}
                        >
                            {loading ? (
                                <CircleNotch weight="bold" className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <span>Sign In</span>
                                    <SignIn weight="bold" className="w-5 h-5" />
                                </>
                            )}
                        </button>

                    </div>
                </GlobalCard>

                {/* Footer */}
                <p className="text-center text-xs text-neutral-400 dark:text-neutral-600 mt-8 font-medium">
                    &copy; 2026 Heylon Systems. Restricted Access.
                </p>

            </motion.div>
        </div>
    );
}
