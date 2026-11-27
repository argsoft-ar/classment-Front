import { Select, type SelectOption } from "../Select/Select";
import { StatusBadge } from "../StatusBadge/StatusBadge";
import { EmptyState } from "../EmptyState/EmptyState";
import { formatDateTime } from "../../utils/date.utils";
import { formatGrade } from "../../utils/labels.utils";
import type { EnrollmentResult, EnrollmentStatus } from "../../interfaces/enrollment.interface";
import styles from "./GradeSheet.module.css";

export interface GradeSheetRow {
  enrollmentId: string;
  studentName: string;
  dni: string;
  email: string;
  modalityLabel: string;
  enrolledAt: string;
  enrollmentStatus: EnrollmentStatus;
  savedResult: EnrollmentResult | null;
  savedGrade: string | null;
  draftResult: EnrollmentResult | "";
  draftGrade: string;
  isReadOnly: boolean;
  isModified: boolean;
  error?: string;
}

export interface GradeSheetProps {
  rows: GradeSheetRow[];
  resultOptions: SelectOption[];
  gradePlaceholder?: string;
  onResultChange: (enrollmentId: string, result: EnrollmentResult | "") => void;
  onGradeChange: (enrollmentId: string, grade: string) => void;
  disabled?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
}

const VALID_RESULTS: EnrollmentResult[] = [
  "REGULARIZADA",
  "APROBADA",
  "DESAPROBADA",
  "AUSENTE",
];

function parseResult(value: string): EnrollmentResult | "" {
  return VALID_RESULTS.find((r) => r === value) ?? "";
}

export function GradeSheet({
  rows,
  resultOptions,
  gradePlaceholder = "1–10",
  onResultChange,
  onGradeChange,
  disabled = false,
  emptyTitle = "Sin alumnos para mostrar",
  emptyDescription = "Todavía no hay inscripciones activas ni cerradas para esta vista.",
}: GradeSheetProps) {
  if (rows.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <caption className={styles.caption}>Planilla de calificaciones y cierre de acta</caption>
        <thead className={styles.thead}>
          <tr>
            <th className={styles.th} scope="col">Alumno</th>
            <th className={styles.th} scope="col">Modalidad</th>
            <th className={styles.th} scope="col">Estado</th>
            <th className={styles.th} scope="col">Condición / Resultado</th>
            <th className={`${styles.th} ${styles.thCenter}`} scope="col">Nota (1–10)</th>
          </tr>
        </thead>
        <tbody className={styles.tbody}>
          {rows.map((row) => {
            const isClosed = row.enrollmentStatus === "CERRADA";
            const gradeDisabled =
              disabled ||
              row.isReadOnly ||
              row.draftResult === "" ||
              row.draftResult === "AUSENTE";

            const rowClasses = [
              styles.row,
              isClosed && !row.isModified ? styles.rowClosed : "",
              row.isModified ? styles.rowModified : "",
              row.error ? styles.rowInvalid : "",
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <tr key={row.enrollmentId} className={rowClasses}>
                <td className={styles.cell} data-label="Alumno">
                  <div className={styles.studentBlock}>
                    <span className={styles.studentName}>{row.studentName}</span>
                    <span className={styles.studentMeta}>
                      DNI {row.dni} · {row.email}
                    </span>
                    <span className={styles.studentMeta}>
                      Inscripto: {formatDateTime(row.enrolledAt)}
                    </span>
                    {row.isModified && (
                      <span className={styles.modifiedTag}>Modificado (sin guardar)</span>
                    )}
                  </div>
                </td>

                <td className={styles.cell} data-label="Modalidad">
                  {row.modalityLabel}
                </td>

                <td className={styles.cell} data-label="Estado">
                  <StatusBadge status={row.enrollmentStatus} size="sm" />
                </td>

                <td className={styles.cell} data-label="Resultado">
                  <div className={styles.controlCell}>
                    {row.isReadOnly ? (
                      <>
                        {row.savedResult ? (
                          <StatusBadge status={row.savedResult} size="sm" />
                        ) : (
                          <span>—</span>
                        )}
                        <span className={styles.readOnlyHint}>
                          Acta cerrada (rectifica Dirección)
                        </span>
                      </>
                    ) : (
                      <Select
                        name={`result-${row.enrollmentId}`}
                        label={`Resultado para ${row.studentName}`}
                        hideLabel
                        size="sm"
                        placeholder="Seleccionar..."
                        value={row.draftResult}
                        options={resultOptions}
                        onChange={(val) => onResultChange(row.enrollmentId, parseResult(val))}
                        disabled={disabled}
                        error={row.error}
                      />
                    )}
                  </div>
                </td>

                <td className={`${styles.cell} ${styles.gradeCell}`} data-label="Nota (1–10)">
                  {row.isReadOnly ? (
                    <span className={styles.readOnlyGrade}>{formatGrade(row.savedGrade)}</span>
                  ) : (
                    <input
                      type="number"
                      min={1}
                      max={10}
                      step={1}
                      inputMode="numeric"
                      aria-label={`Nota para ${row.studentName}`}
                      placeholder={row.draftResult === "AUSENTE" ? "—" : gradePlaceholder}
                      value={row.draftResult === "AUSENTE" ? "" : row.draftGrade}
                      disabled={gradeDisabled}
                      onChange={(e) => onGradeChange(row.enrollmentId, e.target.value)}
                      className={[
                        styles.gradeInput,
                        row.error ? styles.gradeInputError : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    />
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
