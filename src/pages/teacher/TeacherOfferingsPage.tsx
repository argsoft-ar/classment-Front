import { Header } from "../../components/Header/Header";
import { Stack } from "../../components/Stack/Stack";
import { Callout } from "../../components/Callout/Callout";
import { Table, type TableColumn } from "../../components/Table/Table";
import { useTeacherOfferings } from "../../hooks/useTeacherOfferings";
import { formatDateTime } from "../../utils/date.utils";
import { PERIOD_TYPE_LABELS, yearLabel } from "../../utils/labels.utils";
import type { IOffering } from "../../interfaces/offering.interface";

const COLUMNS: TableColumn<IOffering>[] = [
  { key: "subject", header: "Materia", render: (o) => o.subject.name },
  { key: "year", header: "Año", render: (o) => yearLabel(o.subject.yearLevel) },
  { key: "type", header: "Tipo", render: (o) => PERIOD_TYPE_LABELS[o.period.type] },
  { key: "period", header: "Período", render: (o) => o.period.name },
  { key: "examDate", header: "Fecha de examen", render: (o) => formatDateTime(o.examDate) },
  { key: "enrolled", header: "Inscriptos", align: "center", render: (o) => o._count.enrollments },
];

export function TeacherOfferingsPage() {
  const { offerings, isLoading, error } = useTeacherOfferings();

  return (
    <Stack gap="lg">
      <Header title="Mis mesas y materias" subtitle="Cursadas y mesas de final asignadas" />
      {error && <Callout variant="danger" message={error} />}
      <Table
        columns={COLUMNS}
        rows={offerings}
        rowKey={(o) => o.id}
        isLoading={isLoading}
        caption="Ofertas asignadas"
        emptyMessage="No tenés cursadas ni mesas asignadas."
      />
    </Stack>
  );
}
