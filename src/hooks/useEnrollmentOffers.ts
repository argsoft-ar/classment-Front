import { useCallback, useState } from "react";
import { useAsyncData } from "./useAsyncData";
import { useNotify } from "./useNotify";
import { useConfirm } from "./useConfirm";
import { offeringsService } from "../services/offerings.service";
import { enrollmentsService } from "../services/enrollments.service";
import { getErrorMessage, getRejection } from "../utils/error.utils";
import { formatDate } from "../utils/date.utils";
import { formatPeriodTitle, MODALITY_LABELS, yearLabel } from "../utils/labels.utils";
import type {
  EnrollmentModality,
  IAvailableOffering,
} from "../interfaces/offering.interface";
import type {
  IEnrollmentValidationResult,
  IRejectionReason,
} from "../interfaces/correlative.interface";
import type { PeriodType } from "../interfaces/enrollment-period.interface";
import type { FilterBarGroup } from "../components/FilterBar/FilterBar";
import type {
  OfferingListGroup,
  OfferingListItem,
  OfferingRowVisualState,
} from "../components/OfferingList/OfferingList";
import type { TabItem } from "../components/Tabs/Tabs";

export interface OfferingPeriodSection {
  id: string;
  title: string;
  description: string;
  groups: OfferingListGroup[];
}

interface RejectionState {
  subjectName: string;
  reasons: IRejectionReason[];
}

type StatusFilter = "ALL" | "AVAILABLE" | "ENROLLED" | "BLOCKED" | "COMPLETED";

const MODALITIES: EnrollmentModality[] = ["REGULAR", "LIBRE"];

function isModality(value: string): value is EnrollmentModality {
  return MODALITIES.some((m) => m === value);
}

function teacherName(o: IAvailableOffering): string | undefined {
  return o.teacher ? `${o.teacher.firstName} ${o.teacher.lastName}` : undefined;
}

function summarizeCorrelatives(reasons: IRejectionReason[]): string {
  const correlatives = reasons.filter((r) => r.code === "CORRELATIVE_NOT_MET");
  if (correlatives.length === 1) {
    const req = correlatives[0].requiredSubjectName;
    return req ? `Falta 1 correlativa: ${req}` : "Falta 1 correlativa";
  }
  if (correlatives.length > 1) {
    return `Faltan ${correlatives.length} correlativas`;
  }
  return reasons[0]?.message ?? "Requisitos pendientes";
}

function classifyOffering(
  o: IAvailableOffering,
  modality: EnrollmentModality,
  validation: IEnrollmentValidationResult,
): { visualState: OfferingRowVisualState; summaryHint?: string } {
  if (o.activeEnrollmentId !== null) {
    return {
      visualState: "ENROLLED",
      summaryHint:
        o.period.type === "FINAL" ? `Modalidad: ${MODALITY_LABELS[modality]}` : undefined,
    };
  }

  const reasons = validation.reasons;

  if (
    o.period.type === "FINAL" &&
    (reasons.some((r) => r.code === "ALREADY_APPROVED") ||
      (o.validationByModality.REGULAR?.reasons.some((r) => r.code === "ALREADY_APPROVED") &&
        o.validationByModality.LIBRE?.reasons.some((r) => r.code === "ALREADY_APPROVED")))
  ) {
    return { visualState: "ALREADY_APPROVED", summaryHint: "Ya aprobaste esta materia" };
  }

  if (validation.allowed) {
    return { visualState: "AVAILABLE" };
  }

  if (o.period.type === "CURSADA") {
    if (reasons.some((r) => r.code === "ALREADY_APPROVED")) {
      return { visualState: "ALREADY_APPROVED", summaryHint: "Ya aprobaste esta materia" };
    }
    const cursando = reasons.find(
      (r) => r.code === "ALREADY_REGULARIZED" && r.currentStatus === "CURSANDO",
    );
    if (cursando) {
      return { visualState: "CURSANDO", summaryHint: "Ya estás cursando esta materia" };
    }
    if (reasons.some((r) => r.code === "ALREADY_REGULARIZED")) {
      return { visualState: "ALREADY_REGULARIZED", summaryHint: "Lista para mesa de final" };
    }
    return { visualState: "BLOCKED", summaryHint: summarizeCorrelatives(reasons) };
  }

  if (reasons.some((r) => r.code === "NOT_REGULARIZED_FOR_FINAL")) {
    const libreAllowed = o.validationByModality.LIBRE?.allowed ?? false;
    return {
      visualState: "BLOCKED",
      summaryHint: libreAllowed
        ? "Requiere cursada regularizada · Libre habilitada"
        : "Requiere cursada regularizada (probá Libre)",
    };
  }

  if (reasons.some((r) => r.code === "ALREADY_REGULARIZED")) {
    return {
      visualState: "BLOCKED",
      summaryHint: "Ya regularizada: elegí modalidad Regular",
    };
  }

  return { visualState: "BLOCKED", summaryHint: summarizeCorrelatives(reasons) };
}

