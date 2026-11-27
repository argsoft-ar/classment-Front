import { Header } from "../../components/Header/Header";
import { Stack } from "../../components/Stack/Stack";
import { Callout } from "../../components/Callout/Callout";
import { FilterBar } from "../../components/FilterBar/FilterBar";
import { Table, type TableColumn } from "../../components/Table/Table";
import { StatusBadge } from "../../components/StatusBadge/StatusBadge";
import { Button } from "../../components/Button/Button";
import { ConfirmModal } from "../../components/ConfirmModal/ConfirmModal";
import { useMyEnrollments } from "../../hooks/useMyEnrollments";
import { formatDateTime } from "../../utils/date.utils";
import { MODALITY_LABELS, PERIOD_TYPE_LABELS, formatGrade } from "../../utils/labels.utils";
import type { IEnrollment } from "../../interfaces/enrollment.interface";

export function MyEnrollmentsPage() {
  const { enrollments, hasAny, filterGroups, isLoading, error, drop, canDrop, confirmModal } =
    useMyEnrollments();

  const columns: TableColumn<IEnrollment>[] = [
    { key: "subject", header: "Materia", render: (e) => e.offering.subject.name },
    { key: "type", header: "Tipo", render: (e) => PERIOD_TYPE_LABELS[e.offering.period.type] },
    { key: "period", header: "Período", render: (e) => e.offering.period.name },
    { key: "modality", header: "Modalidad", render: (e) => MODALITY_LABELS[e.modality] },
    { key: "examDate", header: "Fecha de examen", render: (e) => formatDateTime(e.offering.examDate) },
    { key: "status", header: "Estado", render: (e) => <StatusBadge status={e.status} size="sm" /> },
    {
      key: "result",
      header: "Resultado",
      render: (e) => (e.result ? <StatusBadge status={e.result} size="sm" /> : "—"),
    },
    { key: "grade", header: "Nota", align: "center", render: (e) => formatGrade(e.grade) },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (e) =>
        canDrop(e) ? (
          <Button
            label="Dar de baja"
            size="sm"
            variant="danger"
            ariaLabel={`Dar de baja ${e.offering.subject.name}`}
            onClick={() => drop(e)}
          />
        ) : (
          "—"
        ),
    },
  ];

  return (
    <Stack gap="lg">
      <Header title="Mis inscripciones" subtitle="Historial de inscripciones a cursadas y finales" />
      {error && <Callout variant="danger" message={error} />}
      {hasAny && <FilterBar groups={filterGroups} />}
      <Table
        columns={columns}
        rows={enrollments}
        rowKey={(e) => e.id}
        isLoading={isLoading}
        caption="Mis inscripciones"
        emptyMessage={
          hasAny
            ? "No hay inscripciones con el estado seleccionado."
            : "Todavía no te inscribiste a ninguna cursada o mesa."
        }
      />
      <ConfirmModal {...confirmModal} />
    </Stack>
  );
}
