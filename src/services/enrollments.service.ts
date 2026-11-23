import { apiClient } from "./api.client";
import type { CreateEnrollmentDto, IEnrollment } from "../interfaces/enrollment.interface";

export const enrollmentsService = {
  getMine: () => apiClient.get<IEnrollment[]>("/enrollments/me"),
  /** Rejected with 422 + { allowed, reasons } when the engine blocks the enrollment. */
  create: (dto: CreateEnrollmentDto) => apiClient.post<IEnrollment>("/enrollments", dto),
  drop: (id: string) => apiClient.patch<IEnrollment>(`/enrollments/${encodeURIComponent(id)}/drop`),
};
