import { useParams } from "react-router-dom";
import { Header } from "../../components/Header/Header";
import { Breadcrumbs } from "../../components/Breadcrumbs/Breadcrumbs";
import { Stack } from "../../components/Stack/Stack";
import { Callout } from "../../components/Callout/Callout";
import { LoadingState } from "../../components/LoadingState/LoadingState";
import { EmptyState } from "../../components/EmptyState/EmptyState";
import { FilterBar } from "../../components/FilterBar/FilterBar";
import { PageSection } from "../../components/PageSection/PageSection";
import { ProgressSummary } from "../../components/ProgressSummary/ProgressSummary";
import { SubjectStatusGrid } from "../../components/SubjectStatusGrid/SubjectStatusGrid";
import { Select } from "../../components/Select/Select";
import { ButtonGroup } from "../../components/ButtonGroup/ButtonGroup";
import { StickyActionBar } from "../../components/StickyActionBar/StickyActionBar";
import { useStudentHistory } from "../../hooks/useStudentHistory";
import { ROUTES } from "../../config/navigation.config";

export function StudentHistoryPage() {
  const { studentId = "" } = useParams();
  const history = useStudentHistory(studentId);

  const saveActions = [
    {
      label: "Descartar",
      variant: "secondary" as const,
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
  ];

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
            description="Marcá el estado de cada materia; la equivalencia solo aplica a Aprobadas y «Sin cursar» elimina el registro."
            actions={<ButtonGroup align="end" nowrap actions={saveActions} />}
          >
            <Stack direction="row" gap="md" align="end" wrap>
              <Select
                name="origin"
                label="Origen de la carga"
                size="sm"
                value={history.origin}
                options={history.originOptions}
                onChange={history.onOriginChange}
              />
            </Stack>
            <FilterBar groups={history.filterGroups} />
            <SubjectStatusGrid
              groups={history.groups}
              editable
              statusOptions={history.statusOptions}
              onStatusChange={history.onStatusChange}
              disabled={history.isSaving}
            />
          </PageSection>

          <StickyActionBar
            visible={history.changedCount > 0}
            message={`${history.changedCount} ${
              history.changedCount === 1 ? "materia modificada" : "materias modificadas"
            } sin guardar`}
            actions={saveActions}
          />
        </Stack>
      )}
    </Stack>
  );
}
