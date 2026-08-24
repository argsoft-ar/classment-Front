import React from "react";
import styles from "./Form.module.css";

export interface FormField {
  name: string;
  label: string;
  type: "text" | "email" | "password" | "select" | "textarea";
  placeholder?: string;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
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
      {fields.map((field) => (
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
              autoComplete={
                field.type === "password" ? "current-password" : "on"
              }
            />
          )}

          {errors[field.name] && (
            <span className={styles.errorMsg}>{errors[field.name]}</span>
          )}
        </div>
      ))}

      <button type="submit" className={styles.submitBtn} disabled={isLoading}>
        {isLoading ? "Cargando..." : submitLabel}
      </button>
    </form>
  );
}
