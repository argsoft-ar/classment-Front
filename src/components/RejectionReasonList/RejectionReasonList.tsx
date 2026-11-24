import { useId } from "react";
import { CircleX } from "lucide-react";
import { StatusBadge } from "../StatusBadge/StatusBadge";
import { STATUS_LABELS } from "../StatusBadge/status";
import type { RejectionReason } from "./RejectionReason.types";
import styles from "./RejectionReasonList.module.css";

export type { RejectionReason } from "./RejectionReason.types";

export interface RejectionReasonListProps {
  /** Motivos de rechazo a mostrar */
  reasons: RejectionReason[];
  /** Título de la lista */
  title?: string;
}

function formatReasonMessage(message: string): string {
  let formatted = message;
  for (const [key, label] of Object.entries(STATUS_LABELS)) {
    // Reemplaza ocurrencias de palabras de estado en mayúsculas (ej: REGULARIZADA -> Regularizada)
    const regex = new RegExp(`\\b${key}\\b`, "g");
    formatted = formatted.replace(regex, label);
  }
  return formatted;
}

export function RejectionReasonList({
  reasons,
  title = "Requisitos no cumplidos",
}: RejectionReasonListProps) {
  const titleId = useId();

  if (reasons.length === 0) return null;

  return (
    <div className={styles.container}>
      {title && (
        <p id={titleId} className={styles.title}>
          {title}
        </p>
      )}
      <ul
        className={styles.list}
        aria-labelledby={title ? titleId : undefined}
      >
        {reasons.map((reason, index) => (
          <li
            key={`${reason.code}-${index}`}
            className={styles.item}
            data-code={reason.code}
          >
            <CircleX className={styles.icon} size={20} aria-hidden="true" />
            <div className={styles.content}>
              <p className={styles.message}>{formatReasonMessage(reason.message)}</p>

              {reason.requiredSubjectName && (
                <p className={styles.subject}>
                  Correlativa:{" "}
                  <strong className={styles.subjectName}>
                    {reason.requiredSubjectName}
                  </strong>
                </p>
              )}

              {(reason.requiredStatus || reason.currentStatus) && (
                <dl className={styles.statusCompare}>
                  {reason.requiredStatus && (
                    <div className={styles.statusItem}>
                      <dt className={styles.statusLabel}>Requerido</dt>
                      <dd className={styles.statusValue}>
                        <StatusBadge status={reason.requiredStatus} size="sm" />
                      </dd>
                    </div>
                  )}
                  {reason.currentStatus && (
                    <div className={styles.statusItem}>
                      <dt className={styles.statusLabel}>Actual</dt>
                      <dd className={styles.statusValue}>
                        <StatusBadge status={reason.currentStatus} size="sm" />
                      </dd>
                    </div>
                  )}
                </dl>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
