import { useId } from "react";
import { StatusBadge } from "../StatusBadge/StatusBadge";
import { Select } from "../Select/Select";
import { EmptyState } from "../EmptyState/EmptyState";
import {
  STATUS_LABELS,
  SUBJECT_STATUSES,
  type SubjectStatus,
} from "../StatusBadge/status";
import styles from "./SubjectStatusGrid.module.css";

export interface StatusGridSubject {
  /** Id de la materia */
  id: string;
  /** Nombre de la materia */
  name: string;
  /** Estado actual */
  status: SubjectStatus;
}

export interface StatusGridGroup {
  /** Año de la carrera (1, 2, 3...) */
  yearLevel: number;
  /** Materias del año */
  subjects: StatusGridSubject[];
}

export interface SubjectStatusGridProps {
  /** Materias agrupadas por año */
  groups: StatusGridGroup[];
  /** Habilita la edición del estado por materia */
  editable?: boolean;
  /** Estados seleccionables en modo edición */
  statusOptions?: SubjectStatus[];
  /** Se invoca al cambiar el estado de una materia */
  onStatusChange?: (subjectId: string, status: SubjectStatus) => void;
  /** Deshabilita los controles (ej. mientras se guarda) */
  disabled?: boolean;
}

export function SubjectStatusGrid({
  groups,
  editable = false,
  statusOptions = SUBJECT_STATUSES,
  onStatusChange,
  disabled = false,
}: SubjectStatusGridProps) {
  const baseId = useId();

  if (groups.length === 0) {
    return <EmptyState title="No hay materias para mostrar" />;
  }

  const sortedGroups = [...groups].sort((a, b) => a.yearLevel - b.yearLevel);

  const optionsFor = (current: SubjectStatus): SubjectStatus[] =>
    statusOptions.includes(current) ? statusOptions : [current, ...statusOptions];

  const handleChange = (
    subjectId: string,
    value: string,
    allowed: SubjectStatus[],
  ) => {
    const next = allowed.find((status) => status === value);
    if (next && onStatusChange) onStatusChange(subjectId, next);
  };

  return (
    <div className={styles.grid}>
      {sortedGroups.map((group) => {
        const headingId = `${baseId}-year-${group.yearLevel}`;
        return (
          <section
            key={group.yearLevel}
            className={styles.group}
            aria-labelledby={headingId}
          >
            <h3 id={headingId} className={styles.groupTitle}>
              {group.yearLevel}° Año
              <span className={styles.groupCount}>
                {group.subjects.length}{" "}
                {group.subjects.length === 1 ? "materia" : "materias"}
              </span>
            </h3>

            <ul className={styles.list}>
              {group.subjects.map((subject) => {
                const allowed = optionsFor(subject.status);
                return (
                  <li
                    key={subject.id}
                    className={`${styles.item} ${styles[`item--${subject.status}`]}`}
                  >
                    <span className={styles.subjectName}>{subject.name}</span>
                    {editable ? (
                      <div className={styles.control}>
                        <Select
                          name={`status-${subject.id}`}
                          label={`Estado de ${subject.name}`}
                          hideLabel
                          size="sm"
                          value={subject.status}
                          options={allowed.map((status) => ({
                            value: status,
                            label: STATUS_LABELS[status],
                          }))}
                          onChange={(value) =>
                            handleChange(subject.id, value, allowed)
                          }
                          disabled={disabled}
                        />
                      </div>
                    ) : (
                      <StatusBadge status={subject.status} size="sm" />
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
