import { useCallback } from "react";
import type { ApiResponse } from "../types/api.types";
import { TOKEN_KEY } from "../auth/AuthContext";

const BASE_URL = import.meta.env.VITE_API_URL as string;

function getHeaders(): HeadersInit {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

export function useApi() {
  const get = useCallback(async <T>(path: string): Promise<ApiResponse<T>> => {
    const res = await fetch(`${BASE_URL}${path}`, { headers: getHeaders() });
    return res.json() as Promise<ApiResponse<T>>;
  }, []);

  const post = useCallback(
    async <T>(path: string, body: unknown): Promise<ApiResponse<T>> => {
      const res = await fetch(`${BASE_URL}${path}`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(body),
      });
      return res.json() as Promise<ApiResponse<T>>;
    },
    [],
  );

  const put = useCallback(
    async <T>(path: string, body: unknown): Promise<ApiResponse<T>> => {
      const res = await fetch(`${BASE_URL}${path}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(body),
      });
      return res.json() as Promise<ApiResponse<T>>;
    },
    [],
  );

  const del = useCallback(async <T>(path: string): Promise<ApiResponse<T>> => {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return res.json() as Promise<ApiResponse<T>>;
  }, []);

  return { get, post, put, delete: del };
}
