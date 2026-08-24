export const RoleLevel = {
  DIRECTIVO: "Directivo",
  PRECEPTOR: "Preceptor",
  DOCENTE: "Docente",
  ALUMNO: "Alumno",
} as const;

export type RoleLevel = (typeof RoleLevel)[keyof typeof RoleLevel];

export type Permission =
  | "institution:read"
  | "institution:write"
  | "institution:delete"
  | "grades:read"
  | "grades:write"
  | "grades:override"
  | "attendance:read"
  | "attendance:write"
  | "messages:read"
  | "messages:write"
  | "users:read"
  | "users:write"
  | "roles:read"
  | "roles:write"
  | "courses:read"
  | "courses:write"
  | "subjects:read"
  | "subjects:write"
  | "academic-records:read"
  | "academic-records:write";

export const ROLE_PERMISSIONS: Record<RoleLevel, Permission[]> = {
  [RoleLevel.DIRECTIVO]: [
    "institution:read",
    "institution:write",
    "institution:delete",
    "grades:read",
    "grades:write",
    "grades:override",
    "attendance:read",
    "attendance:write",
    "messages:read",
    "messages:write",
    "users:read",
    "users:write",
    "roles:read",
    "roles:write",
    "courses:read",
    "courses:write",
    "subjects:read",
    "subjects:write",
    "academic-records:read",
    "academic-records:write",
  ],
  [RoleLevel.PRECEPTOR]: [
    "institution:read",
    "grades:read",
    "attendance:read",
    "attendance:write",
    "messages:read",
    "messages:write",
    "users:read",
    "courses:read",
    "subjects:read",
    "academic-records:read",
  ],
  [RoleLevel.DOCENTE]: [
    "institution:read",
    "grades:read",
    "grades:write",
    "attendance:read",
    "messages:read",
    "users:read",
    "courses:read",
    "subjects:read",
    "academic-records:read",
  ],
  [RoleLevel.ALUMNO]: [
    "institution:read",
    "grades:read",
    "attendance:read",
    "messages:read",
  ],
};
