import { useCallback } from "react";
import { useAsyncData } from "./useAsyncData";
import { offeringsService } from "../services/offerings.service";

/** Docente: the backend only returns offerings assigned to the authenticated teacher. */
export function useTeacherOfferings() {
  const loader = useCallback(() => offeringsService.getAll(), []);
  const { data, isLoading, error } = useAsyncData(loader);

  return {
    offerings: data ?? [],
    isLoading: isLoading && !data,
    error,
  };
}
