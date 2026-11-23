/** Estados académicos de una materia para un alumno */
export type SubjectStatus =
  | "SIN_CURSAR"
  | "CURSANDO"
  | "REGULARIZADA"
  | "APROBADA"
  | "DESAPROBADA"
  | "LIBRE";

/** Todos los estados representables por StatusBadge */
export type BadgeStatus =
  | SubjectStatus
  | "HABILITADA"
  | "BLOQUEADA"
  | "ACTIVA"
  | "BAJA"
  | "CERRADA";

/** Etiquetas en español por defecto */
export const STATUS_LABELS: Record<BadgeStatus, string> = {
  SIN_CURSAR: "Sin cursar",
  CURSANDO: "Cursando",
  REGULARIZADA: "Regularizada",
  APROBADA: "Aprobada",
  DESAPROBADA: "Desaprobada",
  LIBRE: "Libre",
  HABILITADA: "Habilitada",
  BLOQUEADA: "Bloqueada",
  ACTIVA: "Activa",
  BAJA: "Baja",
  CERRADA: "Cerrada",
};

/** Lista ordenada de estados de materia (útil como statusOptions) */
export const SUBJECT_STATUSES: SubjectStatus[] = [
  "SIN_CURSAR",
  "CURSANDO",
  "REGULARIZADA",
  "APROBADA",
  "DESAPROBADA",
  "LIBRE",
];
