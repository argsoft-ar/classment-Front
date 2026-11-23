import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAsyncData } from "./useAsyncData";
import { useAuth } from "./useAuth";
import { careersService } from "../services/careers.service";
import { subjectsService } from "../services/subjects.service";
import { usersService } from "../services/users.service";
import { enrollmentPeriodsService } from "../services/enrollment-periods.service";
import { ROUTES } from "../config/navigation.config";
import { RoleLevel } from "../types/rbac.types";

interface DashboardStats {
  careers: number;
  subjects: number;
  students: number;
  openPeriods: string[];
}

export interface StatCardConfig {
  id: string;
  title: string;
  value: string | number;
  description?: string;
}

export interface QuickLinkConfig {
  id: string;
  title: string;
  description: string;
  onClick: () => void;
}

async function loadStats(): Promise<DashboardStats> {
  const [careers, students, openPeriods] = await Promise.all([
    careersService.getAll(),
    usersService.getAll({ role: RoleLevel.ALUMNO }),
    enrollmentPeriodsService.getOpen(),
  ]);
  const subjectLists = await Promise.all(careers.map((c) => subjectsService.getByCareer(c.id)));
  return {
    careers: careers.length,
    subjects: subjectLists.reduce((total, list) => total + list.length, 0),
    students: students.length,
    openPeriods: openPeriods.map((p) => p.name),
  };
}

export function useDirectorDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data, isLoading, error } = useAsyncData(loadStats);

  const pending = isLoading && !data ? "…" : "—";

  const stats: StatCardConfig[] = [
    { id: "careers", title: "Carreras activas", value: data?.careers ?? pending },
    { id: "subjects", title: "Materias", value: data?.subjects ?? pending },
    { id: "students", title: "Alumnos", value: data?.students ?? pending },
    {
      id: "periods",
      title: "Períodos abiertos",
      value: data?.openPeriods.length ?? pending,
      description: data?.openPeriods.join(" · ") || undefined,
    },
  ];

  const quickLinks = useMemo<QuickLinkConfig[]>(() => {
    const links: QuickLinkConfig[] = [
      {
        id: "careers",
        title: "Carreras y correlatividades",
        description: "Plan de estudios por año y editor de correlatividades.",
        onClick: () => navigate(ROUTES.director.careers),
      },
      {
        id: "students",
        title: "Alumnos e historial (Día Cero)",
        description: "Alta de alumnos y carga rápida de materias previas.",
        onClick: () => navigate(ROUTES.director.students),
      },
      {
        id: "periods",
        title: "Períodos y ofertas",
        description: "Inscripciones a cursadas, turnos de finales y mesas.",
        onClick: () => navigate(ROUTES.director.periods),
      },
    ];
    if (user?.role === RoleLevel.SUPER_ADMIN) {
      links.push({
        id: "institution",
        title: "Configuración institucional",
        description: "Datos del instituto y reglas de aprobación.",
        onClick: () => navigate(ROUTES.director.institution),
      });
    }
    return links;
  }, [navigate, user?.role]);

  return { stats, quickLinks, error, greeting: user?.email ?? "" };
}
