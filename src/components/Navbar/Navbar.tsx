import { useId } from "react";
import { NavLink } from "react-router-dom";
import { GraduationCap, LogOut, Menu, X } from "lucide-react";
import { useDrawer } from "../../hooks/useDrawer";
import type { NavbarItem } from "../../interfaces/navigation.interface";
import styles from "./Navbar.module.css";

export type { NavbarItem } from "../../interfaces/navigation.interface";

export interface NavbarProps {
  /** Brand text shown next to the logo. */
  title: string;
  /** Identifier of the signed-in user (e.g. email). */
  userName: string;
  /** Human-readable role label. */
  role: string;
  items: NavbarItem[];
  onLogout: () => void;
  logoutLabel?: string;
  /** Accessible name of the navigation landmark. */
  ariaLabel?: string;
}

/**
 * Fixed vertical sidebar. Desktop (>=768px): always visible on the left.
 * Mobile: hidden off-canvas, opened as an overlay drawer from a fixed top bar.
 */
export function Navbar({
  title,
  userName,
  role,
  items,
  onLogout,
  logoutLabel = "Cerrar sesión",
  ariaLabel = "Navegación principal",
}: NavbarProps) {
  const sidebarId = useId();
  const { isOpen, close, toggle, drawerRef, toggleRef } = useDrawer({
    bodyLockClassName: styles.bodyLocked,
  });

  return (
    <>
      <div className={styles.topbar}>
        <button
          ref={toggleRef}
          type="button"
          className={styles.menuToggle}
          aria-expanded={isOpen}
          aria-controls={sidebarId}
          aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
          onClick={toggle}
        >
          {isOpen ? <X aria-hidden="true" size={22} /> : <Menu aria-hidden="true" size={22} />}
        </button>
        <span className={styles.topbarBrand}>
          <GraduationCap aria-hidden="true" className={styles.logo} size={22} />
          <span className={styles.title}>{title}</span>
        </span>
      </div>

      <div
        className={`${styles.backdrop} ${isOpen ? styles.backdropVisible : ""}`.trim()}
        aria-hidden="true"
        onClick={close}
      />

      <aside
        id={sidebarId}
        ref={drawerRef}
        className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ""}`.trim()}
      >
        <div className={styles.brand}>
          <GraduationCap aria-hidden="true" className={styles.logo} size={26} />
          <span className={styles.title}>{title}</span>
        </div>

        <nav className={styles.nav} aria-label={ariaLabel}>
          <ul className={styles.links}>
            {items.map(({ to, end, label, icon: Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  onClick={close}
                  className={({ isActive }) =>
                    `${styles.link} ${isActive ? styles.linkActive : ""}`.trim()
                  }
                >
                  <Icon aria-hidden="true" className={styles.linkIcon} size={18} />
                  <span className={styles.linkLabel}>{label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.userSection}>
          <div className={styles.userInfo}>
            <span className={styles.userName} title={userName}>
              {userName}
            </span>
            {role && <span className={styles.userRole}>{role}</span>}
          </div>
          <button className={styles.logoutBtn} onClick={onLogout} type="button">
            <LogOut aria-hidden="true" size={16} />
            <span>{logoutLabel}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
