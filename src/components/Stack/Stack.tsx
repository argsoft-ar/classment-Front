import type { ReactNode } from "react";
import styles from "./Stack.module.css";

export interface StackProps {
  children: ReactNode;
  /** Main axis */
  direction?: "column" | "row";
  /** Spacing between children */
  gap?: "none" | "xs" | "sm" | "md" | "lg" | "xl";
  /** Cross-axis alignment */
  align?: "stretch" | "start" | "center" | "end";
  /** Main-axis distribution */
  justify?: "start" | "center" | "end" | "between";
  /** Allow children to wrap (row direction) */
  wrap?: boolean;
  /** Row only from tablet up; column on mobile */
  responsive?: boolean;
  className?: string;
}

export function Stack({
  children,
  direction = "column",
  gap = "md",
  align = "stretch",
  justify = "start",
  wrap = false,
  responsive = false,
  className = "",
}: StackProps) {
  const classes = [
    styles.stack,
    styles[`stack--${direction}`],
    styles[`gap--${gap}`],
    styles[`align--${align}`],
    styles[`justify--${justify}`],
    wrap ? styles.wrap : "",
    responsive ? styles.responsive : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <div className={classes}>{children}</div>;
}
