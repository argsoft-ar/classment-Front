import { useNavigate, useParams } from "react-router-dom";
import { Header } from "../../components/Header/Header";
import { Breadcrumbs } from "../../components/Breadcrumbs/Breadcrumbs";
import { Stack } from "../../components/Stack/Stack";
import { Callout } from "../../components/Callout/Callout";
import { LoadingState } from "../../components/LoadingState/LoadingState";
import { EmptyState } from "../../components/EmptyState/EmptyState";
import { ProgressSummary } from "../../components/ProgressSummary/ProgressSummary";
import { PageSection } from "../../components/PageSection/PageSection";
import { FilterBar } from "../../components/FilterBar/FilterBar";
import { GradeSheet } from "../../components/GradeSheet/GradeSheet";
import { Button } from "../../components/Button/Button";
import { ButtonGroup } from "../../components/ButtonGroup/ButtonGroup";
import { StickyActionBar } from "../../components/StickyActionBar/StickyActionBar";
import { ConfirmModal } from "../../components/ConfirmModal/ConfirmModal";
import { useOfferingGrades } from "../../hooks/useOfferingGrades";

export function OfferingGradesPage() {
  const { offeringId = "" } = useParams();
  const navigate = useNavigate();
  const acta = useOfferingGrades(offeringId);

  const saveActions = [
    {
      label: "Descartar",
      variant: "secondary" as const,
      onClick: acta.discard,
      disabled: acta.changedCount === 0 || acta.isSaving,
    },
    {
      label:
        acta.changedCount > 0
          ? `Guardar calificaciones (${acta.changedCount})`
          : "Guardar calificaciones",
      onClick: acta.requestSave,
      disabled: acta.changedCount === 0,
      isLoading: acta.isSaving,
      loadingLabel: "Guardando...",
    },
  ];

  return (
    <Stack gap="lg">
      <Breadcrumbs items={acta.breadcrumbs} />
      <Header
        title={acta.title}
        subtitle={acta.subtitle}
        actions={
          <Button
            label="Volver"
            variant="secondary"
            size="sm"
            onClick={() => navigate(acta.backPath)}
          />
        }
      />

      {acta.error && <Callout variant="danger" message={acta.error} />}

      {acta.isLoading ? (
        <LoadingState message="Cargando acta y nómina de alumnos..." />
      ) : !acta.hasOffering && acta.error ? null : !acta.hasOffering ? (
        <EmptyState
          title="Oferta no encontrada"
          description="No se pudo acceder al acta solicitada."
        />
      ) : (
        <Stack gap="lg">
          {acta.rulesBanner && <Callout variant="info" message={acta.rulesBanner} />}

          <ProgressSummary items={acta.summaryItems} ariaLabel="Resumen del acta" />

          <PageSection
            variant="surface"
            title="Planilla de calificaciones"
            description="Seleccioná el resultado y la nota entera (1–10) para cada alumno pendiente."
            actions={<ButtonGroup align="end" nowrap actions={saveActions} />}
          >
            <FilterBar groups={acta.filterGroups} />
            <GradeSheet
              rows={acta.rows}
              resultOptions={acta.resultOptions}
              onResultChange={acta.onResultChange}
              onGradeChange={acta.onGradeChange}
              disabled={acta.isSaving}
              emptyTitle={
                acta.hasAnyEnrollments
                  ? "Sin alumnos en el filtro seleccionado"
                  : "Sin alumnos inscriptos"
              }
              emptyDescription={
                acta.hasAnyEnrollments
                  ? "Probá seleccionando otro estado en el filtro superior."
                  : "Todavía no hay inscripciones activas ni cerradas en esta oferta."
              }
            />
          </PageSection>

          <StickyActionBar
            visible={acta.changedCount > 0}
            message={`${acta.changedCount} ${
              acta.changedCount === 1 ? "calificación modificada" : "calificaciones modificadas"
            } sin guardar`}
            actions={saveActions}
          />
        </Stack>
      )}

      <ConfirmModal {...acta.confirmModal} />
    </Stack>
  );
}
