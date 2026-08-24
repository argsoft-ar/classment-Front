import type { ApiResponse, PaginatedResult } from "../types/api.types";
import type { IGrade } from "../interfaces/grade.interface";

const BASE_URL = import.meta.env.VITE_API_URL as string;

export const gradesService = {
  getAll: async (
    token: string,
  ): Promise<ApiResponse<PaginatedResult<IGrade>>> => {
    const res = await fetch(`${BASE_URL}/grades`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json() as Promise<ApiResponse<PaginatedResult<IGrade>>>;
  },
};
