import type { ApiResponse, PaginatedResult } from "../types/api.types";
import type { IMessage } from "../interfaces/message.interface";

const BASE_URL = import.meta.env.VITE_API_URL as string;

export const messagesService = {
  getAll: async (
    token: string,
  ): Promise<ApiResponse<PaginatedResult<IMessage>>> => {
    const res = await fetch(`${BASE_URL}/messages`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json() as Promise<ApiResponse<PaginatedResult<IMessage>>>;
  },
};
