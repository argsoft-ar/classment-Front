/** Mirrors classment-back src/types/rbac.types.ts (const object instead of enum: erasableSyntaxOnly). */
export const RoleLevel = {
  SUPER_ADMIN: "SuperAdmin",
  DIRECTIVO: "Directivo",
  DOCENTE: "Docente",
  ALUMNO: "Alumno",
} as const;

export type RoleLevel = (typeof RoleLevel)[keyof typeof RoleLevel];

export const ALL_ROLES: RoleLevel[] = [
  RoleLevel.SUPER_ADMIN,
  RoleLevel.DIRECTIVO,
  RoleLevel.DOCENTE,
  RoleLevel.ALUMNO,
];

/** Roles with administrative access to the academic domain. */
export const ADMIN_ROLES: RoleLevel[] = [RoleLevel.SUPER_ADMIN, RoleLevel.DIRECTIVO];

export const ROLE_LABELS: Record<RoleLevel, string> = {
  [RoleLevel.SUPER_ADMIN]: "SuperAdmin",
  [RoleLevel.DIRECTIVO]: "Dirección",
  [RoleLevel.DOCENTE]: "Docente",
  [RoleLevel.ALUMNO]: "Alumno/a",
};

export type Permission =
  | "institution:read"
  | "institution:write"
  | "users:read"
  | "users:write"
  | "users:write-directivo"
  | "careers:read"
  | "careers:write"
  | "subjects:read"
  | "subjects:write"
  | "correlatives:read"
  | "correlatives:write"
  | "academic-records:read"
  | "academic-records:read-own"
  | "academic-records:write"
  | "periods:read"
  | "periods:write"
  | "offerings:read"
  | "offerings:read-assigned"
  | "offerings:write"
  | "enrollments:read"
  | "enrollments:write-own";

const DIRECTIVO_PERMISSIONS: Permission[] = [
  "institution:read",
  "users:read",
  "users:write",
  "careers:read",
  "careers:write",
  "subjects:read",
  "subjects:write",
  "correlatives:read",
  "correlatives:write",
  "academic-records:read",
  "academic-records:write",
  "periods:read",
  "periods:write",
  "offerings:read",
  "offerings:write",
  "enrollments:read",
];

export const ROLE_PERMISSIONS: Record<RoleLevel, Permission[]> = {
  [RoleLevel.SUPER_ADMIN]: [
    ...DIRECTIVO_PERMISSIONS,
    "institution:write",
    "users:write-directivo",
  ],
  [RoleLevel.DIRECTIVO]: DIRECTIVO_PERMISSIONS,
  [RoleLevel.DOCENTE]: [
    "institution:read",
    "careers:read",
    "subjects:read",
    "correlatives:read",
    "periods:read",
    "offerings:read-assigned",
  ],
  [RoleLevel.ALUMNO]: [
    "institution:read",
    "careers:read",
    "subjects:read",
    "correlatives:read",
    "academic-records:read-own",
    "periods:read",
    "offerings:read",
    "enrollments:write-own",
  ],
};

/** Runtime guard against unknown role values (e.g. a crafted JWT). */
export function isValidRole(role: string | null | undefined): role is RoleLevel {
  return ALL_ROLES.some((r) => r === role);
}

export function isAdminRole(role: string | null | undefined): boolean {
  return ADMIN_ROLES.some((r) => r === role);
}

export function hasPermission(role: string | null | undefined, permission: Permission): boolean {
  return isValidRole(role) && ROLE_PERMISSIONS[role].includes(permission);
}
