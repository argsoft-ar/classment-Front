import type { CSSProperties, ReactNode } from "react";
import styles from "./Table.module.css";

type TableStyle = CSSProperties & { "--table-max-height"?: string };

export interface TableColumn<T> {
  /** Clave de la columna (también usada para leer row[key] si no hay render) */
  key: string;
  /** Texto del encabezado (también usado como data-label en mobile) */
  header: string;
  /** Render personalizado de la celda */
  render?: (row: T) => ReactNode;
  /** Alineación del contenido */
  align?: "left" | "center" | "right";
}

export interface TableProps<T extends object> {
  /** Definición de columnas */
  columns: TableColumn<T>[];
  /** Filas de datos */
  rows: T[];
  /** Devuelve una clave única por fila */
  rowKey: (row: T) => string;
  /** Mensaje cuando no hay filas */
  emptyMessage?: string;
  /** Muestra estado de carga */
  isLoading?: boolean;
  /** Mensaje durante la carga */
  loadingMessage?: string;
  /** Descripción accesible de la tabla (oculta visualmente) */
  caption?: string;
  /**
   * Alto máximo del contenedor con scroll (número = px). Por defecto 600px.
   * El encabezado queda fijo (sticky) en modo tabla.
   */
  maxHeight?: number | string;
}

function renderDefault(row: object, key: string): ReactNode {
  const value: unknown = Reflect.get(row, key);
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "string" || typeof value === "number") return value;
  if (typeof value === "boolean") return value ? "Sí" : "No";
  return "—";
}

export function Table<T extends object>({
  columns,
  rows,
  rowKey,
  emptyMessage = "No hay datos para mostrar.",
  isLoading = false,
  loadingMessage = "Cargando...",
  caption,
  maxHeight,
}: TableProps<T>) {
  const alignClass = (align: TableColumn<T>["align"]) =>
    align && align !== "left" ? styles[`align--${align}`] : "";

  const wrapperStyle: TableStyle | undefined =
    maxHeight === undefined
      ? undefined
      : {
          "--table-max-height":
            typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight,
        };

  return (
    <div
      className={styles.wrapper}
      style={wrapperStyle}
      role="region"
      aria-label={caption ?? "Tabla de datos"}
      tabIndex={0}
    >
      <table className={styles.table} aria-busy={isLoading || undefined}>
        {caption && <caption className={styles.caption}>{caption}</caption>}
        <thead className={styles.thead}>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={`${styles.th} ${alignClass(col.align)}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={styles.tbody}>
          {isLoading ? (
            <tr className={styles.stateRow}>
              <td
                className={styles.stateCell}
                colSpan={columns.length}
                role="status"
              >
                <span className={styles.spinner} aria-hidden="true" />
                {loadingMessage}
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr className={styles.stateRow}>
              <td className={styles.stateCell} colSpan={columns.length}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={rowKey(row)} className={styles.row}>
                {columns.map((col) => (
                  <td
                    key={col.key}
                    data-label={col.header}
                    className={`${styles.cell} ${alignClass(col.align)}`}
                  >
                    {col.render ? col.render(row) : renderDefault(row, col.key)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
