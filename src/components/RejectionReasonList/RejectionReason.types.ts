import type { SubjectStatus } from "../StatusBadge/status";

/** Motivo por el cual una inscripción no está habilitada */
export interface RejectionReason {
  /** Código máquina del motivo (ej. CORRELATIVA_NO_REGULARIZADA) */
  code: string;
  /** Mensaje legible para el usuario */
  message: string;
  /** Nombre de la materia correlativa involucrada */
  requiredSubjectName?: string;
  /** Estado requerido en la correlativa */
  requiredStatus?: SubjectStatus;
  /** Estado actual del alumno en la correlativa */
  currentStatus?: SubjectStatus;
}