function matchesStatusFilter(state: OfferingRowVisualState, filter: StatusFilter): boolean {
  if (filter === "ALL") return true;
  if (filter === "COMPLETED") {
    return (
      state === "ALREADY_APPROVED" ||
      state === "ALREADY_REGULARIZED" ||
      state === "CURSANDO"
    );
  }
  return state === filter;
}

export function useEnrollmentOffers() {
  const notify = useNotify();
  const confirm = useConfirm();
  const loader = useCallback(() => offeringsService.getAvailable(), []);
  const { data, isLoading, error, reload } = useAsyncData(loader);
  const [activeTab, setActiveTab] = useState<PeriodType>("CURSADA");
  const [yearFilter, setYearFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [modalityById, setModalityById] = useState<Record<string, EnrollmentModality>>({});
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [rejection, setRejection] = useState<RejectionState | null>(null);

  const offerings = data ?? [];
  const selectedModality = (o: IAvailableOffering): EnrollmentModality =>
    o.period.type === "FINAL" ? (modalityById[o.id] ?? o.modality) : "REGULAR";

  const enroll = async (o: IAvailableOffering) => {
    setPendingId(o.id);
    try {
      await enrollmentsService.create({ offeringId: o.id, modality: selectedModality(o) });
      const kind = o.period.type === "FINAL" ? `mesa de ${o.subject.name}` : o.subject.name;
      notify(`Inscripción confirmada: ${kind}`, "success");
      reload();
    } catch (err) {
      const result = getRejection(err);
      if (result) {
        setRejection({ subjectName: o.subject.name, reasons: result.reasons });
        reload();
      } else {
        notify(getErrorMessage(err, "No se pudo completar la inscripción."), "error", 6000);
      }
    } finally {
      setPendingId(null);
    }
  };

  const drop = (o: IAvailableOffering) => {
    const enrollmentId = o.activeEnrollmentId;
    if (!enrollmentId) return;
    confirm.request({
      title: "Dar de baja",
      message: `¿Confirmás la baja de tu inscripción a ${o.subject.name}?`,
      confirmLabel: "Dar de baja",
      variant: "danger",
      onConfirm: async () => {
        try {
          await enrollmentsService.drop(enrollmentId);
          notify(`Baja registrada: ${o.subject.name}`, "success");
          reload();
        } catch (err) {
          notify(getErrorMessage(err, "No se pudo dar de baja."), "error", 6000);
        }
      },
    });
  };

  const toItem = (o: IAvailableOffering): OfferingListItem => {
    const isFinal = o.period.type === "FINAL";
    const modality = selectedModality(o);
    const validation = (isFinal ? o.validationByModality[modality] : undefined) ?? o.validation;
    const { visualState, summaryHint } = classifyOffering(o, modality, validation);

    return {
      id: o.id,
      subjectName: o.subject.name,
      yearLevel: o.subject.yearLevel,
      type: o.period.type,
      visualState,
      summaryHint,
      examDate: o.examDate ?? undefined,
      teacherName: teacherName(o),
      enrolled: o.activeEnrollmentId !== null,
      isLoading: pendingId === o.id,
      onEnroll: () => void enroll(o),
      onDrop: () => drop(o),
      enrollLabel: isFinal ? `Inscribirme (${MODALITY_LABELS[modality]})` : "Inscribirme",
      ...(isFinal && {
        modality,
        modalityOptions: MODALITIES.map((m) => ({
          value: m,
          label: MODALITY_LABELS[m],
          allowed: o.validationByModality[m]?.allowed ?? false,
        })),
        onModalityChange: (value: string) => {
          if (isModality(value)) setModalityById((prev) => ({ ...prev, [o.id]: value }));
        },
      }),
    };
  };

  const inTab = offerings.filter((o) => o.period.type === activeTab);
  const classified = inTab.map((o) => ({ offering: o, item: toItem(o) }));

  const years = [...new Set(classified.map((c) => c.offering.subject.yearLevel))].sort(
    (a, b) => a - b,
  );
  const availableCount = classified.filter((c) => c.item.visualState === "AVAILABLE").length;
  const enrolledCount = classified.filter((c) => c.item.visualState === "ENROLLED").length;
  const blockedCount = classified.filter((c) => c.item.visualState === "BLOCKED").length;
  const completedCount = classified.filter((c) =>
    matchesStatusFilter(c.item.visualState, "COMPLETED"),
  ).length;

  const filterGroups: FilterBarGroup[] = inTab.length > 0
    ? [
        ...(years.length > 1
          ? [
              {
                id: "year",
                label: "Año",
                value: yearFilter,
                onChange: setYearFilter,
                options: [
                  { value: "ALL", label: "Todos", count: classified.length },
                  ...years.map((y) => ({
                    value: String(y),
                    label: yearLabel(y),
                    count: classified.filter((c) => c.offering.subject.yearLevel === y).length,
                  })),
                ],
              },
            ]
          : []),
        {
          id: "status",
          label: "Estado",
          value: statusFilter,
          onChange: (value: string) => setStatusFilter(value as StatusFilter),
          options: [
            { value: "ALL", label: "Todas", count: classified.length },
            { value: "AVAILABLE", label: "Habilitadas", count: availableCount },
            { value: "ENROLLED", label: "Inscriptas", count: enrolledCount },
            { value: "BLOCKED", label: "Bloqueadas", count: blockedCount },
            ...(completedCount > 0
              ? [{ value: "COMPLETED", label: "Ya cursadas", count: completedCount }]
              : []),
          ],
        },
      ]
    : [];

  const filtered = classified.filter(({ offering, item }) => {
    const matchesYear =
      yearFilter === "ALL" || String(offering.subject.yearLevel) === yearFilter;
    const matchesStatus = matchesStatusFilter(item.visualState, statusFilter);
    return matchesYear && matchesStatus;
  });

  const sections: OfferingPeriodSection[] = [];
  for (const { offering, item } of filtered) {
    let section = sections.find((s) => s.id === offering.period.id);
    if (!section) {
      section = {
        id: offering.period.id,
        title: formatPeriodTitle(offering.period),
        description: `Inscripción abierta hasta el ${formatDate(offering.period.endsAt)}`,
        groups: [],
      };
      sections.push(section);
    }
    let yearGroup = section.groups.find((g) => g.yearLevel === offering.subject.yearLevel);
    if (!yearGroup) {
      yearGroup = { yearLevel: offering.subject.yearLevel, items: [] };
      section.groups.push(yearGroup);
    }
    yearGroup.items.push(item);
  }

  for (const section of sections) {
    section.groups.sort((a, b) => a.yearLevel - b.yearLevel);
    for (const group of section.groups) {
      group.items.sort((a, b) => a.subjectName.localeCompare(b.subjectName, "es"));
    }
  }

  const tabs: TabItem[] = [
    {
      id: "CURSADA",
      label: "Cursadas",
      count: offerings.filter((o) => o.period.type === "CURSADA").length,
    },
    {
      id: "FINAL",
      label: "Mesas de final",
      count: offerings.filter((o) => o.period.type === "FINAL").length,
    },
  ];

  const onTabChange = (id: string) => {
    setActiveTab(id === "FINAL" ? "FINAL" : "CURSADA");
    setYearFilter("ALL");
    setStatusFilter("ALL");
  };

  const clearFilters = () => {
    setYearFilter("ALL");
    setStatusFilter("ALL");
  };

  return {
    isLoading: isLoading && !data,
    error,
    tabs,
    activeTab,
    onTabChange,
    filterGroups,
    hasOfferingsInTab: inTab.length > 0,
    hasActiveFilters: yearFilter !== "ALL" || statusFilter !== "ALL",
    clearFilters,
    sections,
    emptyTitle:
      activeTab === "FINAL" ? "No hay mesas de final abiertas" : "No hay cursadas abiertas",
    rejectionModal: {
      isOpen: rejection !== null,
      title: "Inscripción rechazada",
      subjectName: rejection?.subjectName ?? "",
      reasons: rejection?.reasons ?? [],
      onClose: () => setRejection(null),
    },
    confirmModal: confirm.modalProps,
  };
}
