import type { ApiResponse } from "../types/api.types";
import type { LoginDto, LoginResponse } from "../interfaces/auth.interface";

const BASE_URL = import.meta.env.VITE_API_URL as string;

export const authService = {
  login: async (dto: LoginDto): Promise<ApiResponse<LoginResponse>> => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    });
    return res.json() as Promise<ApiResponse<LoginResponse>>;
  },
};
