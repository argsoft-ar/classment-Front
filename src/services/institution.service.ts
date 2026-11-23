import { apiClient } from "./api.client";
import type {
  IInstitutionConfig,
  UpdateInstitutionDto,
} from "../interfaces/institution.interface";

export const institutionService = {
  getConfig: () => apiClient.get<IInstitutionConfig>("/institution"),
  /** SuperAdmin only. */
  update: (dto: UpdateInstitutionDto) => apiClient.patch<IInstitutionConfig>("/institution", dto),
};
