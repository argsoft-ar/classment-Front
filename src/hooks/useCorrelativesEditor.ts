import { useCallback, useMemo, useState } from "react";
import { useAsyncData } from "./useAsyncData";
import { useForm } from "./useForm";
import { useNotify } from "./useNotify";
import { correlativesService } from "../services/correlatives.service";
import { getErrorMessage } from "../utils/error.utils";
import {
  REQUIRED_STATUS_LABELS,
  SCOPE_LABELS,
  toOptions,
  yearLabel,
} from "../utils/labels.utils";
import type { ISubjectSummary } from "../interfaces/subject.interface";
import type {
  CorrelativeScope,
  RequiredStatus,
  ISubjectCorrelatives,
} from "../interfaces/correlative.interface";
import type { FormField } from "../components/Form/Form";
import type { TagItem } from "../components/TagList/TagList";

type CorrelativeFormValues = {
  requiredSubjectId: string;
  appliesTo: string;
  requiredStatus: string;
};

const INITIAL_VALUES: CorrelativeFormValues = {
  requiredSubjectId: "",
  appliesTo: "CURSADA",
  requiredStatus: "REGULARIZADA",
};

export type CorrelativeRow = ISubjectCorrelatives["correlatives"][number];

const SCOPES = toOptions(SCOPE_LABELS);
const REQUIRED_STATUSES = toOptions(REQUIRED_STATUS_LABELS);

function validateCorrelative(values: CorrelativeFormValues): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!values.requiredSubjectId) errors.requiredSubjectId = "Seleccioná la materia requerida";
  if (!values.appliesTo) errors.appliesTo = "Seleccioná a qué aplica";
  if (!values.requiredStatus) errors.requiredStatus = "Seleccioná el estado requerido";
  return errors;
}

function isScope(value: string): value is CorrelativeScope {
  return SCOPES.some((o) => o.value === value);
}

function isRequiredStatus(value: string): value is RequiredStatus {
  return REQUIRED_STATUSES.some((o) => o.value === value);
}

/**
 * Correlatives editor for one subject at a time. The frontend only collects the rule;
 * self-reference (422) and cycles (409) are rejected by the backend engine.
 */
export function useCorrelativesEditor(subjects: ISubjectSummary[], onChanged: () => void) {
  const notify = useNotify();
  const [subjectId, setSubjectId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const form = useForm<CorrelativeFormValues>(INITIAL_VALUES, validateCorrelative);

  const loader = useMemo(
    () => (subjectId ? () => correlativesService.getBySubject(subjectId) : null),
    [subjectId],
  );
  const { data, isLoading, error, reload } = useAsyncData(loader);
  const current = data && data.subject.id === subjectId ? data : null;
  const subject = subjects.find((s) => s.id === subjectId) ?? null;

  const { reset, handleSubmit } = form;

  const open = useCallback(
    (target: ISubjectSummary) => {
      reset();
      setSubjectId(target.id);
    },
    [reset],
  );

  const close = useCallback(() => {
    if (!isSaving) setSubjectId(null);
  }, [isSaving]);

  const refresh = useCallback(() => {
    reload();
    onChanged();
  }, [reload, onChanged]);

  const fields: FormField[] = [
    {
      name: "requiredSubjectId",
      label: "Materia requerida",
      type: "select",
      required: true,
      options: subjects.map((s) => ({
        value: s.id,
        label: `${s.name} (${yearLabel(s.yearLevel)})`,
      })),
    },
    { name: "appliesTo", label: "Aplica a", type: "select", required: true, options: SCOPES },
    {
      name: "requiredStatus",
      label: "Estado requerido",
      type: "select",
      required: true,
      options: REQUIRED_STATUSES,
    },
  ];

  const onSubmit = handleSubmit(async (values) => {
    if (!subjectId || !isScope(values.appliesTo) || !isRequiredStatus(values.requiredStatus)) {
      return;
    }
    setIsSaving(true);
    try {
      await correlativesService.create({
        subjectId,
        requiredSubjectId: values.requiredSubjectId,
        appliesTo: values.appliesTo,
        requiredStatus: values.requiredStatus,
      });
      notify("Correlatividad agregada", "success");
      reset();
      refresh();
    } catch (err) {
      notify(getErrorMessage(err, "No se pudo agregar la correlatividad."), "error", 7000);
    } finally {
      setIsSaving(false);
    }
  });

  const remove = async (rule: CorrelativeRow) => {
    setDeletingId(rule.id);
    try {
      await correlativesService.delete(rule.id);
      notify(`Correlatividad con ${rule.requiredSubject.name} eliminada`, "success");
      refresh();
    } catch (err) {
      notify(getErrorMessage(err, "No se pudo eliminar la correlatividad."), "error");
    } finally {
      setDeletingId(null);
    }
  };

  const requiredBy: TagItem[] = (current?.requiredBy ?? []).map((r) => ({
    label: `${r.subject.name} · ${SCOPE_LABELS[r.appliesTo].toLowerCase()} (${REQUIRED_STATUS_LABELS[r.requiredStatus]})`,
    tone: "info",
  }));

  return {
    isOpen: subjectId !== null,
    title: subject ? `Correlatividades de ${subject.name}` : "Correlatividades",
    open,
    close,
    rules: current?.correlatives ?? [],
    requiredBy,
    isLoading: (isLoading || current === null) && !error,
    error,
    deletingId,
    remove: (rule: CorrelativeRow) => void remove(rule),
    form: {
      fields,
      values: form.values,
      errors: form.errors,
      onChange: form.handleChange,
      onSubmit,
      isLoading: isSaving,
      submitLabel: "Agregar correlatividad",
    },
  };
}
