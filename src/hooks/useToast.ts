import { useState, useCallback, useRef } from "react";

type ToastType = "success" | "error" | "warning" | "info";

interface ToastState {
  message: string;
  type: ToastType;
  visible: boolean;
}

const TOAST_DURATION = 3000;

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
    (message: string, type: ToastType = "info") => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setToast({ message, type, visible: true });
      timerRef.current = setTimeout(hideToast, TOAST_DURATION);
    },
    [hideToast],
  );

  return { toast, showToast, hideToast };
}
