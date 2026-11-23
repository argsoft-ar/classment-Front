/** Envelope returned by every backend endpoint (mirrors classment-back src/utils/response.utils.ts). */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: unknown;
}

/** Shape of Zod `flatten()` output sent by the backend on 400 "Validation failed". */
export interface ValidationErrorDetails {
  formErrors: string[];
  fieldErrors: Record<string, string[] | undefined>;
}

/** Query string values accepted by the API client. Undefined / empty values are skipped. */
export type QueryParams = Record<string, string | number | boolean | undefined>;
