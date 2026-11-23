import type { ApiResponse, QueryParams } from "../types/api.types";
import { tokenStorage } from "../auth/token.storage";

const BASE_URL = import.meta.env.VITE_API_URL as string;

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/**
 * Error thrown for every non-2xx response. Keeps the backend envelope so the UI can read
 * `errors` (e.g. 409 cycle path, 422 rejection reasons, 400 Zod field errors).
 */
export class ApiError extends Error {
  readonly status: number;
  readonly errors: unknown;

  constructor(status: number, message: string, errors?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

let unauthorizedHandler: (() => void) | null = null;

/** Registers a callback invoked when an authenticated request returns 401 (expired/invalid token). */
export function setUnauthorizedHandler(handler: (() => void) | null): void {
  unauthorizedHandler = handler;
}

export function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = tokenStorage.get();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

function buildUrl(path: string, query?: QueryParams): string {
  const url = `${BASE_URL}${path}`;
  if (!query) return url;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== "") params.append(key, String(value));
  }
  const qs = params.toString();
  return qs ? `${url}?${qs}` : url;
}

function isEnvelope(value: unknown): value is ApiResponse {
  return typeof value === "object" && value !== null && "success" in value;
}

async function request<T>(
  method: HttpMethod,
  path: string,
  options: { body?: unknown; query?: QueryParams } = {},
): Promise<T> {
  const headers = getHeaders();
  let res: Response;
  try {
    res = await fetch(buildUrl(path, options.query), {
      method,
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch {
    throw new ApiError(0, "Network error");
  }

  let payload: unknown;
  try {
    payload = await res.json();
  } catch {
    payload = null; // empty or non-JSON body
  }

  if (!res.ok || (isEnvelope(payload) && !payload.success)) {
    const message = isEnvelope(payload) ? payload.message : res.statusText;
    const errors = isEnvelope(payload) ? payload.errors : undefined;
    if (res.status === 401 && headers["Authorization"] && unauthorizedHandler) {
      unauthorizedHandler();
    }
    throw new ApiError(res.status, message || "Request failed", errors);
  }

  return (isEnvelope(payload) ? payload.data : payload) as T;
}

/** Single HTTP client shared by every service. Resolves with `data` of the envelope. */
export const apiClient = {
  get: <T>(path: string, query?: QueryParams) => request<T>("GET", path, { query }),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, { body }),
  put: <T>(path: string, body?: unknown) => request<T>("PUT", path, { body }),
  patch: <T>(path: string, body?: unknown) => request<T>("PATCH", path, { body }),
  delete: <T>(path: string) => request<T>("DELETE", path),
};

export type ApiClient = typeof apiClient;
