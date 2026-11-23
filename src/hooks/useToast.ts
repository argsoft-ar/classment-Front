import { useState, useCallback, useRef } from "react";

import type { ToastType } from "../context/toast.context";

interface ToastState {
  message: string;
  type: ToastType;
  visible: boolean;
}

const TOAST_DURATION = 4000;

export function useToast() {
  const [toast, setToast] = useState<ToastState>({
    message: "",
    type: "info",
    visible: false,
  });

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, visible: false }));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = "info", durationMs = TOAST_DURATION) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setToast({ message, type, visible: true });
      timerRef.current = setTimeout(hideToast, durationMs);
    },
    [hideToast],
  );

  return { toast, showToast, hideToast };
}
