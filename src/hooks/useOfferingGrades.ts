import { useCallback, useState } from "react";
import { useAuth } from "./useAuth";
import { useAsyncData } from "./useAsyncData";
import { useNotify } from "./useNotify";
import { useConfirm } from "./useConfirm";
import { offeringsService } from "../services/offerings.service";
import { institutionService } from "../services/institution.service";
import { getErrorMessage, getGradeErrors } from "../utils/error.utils";
import { formatDateTime } from "../utils/date.utils";
import {
  formatPeriodTitle,
  MODALITY_LABELS,
  PERIOD_TYPE_LABELS,
  yearLabel,
} from "../utils/labels.utils";
import { ROUTES } from "../config/navigation.config";
import { RoleLevel } from "../types/rbac.types";
import type { IOffering } from "../interfaces/offering.interface";
import type {
  EnrollmentResult,
  GradeEntryDto,
  IOfferingEnrollment,
} from "../interfaces/enrollment.interface";
import type { IInstitutionConfig } from "../interfaces/institution.interface";
import type { SelectOption } from "../components/Select/Select";
import type { ProgressItem } from "../components/ProgressSummary/ProgressSummary";
import type { FilterBarGroup } from "../components/FilterBar/FilterBar";
import type { GradeSheetRow } from "../components/GradeSheet/GradeSheet";

interface LoadedActa {
  offering: IOffering;
  enrollments: IOfferingEnrollment[];
  config: IInstitutionConfig;
}

interface DraftGrade {
  result: EnrollmentResult | "";
  grade: string;
}

type ActaStatusFilter = "ALL" | "ACTIVA" | "CERRADA";

function gradeToInput(grade: string | number | null): string {
  if (grade === null || grade === undefined || grade === "") return "";
  const num = Number(grade);
  return Number.isFinite(num) ? String(Math.round(num)) : "";
}

function buildResultOptions(
  offering: IOffering | undefined,
  config: IInstitutionConfig | undefined,
): SelectOption[] {
  if (!offering) return [];
  if (offering.period.type === "FINAL") {
    return [
      { value: "APROBADA", label: "Aprobada" },
      { value: "DESAPROBADA", label: "Desaprobada" },
      { value: "AUSENTE", label: "Ausente" },
    ];
  }
  const opts: SelectOption[] = [{ value: "REGULARIZADA", label: "Regularizada" }];
  if (config?.allowsPromotion) {
    opts.push({ value: "APROBADA", label: "Aprobada (Promoción)" });
  }
  opts.push(
    { value: "DESAPROBADA", label: "Desaprobada" },
    { value: "AUSENTE", label: "Ausente" },
  );
  return opts;
}

function validateDraft(
  draftResult: EnrollmentResult | "",
  rawGrade: string,
  offering: IOffering,
  config: IInstitutionConfig,
): { error: string | null; parsedGrade: number | null } {
  if (draftResult === "") {
    return { error: "Seleccioná una condición o resultado.", parsedGrade: null };
  }
  if (draftResult === "AUSENTE") {
    return { error: null, parsedGrade: null };
  }

  const trimmed = rawGrade.trim();
  let parsedGrade: number | null = null;
  if (trimmed !== "") {
    if (!/^\d+$/.test(trimmed)) {
      return { error: "La nota debe ser un número entero entre 1 y 10.", parsedGrade: null };
    }
    parsedGrade = Number(trimmed);
    if (parsedGrade < 1 || parsedGrade > 10) {
      return { error: "La nota debe estar entre 1 y 10.", parsedGrade: null };
    }
  }

  if (offering.period.type === "FINAL") {
    if (draftResult === "APROBADA") {
      if (parsedGrade === null || parsedGrade < config.passingGrade) {
        return {
          error: `Para aprobar el final la nota debe estar entre ${config.passingGrade} y 10.`,
          parsedGrade: null,
        };
      }
    } else if (draftResult === "DESAPROBADA") {
      if (parsedGrade === null || parsedGrade >= config.passingGrade) {
        return {
          error: `Para desaprobar el final la nota debe estar entre 1 y ${config.passingGrade - 1}.`,
          parsedGrade: null,
        };
      }
    }
    return { error: null, parsedGrade };
  }

  // CURSADA
  if (draftResult === "APROBADA") {
    if (!config.allowsPromotion || config.promotionGrade === null) {
      return { error: "La promoción directa no está habilitada.", parsedGrade: null };
    }
    if (parsedGrade === null || parsedGrade < config.promotionGrade) {
      return {
        error: `Para promocionar se requiere nota entre ${config.promotionGrade} y 10.`,
        parsedGrade: null,
      };
    }
  } else if (draftResult === "REGULARIZADA") {
    if (parsedGrade !== null && parsedGrade < config.passingGrade) {
      return {
        error: `La nota de regularización debe ser al menos ${config.passingGrade}.`,
        parsedGrade: null,
      };
    }
  } else if (draftResult === "DESAPROBADA") {
    if (parsedGrade !== null && parsedGrade >= config.passingGrade) {
      return {
        error: `La nota de desaprobación debe ser menor a ${config.passingGrade}.`,
        parsedGrade: null,
      };
    }
  }

  return { error: null, parsedGrade };
}

