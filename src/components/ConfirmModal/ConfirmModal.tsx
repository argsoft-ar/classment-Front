import type { ReactNode } from "react";
import { Modal } from "../Modal/Modal";
import styles from "./ConfirmModal.module.css";

export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  /** Question / explanation shown in the body */
  message: string;
  onConfirm: () => void;
  onClose: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Visual intent of the confirm button */
  variant?: "primary" | "danger";
  isLoading?: boolean;
  /** Extra content below the message */
  children?: ReactNode;
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onClose,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "primary",
  isLoading = false,
  children,
}: ConfirmModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      title={title}
      onClose={onClose}
      size="sm"
      actions={[
        { label: cancelLabel, variant: "secondary", onClick: onClose, disabled: isLoading },
        { label: confirmLabel, variant, onClick: onConfirm, isLoading },
      ]}
    >
      <p className={styles.message}>{message}</p>
      {children}
    </Modal>
  );
}
