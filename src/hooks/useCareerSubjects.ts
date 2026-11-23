import { useCallback, useMemo, useState } from "react";
import { useAsyncData } from "./useAsyncData";
import { useModalForm } from "./useModalForm";
import { useNotify } from "./useNotify";
import { useCorrelativesEditor } from "./useCorrelativesEditor";
import { careersService } from "../services/careers.service";
import { subjectsService } from "../services/subjects.service";
import { yearLabel } from "../utils/labels.utils";
import type { ISubjectSummary } from "../interfaces/subject.interface";
import type { FormField } from "../components/Form/Form";
import type { FormModalProps } from "../components/FormModal/FormModal";
import type { TabItem } from "../components/Tabs/Tabs";

type SubjectFormValues = { name: string; yearLevel: string };

const INITIAL_VALUES: SubjectFormValues = { name: "", yearLevel: "1" };

function validateSubject(values: SubjectFormValues): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!values.name.trim()) errors.name = "El nombre es requerido";
  if (!values.yearLevel) errors.yearLevel = "Seleccioná el año";
  return errors;
}

export function useCareerSubjects(careerId: string) {
  const notify = useNotify();
  const loader = useCallback(() => careersService.getCurriculum(careerId), [careerId]);
  const { data, isLoading, error, reload } = useAsyncData(loader);
  const [selectedYear, setSelectedYear] = useState<string>("1");
  const modal = useModalForm<SubjectFormValues>(INITIAL_VALUES, validateSubject);

  const years = useMemo(() => data?.years ?? [], [data]);
  const allSubjects = useMemo(() => years.flatMap((y) => y.subjects), [years]);
  const editor = useCorrelativesEditor(allSubjects, reload);

  const tabs: TabItem[] = years.map((y) => ({
    id: String(y.yearLevel),
    label: yearLabel(y.yearLevel),
    count: y.subjects.length,
  }));
  const activeYear = years.some((y) => String(y.yearLevel) === selectedYear)
    ? selectedYear
    : (tabs[0]?.id ?? "1");
  const activeSubjects = years.find((y) => String(y.yearLevel) === activeYear)?.subjects ?? [];

  const durationYears = data?.career.durationYears ?? 1;
  const subjectFields: FormField[] = [
    { name: "name", label: "Nombre de la materia", type: "text", required: true },
    {
      name: "yearLevel",
      label: "Año de la carrera",
      type: "select",
      required: true,
      options: Array.from({ length: durationYears }, (_, i) => ({
        value: String(i + 1),
        label: yearLabel(i + 1),
      })),
    },
  ];

  const openEdit = (subject: ISubjectSummary) =>
    modal.openEdit(subject.id, { name: subject.name, yearLevel: String(subject.yearLevel) });

  const formModal: FormModalProps = {
    isOpen: modal.isOpen,
    title: modal.isEditing ? "Editar materia" : "Nueva materia",
    onClose: modal.close,
    fields: subjectFields,
    values: modal.values,
    errors: modal.errors,
    onChange: modal.handleChange,
    isLoading: modal.isSubmitting,
    submitLabel: modal.isEditing ? "Guardar cambios" : "Crear materia",
    onSubmit: modal.bindSubmit(async (values, editingId) => {
      const dto = { name: values.name.trim(), yearLevel: Number(values.yearLevel) };
      if (editingId) {
        await subjectsService.update(editingId, dto);
        notify("Materia actualizada", "success");
      } else {
        await subjectsService.create({ careerId, ...dto });
        notify("Materia creada", "success");
      }
      setSelectedYear(values.yearLevel);
      reload();
    }),
  };

  return {
    careerName: data?.career.name ?? "",
    planLabel: data ? `${data.studyPlan.code} · ${durationYears} años` : "",
    isLoading: isLoading && !data,
    error,
    tabs,
    activeYear,
    setActiveYear: setSelectedYear,
    activeSubjects,
    openCreate: () => modal.openCreate({ yearLevel: activeYear }),
    openEdit,
    formModal,
    editor,
  };
}