function buildSubtitle(offering: IOffering): string {
  const parts = [
    PERIOD_TYPE_LABELS[offering.period.type],
    yearLabel(offering.subject.yearLevel),
    formatPeriodTitle(offering.period),
  ];
  if (offering.teacher) {
    parts.push(`Docente: ${offering.teacher.lastName}, ${offering.teacher.firstName}`);
  }
  if (offering.examDate) {
    parts.push(`Mesa: ${formatDateTime(offering.examDate)}`);
  }
  return parts.join(" · ");
}

function buildRulesBanner(
  offering: IOffering,
  config: IInstitutionConfig,
  canRectify: boolean,
): string {
  const parts = [`Nota mínima de aprobación: ${config.passingGrade}`];
  if (offering.period.type === "CURSADA") {
    parts.push(
      config.allowsPromotion && config.promotionGrade !== null
        ? `Promoción directa habilitada (≥ ${config.promotionGrade})`
        : "Sin promoción directa",
    );
  }
  parts.push(
    canRectify
      ? "Modo Directivo: podés cargar calificaciones pendientes o rectificar actas cerradas."
      : "Al guardar, las inscripciones pasan a Cerrada y actualizan el historial del alumno. Las actas cerradas solo las rectifica Dirección.",
  );
  return parts.join(" · ");
}

