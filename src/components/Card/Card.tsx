import React from "react";
import styles from "./Card.module.css";

interface CardProps {
  title: string;
  value?: string | number;
  description?: string;
  icon?: React.ReactNode;
  variant?: "default" | "stat" | "info" | "alert";
  onClick?: () => void;
}

export function Card({
  title,
  value,
  description,
  icon,
  variant = "default",
  onClick,
}: CardProps) {
  return (
    <div
      className={`${styles.card} ${styles[`card--${variant}`]}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === "Enter" && onClick() : undefined}
    >
      {variant === "stat" ? (
        <>
          {icon && <span className={styles.icon}>{icon}</span>}
          <span className={styles.statValue}>{value ?? "—"}</span>
          <span className={styles.statTitle}>{title}</span>
          {description && (
            <span className={styles.description}>{description}</span>
          )}
        </>
      ) : (
        <>
          <div className={styles.cardHeader}>
            {icon && <span className={styles.icon}>{icon}</span>}
            <span className={styles.cardTitle}>{title}</span>
          </div>
          {value !== undefined && (
            <span className={styles.cardValue}>{value}</span>
          )}
          {description && (
            <span className={styles.description}>{description}</span>
          )}
        </>
      )}
    </div>
  );
}
