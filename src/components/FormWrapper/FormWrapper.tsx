import React from "react";
import styles from "./FormWrapper.module.css";

interface FormWrapperProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function FormWrapper({ title, subtitle, children }: FormWrapperProps) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h1 className={styles.title}>{title}</h1>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  );
}
