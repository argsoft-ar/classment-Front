export interface IGrade {
  id: string;
  studentId: string;
  subjectId: string;
  period: 1 | 2;
  preInforme?: string;
  finalGrade?: number;
  cycleGrade?: number;
  createdAt: string;
}
