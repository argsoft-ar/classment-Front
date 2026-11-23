import { LoaderCircle, type LucideIcon } from "lucide-react";
import styles from "./Button.module.css";

export interface ButtonProps {
  /** Texto visible del botón */
  label: string;
  /** Variante visual */
  variant?: "primary" | "secondary" | "danger" | "ghost";
  /** Tamaño */
  size?: "sm" | "md" | "lg";
  /** Tipo nativo del botón */
  type?: "button" | "submit" | "reset";
  /** Deshabilita el botón */
  disabled?: boolean;
  /** Muestra spinner y deshabilita el botón */
  isLoading?: boolean;
  /** Texto mostrado mientras isLoading es true */
  loadingLabel?: string;
  /** Ocupa el 100% del ancho disponible */
  fullWidth?: boolean;
  /** Etiqueta accesible alternativa (cuando el label no alcanza como contexto) */
  ariaLabel?: string;
  /** Ícono Lucide opcional (decorativo) */
  icon?: LucideIcon;
  /** Posición del ícono respecto del texto */
  iconPosition?: "left" | "right";
  /**
   * Oculta visualmente el texto y muestra solo el ícono. El `label` se
   * conserva para lectores de pantalla; usá `ariaLabel` si necesitás más contexto.
   */
  iconOnly?: boolean;
  /** Callback de click */
  onClick?: () => void;
}

export function Button({
  label,
  variant = "primary",
  size = "md",
  type = "button",
  disabled = false,
  isLoading = false,
  loadingLabel = "Cargando...",
  fullWidth = false,
  ariaLabel,
  icon: Icon,
  iconPosition = "left",
  iconOnly = false,
  onClick,
}: ButtonProps) {
  const isIconOnly = iconOnly && Icon !== undefined;
  const className = [
    styles.button,
    styles[`button--${variant}`],
    styles[`button--${size}`],
    fullWidth ? styles.fullWidth : "",
    isIconOnly ? styles.iconOnly : "",
  ]
    .filter(Boolean)
    .join(" ");

  const leading = isLoading ? (
    <LoaderCircle className={`${styles.icon} ${styles.spinner}`} aria-hidden="true" />
  ) : Icon && iconPosition === "left" ? (
    <Icon className={styles.icon} aria-hidden="true" />
  ) : null;

  const trailing =
    !isLoading && Icon && iconPosition === "right" ? (
      <Icon className={styles.icon} aria-hidden="true" />
    ) : null;

  return (
    <button
      type={type}
      className={className}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      aria-label={ariaLabel ?? (isIconOnly ? label : undefined)}
      onClick={onClick}
    >
      {leading}
      <span className={isIconOnly ? styles.srOnly : undefined}>
        {isLoading ? loadingLabel : label}
      </span>
      {trailing}
    </button>
  );
}
