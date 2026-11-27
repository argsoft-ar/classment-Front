import { useNavigate } from "react-router-dom";
import { Header } from "../../components/Header/Header";
import { Breadcrumbs } from "../../components/Breadcrumbs/Breadcrumbs";
import { Stack } from "../../components/Stack/Stack";
import { Tabs } from "../../components/Tabs/Tabs";
import { Table, type TableColumn } from "../../components/Table/Table";
import { Button } from "../../components/Button/Button";
import { ButtonGroup } from "../../components/ButtonGroup/ButtonGroup";
import { Callout } from "../../components/Callout/Callout";
import { FilterBar } from "../../components/FilterBar/FilterBar";
import { Select } from "../../components/Select/Select";
import { StatusBadge } from "../../components/StatusBadge/StatusBadge";
import { PageSection } from "../../components/PageSection/PageSection";
import { FormModal } from "../../components/FormModal/FormModal";
import { ConfirmModal } from "../../components/ConfirmModal/ConfirmModal";
import { usePeriodsPage } from "../../hooks/usePeriodsPage";
import type { PeriodRow } from "../../hooks/usePeriodsManagement";
import { periodOptionLabel } from "../../hooks/useOfferingsManagement";
import { ROUTES } from "../../config/navigation.config";
import { formatDateTime } from "../../utils/date.utils";
import {
  PERIOD_TYPE_LABELS,
  callLabel,
  formatOfferingEnrollmentCount,
  yearLabel,
} from "../../utils/labels.utils";
import { PERIOD_STATE_BADGE } from "../../utils/period.utils";
import type { IOffering } from "../../interfaces/offering.interface";

export function PeriodsPage() {
  const navigate = useNavigate();
  const page = usePeriodsPage();
  const { periods, offerings } = page;

  const periodColumns: TableColumn<PeriodRow>[] = [
    { key: "name", header: "Período" },
    { key: "type", header: "Tipo", render: (p) => PERIOD_TYPE_LABELS[p.type] },
    { key: "academicYear", header: "Ciclo" },
    { key: "callNumber", header: "Llamado", render: (p) => callLabel(p.callNumber) },
    { key: "startsAt", header: "Apertura", render: (p) => formatDateTime(p.startsAt) },
    { key: "endsAt", header: "Cierre", render: (p) => formatDateTime(p.endsAt) },
    {
      key: "state",
      header: "Estado",
      render: (p) => (
        <StatusBadge
          status={PERIOD_STATE_BADGE[p.state].status}
          label={PERIOD_STATE_BADGE[p.state].label}
          size="sm"
        />
      ),
    },
    { key: "offerings", header: "Ofertas", align: "center", render: (p) => p._count?.offerings ?? 0 },
    {
      key: "actions",
      header: "Acciones",
      align: "right",
      render: (p) => (
        <ButtonGroup
          align="end"
          nowrap
          actions={[
            { label: "Ver ofertas", size: "sm", onClick: () => page.viewOfferings(p) },
            {
              label: p.isActive ? "Desactivar" : "Activar",
              size: "sm",
              variant: "secondary",
              onClick: () => periods.toggleActive(p),
            },
          ]}
        />
      ),
    },
  ];

  const offeringColumns: TableColumn<IOffering>[] = [
    { key: "subject", header: "Materia", render: (o) => o.subject.name },
    { key: "year", header: "Año", render: (o) => yearLabel(o.subject.yearLevel) },
    { key: "period", header: "Período", render: (o) => periodOptionLabel(o.period) },
    {
      key: "teacher",
      header: "Docente",
      render: (o) => (o.teacher ? `${o.teacher.lastName}, ${o.teacher.firstName}` : "Sin asignar"),
    },
    { key: "examDate", header: "Fecha de examen", render: (o) => formatDateTime(o.examDate) },
    {
      key: "enrolled",
      header: "Inscriptos",
      align: "center",
      render: (o) => formatOfferingEnrollmentCount(o),
    },
    { key: "maxCapacity", header: "Cupo", align: "center", render: (o) => o.maxCapacity ?? "Libre" },
    {
      key: "actions",
      header: "Acciones",
      align: "right",
      render: (o) => (
        <ButtonGroup
          align="end"
          nowrap
          actions={[
            {
              label: "Acta / Notas",
              size: "sm",
              variant: "secondary",
              ariaLabel: `Abrir acta y notas de ${o.subject.name}`,
              onClick: () => navigate(ROUTES.director.offeringGrades(o.id)),
            },
            {
              label: "Eliminar",
              size: "sm",
              variant: "danger",
              ariaLabel: `Eliminar oferta de ${o.subject.name}`,
              onClick: () => offerings.remove(o),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <Stack gap="lg">
      <Breadcrumbs
        items={[{ label: "Inicio", href: ROUTES.director.dashboard }, { label: "Períodos y ofertas" }]}
      />
      <Header
        title="Períodos de inscripción y ofertas"
        subtitle="Cursadas, turnos de examen final (1° y 2° llamado) y mesas"
      />

      <Tabs
        tabs={page.tabs}
        activeId={page.activeTab}
        onChange={page.onTabChange}
        ariaLabel="Períodos y ofertas"
      >
        {page.activeTab === "periods" ? (
          <PageSection
            title="Períodos"
            description="Ventanas de inscripción a cursadas y a mesas de final."
            actions={<Button label="Nuevo período" onClick={periods.openCreate} />}
          >
            {periods.error && <Callout variant="danger" message={periods.error} />}
            <Table
              columns={periodColumns}
              rows={periods.periods}
              rowKey={(p) => p.id}
              isLoading={periods.isLoading}
              caption="Períodos de inscripción"
              emptyMessage="No hay períodos cargados."
            />
          </PageSection>
        ) : (
          <PageSection
            title="Ofertas"
            description="Materias ofrecidas en cada período, con docente y fecha de mesa."
            actions={
              <Stack direction="row" gap="sm" align="end" wrap>
                <Select {...offerings.filter} />
                <Button label="Nueva oferta" onClick={offerings.openCreate} />
              </Stack>
            }
          >
            {offerings.error && <Callout variant="danger" message={offerings.error} />}
            <FilterBar groups={offerings.yearFilterGroups} />
            <Table
              columns={offeringColumns}
              rows={offerings.offerings}
              rowKey={(o) => o.id}
              isLoading={offerings.isLoading}
              caption="Ofertas por período"
              emptyMessage="No hay ofertas para el filtro seleccionado."
            />
          </PageSection>
        )}
      </Tabs>

      <FormModal {...periods.formModal} />
      <FormModal {...offerings.formModal} />
      <ConfirmModal {...page.confirmModal} />
    </Stack>
  );
}
