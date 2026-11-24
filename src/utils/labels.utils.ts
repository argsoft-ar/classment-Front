import type { CorrelativeScope, RequiredStatus } from "../interfaces/correlative.interface";
import type { PeriodType } from "../interfaces/enrollment-period.interface";
import type { EnrollmentModality } from "../interfaces/offering.interface";
import type { GridOrigin, RecordOrigin } from "../interfaces/academic-record.interface";
import type { UserStatus } from "../interfaces/user.interface";

export interface Option<V extends string = string> {
  value: V;
  label: string;
}

export const PERIOD_TYPE_LABELS: Record<PeriodType, string> = {
  CURSADA: "Cursada",
  FINAL: "Mesa de final",
};

export const MODALITY_LABELS: Record<EnrollmentModality, string> = {
  REGULAR: "Regular",
  LIBRE: "Libre",
};

export const SCOPE_LABELS: Record<CorrelativeScope, string> = {
  CURSADA: "Para cursar",
  FINAL: "Para rendir final",
};

export const REQUIRED_STATUS_LABELS: Record<RequiredStatus, string> = {
  REGULARIZADA: "Regularizada",
  APROBADA: "Aprobada",
};

export const ORIGIN_LABELS: Record<RecordOrigin, string> = {
  CURSADA: "Cursada",
  FINAL: "Final",
  EQUIVALENCIA: "Equivalencia",
  CARGA_INICIAL: "Carga inicial",
};

export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  INVITED: "Invitado",
  ACTIVE: "Activo",
  INACTIVE: "Inactivo",
};

export const toOptions = <V extends string>(labels: Record<V, string>): Option<V>[] =>
  (Object.keys(labels) as V[]).map((value) => ({ value, label: labels[value] }));

export const GRID_ORIGIN_OPTIONS: Option<GridOrigin>[] = [
  { value: "CARGA_INICIAL", label: "Carga inicial (historial previo)" },
  { value: "EQUIVALENCIA", label: "Equivalencia (solo materias aprobadas)" },
];

export const yearLabel = (yearLevel: number): string => `${yearLevel}° Año`;

export const callLabel = (callNumber: number | null): string =>
  callNumber ? `${callNumber}° llamado` : "—";

export function formatPeriodTitle(period: { name: string; callNumber: number | null }): string {
  if (period.callNumber && !period.name.toLowerCase().includes("llamado")) {
    return `${period.name} · ${callLabel(period.callNumber)}`;
  }
  return period.name;
}
