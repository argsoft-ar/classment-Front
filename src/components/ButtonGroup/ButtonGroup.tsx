import { Button, type ButtonProps } from "../Button/Button";
import styles from "./ButtonGroup.module.css";

export interface ButtonGroupProps {
  /** Buttons to render, in order */
  actions: ButtonProps[];
  /** Horizontal alignment */
  align?: "start" | "end" | "stretch";
  /** Accessible label for the group */
  ariaLabel?: string;
}

export function ButtonGroup({ actions, align = "start", ariaLabel }: ButtonGroupProps) {
  if (actions.length === 0) return null;

  return (
    <div
      className={`${styles.group} ${styles[`group--${align}`]}`}
      role="group"
      aria-label={ariaLabel}
    >
      {actions.map((action, index) => (
        <Button key={`${action.label}-${index}`} {...action} />
      ))}
    </div>
  );
}
