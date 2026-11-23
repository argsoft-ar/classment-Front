import { useMemo, type ReactNode } from "react";
import { NotificationToast } from "../components/NotificationToast/NotificationToast";
import { useToast } from "../hooks/useToast";
import { ToastContext } from "./toast.context";

/** App-wide toast: hooks call `useNotify()`, pages never render toasts themselves. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const { toast, showToast, hideToast } = useToast();
  const value = useMemo(() => ({ notify: showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <NotificationToast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onClose={hideToast}
      />
    </ToastContext.Provider>
  );
}
