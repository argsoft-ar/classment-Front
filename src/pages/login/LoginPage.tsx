import { Navigate } from "react-router-dom";
import { FormWrapper } from "../../components/FormWrapper/FormWrapper";
import { Form } from "../../components/Form/Form";
import { useLogin } from "../../hooks/useLogin";

export function LoginPage() {
  const { redirectTo, fields, values, errors, onChange, onSubmit, isLoading } = useLogin();

  if (redirectTo) return <Navigate to={redirectTo} replace />;

  return (
    <FormWrapper title="Iniciar sesión" subtitle="Classment · Gestión académica terciaria">
      <Form
        fields={fields}
        values={values}
        errors={errors}
        onChange={onChange}
        onSubmit={onSubmit}
        submitLabel="Ingresar"
        isLoading={isLoading}
      />
    </FormWrapper>
  );
}
