import { apiClient } from "./api.client";
import type { CreateCareerDto, ICareer, UpdateCareerDto } from "../interfaces/career.interface";
import type { ICareerCurriculum } from "../interfaces/subject.interface";

export const careersService = {
  getAll: () => apiClient.get<ICareer[]>("/careers"),
  getById: (id: string) => apiClient.get<ICareer>(`/careers/${encodeURIComponent(id)}`),
  /** Subjects grouped by year, each with its correlative rules. */
  getCurriculum: (id: string) => apiClient.get<ICareerCurriculum>(`/careers/${encodeURIComponent(id)}/subjects`),
  create: (dto: CreateCareerDto) => apiClient.post<ICareer>("/careers", dto),
  update: (id: string, dto: UpdateCareerDto) => apiClient.patch<ICareer>(`/careers/${encodeURIComponent(id)}`, dto),
  deactivate: (id: string) => apiClient.delete<null>(`/careers/${encodeURIComponent(id)}`),
};
