import { useNavigate } from "react-router-dom";
import { Header } from "../../components/Header/Header";
import { Stack } from "../../components/Stack/Stack";
import { Callout } from "../../components/Callout/Callout";
import { FilterBar } from "../../components/FilterBar/FilterBar";
import { Button } from "../../components/Button/Button";
import { Table, type TableColumn } from "../../components/Table/Table";
import { useTeacherOfferings } from "../../hooks/useTeacherOfferings";
import { ROUTES } from "../../config/navigation.config";
import { formatDateTime } from "../../utils/date.utils";
import {
  PERIOD_TYPE_LABELS,
  formatOfferingEnrollmentCount,
  formatPeriodTitle,
  yearLabel,
} from "../../utils/labels.utils";
import type { IOffering } from "../../interfaces/offering.interface";

export function TeacherOfferingsPage() {
  const navigate = useNavigate();
  const { offerings, hasAny, filterGroups, isLoading, error } = useTeacherOfferings();

  const columns: TableColumn<IOffering>[] = [
    { key: "subject", header: "Materia", render: (o) => o.subject.name },
    { key: "year", header: "Año", render: (o) => yearLabel(o.subject.yearLevel) },
    { key: "type", header: "Tipo", render: (o) => PERIOD_TYPE_LABELS[o.period.type] },
    { key: "period", header: "Período", render: (o) => formatPeriodTitle(o.period) },
    { key: "examDate", header: "Fecha de examen", render: (o) => formatDateTime(o.examDate) },
    {
      key: "enrolled",
      header: "Inscriptos",
      align: "center",
      render: (o) => formatOfferingEnrollmentCount(o),
    },
    {
      key: "actions",
      header: "Acciones",
      align: "right",
      render: (o) => (
        <Button
          label="Acta / Notas"
          size="sm"
          variant="secondary"
          ariaLabel={`Abrir acta y notas de ${o.subject.name}`}
          onClick={() => navigate(ROUTES.teacher.offeringGrades(o.id))}
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
    </Stack>
  );
}
