import { useCallback, useState } from "react";
import { useAsyncData } from "./useAsyncData";
import { useNotify } from "./useNotify";
import { academicRecordsService } from "../services/academic-records.service";
import { getErrorMessage } from "../utils/error.utils";
import { GRID_ORIGIN_OPTIONS } from "../utils/labels.utils";
import { buildProgressItems, toStatusGroups } from "../utils/progress.utils";
import type {
  GridOrigin,
  GridStatus,
  IGridEntry,
  ProgressStatus,
} from "../interfaces/academic-record.interface";
import type { SubjectStatus } from "../components/StatusBadge/status";

/** Statuses the "Día Cero" grid can set (backend gridStatusValues). */
export const GRID_STATUSES: GridStatus[] = [
  "SIN_CURSAR",
  "REGULARIZADA",
  "APROBADA",
  "DESAPROBADA",
  "LIBRE",
];

function isGridStatus(status: ProgressStatus): status is GridStatus {
  return GRID_STATUSES.some((s) => s === status);
}

function isGridOrigin(value: string): value is GridOrigin {
  return GRID_ORIGIN_OPTIONS.some((o) => o.value === value);
}

export function useStudentHistory(studentId: string) {
  const notify = useNotify();
  const loader = useCallback(() => academicRecordsService.getByStudent(studentId), [studentId]);
  const { data, isLoading, error, setData } = useAsyncData(loader);
  const [edits, setEdits] = useState<Record<string, ProgressStatus>>({});
  const [origin, setOrigin] = useState<GridOrigin>("CARGA_INICIAL");
  const [isSaving, setIsSaving] = useState(false);

  const career = data?.careers[0] ?? null;
  const originalStatus = (subjectId: string): ProgressStatus | undefined =>
    career?.years.flatMap((y) => y.subjects).find((s) => s.subjectId === subjectId)?.status;

  const onStatusChange = (subjectId: string, status: SubjectStatus) => {
    setEdits((prev) => {
      const next = { ...prev };
      if (originalStatus(subjectId) === status) delete next[subjectId];
      else next[subjectId] = status;
      return next;
    });
  };

  const onOriginChange = (value: string) => {
    if (isGridOrigin(value)) setOrigin(value);
  };

  const records: IGridEntry[] = Object.entries(edits).flatMap(([subjectId, status]) =>
    isGridStatus(status)
      ? [
          {
            subjectId,
            status,
            // The backend only accepts EQUIVALENCIA for APROBADA entries.
            origin: origin === "EQUIVALENCIA" && status === "APROBADA" ? "EQUIVALENCIA" : "CARGA_INICIAL",
          },
        ]
      : [],
  );

  const save = async () => {
    if (records.length === 0) return;
    setIsSaving(true);
    try {
      const updated = await academicRecordsService.bulkUpsert(studentId, { records });
      setData(updated);
      setEdits({});
      notify(
        `Historial guardado: ${records.length} ${records.length === 1 ? "materia actualizada" : "materias actualizadas"}`,
        "success",
      );
    } catch (err) {
      notify(getErrorMessage(err, "No se pudo guardar el historial."), "error", 6000);
    } finally {
      setIsSaving(false);
    }
  };

  const student = data?.student;

  return {
    isLoading: isLoading && !data,
    error,
    title: student ? `Historial de ${student.firstName} ${student.lastName}` : "Historial del alumno",
    subtitle: career
      ? `${career.careerName} · Cohorte ${career.cohortYear} · DNI ${student?.dni ?? ""}`
      : "",
    hasCareer: career !== null,
    summaryItems: career ? buildProgressItems(career.summary) : [],
    groups: career ? toStatusGroups(career.years, edits) : [],
    statusOptions: GRID_STATUSES,
    onStatusChange,
    origin,
    originOptions: GRID_ORIGIN_OPTIONS,
    onOriginChange,
    changedCount: records.length,
    isSaving,
    save: () => void save(),
    discard: () => setEdits({}),
  };
}
