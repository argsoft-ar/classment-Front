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
  /** Información complementaria opcional (ej. Nota, Equivalencia) */
  meta?: string;
  /** Resalta la tarjeta cuando hay cambios sin guardar */
  isModified?: boolean;
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
        const total = group.subjects.length;
        const approved = group.subjects.filter((s) => s.status === "APROBADA").length;
        const pct = total > 0 ? Math.round((approved / total) * 100) : 0;

        return (
          <section
            key={group.yearLevel}
            className={styles.group}
            aria-labelledby={headingId}
          >
            <div className={styles.groupHeader}>
              <h3 id={headingId} className={styles.groupTitle}>
                <span>{group.yearLevel}° Año</span>
                <span className={styles.groupCount}>
                  {total} {total === 1 ? "materia" : "materias"} · {approved}/{total} aprobadas
                </span>
              </h3>
              {total > 0 && (
                <div className={styles.progressTrack} aria-hidden="true">
                  <div className={styles.progressFill} style={{ width: `${pct}%` }} />
                </div>
              )}
            </div>

            <ul className={styles.list}>
              {group.subjects.map((subject) => {
                const allowed = optionsFor(subject.status);
                return (
                  <li
                    key={subject.id}
                    className={`${styles.item} ${styles[`item--${subject.status}`]} ${
                      subject.isModified ? styles.itemModified : ""
                    }`}
                  >
                    <div className={styles.subjectInfo}>
                      <span className={styles.subjectName}>{subject.name}</span>
                      {subject.meta && <span className={styles.subjectMeta}>{subject.meta}</span>}
                    </div>
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
