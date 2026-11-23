import { useParams } from "react-router-dom";
import { Header } from "../../components/Header/Header";
import { Breadcrumbs } from "../../components/Breadcrumbs/Breadcrumbs";
import { Stack } from "../../components/Stack/Stack";
import { Tabs } from "../../components/Tabs/Tabs";
import { Table, type TableColumn } from "../../components/Table/Table";
import { ButtonGroup } from "../../components/ButtonGroup/ButtonGroup";
import { Button } from "../../components/Button/Button";
import { Callout } from "../../components/Callout/Callout";
import { LoadingState } from "../../components/LoadingState/LoadingState";
import { FormModal } from "../../components/FormModal/FormModal";
import { Modal } from "../../components/Modal/Modal";
import { Form } from "../../components/Form/Form";
import { PageSection } from "../../components/PageSection/PageSection";
import { StatusBadge } from "../../components/StatusBadge/StatusBadge";
import { TagList } from "../../components/TagList/TagList";
import { useCareerSubjects } from "../../hooks/useCareerSubjects";
import type { CorrelativeRow } from "../../hooks/useCorrelativesEditor";
import { ROUTES } from "../../config/navigation.config";
import { REQUIRED_STATUS_LABELS, SCOPE_LABELS } from "../../utils/labels.utils";
import type { ISubjectSummary } from "../../interfaces/subject.interface";

export function CareerSubjectsPage() {
  const { careerId = "" } = useParams();
  const page = useCareerSubjects(careerId);
  const { editor } = page;

  const subjectColumns: TableColumn<ISubjectSummary>[] = [
    { key: "name", header: "Materia" },
    {
      key: "correlatives",
      header: "Correlatividades",
      render: (s) => (
        <TagList
          emptyLabel="Sin correlativas"
          items={s.correlatives.map((c) => ({
            label: `${c.requiredSubjectName} · ${REQUIRED_STATUS_LABELS[c.requiredStatus]} (${c.appliesTo === "CURSADA" ? "cursar" : "final"})`,
            tone: c.requiredStatus === "APROBADA" ? "success" : "warning",
          }))}
        />
      ),
    },
    {
      key: "actions",
      header: "Acciones",
      align: "right",
      render: (s) => (
        <ButtonGroup
          align="end"
          actions={[
            { label: "Correlatividades", size: "sm", onClick: () => editor.open(s) },
            { label: "Editar", size: "sm", variant: "secondary", onClick: () => page.openEdit(s) },
          ]}
        />
      ),
    },
  ];

  const ruleColumns: TableColumn<CorrelativeRow>[] = [
    { key: "required", header: "Materia requerida", render: (r) => r.requiredSubject.name },
    { key: "appliesTo", header: "Aplica a", render: (r) => SCOPE_LABELS[r.appliesTo] },
    {
      key: "requiredStatus",
      header: "Estado requerido",
      render: (r) => <StatusBadge status={r.requiredStatus} size="sm" />,
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (r) => (
        <Button
          label="Eliminar"
          size="sm"
          variant="danger"
          isLoading={editor.deletingId === r.id}
          loadingLabel="Eliminando..."
          ariaLabel={`Eliminar correlatividad con ${r.requiredSubject.name}`}
          onClick={() => editor.remove(r)}
        />
      ),
    },
  ];

  return (
    <Stack gap="lg">
      <Breadcrumbs
        items={[
          { label: "Inicio", href: ROUTES.director.dashboard },
          { label: "Carreras", href: ROUTES.director.careers },
          { label: page.careerName || "Materias" },
        ]}
      />
      <Header
        title={page.careerName || "Materias"}
        subtitle={page.planLabel}
        actions={<Button label="Nueva materia" onClick={page.openCreate} disabled={page.isLoading} />}
      />
      {page.error && <Callout variant="danger" message={page.error} />}

      {page.isLoading ? (
        <LoadingState message="Cargando plan de estudios..." />
      ) : (
        <Tabs
          tabs={page.tabs}
          activeId={page.activeYear}
          onChange={page.setActiveYear}
          ariaLabel="Años de la carrera"
        >
          <Table
            columns={subjectColumns}
            rows={page.activeSubjects}
            rowKey={(s) => s.id}
            caption="Materias del año seleccionado"
            emptyMessage="No hay materias cargadas en este año."
          />
        </Tabs>
      )}

      <FormModal {...page.formModal} />

      <Modal isOpen={editor.isOpen} title={editor.title} onClose={editor.close} size="lg">
        <Callout
          message="El sistema valida automáticamente que no se generen ciclos ni autorreferencias al guardar."
        />
        <PageSection title="Requisitos de esta materia">
          {editor.error && <Callout variant="danger" message={editor.error} />}
          <Table
            columns={ruleColumns}
            rows={editor.rules}
            rowKey={(r) => r.id}
            isLoading={editor.isLoading}
            caption="Correlatividades configuradas"
            emptyMessage="Esta materia no tiene correlatividades."
          />
        </PageSection>
        <PageSection title="Es requerida por">
          <TagList items={editor.requiredBy} emptyLabel="Ninguna materia la requiere." />
        </PageSection>
        <PageSection title="Agregar correlatividad" variant="surface">
          <Form {...editor.form} />
        </PageSection>
      </Modal>
    </Stack>
  );
}
