import { useCallback, useState } from "react";
import { useAsyncData } from "./useAsyncData";
import { useNotify } from "./useNotify";
import { useConfirm } from "./useConfirm";
import { offeringsService } from "../services/offerings.service";
import { enrollmentsService } from "../services/enrollments.service";
import { getErrorMessage, getRejection } from "../utils/error.utils";
import { formatDate } from "../utils/date.utils";
import { MODALITY_LABELS, callLabel } from "../utils/labels.utils";
import type {
  EnrollmentModality,
  IAvailableOffering,
} from "../interfaces/offering.interface";
import type { IRejectionReason } from "../interfaces/correlative.interface";
import type { PeriodType } from "../interfaces/enrollment-period.interface";
import type { OfferingCardProps } from "../components/OfferingCard/OfferingCard";
import type { SelectOption } from "../components/Select/Select";
import type { TabItem } from "../components/Tabs/Tabs";

export interface OfferingCardConfig {
  id: string;
  props: OfferingCardProps;
}

export interface OfferingSectionConfig {
  id: string;
  title: string;
  description: string;
  cards: OfferingCardConfig[];
}

interface RejectionState {
  subjectName: string;
  reasons: IRejectionReason[];
}

const MODALITIES: EnrollmentModality[] = ["REGULAR", "LIBRE"];

function isModality(value: string): value is EnrollmentModality {
  return MODALITIES.some((m) => m === value);
}

function teacherName(o: IAvailableOffering): string | undefined {
  return o.teacher ? `${o.teacher.firstName} ${o.teacher.lastName}` : undefined;
}

export function useEnrollmentOffers() {
  const notify = useNotify();
  const confirm = useConfirm();
  const loader = useCallback(() => offeringsService.getAvailable(), []);
  const { data, isLoading, error, reload } = useAsyncData(loader);
  const [activeTab, setActiveTab] = useState<PeriodType>("CURSADA");
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

  const modalityOptionsFor = (o: IAvailableOffering): SelectOption[] =>
    MODALITIES.map((m) => {
      const result = o.validationByModality[m];
      const state = result ? (result.allowed ? "habilitada" : "bloqueada") : "no disponible";
      return { value: m, label: `${MODALITY_LABELS[m]} — ${state}` };
    });

  const toCard = (o: IAvailableOffering): OfferingCardConfig => {
    const isFinal = o.period.type === "FINAL";
    const modality = selectedModality(o);
    const validation = (isFinal ? o.validationByModality[modality] : undefined) ?? o.validation;
    return {
      id: o.id,
      props: {
        subjectName: o.subject.name,
        yearLevel: o.subject.yearLevel,
        type: o.period.type,
        examDate: o.examDate ?? undefined,
        teacherName: teacherName(o),
        validation,
        enrolled: o.activeEnrollmentId !== null,
        isLoading: pendingId === o.id,
        onEnroll: () => void enroll(o),
        onDrop: () => drop(o),
        allowBlockedAttempt: true,
        enrollLabel: isFinal ? `Inscribirme (${MODALITY_LABELS[modality]})` : "Inscribirme",
        ...(isFinal && {
          modality,
          modalityOptions: modalityOptionsFor(o),
          onModalityChange: (value: string) => {
            if (isModality(value)) setModalityById((prev) => ({ ...prev, [o.id]: value }));
          },
        }),
      },
    };
  };

  const inTab = offerings.filter((o) => o.period.type === activeTab);
  const sections: OfferingSectionConfig[] = [];
  for (const o of inTab) {
    let section = sections.find((s) => s.id === o.period.id);
    if (!section) {
      section = {
        id: o.period.id,
        title: o.period.callNumber
          ? `${o.period.name} · ${callLabel(o.period.callNumber)}`
          : o.period.name,
        description: `Inscripción abierta hasta el ${formatDate(o.period.endsAt)}`,
        cards: [],
      };
      sections.push(section);
    }
    section.cards.push(toCard(o));
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

  return {
    isLoading: isLoading && !data,
    error,
    tabs,
    activeTab,
    onTabChange: (id: string) => setActiveTab(id === "FINAL" ? "FINAL" : "CURSADA"),
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
