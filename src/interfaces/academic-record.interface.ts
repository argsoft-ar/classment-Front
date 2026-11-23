export type ProgressStatus =
  | "SIN_CURSAR"
  | "CURSANDO"
  | "REGULARIZADA"
  | "APROBADA"
  | "DESAPROBADA"
  | "LIBRE";

export type RecordOrigin = "CURSADA" | "FINAL" | "EQUIVALENCIA" | "CARGA_INICIAL";

export interface ISubjectProgress {
  subjectId: string;
  name: string;
  yearLevel: number;
  status: ProgressStatus;
  origin: RecordOrigin | null;
  finalGrade: number | null;
  regularizedAt: string | null;
  approvedAt: string | null;
}

export interface IYearProgress {
  yearLevel: number;
  subjects: ISubjectProgress[];
}

export interface IProgressSummary {
  total: number;
  aprobadas: number;
  regularizadas: number;
  cursando: number;
  pendientes: number;
}

export interface ICareerProgress {
  careerId: string;
  careerName: string;
  studyPlanId: string;
  cohortYear: number;
  summary: IProgressSummary;
  years: IYearProgress[];
}

/** GET /academic-records/me, GET|PUT /academic-records/student/:studentId */
export interface IStudentProgress {
  student: {
    id: string;
    dni: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  careers: ICareerProgress[];
}

/** Statuses accepted by the "Día Cero" grid (SIN_CURSAR removes the record). */
export type GridStatus = "SIN_CURSAR" | "REGULARIZADA" | "APROBADA" | "DESAPROBADA" | "LIBRE";

/** Origins accepted by the "Día Cero" grid. EQUIVALENCIA is only valid for APROBADA. */
export type GridOrigin = "EQUIVALENCIA" | "CARGA_INICIAL";

export interface IGridEntry {
  subjectId: string;
  status: GridStatus;
  origin: GridOrigin;
  finalGrade?: number | null;
}

export interface BulkUpsertRecordsDto {
  records: IGridEntry[];
}
