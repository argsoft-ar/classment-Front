import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { isValidRole, type RoleLevel } from "../types/rbac.types";
import { getHomePath } from "../config/navigation.config";

interface AuthGuardProps {
  children: ReactNode;
  /** When provided, only these roles may access the route; others go to their home. */
  allowedRoles?: RoleLevel[];
}

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated || !user || !isValidRole(user.role)) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={getHomePath(user.role)} replace />;
  }

  return <>{children}</>;
}
