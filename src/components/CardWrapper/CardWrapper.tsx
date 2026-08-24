import React from "react";
import styles from "./CardWrapper.module.css";

interface CardWrapperProps {
  title?: string;
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
}

export function CardWrapper({
  title,
  children,
  columns = 3,
}: CardWrapperProps) {
  return (
    <section className={styles.section}>
      {title && <h2 className={styles.title}>{title}</h2>}
      <div className={`${styles.grid} ${styles[`grid--${columns}`]}`}>
        {children}
      </div>
    </section>
  );
}
