import type { ApiResponse, PaginatedResult } from "../types/api.types";
import type { IInstitution } from "../interfaces/institution.interface";

const BASE_URL = import.meta.env.VITE_API_URL as string;

export const institutionsService = {
  getAllPublic: async (): Promise<ApiResponse<IInstitution[]>> => {
    const res = await fetch(`${BASE_URL}/institutions`);
    return res.json() as Promise<ApiResponse<IInstitution[]>>;
  },

  getAll: async (
    token: string,
  ): Promise<ApiResponse<PaginatedResult<IInstitution>>> => {
    const res = await fetch(`${BASE_URL}/institutions`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json() as Promise<ApiResponse<PaginatedResult<IInstitution>>>;
  },
};
