import {
  BookMarked,
  BookOpen,
  Building2,
  CalendarRange,
  ClipboardList,
  LayoutDashboard,
  ListChecks,
  TrendingUp,
  Users,
} from "lucide-react";
import { RoleLevel, isValidRole } from "../types/rbac.types";
import type { NavbarItem } from "../interfaces/navigation.interface";

/** Centralized route paths (avoid magic strings across pages/hooks). */
export const ROUTES = {
  login: "/",
  director: {
    dashboard: "/director",
    careers: "/director/carreras",
    careerSubjects: (careerId: string) =>
      `/director/carreras/${encodeURIComponent(careerId)}/materias`,
    students: "/director/alumnos",
    studentHistory: (studentId: string) =>
      `/director/alumnos/${encodeURIComponent(studentId)}/historial`,
    periods: "/director/periodos",
    institution: "/director/institucion",
  },
  student: {
    progress: "/alumno",
    enrollment: "/alumno/inscripciones",
    myEnrollments: "/alumno/mis-inscripciones",
  },
  teacher: {
    offerings: "/docente",
  },
} as const;

/** Sidebar entry (alias of the shared NavbarItem contract). */
export type NavItem = NavbarItem;

const DIRECTOR_ITEMS: NavItem[] = [
  { label: "Inicio", to: ROUTES.director.dashboard, icon: LayoutDashboard, end: true },
  { label: "Carreras", to: ROUTES.director.careers, icon: BookOpen },
  { label: "Alumnos", to: ROUTES.director.students, icon: Users },
  { label: "Períodos y ofertas", to: ROUTES.director.periods, icon: CalendarRange },
];

export const NAV_ITEMS: Record<RoleLevel, NavItem[]> = {
  [RoleLevel.SUPER_ADMIN]: [
    ...DIRECTOR_ITEMS,
    { label: "Institución", to: ROUTES.director.institution, icon: Building2 },
  ],
  [RoleLevel.DIRECTIVO]: DIRECTOR_ITEMS,
  [RoleLevel.DOCENTE]: [
    { label: "Mis mesas y materias", to: ROUTES.teacher.offerings, icon: BookMarked, end: true },
  ],
  [RoleLevel.ALUMNO]: [
    { label: "Mi avance", to: ROUTES.student.progress, icon: TrendingUp, end: true },
    { label: "Inscripciones", to: ROUTES.student.enrollment, icon: ClipboardList },
    { label: "Mis inscripciones", to: ROUTES.student.myEnrollments, icon: ListChecks },
  ],
};

const HOME_BY_ROLE: Record<RoleLevel, string> = {
  [RoleLevel.SUPER_ADMIN]: ROUTES.director.dashboard,
  [RoleLevel.DIRECTIVO]: ROUTES.director.dashboard,
  [RoleLevel.DOCENTE]: ROUTES.teacher.offerings,
  [RoleLevel.ALUMNO]: ROUTES.student.progress,
};

/** Landing route after login for a given role (unknown roles go back to login). */
export function getHomePath(role: string | null | undefined): string {
  return isValidRole(role) ? HOME_BY_ROLE[role] : ROUTES.login;
}

export function getNavItems(role: string | null | undefined): NavItem[] {
  return isValidRole(role) ? NAV_ITEMS[role] : [];
}
