import { Header } from "../../components/Header/Header";
import { Stack } from "../../components/Stack/Stack";
import { Tabs } from "../../components/Tabs/Tabs";
import { Callout } from "../../components/Callout/Callout";
import { LoadingState } from "../../components/LoadingState/LoadingState";
import { EmptyState } from "../../components/EmptyState/EmptyState";
import { FilterBar } from "../../components/FilterBar/FilterBar";
import { PageSection } from "../../components/PageSection/PageSection";
import { OfferingList } from "../../components/OfferingList/OfferingList";
import { Modal } from "../../components/Modal/Modal";
import { RejectionReasonList } from "../../components/RejectionReasonList/RejectionReasonList";
import { ConfirmModal } from "../../components/ConfirmModal/ConfirmModal";
import { useEnrollmentOffers } from "../../hooks/useEnrollmentOffers";

export function StudentEnrollmentPage() {
  const offers = useEnrollmentOffers();
  const { rejectionModal } = offers;

  return (
    <Stack gap="lg">
      <Header
        title="Inscripciones"
        subtitle="Cursadas y mesas de final abiertas para tu plan de estudios"
      />
      {offers.error && <Callout variant="danger" message={offers.error} />}

      {offers.isLoading ? (
        <LoadingState message="Buscando ofertas abiertas..." />
      ) : (
        <Tabs
          tabs={offers.tabs}
          activeId={offers.activeTab}
          onChange={offers.onTabChange}
          ariaLabel="Tipo de inscripción"
        >
          {!offers.hasOfferingsInTab ? (
            <EmptyState
              title={offers.emptyTitle}
              description="Cuando se abra un período de inscripción vas a verlo acá."
            />
          ) : (
            <Stack gap="lg">
              <FilterBar groups={offers.filterGroups} />

              {offers.sections.length === 0 ? (
                <EmptyState
                  title="Sin resultados para este filtro"
                  description="No hay materias que coincidan con los filtros seleccionados."
                  action={
                    offers.hasActiveFilters
                      ? { label: "Limpiar filtros", variant: "secondary", onClick: offers.clearFilters }
                      : undefined
                  }
                />
              ) : (
                <Stack gap="xl">
                  {offers.sections.map((section) => (
                    <PageSection
                      key={section.id}
                      title={section.title}
                      description={section.description}
                    >
                      <OfferingList groups={section.groups} />
                    </PageSection>
                  ))}
                </Stack>
              )}
            </Stack>
          )}
        </Tabs>
      )}

      <Modal
        isOpen={rejectionModal.isOpen}
        title={rejectionModal.title}
        onClose={rejectionModal.onClose}
        actions={[{ label: "Entendido", onClick: rejectionModal.onClose }]}
      >
        <Callout
          variant="danger"
          title={rejectionModal.subjectName}
          message="No cumplís los requisitos para esta inscripción. Esto es lo que falta:"
        />
        <RejectionReasonList reasons={rejectionModal.reasons} title="Motivos del rechazo" />
      </Modal>

      <ConfirmModal {...offers.confirmModal} />
    </Stack>
  );
}
