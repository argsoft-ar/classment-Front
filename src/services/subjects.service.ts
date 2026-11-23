import { apiClient } from "./api.client";
import type {
  CreateSubjectDto,
  ISubject,
  UpdateSubjectDto,
} from "../interfaces/subject.interface";

export const subjectsService = {
  getByCareer: (careerId: string) => apiClient.get<ISubject[]>("/subjects", { careerId }),
  getById: (id: string) => apiClient.get<ISubject>(`/subjects/${encodeURIComponent(id)}`),
  create: (dto: CreateSubjectDto) => apiClient.post<ISubject>("/subjects", dto),
  update: (id: string, dto: UpdateSubjectDto) => apiClient.patch<ISubject>(`/subjects/${encodeURIComponent(id)}`, dto),
  deactivate: (id: string) => apiClient.delete<null>(`/subjects/${encodeURIComponent(id)}`),
};
