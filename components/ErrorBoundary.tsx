"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("ErrorBoundary caught:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                this.props.fallback || (
                    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center p-8 text-white">
                        <h1 className="text-xl font-medium mb-4">Something went wrong</h1>
                        <p className="text-neutral-400 mb-6 text-center text-sm max-w-sm">
                            The app encountered an error. Please refresh the page or reinstall the app.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-3 bg-white text-black rounded-xl font-medium active:scale-95 transition-transform"
                        >
                            Refresh App
                        </button>
                    </div>
                )
            );
        }

        return this.props.children;
    }
}
