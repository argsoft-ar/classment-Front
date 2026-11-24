import { Header } from "../../components/Header/Header";
import { Stack } from "../../components/Stack/Stack";
import { Callout } from "../../components/Callout/Callout";
import { LoadingState } from "../../components/LoadingState/LoadingState";
import { EmptyState } from "../../components/EmptyState/EmptyState";
import { FilterBar } from "../../components/FilterBar/FilterBar";
import { PageSection } from "../../components/PageSection/PageSection";
import { ProgressSummary } from "../../components/ProgressSummary/ProgressSummary";
import { SubjectStatusGrid } from "../../components/SubjectStatusGrid/SubjectStatusGrid";
import { Button } from "../../components/Button/Button";
import { useMyProgress } from "../../hooks/useMyProgress";

export function StudentProgressPage() {
  const progress = useMyProgress();

  return (
    <Stack gap="lg">
      <Header
        title={progress.title}
        subtitle={progress.subtitle}
        actions={
          progress.hasCareer ? (
            <Button label="Ir a inscripciones" onClick={progress.goToEnrollment} />
          ) : undefined
        }
      />
      {progress.error && <Callout variant="danger" message={progress.error} />}

      {progress.isLoading ? (
        <LoadingState message="Cargando tu avance..." />
      ) : !progress.hasCareer ? (
        <EmptyState
          title="No estás inscripto/a en ninguna carrera"
          description="Consultá con la Dirección del instituto."
        />
      ) : (
        <Stack gap="lg">
          <ProgressSummary items={progress.summaryItems} ariaLabel="Resumen de tu carrera" />
          <PageSection title="Mi plan de estudios" description="Estado de cada materia por año.">
            <FilterBar groups={progress.filterGroups} />
            <SubjectStatusGrid groups={progress.groups} />
          </PageSection>
        </Stack>
      )}
    </Stack>
  );
}
