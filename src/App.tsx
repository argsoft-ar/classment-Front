import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import { AuthGuard } from "./auth/authGuard";
import { Layout } from "./components/Layout/Layout";
import { useAuth } from "./hooks/useAuth";
import { ADMIN_ROLES, RoleLevel } from "./types/rbac.types";
import { ROUTES, getHomePath } from "./config/navigation.config";
import { LoginPage } from "./pages/login/LoginPage";
import { DirectorDashboardPage } from "./pages/director/DirectorDashboardPage";
import { CareersPage } from "./pages/director/CareersPage";
import { CareerSubjectsPage } from "./pages/director/CareerSubjectsPage";
import { StudentsPage } from "./pages/director/StudentsPage";
import { StudentHistoryPage } from "./pages/director/StudentHistoryPage";
import { PeriodsPage } from "./pages/director/PeriodsPage";
import { InstitutionPage } from "./pages/director/InstitutionPage";
import { StudentProgressPage } from "./pages/student/StudentProgressPage";
import { StudentEnrollmentPage } from "./pages/student/StudentEnrollmentPage";
import { MyEnrollmentsPage } from "./pages/student/MyEnrollmentsPage";
import { TeacherOfferingsPage } from "./pages/teacher/TeacherOfferingsPage";
import { OfferingGradesPage } from "./pages/shared/OfferingGradesPage";

function ProtectedShell({ allowedRoles }: { allowedRoles: RoleLevel[] }) {
  return (
    <AuthGuard allowedRoles={allowedRoles}>
      <Layout>
        <Outlet />
      </Layout>
    </AuthGuard>
  );
}

function FallbackRedirect() {
  const { user } = useAuth();
  return <Navigate to={getHomePath(user?.role)} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.login} element={<LoginPage />} />

        <Route element={<ProtectedShell allowedRoles={ADMIN_ROLES} />}>
          <Route path={ROUTES.director.dashboard} element={<DirectorDashboardPage />} />
          <Route path={ROUTES.director.careers} element={<CareersPage />} />
          <Route path="/director/carreras/:careerId/materias" element={<CareerSubjectsPage />} />
          <Route path={ROUTES.director.students} element={<StudentsPage />} />
          <Route path="/director/alumnos/:studentId/historial" element={<StudentHistoryPage />} />
          <Route path={ROUTES.director.periods} element={<PeriodsPage />} />
          <Route path="/director/ofertas/:offeringId" element={<OfferingGradesPage />} />
        </Route>

        <Route element={<ProtectedShell allowedRoles={[RoleLevel.SUPER_ADMIN]} />}>
          <Route path={ROUTES.director.institution} element={<InstitutionPage />} />
        </Route>

        <Route element={<ProtectedShell allowedRoles={[RoleLevel.ALUMNO]} />}>
          <Route path={ROUTES.student.progress} element={<StudentProgressPage />} />
          <Route path={ROUTES.student.enrollment} element={<StudentEnrollmentPage />} />
          <Route path={ROUTES.student.myEnrollments} element={<MyEnrollmentsPage />} />
        </Route>

        <Route element={<ProtectedShell allowedRoles={[RoleLevel.DOCENTE]} />}>
          <Route path={ROUTES.teacher.offerings} element={<TeacherOfferingsPage />} />
          <Route path="/docente/ofertas/:offeringId" element={<OfferingGradesPage />} />
        </Route>

        <Route path="*" element={<FallbackRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}
