import { Layout } from "../../components/Layout/Layout";
import { Header } from "../../components/Header/Header";
import { Breadcrumbs } from "../../components/Breadcrumbs/Breadcrumbs";
import { Card } from "../../components/Card/Card";
import { CardWrapper } from "../../components/CardWrapper/CardWrapper";
import { useAuth } from "../../hooks/useAuth";
import { RoleLevel, ROLE_PERMISSIONS } from "../../types/rbac.types";
import type { Permission } from "../../types/rbac.types";
import styles from "./DashboardPage.module.css";

// Runtime guard against unknown role values injected via a crafted JWT
function isValidRole(role: string): role is RoleLevel {
  return Object.values(RoleLevel).includes(role as RoleLevel);
}

function hasPermission(role: RoleLevel, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function DashboardPage() {
  const { user } = useAuth();
  const role = user?.role ?? "";
  const greeting = `Bienvenido, ${user?.email ?? ""}`;

  if (role && !isValidRole(role)) {
    return (
      <Layout>
        <Header title="Dashboard" subtitle="Acceso no autorizado" />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={styles.page}>
        <Header title="Dashboard" subtitle={greeting} />
        <Breadcrumbs items={[{ label: "Inicio" }]} />

        {role === RoleLevel.DIRECTIVO && (
          <>
            <CardWrapper columns={4}>
              <Card variant="stat" title="Alumnos" value="—" />
              <Card variant="stat" title="Cursos" value="—" />
              <Card variant="stat" title="Docentes" value="—" />
              <Card variant="stat" title="Materias" value="—" />
            </CardWrapper>

            <CardWrapper columns={3}>
              <Card
                variant="info"
                title="Gestión de Usuarios"
                description="Administrar cuentas y roles"
              />
              <Card
                variant="info"
                title="Gestión de Cursos"
                description="Crear y organizar cursos"
              />
              <Card
                variant="info"
                title="Ciclo Lectivo"
                description="Configuración del ciclo activo"
              />
            </CardWrapper>

            <CardWrapper columns={2}>
              <Card
                variant="alert"
                title="Notas Pendientes"
                description="Calificaciones sin completar"
              />
              <Card
                variant="alert"
                title="Comunicados Institucionales"
                description="Mensajes sin respuesta"
              />
            </CardWrapper>
          </>
        )}

        {role === RoleLevel.PRECEPTOR && (
          <>
            <CardWrapper columns={3}>
              <Card variant="stat" title="Mis Cursos" value="—" />
              <Card variant="stat" title="Alumnos a cargo" value="—" />
              <Card variant="stat" title="Ausencias hoy" value="—" />
            </CardWrapper>

            <CardWrapper columns={2}>
              <Card
                variant="info"
                title="Cargar Asistencia"
                description="Registrar presencia diaria"
              />
              <Card
                variant="info"
                title="Ver Legajos"
                description="Historial académico de alumnos"
              />
            </CardWrapper>

            {hasPermission(role, "messages:read") && (
              <Card
                variant="info"
                title="Comunicados"
                description="Mensajes institucionales y de cursos"
              />
            )}
          </>
        )}

        {role === RoleLevel.DOCENTE && (
          <>
            <CardWrapper columns={3}>
              <Card variant="stat" title="Mis Materias" value="—" />
              <Card
                variant="stat"
                title="Calificaciones Pendientes"
                value="—"
              />
              <Card variant="stat" title="Alumnos" value="—" />
            </CardWrapper>

            <CardWrapper columns={2}>
              <Card
                variant="info"
                title="Cargar Notas"
                description="Ingresar calificaciones por período"
              />
              <Card
                variant="info"
                title="Ver Materias"
                description="Detalle de materias asignadas"
              />
            </CardWrapper>
          </>
        )}

        {role === RoleLevel.ALUMNO && (
          <>
            <CardWrapper columns={2}>
              <Card variant="stat" title="Mis Faltas" value="—" />
              <Card variant="stat" title="Materias Adeudadas" value="—" />
            </CardWrapper>

            <CardWrapper columns={2}>
              <Card
                variant="info"
                title="Ver Calificaciones"
                description="Notas por materia y período"
              />
              <Card
                variant="info"
                title="Ver Asistencia"
                description="Historial de asistencia"
              />
            </CardWrapper>

            {hasPermission(role, "messages:read") && (
              <Card
                variant="info"
                title="Comunicados"
                description="Mensajes de tu institución y curso"
              />
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
