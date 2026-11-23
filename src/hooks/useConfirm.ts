import { useCallback, useState } from "react";
import type { ConfirmModalProps } from "../components/ConfirmModal/ConfirmModal";

export interface ConfirmRequest {
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: "primary" | "danger";
  /** Runs when the user confirms; the dialog closes when it settles. */
  onConfirm: () => Promise<void>;
}

/** Imperative confirmation dialog: `request({...})` then render `<ConfirmModal {...modalProps} />`. */
export function useConfirm() {
  const [pending, setPending] = useState<ConfirmRequest | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const request = useCallback((req: ConfirmRequest) => setPending(req), []);

  const onClose = useCallback(() => {
    if (!isBusy) setPending(null);
  }, [isBusy]);

  const onConfirm = useCallback(async () => {
    if (!pending) return;
    setIsBusy(true);
    try {
      await pending.onConfirm();
    } finally {
      setIsBusy(false);
      setPending(null);
    }
  }, [pending]);

  const modalProps: ConfirmModalProps = {
    isOpen: pending !== null,
    title: pending?.title ?? "",
    message: pending?.message ?? "",
    confirmLabel: pending?.confirmLabel,
    variant: pending?.variant,
    isLoading: isBusy,
    onClose,
    onConfirm: () => void onConfirm(),
  };

  return { request, modalProps };
}
