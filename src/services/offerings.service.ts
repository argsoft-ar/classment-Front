import { apiClient } from "./api.client";
import type {
  CreateOfferingDto,
  IAvailableOffering,
  IOffering,
  OfferingsQuery,
  UpdateOfferingDto,
} from "../interfaces/offering.interface";

export const offeringsService = {
  /** Admin: all offerings. Docente: only the ones assigned (filtered by the backend). */
  getAll: (query: OfferingsQuery = {}) => apiClient.get<IOffering[]>("/offerings", { ...query }),
  /** Alumno: open offerings with the correlatives engine result per modality. */
  getAvailable: () => apiClient.get<IAvailableOffering[]>("/offerings/available"),
  getById: (id: string) => apiClient.get<IOffering>(`/offerings/${encodeURIComponent(id)}`),
  create: (dto: CreateOfferingDto) => apiClient.post<IOffering>("/offerings", dto),
  update: (id: string, dto: UpdateOfferingDto) =>
    apiClient.patch<IOffering>(`/offerings/${encodeURIComponent(id)}`, dto),
  delete: (id: string) => apiClient.delete<null>(`/offerings/${encodeURIComponent(id)}`),
};
