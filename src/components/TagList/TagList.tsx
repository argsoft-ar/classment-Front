import styles from "./TagList.module.css";

export interface TagItem {
  /** Visible text */
  label: string;
  /** Color intent */
  tone?: "neutral" | "info" | "warning" | "success" | "danger";
}

export interface TagListProps {
  /** Tags to render */
  items: TagItem[];
  /** Text shown when there are no tags */
  emptyLabel?: string;
  /** Accessible label */
  ariaLabel?: string;
}

export function TagList({ items, emptyLabel = "—", ariaLabel }: TagListProps) {
  if (items.length === 0) return <span className={styles.empty}>{emptyLabel}</span>;

  return (
    <ul className={styles.list} aria-label={ariaLabel}>
      {items.map((item, index) => (
        <li
          key={`${item.label}-${index}`}
          className={`${styles.tag} ${styles[`tag--${item.tone ?? "neutral"}`]}`}
        >
          {item.label}
        </li>
      ))}
    </ul>
  );
}
