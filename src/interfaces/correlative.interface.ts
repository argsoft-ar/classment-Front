/** Mirrors classment-back src/domain/correlatives/types.ts */
export type CorrelativeScope = "CURSADA" | "FINAL";
export type RequiredStatus = "REGULARIZADA" | "APROBADA";
export type EngineSubjectStatus =
  | "SIN_CURSAR"
  | "CURSANDO"
  | "REGULARIZADA"
  | "APROBADA"
  | "DESAPROBADA";

export type RejectionCode =
  | "PERIOD_CLOSED"
  | "ALREADY_APPROVED"
  | "ALREADY_ENROLLED"
  | "ALREADY_REGULARIZED"
  | "NOT_REGULARIZED_FOR_FINAL"
  | "CORRELATIVE_NOT_MET";

export interface IRejectionReason {
  code: RejectionCode;
  message: string;
  requiredSubjectId?: string;
  requiredSubjectName?: string;
  requiredStatus?: RequiredStatus;
  currentStatus?: EngineSubjectStatus;
}

export interface IEnrollmentValidationResult {
  allowed: boolean;
  reasons: IRejectionReason[];
}

export interface ISubjectBrief {
  id: string;
  name: string;
  yearLevel: number;
}

export interface ICorrelativeRule {
  id: string;
  subjectId: string;
  requiredSubjectId: string;
  appliesTo: CorrelativeScope;
  requiredStatus: RequiredStatus;
  createdAt: string;
  updatedAt: string;
}

/** GET /correlatives/subject/:subjectId */
export interface ISubjectCorrelatives {
  subject: ISubjectBrief;
  correlatives: Array<ICorrelativeRule & { requiredSubject: ISubjectBrief }>;
  requiredBy: Array<ICorrelativeRule & { subject: ISubjectBrief }>;
}

export interface CreateCorrelativeDto {
  subjectId: string;
  requiredSubjectId: string;
  appliesTo: CorrelativeScope;
  requiredStatus: RequiredStatus;
}

/** `errors` payload of the 409 returned when a rule would create a cycle. */
export interface ICycleErrorDetails {
  path: string[];
  names: string[];
}
