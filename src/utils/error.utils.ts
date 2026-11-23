import { ApiError } from "../services/api.client";
import type { ValidationErrorDetails } from "../types/api.types";
import type {
  ICycleErrorDetails,
  IEnrollmentValidationResult,
} from "../interfaces/correlative.interface";

/** Exact backend messages → Spanish UI text. */
const EXACT_MESSAGES: Record<string, string> = {
  "Network error": "Error de conexión con el servidor. Intente nuevamente.",
  "Validation failed": "Revisá los datos ingresados.",
  "Invalid credentials": "Credenciales inválidas. Verifique sus datos.",
  "User account is not active": "La cuenta no está activa.",
  "A subject cannot be its own correlative": "Una materia no puede ser correlativa de sí misma.",
  "Both subjects must belong to the same study plan":
    "Ambas materias deben pertenecer al mismo plan de estudios.",
  "Correlative rule already exists": "Esa correlatividad ya existe.",
  "Correlative rule not found": "La correlatividad no existe.",
  "A user with this email or DNI already exists": "Ya existe un usuario con ese email o DNI.",
  "careerId is required for students": "Seleccioná la carrera del alumno.",
  "Career not found": "Carrera no encontrada.",
  "Career has no active study plan": "La carrera no tiene un plan de estudios activo.",
  "Subject not found": "Materia no encontrada.",
  "Student not found": "Alumno no encontrado.",
  "Some subjects do not belong to the student's study plan":
    "Algunas materias no pertenecen al plan de estudios del alumno.",
  "Enrollment period not found": "Período de inscripción no encontrado.",
  "endsAt must be after startsAt": "La fecha de cierre debe ser posterior a la de apertura.",
  "callNumber (1 or 2) is required for FINAL periods and must be empty for CURSADA":
    "El llamado (1° o 2°) es obligatorio para mesas de final y no aplica a cursadas.",
  "Period has enrollments; deactivate it instead":
    "El período tiene inscripciones: desactivalo en lugar de eliminarlo.",
  "Subject is already offered in this period": "La materia ya tiene una oferta en este período.",
  "teacherId must reference an active Docente": "El docente seleccionado no es válido.",
  "examDate is only allowed for FINAL periods":
    "La fecha de examen solo aplica a períodos de final.",
  "Offering not found": "Oferta no encontrada.",
  "Offering has enrollments and cannot be deleted":
    "La oferta tiene inscripciones y no puede eliminarse.",
  "Only ACTIVA enrollments can be dropped": "Solo se pueden dar de baja inscripciones activas.",
  "Enrollment not found": "Inscripción no encontrada.",
  "promotionGrade must be set and >= passingGrade when allowsPromotion is true":
    "Con promoción habilitada, la nota de promoción es obligatoria y debe ser mayor o igual a la de aprobación.",
  "You cannot deactivate your own account": "No podés desactivar tu propia cuenta.",
  "Cannot activate a user without a password": "No se puede activar un usuario sin contraseña.",
};

/** Backend message prefixes with dynamic content → Spanish UI text. */
const PREFIX_MESSAGES: Array<[string, string]> = [
  ["yearLevel must be between 1", "El año de la materia excede la duración de la carrera."],
  [
    "durationYears cannot be lower",
    "La duración no puede ser menor al año de la materia más avanzada.",
  ],
  ["finalGrade for APROBADA must be", "La nota final debe ser mayor o igual a la de aprobación."],
  ["Forbidden", "No tenés permisos para realizar esta acción."],
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function isCycleError(details: unknown): details is ICycleErrorDetails {
  return isRecord(details) && Array.isArray(details.names) && Array.isArray(details.path);
}

export function isValidationResult(details: unknown): details is IEnrollmentValidationResult {
  return isRecord(details) && typeof details.allowed === "boolean" && Array.isArray(details.reasons);
}

function isZodFlatten(details: unknown): details is ValidationErrorDetails {
  return isRecord(details) && isRecord(details.fieldErrors) && Array.isArray(details.formErrors);
}

/** Shown when the backend rate limiter answers 429 (e.g. POST /auth/login). */
export const TOO_MANY_ATTEMPTS_MESSAGE = "Demasiados intentos. Intentá nuevamente en unos minutos.";

/** Human-readable Spanish message for any thrown value (ApiError or unknown). */
export function getErrorMessage(error: unknown, fallback = "Ocurrió un error inesperado."): string {
  if (!(error instanceof ApiError)) return fallback;

  if (error.status === 429) return TOO_MANY_ATTEMPTS_MESSAGE;

  if (error.status === 409 && isCycleError(error.errors)) {
    return `La correlatividad generaría un ciclo: ${error.errors.names.join(" → ")}.`;
  }

  const exact = EXACT_MESSAGES[error.message];
  if (exact) return exact;
  const prefix = PREFIX_MESSAGES.find(([p]) => error.message.startsWith(p));
  if (prefix) return prefix[1];

  if (error.status === 401) return "La sesión expiró. Ingresá nuevamente.";
  if (error.status === 403) return "No tenés permisos para realizar esta acción.";
  if (error.status === 404) return "El recurso solicitado no existe.";
  if (error.status >= 500 || error.status === 0) return fallback;
  // Messages already written in Spanish by the backend (e.g. "Cupo completo", "Fuera de fecha...").
  return error.message || fallback;
}

/** Maps a 400 Zod error to { field: message } so forms can highlight invalid inputs. */
export function getFieldErrors(error: unknown): Record<string, string> {
  if (!(error instanceof ApiError) || !isZodFlatten(error.errors)) return {};
  const result: Record<string, string> = {};
  for (const [field, messages] of Object.entries(error.errors.fieldErrors)) {
    if (messages && messages.length > 0) result[field] = "Valor inválido";
  }
  return result;
}

/** Extracts the engine rejection result from a 422 "Inscripción rechazada" response. */
export function getRejection(error: unknown): IEnrollmentValidationResult | null {
  if (error instanceof ApiError && error.status === 422 && isValidationResult(error.errors)) {
    return error.errors;
  }
  return null;
}
