import { Modal } from "../Modal/Modal";
import { Stack } from "../Stack/Stack";
import { Callout } from "../Callout/Callout";
import { LoadingState } from "../LoadingState/LoadingState";
import { EmptyState } from "../EmptyState/EmptyState";
import { Table, type TableColumn } from "../Table/Table";
import { StatusBadge } from "../StatusBadge/StatusBadge";
import { formatDateTime } from "../../utils/date.utils";
import { MODALITY_LABELS } from "../../utils/labels.utils";
import type { IOfferingEnrollment } from "../../interfaces/enrollment.interface";

export interface OfferingRosterModalProps {
  isOpen: boolean;
  title: string;
  subtitle: string;
  enrollments: IOfferingEnrollment[];
  isLoading: boolean;
  error: string | null;
  onClose: () => void;
}

const COLUMNS: TableColumn<IOfferingEnrollment>[] = [
  {
    key: "student",
    header: "Alumno",
    render: (e) => `${e.student.lastName}, ${e.student.firstName}`,
  },
  { key: "dni", header: "DNI", render: (e) => e.student.dni },
  { key: "email", header: "Email", render: (e) => e.student.email },
  { key: "modality", header: "Modalidad", render: (e) => MODALITY_LABELS[e.modality] },
  {
    key: "status",
    header: "Estado",
    render: (e) => <StatusBadge status={e.status} size="sm" />,
  },
  {
    key: "createdAt",
    header: "Inscripción",
    render: (e) => formatDateTime(e.createdAt),
  },
];

export function OfferingRosterModal({
  isOpen,
  title,
  subtitle,
  enrollments,
  isLoading,
  error,
  onClose,
}: OfferingRosterModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      title={title}
      onClose={onClose}
      size="lg"
      actions={[{ label: "Cerrar", variant: "secondary", onClick: onClose }]}
    >
      <Stack gap="md">
        {subtitle && <Callout variant="info" message={subtitle} />}
        {error && <Callout variant="danger" message={error} />}

        {isLoading ? (
          <LoadingState message="Cargando nómina de inscriptos..." />
        ) : enrollments.length === 0 ? (
          <EmptyState
            title="Sin alumnos inscriptos"
            description="Todavía no hay inscripciones activas o cerradas en esta oferta."
          />
        ) : (
          <Table
            columns={COLUMNS}
            rows={enrollments}
            rowKey={(e) => e.id}
            caption="Nómina de alumnos inscriptos"
          />
        )}
      </Stack>
    </Modal>
  );
}
