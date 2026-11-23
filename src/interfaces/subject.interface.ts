import type { CorrelativeScope, RequiredStatus } from "./correlative.interface";

/** Plain subject row (GET /subjects?careerId=). */
export interface ISubject {
  id: string;
  studyPlanId: string;
  name: string;
  yearLevel: number;
  regime: "ANNUAL";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ICorrelativeSummary {
  id: string;
  requiredSubjectId: string;
  requiredSubjectName: string;
  appliesTo: CorrelativeScope;
  requiredStatus: RequiredStatus;
}

export interface ISubjectSummary {
  id: string;
  name: string;
  yearLevel: number;
  regime: "ANNUAL";
  isActive: boolean;
  correlatives: ICorrelativeSummary[];
}

export interface ISubjectsByYear {
  yearLevel: number;
  subjects: ISubjectSummary[];
}

/** GET /careers/:id/subjects */
export interface ICareerCurriculum {
  career: { id: string; name: string; durationYears: number };
  studyPlan: { id: string; code: string; year: number };
  years: ISubjectsByYear[];
}

export interface CreateSubjectDto {
  careerId: string;
  name: string;
  yearLevel: number;
}

export type UpdateSubjectDto = Partial<{ name: string; yearLevel: number; isActive: boolean }>;
