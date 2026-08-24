import type { ApiResponse, PaginatedResult } from "../types/api.types";
import type { IAttendance } from "../interfaces/attendance.interface";

const BASE_URL = import.meta.env.VITE_API_URL as string;

export const attendanceService = {
  getAll: async (
    token: string,
  ): Promise<ApiResponse<PaginatedResult<IAttendance>>> => {
    const res = await fetch(`${BASE_URL}/attendance`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json() as Promise<ApiResponse<PaginatedResult<IAttendance>>>;
  },
};
