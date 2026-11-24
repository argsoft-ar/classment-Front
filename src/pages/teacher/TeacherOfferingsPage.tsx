import { Header } from "../../components/Header/Header";
import { Stack } from "../../components/Stack/Stack";
import { Callout } from "../../components/Callout/Callout";
import { FilterBar } from "../../components/FilterBar/FilterBar";
import { Button } from "../../components/Button/Button";
import { Table, type TableColumn } from "../../components/Table/Table";
import { OfferingRosterModal } from "../../components/OfferingRosterModal/OfferingRosterModal";
import { useTeacherOfferings } from "../../hooks/useTeacherOfferings";
import { formatDateTime } from "../../utils/date.utils";
import { PERIOD_TYPE_LABELS, formatPeriodTitle, yearLabel } from "../../utils/labels.utils";
import type { IOffering } from "../../interfaces/offering.interface";

export function TeacherOfferingsPage() {
  const { offerings, hasAny, filterGroups, roster, isLoading, error } = useTeacherOfferings();

  const columns: TableColumn<IOffering>[] = [
    { key: "subject", header: "Materia", render: (o) => o.subject.name },
    { key: "year", header: "Año", render: (o) => yearLabel(o.subject.yearLevel) },
    { key: "type", header: "Tipo", render: (o) => PERIOD_TYPE_LABELS[o.period.type] },
    { key: "period", header: "Período", render: (o) => formatPeriodTitle(o.period) },
    { key: "examDate", header: "Fecha de examen", render: (o) => formatDateTime(o.examDate) },
    { key: "enrolled", header: "Inscriptos", align: "center", render: (o) => o._count.enrollments },
    {
      key: "actions",
      header: "Acciones",
      align: "right",
      render: (o) => (
        <Button
          label="Ver inscriptos"
          size="sm"
          variant="secondary"
          ariaLabel={`Ver inscriptos de ${o.subject.name}`}
          onClick={() => roster.open(o)}
        />
      ),
    },
  ];

  return (
    <Stack gap="lg">
      <Header title="Mis mesas y materias" subtitle="Cursadas y mesas de final asignadas" />
      {error && <Callout variant="danger" message={error} />}
      {hasAny && <FilterBar groups={filterGroups} />}
      <Table
        columns={columns}
        rows={offerings}
        rowKey={(o) => o.id}
        isLoading={isLoading}
        caption="Ofertas asignadas"
        emptyMessage={
          hasAny
            ? "No tenés ofertas para el tipo seleccionado."
            : "No tenés cursadas ni mesas asignadas."
        }
      />
      <OfferingRosterModal {...roster.modalProps} />
    </Stack>
  );
}
