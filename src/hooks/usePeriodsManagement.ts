import { useAsyncData } from "./useAsyncData";
import { useModalForm } from "./useModalForm";
import { useNotify } from "./useNotify";
import { enrollmentPeriodsService } from "../services/enrollment-periods.service";
import { getErrorMessage } from "../utils/error.utils";
import { dateTimeLocalFromNow, fromDateTimeLocal } from "../utils/date.utils";
import { PERIOD_TYPE_LABELS, toOptions } from "../utils/labels.utils";
import { getPeriodState, type PeriodState } from "../utils/period.utils";
import type { IEnrollmentPeriod, PeriodType } from "../interfaces/enrollment-period.interface";
import type { FormField } from "../components/Form/Form";
import type { FormModalProps } from "../components/FormModal/FormModal";

type PeriodFormValues = {
  type: string;
  name: string;
  academicYear: string;
  callNumber: string;
  startsAt: string;
  endsAt: string;
  isActive: string;
};

export interface PeriodRow extends IEnrollmentPeriod {
  state: PeriodState;
}

const INITIAL_VALUES: PeriodFormValues = {
  type: "CURSADA",
  name: "",
  academicYear: String(new Date().getFullYear()),
  callNumber: "",
  startsAt: "",
  endsAt: "",
  isActive: "true",
};

const TYPE_OPTIONS = toOptions(PERIOD_TYPE_LABELS);

function isPeriodType(value: string): value is PeriodType {
  return TYPE_OPTIONS.some((o) => o.value === value);
}

function validatePeriod(values: PeriodFormValues): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!isPeriodType(values.type)) errors.type = "Seleccioná el tipo";
  if (!values.name.trim()) errors.name = "El nombre es requerido";
  const year = Number(values.academicYear);
  if (!Number.isInteger(year) || year < 2000 || year > 2100) errors.academicYear = "Año inválido";
  if (values.type === "FINAL" && !values.callNumber) errors.callNumber = "Seleccioná el llamado";
  if (!values.startsAt) errors.startsAt = "Indicá la apertura";
  if (!values.endsAt) errors.endsAt = "Indicá el cierre";
  if (values.startsAt && values.endsAt && values.endsAt <= values.startsAt) {
    errors.endsAt = "El cierre debe ser posterior a la apertura";
  }
  return errors;
}

async function loadPeriods(): Promise<PeriodRow[]> {
  const periods = await enrollmentPeriodsService.getAll();
  const now = Date.now();
  return periods.map((p) => ({ ...p, state: getPeriodState(p, now) }));
}

export function usePeriodsManagement() {
  const notify = useNotify();
  const { data, isLoading, error, reload } = useAsyncData(loadPeriods);
  const modal = useModalForm<PeriodFormValues>(INITIAL_VALUES, validatePeriod);

  const fields: FormField[] = [
    { name: "type", label: "Tipo", type: "select", required: true, options: TYPE_OPTIONS },
    {
      name: "name",
      label: "Nombre",
      type: "text",
      placeholder: "Ej.: Turno Diciembre — 1° llamado",
      required: true,
    },
    { name: "academicYear", label: "Ciclo lectivo", type: "number", min: 2000, max: 2100, required: true },
    ...(modal.values.type === "FINAL"
      ? [
          {
            name: "callNumber",
            label: "Llamado",
            type: "select" as const,
            required: true,
            options: [
              { value: "1", label: "1° llamado" },
              { value: "2", label: "2° llamado" },
            ],
          },
        ]
      : []),
    { name: "startsAt", label: "Apertura de inscripción", type: "datetime-local", required: true },
    { name: "endsAt", label: "Cierre de inscripción", type: "datetime-local", required: true },
    { name: "isActive", label: "Período activo", type: "checkbox" },
  ];

  const formModal: FormModalProps = {
    isOpen: modal.isOpen,
    title: "Nuevo período de inscripción",
    onClose: modal.close,
    fields,
    values: modal.values,
    errors: modal.errors,
    onChange: modal.handleChange,
    isLoading: modal.isSubmitting,
    submitLabel: "Crear período",
    onSubmit: modal.bindSubmit(async (values) => {
      if (!isPeriodType(values.type)) return;
      const startsAt = fromDateTimeLocal(values.startsAt);
      const endsAt = fromDateTimeLocal(values.endsAt);
      if (!startsAt || !endsAt) return;
      await enrollmentPeriodsService.create({
        type: values.type,
        name: values.name.trim(),
        academicYear: Number(values.academicYear),
        callNumber: values.type === "FINAL" ? Number(values.callNumber) : null,
        startsAt,
        endsAt,
        isActive: values.isActive === "true",
      });
      notify("Período creado", "success");
      reload();
    }),
  };

  const toggleActive = async (period: PeriodRow) => {
    try {
      await enrollmentPeriodsService.update(period.id, { isActive: !period.isActive });
      notify(period.isActive ? "Período desactivado" : "Período activado", "success");
      reload();
    } catch (err) {
      notify(getErrorMessage(err), "error");
    }
  };

  return {
    periods: data ?? [],
    isLoading,
    error,
    reload,
    openCreate: () =>
      modal.openCreate({ startsAt: dateTimeLocalFromNow(0), endsAt: dateTimeLocalFromNow(30, 23) }),
    toggleActive: (period: PeriodRow) => void toggleActive(period),
    formModal,
  };
}
