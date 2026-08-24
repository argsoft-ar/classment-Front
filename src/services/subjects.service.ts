import type { ApiResponse, PaginatedResult } from "../types/api.types";
import type { ISubject } from "../interfaces/subject.interface";

const BASE_URL = import.meta.env.VITE_API_URL as string;

export const subjectsService = {
  getAll: async (
    token: string,
  ): Promise<ApiResponse<PaginatedResult<ISubject>>> => {
    const res = await fetch(`${BASE_URL}/subjects`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json() as Promise<ApiResponse<PaginatedResult<ISubject>>>;
  },
};
