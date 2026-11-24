import styles from "./FilterBar.module.css";

export interface FilterBarOption {
  value: string;
  label: string;
  count?: number;
}

export interface FilterBarGroup {
  id: string;
  label?: string;
  value: string;
  options: FilterBarOption[];
  onChange: (value: string) => void;
  ariaLabel?: string;
}

export interface FilterBarProps {
  groups: FilterBarGroup[];
}

export function FilterBar({ groups }: FilterBarProps) {
  const visibleGroups = groups.filter((g) => g.options.length > 0);
  if (visibleGroups.length === 0) return null;

  return (
    <div className={styles.bar}>
      {visibleGroups.map((group) => (
        <div
          key={group.id}
          className={styles.group}
          role="group"
          aria-label={group.ariaLabel ?? group.label}
        >
          {group.label && <span className={styles.groupLabel}>{group.label}</span>}
          <div className={styles.options}>
            {group.options.map((opt) => {
              const isActive = opt.value === group.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  aria-pressed={isActive}
                  className={`${styles.chip} ${isActive ? styles.chipActive : ""}`}
                  onClick={() => group.onChange(opt.value)}
                >
                  <span>{opt.label}</span>
                  {opt.count !== undefined && (
                    <span className={styles.count}>{opt.count}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
