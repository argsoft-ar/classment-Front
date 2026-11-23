import { createContext } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastContextValue {
  notify: (message: string, type?: ToastType, durationMs?: number) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);
