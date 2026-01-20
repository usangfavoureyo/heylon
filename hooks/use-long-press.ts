"use client";

import { useCallback, useRef, useState } from "react";

interface LongPressOptions {
    threshold?: number;
    onStart?: () => void;
    onFinish?: () => void;
    onCancel?: () => void;
}

export function useLongPress(
    callback: (e: React.TouchEvent | React.MouseEvent) => void,
    options: LongPressOptions = {}
) {
    const { threshold = 500, onStart, onFinish, onCancel } = options;
    const isLongPress = useRef(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const start = useCallback(
        (e: React.TouchEvent | React.MouseEvent) => {
            if (onStart) onStart();
            isLongPress.current = false;
            timerRef.current = setTimeout(() => {
                isLongPress.current = true;
                callback(e);
                if (onFinish) onFinish();
            }, threshold);
        },
        [callback, threshold, onStart, onFinish]
    );

    const cancel = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
        if (onCancel) onCancel();
    }, [onCancel]);

    return {
        onMouseDown: start,
        onTouchStart: start,
        onMouseUp: cancel,
        onMouseLeave: cancel,
        onTouchEnd: cancel,
    };
}
