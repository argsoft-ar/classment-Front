import type { ApiResponse, PaginatedResult } from "../types/api.types";
import type { ICourse } from "../interfaces/course.interface";

const BASE_URL = import.meta.env.VITE_API_URL as string;

export const coursesService = {
  getAll: async (
    token: string,
  ): Promise<ApiResponse<PaginatedResult<ICourse>>> => {
    const res = await fetch(`${BASE_URL}/courses`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json() as Promise<ApiResponse<PaginatedResult<ICourse>>>;
  },
};
