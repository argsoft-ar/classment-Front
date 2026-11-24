import type {
  IProgressSummary,
  ISubjectProgress,
  IYearProgress,
  ProgressStatus,
} from "../interfaces/academic-record.interface";
import type { ProgressItem } from "../components/ProgressSummary/ProgressSummary";
import type { StatusGridGroup } from "../components/SubjectStatusGrid/SubjectStatusGrid";
import type { FilterBarGroup } from "../components/FilterBar/FilterBar";
import { ORIGIN_LABELS, yearLabel } from "./labels.utils";

/** Maps the backend summary (already computed server-side) to ProgressSummary items. */
export function buildProgressItems(summary: IProgressSummary): ProgressItem[] {
  return [
    { label: "Aprobadas", value: summary.aprobadas, status: "APROBADA" },
    { label: "Regularizadas", value: summary.regularizadas, status: "REGULARIZADA" },
    { label: "Cursando", value: summary.cursando, status: "CURSANDO" },
    { label: "Pendientes", value: summary.pendientes, status: "SIN_CURSAR" },
  ];
}

function formatSubjectMeta(subject: ISubjectProgress, isModified: boolean): string | undefined {
  if (isModified) return "Modificada (sin guardar)";
  if (subject.status === "SIN_CURSAR" || !subject.origin) return undefined;
  if (subject.origin === "EQUIVALENCIA") return "Equivalencia";
  if (subject.finalGrade !== null) {
    return `Nota ${subject.finalGrade} · ${ORIGIN_LABELS[subject.origin]}`;
  }
  if (subject.origin === "CARGA_INICIAL") return ORIGIN_LABELS[subject.origin];
  return undefined;
}

/** Year groups for SubjectStatusGrid, optionally overlaying unsaved edits. */
export function toStatusGroups(
  years: IYearProgress[],
  overrides: Record<string, ProgressStatus> = {},
  modifiedIds?: ReadonlySet<string>,
): StatusGridGroup[] {
  return years.map((year) => ({
    yearLevel: year.yearLevel,
    subjects: year.subjects.map((s) => {
      const isModified = modifiedIds?.has(s.subjectId) ?? false;
      return {
        id: s.subjectId,
        name: s.name,
        status: overrides[s.subjectId] ?? s.status,
        meta: formatSubjectMeta(s, isModified),
        isModified,
      };
    }),
  }));
}

export function buildYearFilterGroups(
  years: IYearProgress[],
  value: string,
  onChange: (value: string) => void,
): FilterBarGroup[] {
  if (years.length <= 1) return [];
  const total = years.reduce((acc, y) => acc + y.subjects.length, 0);
  return [
    {
      id: "year",
      label: "Año",
      value,
      onChange,
      options: [
        { value: "ALL", label: "Todos", count: total },
        ...[...years]
          .sort((a, b) => a.yearLevel - b.yearLevel)
          .map((y) => ({
            value: String(y.yearLevel),
            label: yearLabel(y.yearLevel),
            count: y.subjects.length,
          })),
      ],
    },
  ];
}
