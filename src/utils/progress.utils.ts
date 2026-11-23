import type {
  IProgressSummary,
  IYearProgress,
  ProgressStatus,
} from "../interfaces/academic-record.interface";
import type { ProgressItem } from "../components/ProgressSummary/ProgressSummary";
import type { StatusGridGroup } from "../components/SubjectStatusGrid/SubjectStatusGrid";

/** Maps the backend summary (already computed server-side) to ProgressSummary items. */
export function buildProgressItems(summary: IProgressSummary): ProgressItem[] {
  return [
    { label: "Aprobadas", value: summary.aprobadas, status: "APROBADA" },
    { label: "Regularizadas", value: summary.regularizadas, status: "REGULARIZADA" },
    { label: "Cursando", value: summary.cursando, status: "CURSANDO" },
    { label: "Pendientes", value: summary.pendientes, status: "SIN_CURSAR" },
  ];
}

/** Year groups for SubjectStatusGrid, optionally overlaying unsaved edits. */
export function toStatusGroups(
  years: IYearProgress[],
  overrides: Record<string, ProgressStatus> = {},
): StatusGridGroup[] {
  return years.map((year) => ({
    yearLevel: year.yearLevel,
    subjects: year.subjects.map((s) => ({
      id: s.subjectId,
      name: s.name,
      status: overrides[s.subjectId] ?? s.status,
    })),
  }));
}
