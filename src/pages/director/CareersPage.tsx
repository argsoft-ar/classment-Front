import { Header } from "../../components/Header/Header";
import { Breadcrumbs } from "../../components/Breadcrumbs/Breadcrumbs";
import { Stack } from "../../components/Stack/Stack";
import { Table, type TableColumn } from "../../components/Table/Table";
import { ButtonGroup } from "../../components/ButtonGroup/ButtonGroup";
import { Button } from "../../components/Button/Button";
import { Callout } from "../../components/Callout/Callout";
import { FormModal } from "../../components/FormModal/FormModal";
import { useCareersManagement } from "../../hooks/useCareersManagement";
import { ROUTES } from "../../config/navigation.config";
import type { ICareer } from "../../interfaces/career.interface";

export function CareersPage() {
  const { careers, isLoading, error, openCreate, openEdit, goToSubjects, formModal } =
    useCareersManagement();

  const columns: TableColumn<ICareer>[] = [
    { key: "name", header: "Carrera" },
    { key: "durationYears", header: "Duración", render: (c) => `${c.durationYears} años` },
    { key: "plan", header: "Plan vigente", render: (c) => c.studyPlans[0]?.code ?? "—" },
    {
      key: "actions",
      header: "Acciones",
      align: "right",
      render: (c) => (
        <ButtonGroup
          align="end"
          actions={[
            { label: "Materias y correlatividades", size: "sm", onClick: () => goToSubjects(c) },
            { label: "Editar", size: "sm", variant: "secondary", onClick: () => openEdit(c) },
          ]}
        />
      ),
    },
  ];

  return (
    <Stack gap="lg">
      <Breadcrumbs items={[{ label: "Inicio", href: ROUTES.director.dashboard }, { label: "Carreras" }]} />
      <Header
        title="Carreras"
        subtitle="Carreras terciarias con su plan de estudios vigente"
        actions={<Button label="Nueva carrera" onClick={openCreate} />}
      />
      {error && <Callout variant="danger" message={error} />}
      <Table
        columns={columns}
        rows={careers}
        rowKey={(c) => c.id}
        isLoading={isLoading}
        caption="Listado de carreras"
        emptyMessage="Todavía no hay carreras cargadas."
      />
      <FormModal {...formModal} />
    </Stack>
  );
}
