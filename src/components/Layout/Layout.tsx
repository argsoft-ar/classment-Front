import type { ReactNode } from "react";
import { Navbar } from "../Navbar/Navbar";
import { Footer } from "../Footer/Footer";
import { useAuth } from "../../hooks/useAuth";
import { getNavItems } from "../../config/navigation.config";
import { ROLE_LABELS, isValidRole } from "../../types/rbac.types";
import styles from "./Layout.module.css";

interface LayoutProps {
  children: ReactNode;
}

/** Authenticated shell: role-driven navbar + content + footer. */
export function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const role = user?.role ?? "";

  return (
    <div className={styles.layout}>
      <Navbar
        title="Classment"
        userName={user?.email ?? ""}
        role={isValidRole(role) ? ROLE_LABELS[role] : ""}
        items={getNavItems(role)}
        onLogout={logout}
      />
      <main className={styles.main}>{children}</main>
      <Footer appName="Classment" version="0.1.0" />
    </div>
  );
}
