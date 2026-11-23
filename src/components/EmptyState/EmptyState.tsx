import { Inbox, type LucideIcon } from "lucide-react";
import { Button, type ButtonProps } from "../Button/Button";
import styles from "./EmptyState.module.css";

export interface EmptyStateProps {
  /** Título principal */
  title: string;
  /** Texto de apoyo */
  description?: string;
  /** Acción sugerida */
  action?: ButtonProps;
  /** Ícono Lucide decorativo (por defecto `Inbox`) */
  icon?: LucideIcon;
}

export function EmptyState({
  title,
  description,
  action,
  icon: Icon = Inbox,
}: EmptyStateProps) {
  return (
    <div className={styles.emptyState}>
      <Icon className={styles.icon} strokeWidth={1.5} aria-hidden="true" />
      <h3 className={styles.title}>{title}</h3>
      {description && <p className={styles.description}>{description}</p>}
      {action && (
        <div className={styles.action}>
          <Button {...action} />
        </div>
      )}
    </div>
  );
}
