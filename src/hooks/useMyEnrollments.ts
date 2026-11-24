import { useCallback, useState } from "react";
import { useAsyncData } from "./useAsyncData";
import { useNotify } from "./useNotify";
import { useConfirm } from "./useConfirm";
import { enrollmentsService } from "../services/enrollments.service";
import { getErrorMessage } from "../utils/error.utils";
import type { IEnrollment } from "../interfaces/enrollment.interface";
import type { FilterBarGroup } from "../components/FilterBar/FilterBar";

type EnrollmentStatusFilter = "ALL" | "ACTIVA" | "BAJA";

export function useMyEnrollments() {
  const notify = useNotify();
  const confirm = useConfirm();
  const loader = useCallback(() => enrollmentsService.getMine(), []);
  const { data, isLoading, error, reload } = useAsyncData(loader);
  const [statusFilter, setStatusFilter] = useState<EnrollmentStatusFilter>("ALL");

  const allEnrollments = data ?? [];
  const activeCount = allEnrollments.filter((e) => e.status === "ACTIVA").length;
  const droppedCount = allEnrollments.filter((e) => e.status === "BAJA").length;

  const filterGroups: FilterBarGroup[] =
    allEnrollments.length > 0
      ? [
          {
            id: "status",
            label: "Estado",
            value: statusFilter,
            onChange: (value: string) => setStatusFilter(value as EnrollmentStatusFilter),
            options: [
              { value: "ALL", label: "Todas", count: allEnrollments.length },
              { value: "ACTIVA", label: "Activas", count: activeCount },
              { value: "BAJA", label: "Dadas de baja", count: droppedCount },
            ],
          },
        ]
      : [];

  const enrollments =
    statusFilter === "ALL"
      ? allEnrollments
      : allEnrollments.filter((e) => e.status === statusFilter);

  const drop = (enrollment: IEnrollment) =>
    confirm.request({
      title: "Dar de baja",
      message: `¿Confirmás la baja de tu inscripción a ${enrollment.offering.subject.name}?`,
      confirmLabel: "Dar de baja",
      variant: "danger",
      onConfirm: async () => {
        try {
          await enrollmentsService.drop(enrollment.id);
          notify(`Baja registrada: ${enrollment.offering.subject.name}`, "success");
          reload();
        } catch (err) {
          notify(getErrorMessage(err, "No se pudo dar de baja."), "error", 6000);
        }
      },
    });

  return {
    enrollments,
    hasAny: allEnrollments.length > 0,
    filterGroups,
    isLoading: isLoading && !data,
    error,
    drop,
    canDrop: (enrollment: IEnrollment) => enrollment.status === "ACTIVA",
    confirmModal: confirm.modalProps,
  };
}
