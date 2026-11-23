import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAsyncData } from "./useAsyncData";
import { useModalForm } from "./useModalForm";
import { useNotify } from "./useNotify";
import { careersService } from "../services/careers.service";
import { ROUTES } from "../config/navigation.config";
import type { ICareer } from "../interfaces/career.interface";
import type { FormField } from "../components/Form/Form";
import type { FormModalProps } from "../components/FormModal/FormModal";

type CareerFormValues = { name: string; durationYears: string };

const INITIAL_VALUES: CareerFormValues = { name: "", durationYears: "3" };

const CAREER_FIELDS: FormField[] = [
  {
    name: "name",
    label: "Nombre de la carrera",
    type: "text",
    placeholder: "Tecnicatura Superior en...",
    required: true,
  },
  { name: "durationYears", label: "Duración (años)", type: "number", min: 1, max: 10, required: true },
];

function validateCareer(values: CareerFormValues): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!values.name.trim()) errors.name = "El nombre es requerido";
  const years = Number(values.durationYears);
  if (!Number.isInteger(years) || years < 1 || years > 10) {
    errors.durationYears = "Ingresá un número entre 1 y 10";
  }
  return errors;
}

export function useCareersManagement() {
  const navigate = useNavigate();
  const notify = useNotify();
  const loader = useCallback(() => careersService.getAll(), []);
  const { data, isLoading, error, reload } = useAsyncData(loader);
  const modal = useModalForm<CareerFormValues>(INITIAL_VALUES, validateCareer);

  const openEdit = (career: ICareer) =>
    modal.openEdit(career.id, { name: career.name, durationYears: String(career.durationYears) });

  const goToSubjects = (career: ICareer) => navigate(ROUTES.director.careerSubjects(career.id));

  const formModal: FormModalProps = {
    isOpen: modal.isOpen,
    title: modal.isEditing ? "Editar carrera" : "Nueva carrera",
    onClose: modal.close,
    fields: CAREER_FIELDS,
    values: modal.values,
    errors: modal.errors,
    onChange: modal.handleChange,
    isLoading: modal.isSubmitting,
    submitLabel: modal.isEditing ? "Guardar cambios" : "Crear carrera",
    onSubmit: modal.bindSubmit(async (values, editingId) => {
      const dto = { name: values.name.trim(), durationYears: Number(values.durationYears) };
      if (editingId) {
        await careersService.update(editingId, dto);
        notify("Carrera actualizada", "success");
      } else {
        await careersService.create(dto);
        notify("Carrera creada", "success");
      }
      reload();
    }),
  };

  return {
    careers: data ?? [],
    isLoading,
    error,
    openCreate: () => modal.openCreate(),
    openEdit,
    goToSubjects,
    formModal,
  };
}
