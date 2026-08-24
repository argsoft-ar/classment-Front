import React from "react";
import { Navbar } from "../Navbar/Navbar";
import { Footer } from "../Footer/Footer";
import { useAuth } from "../../hooks/useAuth";
import styles from "./Layout.module.css";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();

  return (
    <div className={styles.layout}>
      <Navbar
        title="Classment"
        userName={user?.email ?? ""}
        role={user?.role ?? ""}
        onLogout={logout}
      />
      <main className={styles.main}>{children}</main>
      <Footer appName="Classment" version="1.0.0" />
    </div>
  );
}
