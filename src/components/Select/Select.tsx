import { useId } from "react";
import styles from "./Select.module.css";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  /** Nombre del campo (también base del id) */
  name: string;
  /** Etiqueta visible / accesible */
  label: string;
  /** Valor seleccionado (controlado) */
  value: string;
  /** Opciones disponibles */
  options: SelectOption[];
  /** Devuelve el nuevo valor seleccionado */
  onChange: (value: string) => void;
  /** Texto de la opción vacía; si se omite no se renderiza opción vacía */
  placeholder?: string;
  /** Mensaje de error */
  error?: string;
  /** Deshabilita el control */
  disabled?: boolean;
  /** Marca el campo como requerido */
  required?: boolean;
  /** Oculta visualmente la etiqueta (sigue disponible para lectores de pantalla) */
  hideLabel?: boolean;
  /** Tamaño del control */
  size?: "sm" | "md";
}

export function Select({
  name,
  label,
  value,
  options,
  onChange,
  placeholder,
  error,
  disabled = false,
  required = false,
  hideLabel = false,
  size = "md",
}: SelectProps) {
  const id = `${name}-${useId()}`;
  const errorId = `${id}-error`;

  return (
    <div className={styles.fieldGroup}>
      <label className={hideLabel ? styles.srOnly : styles.label} htmlFor={id}>
        {label}
        {required && (
          <span className={styles.required} aria-hidden="true">
            *
          </span>
        )}
      </label>
      <select
        id={id}
        name={name}
        className={[
          styles.select,
          styles[`select--${size}`],
          error ? styles.selectError : "",
        ]
          .filter(Boolean)
          .join(" ")}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <span id={errorId} className={styles.errorMsg} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
