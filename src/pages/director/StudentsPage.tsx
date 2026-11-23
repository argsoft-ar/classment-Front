import { Header } from "../../components/Header/Header";
import { Breadcrumbs } from "../../components/Breadcrumbs/Breadcrumbs";
import { Stack } from "../../components/Stack/Stack";
import { Table, type TableColumn } from "../../components/Table/Table";
import { Button } from "../../components/Button/Button";
import { Callout } from "../../components/Callout/Callout";
import { StatusBadge } from "../../components/StatusBadge/StatusBadge";
import { FormModal } from "../../components/FormModal/FormModal";
import { useStudentsManagement } from "../../hooks/useStudentsManagement";
import { ROUTES } from "../../config/navigation.config";
import { USER_STATUS_LABELS } from "../../utils/labels.utils";
import { USER_STATUS_BADGE } from "../../utils/status.utils";
import type { IUserPublic } from "../../interfaces/user.interface";

export function StudentsPage() {
  const { students, isLoading, error, openCreate, goToHistory, formModal } =
    useStudentsManagement();

  const columns: TableColumn<IUserPublic>[] = [
    { key: "lastName", header: "Apellido" },
    { key: "firstName", header: "Nombre" },
    { key: "dni", header: "DNI" },
    { key: "email", header: "Email" },
    { key: "career", header: "Carrera", render: (s) => s.careers[0]?.careerName ?? "—" },
    { key: "cohort", header: "Cohorte", render: (s) => s.careers[0]?.cohortYear ?? "—" },
    {
      key: "status",
      header: "Estado",
      render: (s) => (
        <StatusBadge status={USER_STATUS_BADGE[s.status]} label={USER_STATUS_LABELS[s.status]} size="sm" />
      ),
    },
    {
      key: "actions",
      header: "Acciones",
      align: "right",
      render: (s) => (
        <Button
          label="Historial (Día Cero)"
          size="sm"
          ariaLabel={`Historial de ${s.firstName} ${s.lastName}`}
          onClick={() => goToHistory(s)}
        />
      ),
    },
  ];

  return (
    <Stack gap="lg">
      <Breadcrumbs items={[{ label: "Inicio", href: ROUTES.director.dashboard }, { label: "Alumnos" }]} />
      <Header
        title="Alumnos"
        subtitle="Legajos de alumnos y carga de historial previo"
        actions={<Button label="Nuevo alumno" onClick={openCreate} />}
      />
      {error && <Callout variant="danger" message={error} />}
      <Table
        columns={columns}
        rows={students}
        rowKey={(s) => s.id}
        isLoading={isLoading}
        caption="Listado de alumnos"
        emptyMessage="Todavía no hay alumnos cargados."
      />
      <FormModal {...formModal} />
    </Stack>
  );
}
