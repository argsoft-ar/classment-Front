import { useState, useCallback, type FormEvent } from "react";

type Validator<T> = (values: T) => Record<string, string>;

export function useForm<T extends Record<string, string>>(
  initialValues: T,
  validate?: Validator<T>,
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = useCallback((name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  const handleSubmit = useCallback(
    (onValid: (values: T) => void) => (e: FormEvent) => {
      e.preventDefault();
      const validationErrors = validate ? validate(values) : {};
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }
      onValid(values);
    },
    [values, validate],
  );

  const setError = useCallback((name: string, message: string) => {
    setErrors((prev) => ({ ...prev, [name]: message }));
  }, []);

  /** Resets to the initial values, or to `next` (e.g. to prefill an edit form). */
  const reset = useCallback(
    (next?: T) => {
      setValues(next ?? initialValues);
      setErrors({});
    },
    [initialValues],
  );

  return { values, errors, handleChange, handleSubmit, setError, setErrors, reset };
}
