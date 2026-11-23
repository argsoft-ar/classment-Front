import styles from "./StatusBadge.module.css";
import { STATUS_LABELS, type BadgeStatus } from "./status";

export type { BadgeStatus, SubjectStatus } from "./status";

export interface StatusBadgeProps {
  /** Estado a representar */
  status: BadgeStatus;
  /** Sobrescribe la etiqueta por defecto */
  label?: string;
  /** Tamaño */
  size?: "sm" | "md";
}

export function StatusBadge({ status, label, size = "md" }: StatusBadgeProps) {
  return (
    <span
      className={`${styles.badge} ${styles[`badge--${status}`]} ${styles[`badge--${size}`]}`}
    >
      <span className={styles.dot} aria-hidden="true" />
      {label ?? STATUS_LABELS[status]}
    </span>
  );
}
