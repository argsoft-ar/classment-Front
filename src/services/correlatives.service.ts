import { apiClient } from "./api.client";
import type {
  CreateCorrelativeDto,
  ICorrelativeRule,
  ISubjectCorrelatives,
} from "../interfaces/correlative.interface";

/** Cycle (409) and self-reference (422) checks are performed by the backend engine. */
export const correlativesService = {
  getBySubject: (subjectId: string) =>
    apiClient.get<ISubjectCorrelatives>(`/correlatives/subject/${encodeURIComponent(subjectId)}`),
  create: (dto: CreateCorrelativeDto) => apiClient.post<ICorrelativeRule>("/correlatives", dto),
  delete: (id: string) => apiClient.delete<null>(`/correlatives/${encodeURIComponent(id)}`),
};
