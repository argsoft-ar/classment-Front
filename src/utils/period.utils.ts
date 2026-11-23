import type { IEnrollmentPeriod } from "../interfaces/enrollment-period.interface";
import type { BadgeStatus } from "../components/StatusBadge/status";

export type PeriodState = "OPEN" | "UPCOMING" | "CLOSED" | "INACTIVE";

/** Display-only state of a period window relative to `now`. */
export function getPeriodState(period: IEnrollmentPeriod, now: number): PeriodState {
  if (!period.isActive) return "INACTIVE";
  const starts = new Date(period.startsAt).getTime();
  const ends = new Date(period.endsAt).getTime();
  if (now < starts) return "UPCOMING";
  if (now > ends) return "CLOSED";
  return "OPEN";
}

export const PERIOD_STATE_BADGE: Record<PeriodState, { status: BadgeStatus; label: string }> = {
  OPEN: { status: "HABILITADA", label: "Abierto" },
  UPCOMING: { status: "CURSANDO", label: "Próximo" },
  CLOSED: { status: "CERRADA", label: "Cerrado" },
  INACTIVE: { status: "BAJA", label: "Inactivo" },
};
