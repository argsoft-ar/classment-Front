import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAsyncData } from "./useAsyncData";
import { academicRecordsService } from "../services/academic-records.service";
import { buildProgressItems, toStatusGroups } from "../utils/progress.utils";
import { ROUTES } from "../config/navigation.config";

export function useMyProgress() {
  const navigate = useNavigate();
  const loader = useCallback(() => academicRecordsService.getMine(), []);
  const { data, isLoading, error } = useAsyncData(loader);
  const career = data?.careers[0] ?? null;

  return {
    isLoading: isLoading && !data,
    error,
    title: data ? `Hola, ${data.student.firstName}` : "Mi avance",
    subtitle: career ? `${career.careerName} · Cohorte ${career.cohortYear}` : "",
    hasCareer: career !== null,
    summaryItems: career ? buildProgressItems(career.summary) : [],
    groups: career ? toStatusGroups(career.years) : [],
    goToEnrollment: () => navigate(ROUTES.student.enrollment),
  };
}
