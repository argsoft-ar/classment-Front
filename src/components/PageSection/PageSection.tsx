import { useId, type ReactNode } from "react";
import styles from "./PageSection.module.css";

export interface PageSectionProps {
  /** Section heading */
  title?: string;
  /** Supporting text below the heading */
  description?: string;
  /** Controls aligned to the heading (buttons, selects) */
  actions?: ReactNode;
  /** Section body */
  children?: ReactNode;
  /** Visual container */
  variant?: "plain" | "surface";
}

export function PageSection({
  title,
  description,
  actions,
  children,
  variant = "plain",
}: PageSectionProps) {
  const headingId = useId();
  const hasHeader = Boolean(title || description || actions);

  return (
    <section
      className={`${styles.section} ${styles[`section--${variant}`]}`}
      aria-labelledby={title ? headingId : undefined}
    >
      {hasHeader && (
        <header className={styles.header}>
          <div className={styles.text}>
            {title && (
              <h2 id={headingId} className={styles.title}>
                {title}
              </h2>
            )}
            {description && <p className={styles.description}>{description}</p>}
          </div>
          {actions && <div className={styles.actions}>{actions}</div>}
        </header>
      )}
      {children !== undefined && children !== null && (
        <div className={styles.body}>{children}</div>
      )}
    </section>
  );
}
