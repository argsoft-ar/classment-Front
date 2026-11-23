import { useCallback } from "react";
import { useAsyncData } from "./useAsyncData";
import { useNotify } from "./useNotify";
import { useConfirm } from "./useConfirm";
import { enrollmentsService } from "../services/enrollments.service";
import { getErrorMessage } from "../utils/error.utils";
import type { IEnrollment } from "../interfaces/enrollment.interface";

export function useMyEnrollments() {
  const notify = useNotify();
  const confirm = useConfirm();
  const loader = useCallback(() => enrollmentsService.getMine(), []);
  const { data, isLoading, error, reload } = useAsyncData(loader);

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
    enrollments: data ?? [],
    isLoading: isLoading && !data,
    error,
    drop,
    canDrop: (enrollment: IEnrollment) => enrollment.status === "ACTIVA",
    confirmModal: confirm.modalProps,
  };
}
