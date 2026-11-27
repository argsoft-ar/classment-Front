import { useCallback, useState } from "react";
import { useAsyncData } from "./useAsyncData";
import { offeringsService } from "../services/offerings.service";
import type { FilterBarGroup } from "../components/FilterBar/FilterBar";
import type { PeriodType } from "../interfaces/enrollment-period.interface";

type OfferingTypeFilter = "ALL" | PeriodType;

/** Docente: the backend only returns offerings assigned to the authenticated teacher. */
export function useTeacherOfferings() {
  const loader = useCallback(() => offeringsService.getAll(), []);
  const { data, isLoading, error } = useAsyncData(loader);
  const [typeFilter, setTypeFilter] = useState<OfferingTypeFilter>("ALL");

  const allOfferings = data ?? [];
  const cursadaCount = allOfferings.filter((o) => o.period.type === "CURSADA").length;
  const finalCount = allOfferings.filter((o) => o.period.type === "FINAL").length;

  const filterGroups: FilterBarGroup[] =
    allOfferings.length > 0
      ? [
          {
            id: "type",
            label: "Tipo",
            value: typeFilter,
            onChange: (value: string) => setTypeFilter(value as OfferingTypeFilter),
            options: [
              { value: "ALL", label: "Todas", count: allOfferings.length },
              { value: "CURSADA", label: "Cursadas", count: cursadaCount },
              { value: "FINAL", label: "Finales", count: finalCount },
            ],
          },
        ]
      : [];

  const offerings =
    typeFilter === "ALL"
      ? allOfferings
      : allOfferings.filter((o) => o.period.type === typeFilter);

  return {
    offerings,
    hasAny: allOfferings.length > 0,
    filterGroups,
    isLoading: isLoading && !data,
    error,
  };
}
