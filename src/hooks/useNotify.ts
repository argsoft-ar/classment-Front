import { useContext } from "react";
import { ToastContext } from "../context/toast.context";

export function useNotify() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useNotify must be used inside ToastProvider");
  return ctx.notify;
}
