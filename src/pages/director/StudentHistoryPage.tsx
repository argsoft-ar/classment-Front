import { useParams } from "react-router-dom";
import { Header } from "../../components/Header/Header";
import { Breadcrumbs } from "../../components/Breadcrumbs/Breadcrumbs";
import { Stack } from "../../components/Stack/Stack";
import { Callout } from "../../components/Callout/Callout";
import { LoadingState } from "../../components/LoadingState/LoadingState";
import { EmptyState } from "../../components/EmptyState/EmptyState";
import { PageSection } from "../../components/PageSection/PageSection";
import { ProgressSummary } from "../../components/ProgressSummary/ProgressSummary";
import { SubjectStatusGrid } from "../../components/SubjectStatusGrid/SubjectStatusGrid";
import { Select } from "../../components/Select/Select";
import { ButtonGroup } from "../../components/ButtonGroup/ButtonGroup";
import { useStudentHistory } from "../../hooks/useStudentHistory";
import { ROUTES } from "../../config/navigation.config";

export function StudentHistoryPage() {
  const { studentId = "" } = useParams();
  const history = useStudentHistory(studentId);

  const saveActions = (
    <ButtonGroup
      align="end"
      actions={[
        {
          label: "Descartar",
          variant: "secondary",
          onClick: history.discard,
          disabled: history.changedCount === 0 || history.isSaving,
        },
        {
          label:
            history.changedCount > 0 ? `Guardar cambios (${history.changedCount})` : "Guardar cambios",
          onClick: history.save,
          disabled: history.changedCount === 0,
          isLoading: history.isSaving,
          loadingLabel: "Guardando...",
        },
      ]}
    />
  );

  return (
    <Stack gap="lg">
      <Breadcrumbs
        items={[
          { label: "Inicio", href: ROUTES.director.dashboard },
          { label: "Alumnos", href: ROUTES.director.students },
          { label: "Historial (Día Cero)" },
        ]}
      />
      <Header title={history.title} subtitle={history.subtitle} />
      {history.error && <Callout variant="danger" message={history.error} />}

      {history.isLoading ? (
        <LoadingState message="Cargando historial..." />
      ) : !history.hasCareer ? (
        <EmptyState
          title="El alumno no tiene carrera asignada"
          description="Asigná una carrera para poder cargar su historial."
        />
      ) : (
        <Stack gap="lg">
          <ProgressSummary items={history.summaryItems} ariaLabel="Resumen guardado del alumno" />

          <PageSection
            variant="surface"
            title="Grilla rápida de historial previo"
            description="Marcá el estado de cada materia y guardá todos los cambios de una vez."
            actions={saveActions}
          >
            <Stack direction="row" gap="md" align="end" wrap>
              <Select
                name="origin"
                label="Origen de la carga"
                value={history.origin}
                options={history.originOptions}
                onChange={history.onOriginChange}
              />
            </Stack>
            <Callout
              variant="info"
              message="La equivalencia solo se registra en materias marcadas como Aprobadas; el resto se guarda como carga inicial. «Sin cursar» elimina el registro."
            />
            <SubjectStatusGrid
              groups={history.groups}
              editable
              statusOptions={history.statusOptions}
              onStatusChange={history.onStatusChange}
              disabled={history.isSaving}
            />
          </PageSection>
        </Stack>
      )}
    </Stack>
  );
}
