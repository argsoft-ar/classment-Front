import { useCallback, useMemo, useState } from "react";
import { useAsyncData } from "./useAsyncData";
import { offeringsService } from "../services/offerings.service";
import { formatDateTime } from "../utils/date.utils";
import { formatPeriodTitle, yearLabel } from "../utils/labels.utils";
import type { IOffering } from "../interfaces/offering.interface";
import type { IOfferingEnrollment } from "../interfaces/enrollment.interface";

interface RosterPayload {
  offeringId: string;
  items: IOfferingEnrollment[];
}

function buildSubtitle(offering: IOffering, count: number): string {
  const parts = [
    `${yearLabel(offering.subject.yearLevel)} · ${formatPeriodTitle(offering.period)}`,
  ];
  if (offering.teacher) {
    parts.push(`Docente: ${offering.teacher.lastName}, ${offering.teacher.firstName}`);
  }
  if (offering.examDate) {
    parts.push(`Mesa: ${formatDateTime(offering.examDate)}`);
  }
  const countText = offering.maxCapacity
    ? `${count}/${offering.maxCapacity} inscriptos`
    : `${count} ${count === 1 ? "inscripto" : "inscriptos"}`;
  parts.push(countText);
  return parts.join(" · ");
}

export function useOfferingRoster() {
  const [selected, setSelected] = useState<IOffering | null>(null);

  const loader = useMemo(
    () =>
      selected
        ? async (): Promise<RosterPayload> => {
            const items = await offeringsService.getEnrollments(selected.id);
            return { offeringId: selected.id, items };
          }
        : null,
    [selected],
  );

  const { data, isLoading, error } = useAsyncData(loader);
  const current = selected && data?.offeringId === selected.id ? data.items : null;

  const open = useCallback((offering: IOffering) => {
    setSelected(offering);
  }, []);

  const close = useCallback(() => {
    setSelected(null);
  }, []);

  const enrollments = current ?? [];
  const count = current ? enrollments.length : (selected?._count.enrollments ?? 0);

  return {
    open,
    close,
    modalProps: {
      isOpen: selected !== null,
      title: selected ? `Inscriptos — ${selected.subject.name}` : "Inscriptos",
      subtitle: selected ? buildSubtitle(selected, count) : "",
      enrollments,
      isLoading: selected !== null && (isLoading || current === null) && !error,
      error,
      onClose: close,
    },
  };
}
