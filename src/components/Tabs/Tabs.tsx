import { useId, useRef, type KeyboardEvent, type ReactNode } from "react";
import styles from "./Tabs.module.css";

export interface TabItem {
  /** Identificador único de la pestaña */
  id: string;
  /** Texto visible */
  label: string;
  /** Contador opcional mostrado junto al label */
  count?: number;
}

export interface TabsProps {
  /** Pestañas disponibles */
  tabs: TabItem[];
  /** Id de la pestaña activa */
  activeId: string;
  /** Se invoca con el id de la pestaña seleccionada */
  onChange: (id: string) => void;
  /** Etiqueta accesible del tablist */
  ariaLabel?: string;
  /** Contenido del panel de la pestaña activa */
  children?: ReactNode;
}

export function Tabs({
  tabs,
  activeId,
  onChange,
  ariaLabel = "Secciones",
  children,
}: TabsProps) {
  const baseId = useId();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const panelId = `${baseId}-panel`;
  const tabDomId = (id: string) => `${baseId}-tab-${id}`;

  const activeIndex = tabs.findIndex((t) => t.id === activeId);
  const focusableIndex = activeIndex >= 0 ? activeIndex : 0;
  const hasPanel = children !== undefined && children !== null;

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const total = tabs.length;
    let next = -1;
    if (e.key === "ArrowRight") next = (index + 1) % total;
    else if (e.key === "ArrowLeft") next = (index - 1 + total) % total;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = total - 1;
    if (next < 0) return;

    e.preventDefault();
    tabRefs.current[next]?.focus();
    onChange(tabs[next].id);
  };

  return (
    <div className={styles.tabs}>
      <div className={styles.tablist} role="tablist" aria-label={ariaLabel}>
        {tabs.map((tab, index) => {
          const isActive = tab.id === activeId;
          return (
            <button
              key={tab.id}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              id={tabDomId(tab.id)}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={hasPanel && isActive ? panelId : undefined}
              tabIndex={index === focusableIndex ? 0 : -1}
              className={`${styles.tab} ${isActive ? styles.tabActive : ""}`}
              onClick={() => onChange(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, index)}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={styles.count}>{tab.count}</span>
              )}
            </button>
          );
        })}
      </div>

      {hasPanel && (
        <div
          id={panelId}
          role="tabpanel"
          aria-labelledby={activeIndex >= 0 ? tabDomId(activeId) : undefined}
          tabIndex={0}
          className={styles.panel}
        >
          {children}
        </div>
      )}
    </div>
  );
}
