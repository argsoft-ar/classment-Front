import { Button, type ButtonProps } from "../Button/Button";
import styles from "./ButtonGroup.module.css";

export interface ButtonGroupProps {
  /** Buttons to render, in order */
  actions: ButtonProps[];
  /** Horizontal alignment */
  align?: "start" | "end" | "stretch";
  /** Keep buttons on a single line in desktop */
  nowrap?: boolean;
  /** Accessible label for the group */
  ariaLabel?: string;
}

export function ButtonGroup({
  actions,
  align = "start",
  nowrap = false,
  ariaLabel,
}: ButtonGroupProps) {
  if (actions.length === 0) return null;

  return (
    <div
      className={`${styles.group} ${styles[`group--${align}`]} ${nowrap ? styles["group--nowrap"] : ""}`}
      role="group"
      aria-label={ariaLabel}
    >
      {actions.map((action, index) => (
        <Button key={`${action.label}-${index}`} {...action} />
      ))}
    </div>
  );
}
