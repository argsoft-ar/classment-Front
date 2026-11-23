import { useCallback, useState } from "react";
import { useForm } from "./useForm";
import { useNotify } from "./useNotify";
import { getErrorMessage, getFieldErrors } from "../utils/error.utils";

type Validator<T> = (values: T) => Record<string, string>;

/**
 * Create/edit modal state around useForm: open/close, edit target, submitting flag and
 * uniform API error handling (field errors + toast).
 */
export function useModalForm<T extends Record<string, string>>(
  initialValues: T,
  validate?: Validator<T>,
) {
  const form = useForm<T>(initialValues, validate);
  const notify = useNotify();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { reset, setErrors, handleSubmit } = form;

  const openCreate = useCallback(
    (overrides: Partial<T> = {}) => {
      reset({ ...initialValues, ...overrides });
      setEditingId(null);
      setIsOpen(true);
    },
    [reset, initialValues],
  );

  const openEdit = useCallback(
    (id: string, values: T) => {
      reset(values);
      setEditingId(id);
      setIsOpen(true);
    },
    [reset],
  );

  const close = useCallback(() => {
    if (!isSubmitting) setIsOpen(false);
  }, [isSubmitting]);

  /** Wraps an async handler: closes on success, maps errors on failure. */
  const bindSubmit = useCallback(
    (handler: (values: T, editingId: string | null) => Promise<void>, keepOpen = false) =>
      handleSubmit(async (values) => {
        setIsSubmitting(true);
        try {
          await handler(values, editingId);
          if (!keepOpen) setIsOpen(false);
        } catch (err) {
          setErrors(getFieldErrors(err));
          notify(getErrorMessage(err), "error", 6000);
        } finally {
          setIsSubmitting(false);
        }
      }),
    [handleSubmit, editingId, setErrors, notify],
  );

  return {
    ...form,
    isOpen,
    isEditing: editingId !== null,
    editingId,
    isSubmitting,
    openCreate,
    openEdit,
    close,
    bindSubmit,
  };
}
