import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FormWrapper } from "../../components/FormWrapper/FormWrapper";
import { Form } from "../../components/Form/Form";
import { NotificationToast } from "../../components/NotificationToast/NotificationToast";
import { useForm } from "../../hooks/useForm";
import { useToast } from "../../hooks/useToast";
import { useAuth } from "../../hooks/useAuth";
import { authService } from "../../services/auth.service";
import type { FormField } from "../../components/Form/Form";
import styles from "./LoginPage.module.css";

const LOGIN_FIELDS: FormField[] = [
  {
    name: "email",
    label: "Correo electrónico",
    type: "email",
    placeholder: "usuario@institución.edu.ar",
    required: true,
  },
  {
    name: "password",
    label: "Contraseña",
    type: "password",
    placeholder: "••••••••",
    required: true,
  },
  {
    name: "institutionId",
    label: "ID de Institución",
    type: "text",
    placeholder: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    required: true,
  },
];

type LoginFields = { email: string; password: string; institutionId: string };

function validateLogin(values: LoginFields): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!values.email) errors.email = "El correo es requerido";
  if (!values.password) errors.password = "La contraseña es requerida";
  if (!values.institutionId)
    errors.institutionId = "El ID de institución es requerido";
  return errors;
}

// Lock out after this many consecutive failures; reset on successful login
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 30_000;

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast, showToast, hideToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(0);

  const { values, errors, handleChange, handleSubmit } = useForm<LoginFields>(
    { email: "", password: "", institutionId: "" },
    validateLogin,
  );

  const onValid = async (formValues: LoginFields) => {
    if (Date.now() < lockedUntil) {
      const remaining = Math.ceil((lockedUntil - Date.now()) / 1000);
      showToast(`Demasiados intentos. Espere ${remaining} segundos.`, "error");
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.login(formValues);
      if (response.success && response.data?.token) {
        setAttemptCount(0);
        login(response.data.token);
        navigate("/dashboard", { replace: true });
      } else {
        const next = attemptCount + 1;
        setAttemptCount(next);
        if (next >= MAX_ATTEMPTS) {
          setLockedUntil(Date.now() + LOCKOUT_DURATION_MS);
          showToast(
            "Demasiados intentos fallidos. Espere 30 segundos.",
            "error",
          );
        } else {
          // Generic message - do not reflect backend error details to the user
          showToast("Credenciales inválidas. Verifique sus datos.", "error");
        }
      }
    } catch {
      showToast("Error de conexión. Intente nuevamente.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const isLocked = Date.now() < lockedUntil;

  return (
    <div className={styles.page}>
      <FormWrapper title="Iniciar Sesión" subtitle="Bienvenido a Classment">
        <Form
          fields={LOGIN_FIELDS}
          values={values}
          errors={errors}
          onChange={handleChange}
          onSubmit={handleSubmit(onValid)}
          submitLabel="Ingresar"
          isLoading={isLoading || isLocked}
        />
      </FormWrapper>
      <NotificationToast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onClose={hideToast}
      />
    </div>
  );
}
