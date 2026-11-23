import { apiClient } from "./api.client";
import type { LoginDto, LoginResult } from "../interfaces/auth.interface";

export const authService = {
  login: (dto: LoginDto) => apiClient.post<LoginResult>("/auth/login", dto),
};
