import type { ApiResponse, PaginatedResult } from "../types/api.types";
import type { IAcademicRecord } from "../interfaces/academic-record.interface";

const BASE_URL = import.meta.env.VITE_API_URL as string;

export const academicRecordsService = {
  getAll: async (
    token: string,
  ): Promise<ApiResponse<PaginatedResult<IAcademicRecord>>> => {
    const res = await fetch(`${BASE_URL}/academic-records`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json() as Promise<ApiResponse<PaginatedResult<IAcademicRecord>>>;
  },
};
