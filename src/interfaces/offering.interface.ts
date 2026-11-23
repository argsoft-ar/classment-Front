import type { IEnrollmentPeriod, PeriodType } from "./enrollment-period.interface";
import type { IEnrollmentValidationResult } from "./correlative.interface";

export type EnrollmentModality = "REGULAR" | "LIBRE";

export interface IOfferingTeacher {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
}

/** GET /offerings (admin: all; Docente: only assigned) */
export interface IOffering {
  id: string;
  periodId: string;
  subjectId: string;
  teacherId: string | null;
  examDate: string | null;
  maxCapacity: number | null;
  createdAt: string;
  updatedAt: string;
  period: IEnrollmentPeriod;
  subject: { id: string; name: string; yearLevel: number; studyPlanId: string };
  teacher: IOfferingTeacher | null;
  _count: { enrollments: number };
}

/** GET /offerings/available (Alumno) — each offering validated by the correlatives engine. */
export interface IAvailableOffering {
  id: string;
  examDate: string | null;
  maxCapacity: number | null;
  period: {
    id: string;
    type: PeriodType;
    name: string;
    academicYear: number;
    callNumber: number | null;
    startsAt: string;
    endsAt: string;
  };
  subject: { id: string; name: string; yearLevel: number };
  teacher: IOfferingTeacher | null;
  /** Modality suggested by the backend; `validation` refers to it. */
  modality: EnrollmentModality;
  validation: IEnrollmentValidationResult;
  /** For FINAL offerings: result for each modality (Regular / Libre). */
  validationByModality: Partial<Record<EnrollmentModality, IEnrollmentValidationResult>>;
  activeEnrollmentId: string | null;
}

export interface CreateOfferingDto {
  periodId: string;
  subjectId: string;
  teacherId?: string | null;
  examDate?: string | null;
  maxCapacity?: number | null;
}

export type UpdateOfferingDto = Partial<Pick<CreateOfferingDto, "teacherId" | "examDate" | "maxCapacity">>;

export interface OfferingsQuery {
  periodId?: string;
  subjectId?: string;
}
