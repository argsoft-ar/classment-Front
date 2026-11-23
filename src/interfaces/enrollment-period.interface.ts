export type PeriodType = "CURSADA" | "FINAL";

/** GET /enrollment-periods, GET /enrollment-periods/open */
export interface IEnrollmentPeriod {
  id: string;
  type: PeriodType;
  name: string;
  academicYear: number;
  /** Null for CURSADA; 1 or 2 for FINAL. */
  callNumber: number | null;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: { offerings: number };
}

export interface CreatePeriodDto {
  type: PeriodType;
  name: string;
  academicYear: number;
  callNumber?: number | null;
  startsAt: string;
  endsAt: string;
  isActive?: boolean;
}

export type UpdatePeriodDto = Partial<Omit<CreatePeriodDto, "type">>;

export interface PeriodsQuery {
  type?: PeriodType;
  academicYear?: number;
}
