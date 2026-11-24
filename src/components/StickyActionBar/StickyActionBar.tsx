import { ButtonGroup } from "../ButtonGroup/ButtonGroup";
import type { ButtonProps } from "../Button/Button";
import styles from "./StickyActionBar.module.css";

export interface StickyActionBarProps {
  visible: boolean;
  message: string;
  actions: ButtonProps[];
}

export function StickyActionBar({ visible, message, actions }: StickyActionBarProps) {
  if (!visible) return null;

  return (
    <div className={styles.bar} role="region" aria-label="Acciones pendientes">
      <span className={styles.message}>{message}</span>
      <ButtonGroup actions={actions} align="end" nowrap />
    </div>
  );
}
