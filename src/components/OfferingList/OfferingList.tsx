import { useId } from "react";
import { Calendar, User } from "lucide-react";
import { Button } from "../Button/Button";
import { StatusBadge, type BadgeStatus } from "../StatusBadge/StatusBadge";
import { yearLabel } from "../../utils/labels.utils";
import styles from "./OfferingList.module.css";

export type OfferingRowVisualState =
  | "ENROLLED"
  | "AVAILABLE"
  | "ALREADY_APPROVED"
  | "ALREADY_REGULARIZED"
  | "CURSANDO"
  | "BLOCKED";

export interface OfferingModalityOption {
  value: "REGULAR" | "LIBRE";
  label: string;
  allowed: boolean;
}

export interface OfferingListItem {
  id: string;
  subjectName: string;
  yearLevel: number;
  type: "CURSADA" | "FINAL";
  visualState: OfferingRowVisualState;
  statusLabel?: string;
  summaryHint?: string;
  teacherName?: string;
  examDate?: string;
  enrolled?: boolean;
  modality?: "REGULAR" | "LIBRE";
  modalityOptions?: OfferingModalityOption[];
  onModalityChange?: (value: string) => void;
  onEnroll?: () => void;
  onDrop?: () => void;
  enrollLabel?: string;
  blockedEnrollLabel?: string;
  dropLabel?: string;
  isLoading?: boolean;
}

export interface OfferingListGroup {
  yearLevel: number;
  items: OfferingListItem[];
}

export interface OfferingListProps {
  groups: OfferingListGroup[];
}

const BADGE_BY_STATE: Record<OfferingRowVisualState, BadgeStatus> = {
  ENROLLED: "ACTIVA",
  AVAILABLE: "HABILITADA",
  ALREADY_APPROVED: "APROBADA",
  ALREADY_REGULARIZED: "REGULARIZADA",
  CURSANDO: "CURSANDO",
  BLOCKED: "BLOQUEADA",
};

function formatExamDate(value: string): string {
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  const date = dateOnly
    ? new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]))
    : new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return dateOnly
    ? date.toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : date.toLocaleString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
}

function isCompletedState(state: OfferingRowVisualState): boolean {
  return (
    state === "ALREADY_APPROVED" ||
    state === "ALREADY_REGULARIZED" ||
    state === "CURSANDO"
  );
}

export function OfferingList({ groups }: OfferingListProps) {
  const baseId = useId();
  const sortedGroups = [...groups].sort((a, b) => a.yearLevel - b.yearLevel);

  return (
    <div className={styles.groups}>
      {sortedGroups.map((group) => {
        const headingId = `${baseId}-year-${group.yearLevel}`;
        return (
          <section key={group.yearLevel} className={styles.group} aria-labelledby={headingId}>
            <header className={styles.groupHeader}>
              <h3 id={headingId} className={styles.groupTitle}>
                {yearLabel(group.yearLevel)}
              </h3>
              <span className={styles.groupCount}>
                {group.items.length} {group.items.length === 1 ? "materia" : "materias"}
              </span>
            </header>

            <ul className={styles.list}>
              {group.items.map((item) => {
                const badgeStatus = BADGE_BY_STATE[item.visualState];
                const badgeLabel =
                  item.statusLabel ?? (item.visualState === "ENROLLED" ? "Inscripto" : undefined);
                const completed = isCompletedState(item.visualState);
                const showModality =
                  !item.enrolled &&
                  item.visualState !== "ALREADY_APPROVED" &&
                  item.modalityOptions &&
                  item.modalityOptions.length > 0 &&
                  item.onModalityChange;

                const showDrop = item.enrolled && item.onDrop !== undefined;
                const showEnroll =
                  !item.enrolled && !completed && item.onEnroll !== undefined;

                const enrollLabel =
                  item.visualState === "BLOCKED"
                    ? (item.blockedEnrollLabel ?? "Intentar inscribirme")
                    : (item.enrollLabel ?? "Inscribirme");

                const hasActions = Boolean(showModality || showDrop || showEnroll);

                return (
                  <li
                    key={item.id}
                    className={`${styles.row} ${styles[`row--${item.visualState}`]} ${
                      completed ? styles.rowMuted : ""
                    }`}
                  >
                    <div className={styles.main}>
                      <div className={styles.titleRow}>
                        <span className={styles.subjectName}>{item.subjectName}</span>
                        <span className={styles.mobileBadge}>
                          <StatusBadge status={badgeStatus} label={badgeLabel} size="sm" />
                        </span>
                      </div>

                      {(item.teacherName || item.examDate) && (
                        <div className={styles.meta}>
                          {item.teacherName && (
                            <span className={styles.metaItem}>
                              <User className={styles.metaIcon} aria-hidden="true" />
                              {item.teacherName}
                            </span>
                          )}
                          {item.examDate && (
                            <span className={styles.metaItem}>
                              <Calendar className={styles.metaIcon} aria-hidden="true" />
                              <time dateTime={item.examDate}>{formatExamDate(item.examDate)}</time>
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className={styles.statusZone}>
                      <span className={styles.desktopBadge}>
                        <StatusBadge status={badgeStatus} label={badgeLabel} size="sm" />
                      </span>
                      {item.summaryHint && (
                        <span
                          className={`${styles.hint} ${
                            item.visualState === "BLOCKED" ? styles.hintBlocked : ""
                          }`}
                        >
                          {item.summaryHint}
                        </span>
                      )}
                    </div>

                    {hasActions && (
                      <div className={styles.actionsZone}>
                        {showModality && item.modalityOptions && (
                          <div
                            className={styles.segmented}
                            role="group"
                            aria-label={`Modalidad para ${item.subjectName}`}
                          >
                            {item.modalityOptions.map((opt) => {
                              const selected = item.modality === opt.value;
                              return (
                                <button
                                  key={opt.value}
                                  type="button"
                                  disabled={item.isLoading}
                                  aria-pressed={selected}
                                  className={`${styles.segmentBtn} ${
                                    selected ? styles.segmentActive : ""
                                  }`}
                                  onClick={() => item.onModalityChange?.(opt.value)}
                                >
                                  <span
                                    className={`${styles.segmentDot} ${
                                      opt.allowed ? styles.dotAllowed : styles.dotBlocked
                                    }`}
                                    aria-hidden="true"
                                  />
                                  {opt.label}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {showDrop && (
                          <Button
                            label={item.dropLabel ?? "Dar de baja"}
                            variant="danger"
                            size="sm"
                            isLoading={item.isLoading}
                            ariaLabel={`${item.dropLabel ?? "Dar de baja"}: ${item.subjectName}`}
                            onClick={item.onDrop}
                          />
                        )}

                        {showEnroll && (
                          <Button
                            label={enrollLabel}
                            variant={item.visualState === "BLOCKED" ? "secondary" : "primary"}
                            size="sm"
                            isLoading={item.isLoading}
                            ariaLabel={`${enrollLabel}: ${item.subjectName}`}
                            onClick={item.onEnroll}
                          />
                        )}
                      </div>
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
