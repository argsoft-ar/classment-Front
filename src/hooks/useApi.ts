import { apiClient, type ApiClient } from "../services/api.client";

/**
 * Exposes the shared API client (Bearer token from storage via getHeaders, envelope parsing,
 * ApiError on non-2xx). Services use `apiClient` directly; hooks may use this.
 */
export function useApi(): ApiClient {
  return apiClient;
}
