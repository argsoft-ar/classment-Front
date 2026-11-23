import type { FormEvent, ReactNode } from "react";
import { Modal } from "../Modal/Modal";
import { Form, type FormField } from "../Form/Form";

export interface FormModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  fields: FormField[];
  values: Record<string, string>;
  errors: Record<string, string>;
  onChange: (name: string, value: string) => void;
  onSubmit: (e: FormEvent) => void;
  submitLabel?: string;
  isLoading?: boolean;
  size?: "sm" | "md" | "lg";
  /** Content rendered above the form (hints, callouts) */
  children?: ReactNode;
}

/** Modal dialog hosting a config-driven Form. */
export function FormModal({
  isOpen,
  title,
  onClose,
  fields,
  values,
  errors,
  onChange,
  onSubmit,
  submitLabel = "Guardar",
  isLoading = false,
  size = "md",
  children,
}: FormModalProps) {
  return (
    <Modal isOpen={isOpen} title={title} onClose={onClose} size={size}>
      {children}
      <Form
        fields={fields}
        values={values}
        errors={errors}
        onChange={onChange}
        onSubmit={onSubmit}
        submitLabel={submitLabel}
        isLoading={isLoading}
      />
    </Modal>
  );
}
