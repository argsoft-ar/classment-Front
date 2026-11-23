import { useEffect, useId, useRef, type MouseEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Button, type ButtonProps } from "../Button/Button";
import styles from "./Modal.module.css";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

export interface ModalProps {
  /** Controla la visibilidad */
  isOpen: boolean;
  /** Título del diálogo */
  title: string;
  /** Se invoca al cerrar (Escape, overlay o botón cerrar) */
  onClose: () => void;
  /** Contenido del cuerpo */
  children: ReactNode;
  /** Botones de acción del pie */
  actions?: ButtonProps[];
  /** Ancho máximo del diálogo */
  size?: "sm" | "md" | "lg";
  /** Etiqueta accesible del botón cerrar */
  closeLabel?: string;
}

export function Modal({
  isOpen,
  title,
  onClose,
  children,
  actions,
  size = "md",
  closeLabel = "Cerrar",
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const pointerDownOnOverlay = useRef(false);
  const titleId = useId();

  // Foco inicial, restauración de foco y bloqueo de scroll
  useEffect(() => {
    if (!isOpen) return;
    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    dialogRef.current?.focus();
    document.body.classList.add(styles.bodyLocked);

    return () => {
      document.body.classList.remove(styles.bodyLocked);
      previouslyFocused?.focus();
    };
  }, [isOpen]);

  // Escape + focus trap
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;

      const dialog = dialogRef.current;
      if (!dialog) return;
      const focusables = Array.from(
        dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      );
      if (focusables.length === 0) {
        e.preventDefault();
        dialog.focus();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;

      if (e.shiftKey && (active === first || active === dialog)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      } else if (!dialog.contains(active)) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    pointerDownOnOverlay.current = e.target === e.currentTarget;
  };

  const handleOverlayClick = (e: MouseEvent<HTMLDivElement>) => {
    if (pointerDownOnOverlay.current && e.target === e.currentTarget) {
      onClose();
    }
    pointerDownOnOverlay.current = false;
  };

  return createPortal(
    <div
      className={styles.overlay}
      onMouseDown={handleOverlayMouseDown}
      onClick={handleOverlayClick}
    >
      <div
        ref={dialogRef}
        className={`${styles.dialog} ${styles[`dialog--${size}`]}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <header className={styles.header}>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label={closeLabel}
          >
            <X size={20} aria-hidden="true" />
          </button>
        </header>

        <div className={styles.body}>{children}</div>

        {actions && actions.length > 0 && (
          <footer className={styles.footer}>
            {actions.map((action, index) => (
              <Button key={`${action.label}-${index}`} {...action} />
            ))}
          </footer>
        )}
      </div>
    </div>,
    document.body,
  );
}
