import type { IEnrollmentPeriod } from "./enrollment-period.interface";
import type { EnrollmentModality, IOfferingTeacher } from "./offering.interface";

export type EnrollmentStatus = "ACTIVA" | "BAJA" | "CERRADA";
export type EnrollmentResult = "REGULARIZADA" | "APROBADA" | "DESAPROBADA" | "AUSENTE";

/** GET /enrollments/me, POST /enrollments, PATCH /enrollments/:id/drop */
export interface IEnrollment {
  id: string;
  offeringId: string;
  studentId: string;
  modality: EnrollmentModality;
  status: EnrollmentStatus;
  /** Prisma Decimal serialized as string. */
  grade: string | null;
  result: EnrollmentResult | null;
  createdAt: string;
  updatedAt: string;
  offering: {
    id: string;
    examDate: string | null;
    maxCapacity: number | null;
    period: IEnrollmentPeriod;
    subject: { id: string; name: string; yearLevel: number };
    teacher: IOfferingTeacher | null;
  };
}

/** GET /offerings/:id/enrollments (Directivo / Docente) */
export interface IOfferingEnrollment {
  id: string;
  offeringId: string;
  studentId: string;
  modality: EnrollmentModality;
  status: EnrollmentStatus;
  grade: string | null;
  result: EnrollmentResult | null;
  createdAt: string;
  updatedAt: string;
  student: {
    id: string;
    dni: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

/** studentId is never sent: the backend takes it from the JWT. */
export interface CreateEnrollmentDto {
  offeringId: string;
  modality: EnrollmentModality;
}
