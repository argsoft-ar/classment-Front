import type { ReactNode } from "react";
import { CircleCheck, CircleX, Info, TriangleAlert } from "lucide-react";
import styles from "./Callout.module.css";

export interface CalloutProps {
  /** Main message */
  message: string;
  /** Optional bold heading */
  title?: string;
  /** Color intent */
  variant?: "info" | "success" | "warning" | "danger";
  /** Extra content below the message (e.g. a list or actions) */
  children?: ReactNode;
}

function CalloutIcon({ variant }: { variant: NonNullable<CalloutProps["variant"]> }) {
  const iconProps = { size: 20, "aria-hidden": true } as const;
  switch (variant) {
    case "success":
      return <CircleCheck {...iconProps} />;
    case "danger":
      return <CircleX {...iconProps} />;
    case "warning":
      return <TriangleAlert {...iconProps} />;
    default:
      return <Info {...iconProps} />;
  }
}

export function Callout({ message, title, variant = "info", children }: CalloutProps) {
  return (
    <div
      className={`${styles.callout} ${styles[`callout--${variant}`]}`}
      role={variant === "danger" ? "alert" : "note"}
    >
      <span className={styles.icon} aria-hidden="true">
        <CalloutIcon variant={variant} />
      </span>
      <div className={styles.content}>
        {title && <p className={styles.title}>{title}</p>}
        <p className={styles.message}>{message}</p>
        {children}
      </div>
    </div>
  );
}
