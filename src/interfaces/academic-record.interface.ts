export type CycleStatus = "En curso" | "Promovido" | "Repite" | "Egresado";

export interface IAcademicRecord {
  id: string;
  studentId: string;
  institutionId: string;
  cycleYear: number;
  status: CycleStatus;
  pendingSubjects: string[];
  createdAt: string;
}
