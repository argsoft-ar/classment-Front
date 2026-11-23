import {
  CircleCheck,
  CircleX,
  Info,
  TriangleAlert,
  X,
} from "lucide-react";
import styles from "./NotificationToast.module.css";

interface NotificationToastProps {
  message: string;
  type: "success" | "error" | "warning" | "info";
  visible: boolean;
  onClose: () => void;
}

function ToastTypeIcon({ type }: { type: NotificationToastProps["type"] }) {
  const iconProps = {
    className: styles.typeIcon,
    size: 20,
    "aria-hidden": true,
  } as const;
  switch (type) {
    case "success":
      return <CircleCheck {...iconProps} />;
    case "error":
      return <CircleX {...iconProps} />;
    case "warning":
      return <TriangleAlert {...iconProps} />;
    default:
      return <Info {...iconProps} />;
  }
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
      <ToastTypeIcon type={type} />
      <span className={styles.message}>{message}</span>
      <button
        className={styles.closeBtn}
        onClick={onClose}
        type="button"
        aria-label="Cerrar notificación"
      >
        <X size={18} aria-hidden="true" />
      </button>
    </div>
  );
}
