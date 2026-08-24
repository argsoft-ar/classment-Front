import styles from "./NotificationToast.module.css";

interface NotificationToastProps {
  message: string;
  type: "success" | "error" | "warning" | "info";
  visible: boolean;
  onClose: () => void;
}

export function NotificationToast({
  message,
  type,
  visible,
  onClose,
}: NotificationToastProps) {
  if (!visible) return null;

  return (
    <div className={`${styles.toast} ${styles[`toast--${type}`]}`} role="alert">
      <span className={styles.message}>{message}</span>
      <button
        className={styles.closeBtn}
        onClick={onClose}
        type="button"
        aria-label="Cerrar notificación"
      >
        ✕
      </button>
    </div>
  );
}
