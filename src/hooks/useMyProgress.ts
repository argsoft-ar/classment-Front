import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAsyncData } from "./useAsyncData";
import { academicRecordsService } from "../services/academic-records.service";
import {
  buildProgressItems,
  buildYearFilterGroups,
  toStatusGroups,
} from "../utils/progress.utils";
import { ROUTES } from "../config/navigation.config";

export function useMyProgress() {
  const navigate = useNavigate();
  const loader = useCallback(() => academicRecordsService.getMine(), []);
  const { data, isLoading, error } = useAsyncData(loader);
  const [yearFilter, setYearFilter] = useState<string>("ALL");

  const career = data?.careers[0] ?? null;
  const years = career?.years ?? [];
  const visibleYears =
    yearFilter === "ALL" ? years : years.filter((y) => String(y.yearLevel) === yearFilter);

  return {
    isLoading: isLoading && !data,
    error,
    title: data ? `Hola, ${data.student.firstName}` : "Mi avance",
    subtitle: career ? `${career.careerName} · Cohorte ${career.cohortYear}` : "",
    hasCareer: career !== null,
    summaryItems: career ? buildProgressItems(career.summary) : [],
    filterGroups: buildYearFilterGroups(years, yearFilter, setYearFilter),
    groups: career ? toStatusGroups(visibleYears) : [],
    goToEnrollment: () => navigate(ROUTES.student.enrollment),
  };
}
