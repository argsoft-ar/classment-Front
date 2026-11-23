import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./useAuth";
import { useForm } from "./useForm";
import { useNotify } from "./useNotify";
import { authService } from "../services/auth.service";
import { getHomePath } from "../config/navigation.config";
import { ApiError } from "../services/api.client";
import { getErrorMessage, TOO_MANY_ATTEMPTS_MESSAGE } from "../utils/error.utils";
import type { FormField } from "../components/Form/Form";

type LoginFields = { email: string; password: string };

const INITIAL_VALUES: LoginFields = { email: "", password: "" };

export const LOGIN_FIELDS: FormField[] = [
  {
    name: "email",
    label: "Correo electrónico",
    type: "email",
    placeholder: "usuario@institucion.edu.ar",
    required: true,
  },
  {
    name: "password",
    label: "Contraseña",
    type: "password",
    placeholder: "••••••••",
    required: true,
  },
];

function validateLogin(values: LoginFields): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!values.email) errors.email = "El correo es requerido";
  if (!values.password) errors.password = "La contraseña es requerida";
  return errors;
}

// Lock out after this many consecutive failures; reset on successful login.
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 30_000;

export function useLogin() {
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuth();
  const notify = useNotify();
  const [isLoading, setIsLoading] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const form = useForm<LoginFields>(INITIAL_VALUES, validateLogin);

  const registerFailure = useCallback(() => {
    const next = attempts + 1;
    if (next >= MAX_ATTEMPTS) {
      setAttempts(0);
      setIsLocked(true);
      setTimeout(() => setIsLocked(false), LOCKOUT_DURATION_MS);
      notify("Demasiados intentos fallidos. Espere 30 segundos.", "error");
      return;
    }
    setAttempts(next);
    // Generic message: do not reflect backend details for auth failures.
    notify("Credenciales inválidas. Verifique sus datos.", "error");
  }, [attempts, notify]);

  const onValid = useCallback(
    async (values: LoginFields) => {
      if (isLocked) return;
      setIsLoading(true);
      try {
        const result = await authService.login(values);
        const decoded = login(result.token);
        if (!decoded) {
          notify("No se pudo iniciar sesión. Intente nuevamente.", "error");
          return;
        }
        setAttempts(0);
        navigate(getHomePath(decoded.role), { replace: true });
      } catch (err) {
        if (err instanceof ApiError && err.status === 429) {
          // Server-side rate limit: independent from the client lockout counter.
          notify(TOO_MANY_ATTEMPTS_MESSAGE, "error");
        } else if (err instanceof ApiError && (err.status === 401 || err.status === 400)) {
          registerFailure();
        } else {
          notify(getErrorMessage(err, "Error de conexión. Intente nuevamente."), "error");
        }
      } finally {
        setIsLoading(false);
      }
    },
    [isLocked, login, navigate, notify, registerFailure],
  );

  return {
    /** Already logged in: page should redirect here. */
    redirectTo: isAuthenticated && user ? getHomePath(user.role) : null,
    fields: LOGIN_FIELDS,
    values: form.values,
    errors: form.errors,
    onChange: form.handleChange,
    onSubmit: form.handleSubmit(onValid),
    isLoading: isLoading || isLocked,
  };
}
