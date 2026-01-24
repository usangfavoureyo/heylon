import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ConvexClientProvider from "./ConvexClientProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ThemeSync } from "@/components/providers/ThemeSync";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Heylon",
    description: "Structure-Gated Decision System",
    manifest: "/manifest.json",
    icons: {
        icon: "/icons/icon-192x192.png",
        apple: "/icons/icon-192x192.png",
    },
    viewport: {
        width: "device-width",
        initialScale: 1,
        maximumScale: 1,
        userScalable: false,
        viewportFit: "cover",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${inter.className} bg-background text-foreground antialiased`} suppressHydrationWarning={true}>
                <ConvexClientProvider>
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="dark"
                        enableSystem
                        disableTransitionOnChange
                    >
                        <ThemeSync />
                        <ServiceWorkerRegistration />
                        <ErrorBoundary>
                            {children}
                        </ErrorBoundary>
                    </ThemeProvider>
                </ConvexClientProvider>
            </body>
        </html>
    );
}
