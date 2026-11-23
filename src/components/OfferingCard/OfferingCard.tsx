import { useId } from "react";
import { BookOpen, Calendar, CircleCheck, User } from "lucide-react";
import { Button } from "../Button/Button";
import { Select, type SelectOption } from "../Select/Select";
import { StatusBadge } from "../StatusBadge/StatusBadge";
import { RejectionReasonList } from "../RejectionReasonList/RejectionReasonList";
import type { RejectionReason } from "../RejectionReasonList/RejectionReason.types";
import styles from "./OfferingCard.module.css";

export interface OfferingValidation {
  /** Si la inscripción está habilitada */
  allowed: boolean;
  /** Motivos por los que no está habilitada */
  reasons: RejectionReason[];
}

export interface OfferingCardProps {
  /** Nombre de la materia */
  subjectName: string;
  /** Año de la carrera */
  yearLevel: number;
  /** Tipo de oferta */
  type: "CURSADA" | "FINAL";
  /** Fecha del examen (ISO: YYYY-MM-DD o fecha-hora) */
  examDate?: string;
  /** Docente a cargo */
  teacherName?: string;
  /** Resultado de validación de correlativas */
  validation: OfferingValidation;
  /** Acción de inscripción */
  onEnroll?: () => void;
  /** Acción de baja */
  onDrop?: () => void;
  /** El alumno ya está inscripto */
  enrolled?: boolean;
  /** Acción en curso */
  isLoading?: boolean;
  /** Texto del botón de inscripción */
  enrollLabel?: string;
  /** Texto del botón de baja */
  dropLabel?: string;
  /** Período / turno al que pertenece la oferta */
  periodLabel?: string;
  /** Modalidad seleccionada (ej. mesas de final Regular / Libre) */
  modality?: string;
  /** Opciones de modalidad; si se omite no se muestra el selector */
  modalityOptions?: SelectOption[];
  /** Cambio de modalidad */
  onModalityChange?: (value: string) => void;
  /**
   * Permite intentar la inscripción aun estando bloqueada: el backend decide y
   * devuelve el detalle del rebote.
   */
  allowBlockedAttempt?: boolean;
  /** Texto del botón cuando la oferta está bloqueada y se permite intentar */
  blockedEnrollLabel?: string;
}

const TYPE_LABELS: Record<OfferingCardProps["type"], string> = {
  CURSADA: "Cursada",
  FINAL: "Mesa de final",
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

export function OfferingCard({
  subjectName,
  yearLevel,
  type,
  examDate,
  teacherName,
  validation,
  onEnroll,
  onDrop,
  enrolled = false,
  isLoading = false,
  enrollLabel = "Inscribirme",
  dropLabel = "Darme de baja",
  periodLabel,
  modality,
  modalityOptions,
  onModalityChange,
  allowBlockedAttempt = false,
  blockedEnrollLabel = "Intentar inscribirme",
}: OfferingCardProps) {
  const titleId = useId();
  const showDrop = enrolled && onDrop !== undefined;
  const showEnroll = !enrolled && onEnroll !== undefined;
  const showFooter = enrolled || showDrop || showEnroll;
  const showModality =
    !enrolled && modalityOptions !== undefined && modalityOptions.length > 0 && onModalityChange;
  const isBlockedAttempt = !validation.allowed && allowBlockedAttempt;

  return (
    <article
      className={`${styles.card} ${validation.allowed ? styles["card--allowed"] : styles["card--blocked"]}`}
      aria-labelledby={titleId}
    >
      <header className={styles.header}>
        <div className={styles.headingGroup}>
          <span className={styles.typeTag}>
            <BookOpen className={styles.inlineIcon} aria-hidden="true" />
            {TYPE_LABELS[type]}
          </span>
          <h3 id={titleId} className={styles.title}>
            {subjectName}
          </h3>
        </div>
        <StatusBadge status={validation.allowed ? "HABILITADA" : "BLOQUEADA"} />
      </header>

      <dl className={styles.meta}>
        <div className={styles.metaItem}>
          <dt className={styles.metaLabel}>Año</dt>
          <dd className={styles.metaValue}>{yearLevel}° Año</dd>
        </div>
        {periodLabel && (
          <div className={styles.metaItem}>
            <dt className={styles.metaLabel}>Período</dt>
            <dd className={styles.metaValue}>{periodLabel}</dd>
          </div>
        )}
        {examDate && (
          <div className={styles.metaItem}>
            <dt className={styles.metaLabel}>
              <Calendar className={styles.inlineIcon} aria-hidden="true" />
              Fecha de examen
            </dt>
            <dd className={styles.metaValue}>
              <time dateTime={examDate}>{formatExamDate(examDate)}</time>
            </dd>
          </div>
        )}
        {teacherName && (
          <div className={styles.metaItem}>
            <dt className={styles.metaLabel}>
              <User className={styles.inlineIcon} aria-hidden="true" />
              Docente
            </dt>
            <dd className={styles.metaValue}>{teacherName}</dd>
          </div>
        )}
      </dl>

      {showModality && (
        <Select
          name={`modality-${titleId}`}
          label="Modalidad"
          value={modality ?? ""}
          options={modalityOptions}
          onChange={onModalityChange}
          size="sm"
          disabled={isLoading}
        />
      )}

      {!validation.allowed && validation.reasons.length > 0 && (
        <RejectionReasonList reasons={validation.reasons} />
      )}

      {showFooter && (
        <footer className={styles.footer}>
          {enrolled && (
            <span className={styles.enrolledTag}>
              <CircleCheck className={styles.enrolledIcon} aria-hidden="true" />
              Inscripto
            </span>
          )}
          {showDrop && (
            <Button
              label={dropLabel}
              variant="danger"
              onClick={onDrop}
              isLoading={isLoading}
              ariaLabel={`${dropLabel}: ${subjectName}`}
            />
          )}
          {showEnroll && (
            <Button
              label={isBlockedAttempt ? blockedEnrollLabel : enrollLabel}
              variant={isBlockedAttempt ? "secondary" : "primary"}
              onClick={onEnroll}
              disabled={!validation.allowed && !allowBlockedAttempt}
              isLoading={isLoading}
              ariaLabel={`${isBlockedAttempt ? blockedEnrollLabel : enrollLabel}: ${subjectName}`}
            />
          )}
        </footer>
      )}
    </article>
  );
}
