import type { BadgeStatus } from "../StatusBadge/status";
import styles from "./ProgressSummary.module.css";

export interface ProgressItem {
  /** Etiqueta del contador (ej. "Aprobadas") */
  label: string;
  /** Valor del contador */
  value: number | string;
  /** Estado asociado (define el color de acento) */
  status?: BadgeStatus;
}

export interface ProgressSummaryProps {
  /** Contadores a mostrar */
  items: ProgressItem[];
  /** Etiqueta accesible del resumen */
  ariaLabel?: string;
}

export function ProgressSummary({
  items,
  ariaLabel = "Resumen de progreso",
}: ProgressSummaryProps) {
  return (
    <ul className={styles.grid} aria-label={ariaLabel}>
      {items.map((item, index) => (
        <li
          key={`${item.label}-${index}`}
          className={`${styles.item} ${item.status ? styles[`item--${item.status}`] : ""}`}
        >
          <span className={styles.value}>{item.value}</span>
          <span className={styles.label}>{item.label}</span>
        </li>
      ))}
    </ul>
  );
}