export function useOfferingGrades(offeringId: string) {
  const { user } = useAuth();
  const notify = useNotify();
  const confirm = useConfirm();

  const canRectify =
    user?.role === RoleLevel.DIRECTIVO || user?.role === RoleLevel.SUPER_ADMIN;
  const backPath =
    user?.role === RoleLevel.DOCENTE ? ROUTES.teacher.offerings : ROUTES.director.periods;

  const loader = useCallback(async (): Promise<LoadedActa> => {
    const [offering, enrollments, config] = await Promise.all([
      offeringsService.getById(offeringId),
      offeringsService.getEnrollments(offeringId),
      institutionService.getConfig(),
    ]);
    return { offering, enrollments, config };
  }, [offeringId]);

  const { data, isLoading, error, reload, setData } = useAsyncData(loader);
  const [drafts, setDrafts] = useState<Record<string, DraftGrade>>({});
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({});
  const [statusFilter, setStatusFilter] = useState<ActaStatusFilter>("ALL");
  const [isSaving, setIsSaving] = useState(false);

  const offering = data?.offering;
  const enrollments = data?.enrollments ?? [];
  const config = data?.config;

  const findSaved = (enrollmentId: string): DraftGrade => {
    const found = enrollments.find((e) => e.id === enrollmentId);
    return {
      result: found?.result ?? "",
      grade: gradeToInput(found?.grade ?? null),
    };
  };

  const clearErrorFor = (enrollmentId: string) => {
    setRowErrors((prev) => {
      if (!(enrollmentId in prev)) return prev;
      const next = { ...prev };
      delete next[enrollmentId];
      return next;
    });
  };

  const onResultChange = (enrollmentId: string, nextResult: EnrollmentResult | "") => {
    const saved = findSaved(enrollmentId);
    setDrafts((prev) => {
      const current = prev[enrollmentId] ?? saved;
      const nextGrade = nextResult === "AUSENTE" || nextResult === "" ? "" : current.grade;
      const next = { ...prev };
      if (nextResult === saved.result && nextGrade === saved.grade) {
        delete next[enrollmentId];
      } else {
        next[enrollmentId] = { result: nextResult, grade: nextGrade };
      }
      return next;
    });
    clearErrorFor(enrollmentId);
  };

  const onGradeChange = (enrollmentId: string, nextGrade: string) => {
    const saved = findSaved(enrollmentId);
    setDrafts((prev) => {
      const current = prev[enrollmentId] ?? saved;
      const next = { ...prev };
      if (current.result === saved.result && nextGrade === saved.grade) {
        delete next[enrollmentId];
      } else {
        next[enrollmentId] = { result: current.result, grade: nextGrade };
      }
      return next;
    });
    clearErrorFor(enrollmentId);
  };

  const discard = () => {
    setDrafts({});
    setRowErrors({});
  };

  const modifiedEnrollments = enrollments.filter((e) => {
    if (e.status === "CERRADA" && !canRectify) return false;
    return e.id in drafts;
  });
  const changedCount = modifiedEnrollments.length;

  const submitEntries = async (entries: GradeEntryDto[]) => {
    setIsSaving(true);
    try {
      const updatedEnrollments = await offeringsService.recordGrades(offeringId, { entries });
      if (data) {
        setData({
          ...data,
          enrollments: updatedEnrollments,
          offering: {
            ...data.offering,
            closedEnrollmentsCount: updatedEnrollments.filter((e) => e.status === "CERRADA")
              .length,
          },
        });
      }
      setDrafts({});
      setRowErrors({});
      notify(
        `Acta actualizada: ${entries.length} ${
          entries.length === 1 ? "calificación guardada" : "calificaciones guardadas"
        }.`,
        "success",
      );
    } catch (err) {
      const perRow = getGradeErrors(err);
      if (Object.keys(perRow).length > 0) setRowErrors(perRow);
      notify(getErrorMessage(err, "No se pudieron guardar las calificaciones."), "error", 6000);
      if (Object.keys(perRow).length === 0) reload();
    } finally {
      setIsSaving(false);
    }
  };

  const requestSave = () => {
    if (!offering || !config || modifiedEnrollments.length === 0) return;

    const nextErrors: Record<string, string> = {};
    const entries: GradeEntryDto[] = [];

    for (const enrollment of modifiedEnrollments) {
      const saved = findSaved(enrollment.id);
      const draft = drafts[enrollment.id] ?? saved;
      const check = validateDraft(draft.result, draft.grade, offering, config);
      if (check.error || draft.result === "") {
        nextErrors[enrollment.id] = check.error ?? "Seleccioná un resultado válido.";
      } else {
        entries.push({
          enrollmentId: enrollment.id,
          result: draft.result,
          grade: check.parsedGrade,
        });
      }
    }

    if (Object.keys(nextErrors).length > 0) {
      setRowErrors(nextErrors);
      notify("Revisá las calificaciones marcadas antes de guardar.", "error");
      return;
    }

    const hasRectification = modifiedEnrollments.some((e) => e.status === "CERRADA");
    confirm.request({
      title: hasRectification
        ? "Confirmar calificaciones y rectificaciones"
        : "Confirmar cierre de calificaciones",
      message: hasRectification
        ? `Vas a guardar ${entries.length} ${
            entries.length === 1 ? "calificación" : "calificaciones"
          } (incluyendo rectificaciones sobre filas cerradas). Se actualizará el historial académico correspondiente.`
        : `Vas a cerrar la calificación de ${entries.length} ${
            entries.length === 1 ? "alumno" : "alumnos"
          } y actualizar su historial académico. ${
            canRectify
              ? ""
              : "Una vez guardadas, solo Dirección podrá rectificar estas notas."
          }`,
      confirmLabel: "Guardar calificaciones",
      onConfirm: () => submitEntries(entries),
    });
  };

  // Summary metrics (from persisted enrollments)
  const activeCount = enrollments.filter((e) => e.status === "ACTIVA").length;
  const closedCount = enrollments.filter((e) => e.status === "CERRADA").length;
  const approvedCount = enrollments.filter((e) => e.result === "APROBADA").length;
  const regularizedCount = enrollments.filter((e) => e.result === "REGULARIZADA").length;
  const failedOrAbsentCount = enrollments.filter(
    (e) => e.result === "DESAPROBADA" || e.result === "AUSENTE",
  ).length;

  const summaryItems: ProgressItem[] = [
    { label: "Total inscriptos", value: enrollments.length },
    { label: "Pendientes", value: activeCount, status: "ACTIVA" },
    { label: "Aprobadas", value: approvedCount, status: "APROBADA" },
    ...(offering?.period.type === "CURSADA"
      ? [{ label: "Regularizadas", value: regularizedCount, status: "REGULARIZADA" as const }]
      : []),
    { label: "Desaprob. / Aus.", value: failedOrAbsentCount, status: "DESAPROBADA" },
  ];

  const filterGroups: FilterBarGroup[] =
    enrollments.length > 0
      ? [
          {
            id: "acta-status",
            label: "Estado",
            value: statusFilter,
            onChange: (value: string) => setStatusFilter(value as ActaStatusFilter),
            options: [
              { value: "ALL", label: "Todos", count: enrollments.length },
              { value: "ACTIVA", label: "Pendientes", count: activeCount },
              { value: "CERRADA", label: "Cerradas", count: closedCount },
            ],
          },
        ]
      : [];

  const visibleEnrollments =
    statusFilter === "ALL"
      ? enrollments
      : enrollments.filter((e) => e.status === statusFilter);

  const rows: GradeSheetRow[] = visibleEnrollments.map((e) => {
    const savedResult = e.result ?? "";
    const savedGrade = gradeToInput(e.grade);
    const isReadOnly = e.status === "CERRADA" && !canRectify;
    const draft = isReadOnly ? undefined : drafts[e.id];
    const draftResult = draft ? draft.result : savedResult;
    const draftGrade = draft ? draft.grade : savedGrade;

    return {
      enrollmentId: e.id,
      studentName: `${e.student.lastName}, ${e.student.firstName}`,
      dni: e.student.dni,
      email: e.student.email,
      modalityLabel: MODALITY_LABELS[e.modality],
      enrolledAt: e.createdAt,
      enrollmentStatus: e.status,
      savedResult: e.result,
      savedGrade: e.grade,
      draftResult,
      draftGrade,
      isReadOnly,
      isModified: !isReadOnly && e.id in drafts,
      error: rowErrors[e.id],
    };
  });

  const breadcrumbs =
    user?.role === RoleLevel.DOCENTE
      ? [
          { label: "Mis mesas y materias", href: ROUTES.teacher.offerings },
          { label: offering?.subject.name ?? "Acta y calificaciones" },
        ]
      : [
          { label: "Inicio", href: ROUTES.director.dashboard },
          { label: "Períodos y ofertas", href: ROUTES.director.periods },
          { label: offering?.subject.name ?? "Acta y calificaciones" },
        ];

  return {
    breadcrumbs,
    backPath,
    title: offering ? `Acta — ${offering.subject.name}` : "Acta de calificaciones",
    subtitle: offering ? buildSubtitle(offering) : undefined,
    rulesBanner: offering && config ? buildRulesBanner(offering, config, canRectify) : null,
    hasOffering: Boolean(offering),
    summaryItems,
    filterGroups,
    rows,
    resultOptions: buildResultOptions(offering, config),
    hasAnyEnrollments: enrollments.length > 0,
    changedCount,
    isLoading: isLoading && !data,
    isSaving,
    error,
    onResultChange,
    onGradeChange,
    requestSave,
    discard,
    confirmModal: confirm.modalProps,
  };
}
