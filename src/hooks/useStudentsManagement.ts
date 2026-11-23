import { useNavigate } from "react-router-dom";
import { useAsyncData } from "./useAsyncData";
import { useModalForm } from "./useModalForm";
import { useNotify } from "./useNotify";
import { usersService } from "../services/users.service";
import { careersService } from "../services/careers.service";
import { ROUTES } from "../config/navigation.config";
import { RoleLevel } from "../types/rbac.types";
import type { IUserPublic } from "../interfaces/user.interface";
import type { FormField } from "../components/Form/Form";
import type { FormModalProps } from "../components/FormModal/FormModal";

type StudentFormValues = {
  dni: string;
  firstName: string;
  lastName: string;
  email: string;
  careerId: string;
  cohortYear: string;
  password: string;
};

const CURRENT_YEAR = new Date().getFullYear();

const INITIAL_VALUES: StudentFormValues = {
  dni: "",
  firstName: "",
  lastName: "",
  email: "",
  careerId: "",
  cohortYear: String(CURRENT_YEAR),
  password: "",
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DNI_PATTERN = /^\d{7,10}$/;

function validateStudent(values: StudentFormValues): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!DNI_PATTERN.test(values.dni)) errors.dni = "El DNI debe tener entre 7 y 10 dígitos";
  if (!values.firstName.trim()) errors.firstName = "El nombre es requerido";
  if (!values.lastName.trim()) errors.lastName = "El apellido es requerido";
  if (!EMAIL_PATTERN.test(values.email)) errors.email = "Ingresá un email válido";
  if (!values.careerId) errors.careerId = "Seleccioná la carrera";
  const cohort = Number(values.cohortYear);
  if (!Number.isInteger(cohort) || cohort < 1990 || cohort > 2100) {
    errors.cohortYear = "Año de ingreso inválido";
  }
  if (values.password && values.password.length < 8) {
    errors.password = "Mínimo 8 caracteres";
  }
  return errors;
}

async function loadStudentsData() {
  const [students, careers] = await Promise.all([
    usersService.getAll({ role: RoleLevel.ALUMNO }),
    careersService.getAll(),
  ]);
  return { students, careers };
}

export function useStudentsManagement() {
  const navigate = useNavigate();
  const notify = useNotify();
  const { data, isLoading, error, reload } = useAsyncData(loadStudentsData);
  const modal = useModalForm<StudentFormValues>(INITIAL_VALUES, validateStudent);
  const careers = data?.careers ?? [];

  const fields: FormField[] = [
    { name: "dni", label: "DNI", type: "text", placeholder: "Solo números", required: true },
    { name: "firstName", label: "Nombre", type: "text", required: true },
    { name: "lastName", label: "Apellido", type: "text", required: true },
    { name: "email", label: "Email", type: "email", required: true },
    {
      name: "careerId",
      label: "Carrera",
      type: "select",
      required: true,
      options: careers.map((c) => ({ value: c.id, label: c.name })),
    },
    { name: "cohortYear", label: "Año de ingreso (cohorte)", type: "number", min: 1990, max: 2100 },
    {
      name: "password",
      label: "Contraseña inicial (opcional: sin contraseña queda Invitado)",
      type: "password",
    },
  ];

  const formModal: FormModalProps = {
    isOpen: modal.isOpen,
    title: "Nuevo alumno",
    onClose: modal.close,
    fields,
    values: modal.values,
    errors: modal.errors,
    onChange: modal.handleChange,
    isLoading: modal.isSubmitting,
    submitLabel: "Crear alumno",
    onSubmit: modal.bindSubmit(async (values) => {
      const created = await usersService.create({
        role: RoleLevel.ALUMNO,
        dni: values.dni.trim(),
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim(),
        careerId: values.careerId,
        cohortYear: Number(values.cohortYear),
        password: values.password || undefined,
      });
      notify(`Alumno ${created.firstName} ${created.lastName} creado`, "success");
      reload();
    }),
  };

  return {
    students: data?.students ?? [],
    isLoading,
    error,
    openCreate: () =>
      modal.openCreate(careers.length === 1 ? { careerId: careers[0].id } : {}),
    goToHistory: (student: IUserPublic) => navigate(ROUTES.director.studentHistory(student.id)),
    formModal,
  };
}
