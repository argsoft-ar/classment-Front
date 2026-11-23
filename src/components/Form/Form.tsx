import React from "react";
import styles from "./Form.module.css";

export interface FormField {
  name: string;
  label: string;
  type:
    | "text"
    | "email"
    | "password"
    | "select"
    | "textarea"
    | "number"
    | "date"
    | "datetime-local"
    | "checkbox";
  placeholder?: string;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  /** Valor mínimo (number / date / datetime-local) */
  min?: string | number;
  /** Valor máximo (number / date / datetime-local) */
  max?: string | number;
  /** Deshabilita el campo */
  disabled?: boolean;
}

interface FormProps {
  fields: FormField[];
  values: Record<string, string>;
  errors: Record<string, string>;
  onChange: (name: string, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitLabel?: string;
  isLoading?: boolean;
}

export function Form({
  fields,
  values,
  errors,
  onChange,
  onSubmit,
  submitLabel = "Enviar",
  isLoading = false,
}: FormProps) {
  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      {fields.map((field) =>
        field.type === "checkbox" ? (
          <div
            key={field.name}
            className={`${styles.fieldGroup} ${styles.checkboxGroup}`}
          >
            <div className={styles.checkboxRow}>
              <input
                id={field.name}
                name={field.name}
                type="checkbox"
                className={styles.checkbox}
                checked={values[field.name] === "true"}
                onChange={(e) =>
                  onChange(field.name, e.target.checked ? "true" : "false")
                }
                required={field.required}
                disabled={field.disabled}
                aria-invalid={errors[field.name] ? true : undefined}
                aria-describedby={
                  errors[field.name] ? `${field.name}-error` : undefined
                }
              />
              <label className={styles.label} htmlFor={field.name}>
                {field.label}
                {field.required && <span className={styles.required}>*</span>}
              </label>
            </div>
            {errors[field.name] && (
              <span id={`${field.name}-error`} className={styles.errorMsg}>
                {errors[field.name]}
              </span>
            )}
          </div>
        ) : (
        <div key={field.name} className={styles.fieldGroup}>
          <label className={styles.label} htmlFor={field.name}>
            {field.label}
            {field.required && <span className={styles.required}>*</span>}
          </label>

          {field.type === "select" ? (
            <select
              id={field.name}
              name={field.name}
              className={`${styles.input} ${errors[field.name] ? styles.inputError : ""}`}
              value={values[field.name] ?? ""}
              onChange={(e) => onChange(field.name, e.target.value)}
              required={field.required}
              disabled={field.disabled}
              aria-invalid={errors[field.name] ? true : undefined}
              aria-describedby={
                errors[field.name] ? `${field.name}-error` : undefined
              }
            >
              <option value="">Seleccionar...</option>
              {field.options?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : field.type === "textarea" ? (
            <textarea
              id={field.name}
              name={field.name}
              className={`${styles.input} ${styles.textarea} ${errors[field.name] ? styles.inputError : ""}`}
              placeholder={field.placeholder}
              value={values[field.name] ?? ""}
              onChange={(e) => onChange(field.name, e.target.value)}
              required={field.required}
              disabled={field.disabled}
              aria-invalid={errors[field.name] ? true : undefined}
              aria-describedby={
                errors[field.name] ? `${field.name}-error` : undefined
              }
              rows={4}
            />
          ) : (
            <input
              id={field.name}
              name={field.name}
              type={field.type}
              className={`${styles.input} ${errors[field.name] ? styles.inputError : ""}`}
              placeholder={field.placeholder}
              value={values[field.name] ?? ""}
              onChange={(e) => onChange(field.name, e.target.value)}
              required={field.required}
              disabled={field.disabled}
              min={field.min}
              max={field.max}
              aria-invalid={errors[field.name] ? true : undefined}
              aria-describedby={
                errors[field.name] ? `${field.name}-error` : undefined
              }
              autoComplete={
                field.type === "password" ? "current-password" : "on"
              }
            />
          )}

          {errors[field.name] && (
            <span id={`${field.name}-error`} className={styles.errorMsg}>
              {errors[field.name]}
            </span>
          )}
        </div>
      ))}

      <button type="submit" className={styles.submitBtn} disabled={isLoading}>
        {isLoading ? "Cargando..." : submitLabel}
      </button>
    </form>
  );
}
