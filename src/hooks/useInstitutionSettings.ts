import { useCallback, useState } from "react";
import { useAsyncData } from "./useAsyncData";
import { useForm } from "./useForm";
import { useNotify } from "./useNotify";
import { institutionService } from "../services/institution.service";
import { getErrorMessage, getFieldErrors } from "../utils/error.utils";
import type { IInstitutionConfig } from "../interfaces/institution.interface";
import type { FormField } from "../components/Form/Form";

type InstitutionFormValues = {
  name: string;
  cue: string;
  address: string;
  allowsPromotion: string;
  passingGrade: string;
  promotionGrade: string;
  validateFinalCorrelatives: string;
};

const EMPTY_VALUES: InstitutionFormValues = {
  name: "",
  cue: "",
  address: "",
  allowsPromotion: "false",
  passingGrade: "4",
  promotionGrade: "",
  validateFinalCorrelatives: "true",
};

const FIELDS: FormField[] = [
  { name: "name", label: "Nombre del instituto", type: "text", required: true },
  { name: "cue", label: "CUE", type: "text", required: true },
  { name: "address", label: "Dirección", type: "text", required: true },
  { name: "passingGrade", label: "Nota mínima de aprobación", type: "number", min: 1, max: 10, required: true },
  { name: "allowsPromotion", label: "Permite promoción directa", type: "checkbox" },
  { name: "promotionGrade", label: "Nota de promoción (si aplica)", type: "number", min: 1, max: 10 },
  {
    name: "validateFinalCorrelatives",
    label: "Validar correlatividades para rendir finales",
    type: "checkbox",
  },
];

function toFormValues(config: IInstitutionConfig): InstitutionFormValues {
  return {
    name: config.name,
    cue: config.cue,
    address: config.address,
    allowsPromotion: String(config.allowsPromotion),
    passingGrade: String(config.passingGrade),
    promotionGrade: config.promotionGrade === null ? "" : String(config.promotionGrade),
    validateFinalCorrelatives: String(config.validateFinalCorrelatives),
  };
}

const isGrade = (value: number) => Number.isInteger(value) && value >= 1 && value <= 10;

function validateInstitution(values: InstitutionFormValues): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!values.name.trim()) errors.name = "Requerido";
  if (!values.cue.trim()) errors.cue = "Requerido";
  if (!values.address.trim()) errors.address = "Requerido";
  if (!isGrade(Number(values.passingGrade))) errors.passingGrade = "Entre 1 y 10";
  if (values.promotionGrade && !isGrade(Number(values.promotionGrade))) {
    errors.promotionGrade = "Entre 1 y 10";
  }
  if (values.allowsPromotion === "true" && !values.promotionGrade) {
    errors.promotionGrade = "Requerida si se permite promoción";
  }
  return errors;
}

export function useInstitutionSettings() {
  const notify = useNotify();
  const form = useForm<InstitutionFormValues>(EMPTY_VALUES, validateInstitution);
  const [isSaving, setIsSaving] = useState(false);
  const { reset, setErrors, handleSubmit } = form;

  const loader = useCallback(async () => {
    const config = await institutionService.getConfig();
    reset(toFormValues(config));
    return config;
  }, [reset]);
  const { data, isLoading, error, setData } = useAsyncData(loader);

  const onSubmit = handleSubmit(async (values) => {
    setIsSaving(true);
    try {
      const updated = await institutionService.update({
        name: values.name.trim(),
        cue: values.cue.trim(),
        address: values.address.trim(),
        allowsPromotion: values.allowsPromotion === "true",
        passingGrade: Number(values.passingGrade),
        promotionGrade: values.promotionGrade ? Number(values.promotionGrade) : null,
        validateFinalCorrelatives: values.validateFinalCorrelatives === "true",
      });
      setData(updated);
      reset(toFormValues(updated));
      notify("Configuración institucional guardada", "success");
    } catch (err) {
      setErrors(getFieldErrors(err));
      notify(getErrorMessage(err), "error", 6000);
    } finally {
      setIsSaving(false);
    }
  });

  return {
    isLoading: isLoading && !data,
    error,
    fields: FIELDS,
    values: form.values,
    errors: form.errors,
    onChange: form.handleChange,
    onSubmit,
    isSaving,
  };
}
