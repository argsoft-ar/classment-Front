import { useState } from "react";
import { useAsyncData } from "./useAsyncData";
import { useModalForm } from "./useModalForm";
import { useNotify } from "./useNotify";
import type { ConfirmRequest } from "./useConfirm";
import { offeringsService } from "../services/offerings.service";
import { careersService } from "../services/careers.service";
import { subjectsService } from "../services/subjects.service";
import { usersService } from "../services/users.service";
import { getErrorMessage } from "../utils/error.utils";
import { fromDateTimeLocal } from "../utils/date.utils";
import { formatPeriodTitle, yearLabel } from "../utils/labels.utils";
import { RoleLevel } from "../types/rbac.types";
import type { IEnrollmentPeriod } from "../interfaces/enrollment-period.interface";
import type { IOffering } from "../interfaces/offering.interface";
import type { FilterBarGroup } from "../components/FilterBar/FilterBar";
import type { FormField } from "../components/Form/Form";
import type { FormModalProps } from "../components/FormModal/FormModal";
import type { SelectOption } from "../components/Select/Select";

type OfferingFormValues = {
  periodId: string;
  careerId: string;
  subjectId: string;
  teacherId: string;
  examDate: string;
  maxCapacity: string;
};

const INITIAL_VALUES: OfferingFormValues = {
  periodId: "",
  careerId: "",
  subjectId: "",
  teacherId: "",
  examDate: "",
  maxCapacity: "",
};

const ALL_PERIODS = "";

function validateOffering(values: OfferingFormValues): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!values.periodId) errors.periodId = "Seleccioná el período";
  if (!values.careerId) errors.careerId = "Seleccioná la carrera";
  if (!values.subjectId) errors.subjectId = "Seleccioná la materia";
  if (values.maxCapacity) {
    const cap = Number(values.maxCapacity);
    if (!Number.isInteger(cap) || cap < 1) errors.maxCapacity = "Cupo inválido";
  }
  return errors;
}

async function loadOfferingsData() {
  const [offerings, careers, teachers] = await Promise.all([
    offeringsService.getAll(),
    careersService.getAll(),
    usersService.getAll({ role: RoleLevel.DOCENTE }),
  ]);
  const subjectLists = await Promise.all(careers.map((c) => subjectsService.getByCareer(c.id)));
  const subjectsByCareer: Record<string, SelectOption[]> = {};
  careers.forEach((career, i) => {
    subjectsByCareer[career.id] = subjectLists[i].map((s) => ({
      value: s.id,
      label: `${s.name} (${yearLabel(s.yearLevel)})`,
    }));
  });
  return { offerings, careers, teachers, subjectsByCareer };
}

export const periodOptionLabel = (p: IEnrollmentPeriod) => formatPeriodTitle(p);

export function useOfferingsManagement(
  periods: IEnrollmentPeriod[],
  onPeriodsChanged: () => void,
  requestConfirm: (req: ConfirmRequest) => void,
) {
  const notify = useNotify();
  const { data, isLoading, error, reload } = useAsyncData(loadOfferingsData);
  const [periodFilter, setPeriodFilter] = useState<string>(ALL_PERIODS);
  const [yearFilter, setYearFilter] = useState<string>("ALL");
  const modal = useModalForm<OfferingFormValues>(INITIAL_VALUES, validateOffering);

  const careers = data?.careers ?? [];
  const selectedPeriod = periods.find((p) => p.id === modal.values.periodId);
  const isFinalPeriod = selectedPeriod?.type === "FINAL";

  const periodOptions: SelectOption[] = periods.map((p) => ({
    value: p.id,
    label: periodOptionLabel(p),
  }));

  const fields: FormField[] = [
    { name: "periodId", label: "Período", type: "select", required: true, options: periodOptions },
    {
      name: "careerId",
      label: "Carrera",
      type: "select",
      required: true,
      options: careers.map((c) => ({ value: c.id, label: c.name })),
    },
    {
      name: "subjectId",
      label: "Materia",
      type: "select",
      required: true,
      disabled: !modal.values.careerId,
      options: data?.subjectsByCareer[modal.values.careerId] ?? [],
    },
    {
      name: "teacherId",
      label: "Docente (opcional)",
      type: "select",
      options: (data?.teachers ?? []).map((t) => ({
        value: t.id,
        label: `${t.lastName}, ${t.firstName}`,
      })),
    },
    ...(isFinalPeriod
      ? [{ name: "examDate", label: "Fecha y hora del examen", type: "datetime-local" as const }]
      : []),
    { name: "maxCapacity", label: "Cupo máximo (opcional)", type: "number", min: 1 },
  ];

  const onChange = (name: string, value: string) => {
    modal.handleChange(name, value);
    // Subject options depend on the selected career.
    if (name === "careerId") modal.handleChange("subjectId", "");
  };

  const formModal: FormModalProps = {
    isOpen: modal.isOpen,
    title: "Nueva oferta",
    onClose: modal.close,
    fields,
    values: modal.values,
    errors: modal.errors,
    onChange,
    isLoading: modal.isSubmitting,
    submitLabel: "Crear oferta",
    onSubmit: modal.bindSubmit(async (values) => {
      await offeringsService.create({
        periodId: values.periodId,
        subjectId: values.subjectId,
        teacherId: values.teacherId || null,
        examDate: isFinalPeriod ? fromDateTimeLocal(values.examDate) : null,
        maxCapacity: values.maxCapacity ? Number(values.maxCapacity) : null,
      });
      notify("Oferta creada", "success");
      reload();
      onPeriodsChanged();
    }),
  };

  const remove = (offering: IOffering) =>
    requestConfirm({
      title: "Eliminar oferta",
      message: `¿Eliminar la oferta de ${offering.subject.name} en ${offering.period.name}?`,
      confirmLabel: "Eliminar",
      variant: "danger",
      onConfirm: async () => {
        try {
          await offeringsService.delete(offering.id);
          notify("Oferta eliminada", "success");
          reload();
          onPeriodsChanged();
        } catch (err) {
          notify(getErrorMessage(err), "error", 6000);
        }
      },
    });

  const byPeriod = (data?.offerings ?? []).filter(
    (o) => periodFilter === ALL_PERIODS || o.periodId === periodFilter,
  );
  const years = [...new Set(byPeriod.map((o) => o.subject.yearLevel))].sort((a, b) => a - b);
  const yearFilterGroups: FilterBarGroup[] =
    years.length > 1
      ? [
          {
            id: "year",
            label: "Año",
            value: yearFilter,
            onChange: setYearFilter,
            options: [
              { value: "ALL", label: "Todos", count: byPeriod.length },
              ...years.map((y) => ({
                value: String(y),
                label: yearLabel(y),
                count: byPeriod.filter((o) => o.subject.yearLevel === y).length,
              })),
            ],
          },
        ]
      : [];

  const offerings =
    yearFilter === "ALL"
      ? byPeriod
      : byPeriod.filter((o) => String(o.subject.yearLevel) === yearFilter);

  const handlePeriodFilterChange = (value: string) => {
    setPeriodFilter(value);
    setYearFilter("ALL");
  };

  return {
    offerings,
    isLoading,
    error,
    yearFilterGroups,
    filter: {
      name: "periodFilter",
      label: "Filtrar por período",
      value: periodFilter,
      options: periodOptions,
      placeholder: "Todos los períodos",
      onChange: handlePeriodFilterChange,
    },
    setPeriodFilter: handlePeriodFilterChange,
    openCreate: () =>
      modal.openCreate({
        periodId: periodFilter,
        careerId: careers.length === 1 ? careers[0].id : "",
      }),
    remove,
    formModal,
  };
}
