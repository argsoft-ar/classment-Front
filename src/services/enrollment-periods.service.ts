import { apiClient } from "./api.client";
import type {
  CreatePeriodDto,
  IEnrollmentPeriod,
  PeriodsQuery,
  UpdatePeriodDto,
} from "../interfaces/enrollment-period.interface";

export const enrollmentPeriodsService = {
  getAll: (query: PeriodsQuery = {}) =>
    apiClient.get<IEnrollmentPeriod[]>("/enrollment-periods", { ...query }),
  getOpen: () => apiClient.get<IEnrollmentPeriod[]>("/enrollment-periods/open"),
  getById: (id: string) => apiClient.get<IEnrollmentPeriod>(`/enrollment-periods/${encodeURIComponent(id)}`),
  create: (dto: CreatePeriodDto) => apiClient.post<IEnrollmentPeriod>("/enrollment-periods", dto),
  update: (id: string, dto: UpdatePeriodDto) =>
    apiClient.patch<IEnrollmentPeriod>(`/enrollment-periods/${encodeURIComponent(id)}`, dto),
  delete: (id: string) => apiClient.delete<null>(`/enrollment-periods/${encodeURIComponent(id)}`),
};
