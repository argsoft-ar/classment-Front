import styles from "./Navbar.module.css";

interface NavbarProps {
  title: string;
  userName: string;
  role: string;
  onLogout: () => void;
}

export function Navbar({ title, userName, role, onLogout }: NavbarProps) {
  return (
    <nav className={styles.navbar}>
      <div className={styles.brand}>
        <span className={styles.logo}>▣</span>
        <span className={styles.title}>{title}</span>
      </div>
      <div className={styles.userSection}>
        <div className={styles.userInfo}>
          <span className={styles.userName}>{userName}</span>
          <span className={styles.userRole}>{role}</span>
        </div>
        <button className={styles.logoutBtn} onClick={onLogout} type="button">
          Cerrar sesión
        </button>
      </div>
    </nav>
  );
}
