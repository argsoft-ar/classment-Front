import styles from "./Footer.module.css";

interface FooterProps {
  appName: string;
  version?: string;
}

export function Footer({ appName, version }: FooterProps) {
  const year = new Date().getFullYear();
  return (
    <footer className={styles.footer}>
      <span className={styles.text}>
        © {year} {appName}
        {version && <span className={styles.version}> v{version}</span>}
      </span>
    </footer>
  );
}
