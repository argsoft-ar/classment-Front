import type { ApiResponse, PaginatedResult } from "../types/api.types";
import type { IUserPublic } from "../interfaces/user.interface";

const BASE_URL = import.meta.env.VITE_API_URL as string;

export const usersService = {
  getAll: async (
    token: string,
  ): Promise<ApiResponse<PaginatedResult<IUserPublic>>> => {
    const res = await fetch(`${BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json() as Promise<ApiResponse<PaginatedResult<IUserPublic>>>;
  },
};
