// App.jsx — Routeur principal avec protection mustChangePassword

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/context/AuthContext';

// Pages Auth
import LoginPage               from './pages/auth/LoginPage';
import ForgotPasswordPage      from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage       from './pages/auth/ResetPasswordPage';
import VerifyEmailPage         from './pages/auth/VerifyEmailPage';
import ForceChangePasswordPage from './pages/Auth/ForceChangePasswordPage';

// Dashboards (à adapter selon votre structure)
import AdminDashboard   from './pages/admin/Dashboard';
import TeacherDashboard from './pages/teacher/Dashboard';
import StudentDashboard from './pages/student/Dashboard';

// ─── Guard : utilisateur connecté mais doit changer son MDP ──────────────────
const MustChangePasswordGuard = ({ children }) => {
  const { user, mustChangePassword, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  // Si MDP à changer → forcer la page dédiée
  if (mustChangePassword) return <Navigate to="/force-change-password" replace />;
  return children;
};

// ─── Guard : routes publiques seulement si non connecté ──────────────────────
const PublicRoute = ({ children }) => {
  const { user, loading, mustChangePassword } = useAuth();
  if (loading) return <LoadingScreen />;
  if (user) {
    if (mustChangePassword) return <Navigate to="/force-change-password" replace />;
    // Rediriger vers dashboard selon le rôle
    const routes = {
      admin: '/admin/dashboard', super_admin: '/admin/dashboard',
      staff: '/admin/dashboard', department_head: '/admin/dashboard',
      teacher: '/teacher/dashboard', student: '/student/dashboard',
    };
    return <Navigate to={routes[user.role] || '/login'} replace />;
  }
  return children;
};

// ─── Guard : routes protégées selon le rôle ───────────────────────────────────
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading, mustChangePassword } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (mustChangePassword) return <Navigate to="/force-change-password" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/unauthorized" replace />;
  return children;
};

// ─── Écran de chargement ─────────────────────────────────────────────────────
const LoadingScreen = () => (
  <div className="min-h-screen bg-indigo-950 flex items-center justify-center">
    <svg className="animate-spin w-10 h-10 text-indigo-400" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
    </svg>
  </div>
);

// ─── App ─────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ── Routes publiques ── */}
          <Route path="/login"           element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
          <Route path="/reset-password/:token" element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />
          <Route path="/verify-email/:token"   element={<VerifyEmailPage />} />

          {/* ⭐ Route spéciale : changement forcé du MDP (connecté mais MDP temporaire) */}
          <Route path="/force-change-password" element={
            // Accessible seulement si connecté
            <RequireAuth>
              <ForceChangePasswordPage />
            </RequireAuth>
          } />

          {/* ── Dashboards protégés ── */}
          <Route path="/admin/*" element={
            <ProtectedRoute roles={['admin', 'super_admin', 'staff', 'department_head']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          <Route path="/teacher/*" element={
            <ProtectedRoute roles={['teacher']}>
              <TeacherDashboard />
            </ProtectedRoute>
          } />

          <Route path="/student/*" element={
            <ProtectedRoute roles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          } />

          {/* ── Fallback ── */}
          <Route path="/"              element={<Navigate to="/login" replace />} />
          <Route path="/unauthorized"  element={<div className="text-white p-8">Accès non autorisé</div>} />
          <Route path="*"              element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

// Guard minimal : connecté ou non (pour force-change-password)
const RequireAuth = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};






























import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './components/context/AuthContext';
import { MainLayout } from './components/layout/MainLayout';

// ─── Auth pages ───────────────────────────────────────────────────────────────
import LoginPage               from './pages/auth/LoginPage';
import ForgotPasswordPage      from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage       from './pages/auth/ResetPasswordPage';
import VerifyEmailPage         from './pages/auth/VerifyEmailPage';
import ForceChangePasswordPage from './pages/auth/ForceChangePasswordPage';

// ─── Admin pages ──────────────────────────────────────────────────────────────
import AdminDashboard          from './pages/admin/AdminDashboard';
import StudentsPage            from './pages/admin/StudentsPage';
import TeachersPage            from './pages/admin/TeachersPage';
import StaffPage               from './pages/admin/StaffPage';
import ProgramsPage            from './pages/admin/ProgramsPage';
import CoursesPage             from './pages/admin/CoursesPage';
import SchedulePage            from './pages/admin/SchedulePage';
import GradesPage              from './pages/admin/GradesPage';
import AttendancePage          from './pages/admin/AttendancePage';
import ExamsPage               from './pages/admin/ExamsPage';
import FeesPage                from './pages/admin/FeesPage';
import LibraryPage             from './pages/admin/LibraryPage';
import InternshipsPage         from './pages/admin/InternshipsPage';
import DiplomasPage            from './pages/admin/DiplomasPage';
import ReportsPage             from './pages/admin/ReportsPage';
import SettingsPage            from './pages/admin/SettingsPage';
import NotificationsAdminPage  from './pages/admin/NotificationsAdminPage';
import ArchivePage             from './pages/admin/ArchivePage';
import AdminJuryPage           from './pages/admin/AdminJuryPage';
import UEAdminPage             from './pages/admin/UEAdminPage';

// ─── Teacher pages ────────────────────────────────────────────────────────────
import TeacherDashboard        from './pages/teacher/TeacherDashboard';
import TeacherCoursesPage      from './pages/teacher/TeacherCoursesPage';
import TeacherAttendancePage   from './pages/teacher/TeacherAttendancePage';
import TeacherGradesPage       from './pages/teacher/TeacherGradesPage';
import TeacherAssignmentsPage  from './pages/teacher/TeacherAssignmentsPage';
import TeacherSchedulePage     from './pages/teacher/TeacherSchedulePage';
import TeacherStudentsPage     from './pages/teacher/TeacherStudentsPage';
import TeacherProfilePage      from './pages/teacher/TeacherProfilePage';
import TeacherNotificationsPage from './pages/teacher/TeacherNotificationsPage';
import TeacherJuryPage         from './pages/teacher/TeacherJury';
import TeacherSettingsPage     from './pages/teacher/TeacherSettingsPage';
import TeacherExamsPage        from './pages/teacher/TeacherExamsPage';

// ─── Student pages ────────────────────────────────────────────────────────────
import StudentDashboard        from './pages/student/StudentDashboard';
import StudentGradesPage       from './pages/student/StudentGradesPage';
import StudentAttendancePage   from './pages/student/StudentAttendancePage';
import StudentSchedulePage     from './pages/student/StudentSchedulePage';
import StudentHomeworkPage     from './pages/student/StudentHomeworkPage';
import StudentExamsPage        from './pages/student/StudentExamsPage';
import StudentFeesPage         from './pages/student/StudentFeesPage';
import StudentLibraryPage      from './pages/student/StudentLibraryPage';
import StudentInternshipPage   from './pages/student/StudentInternshipPage';
import StudentProfilePage      from './pages/student/StudentProfilePage';
import StudentNotificationsPage from './pages/student/StudentNotificationsPage';
import StudentSettingsPage     from './pages/student/StudentSettingsPage';

// ─────────────────────────────────────────────────────────────────────────────

const ADMIN_ROLES   = ['admin', 'super_admin', 'staff', 'department_head'];
const TEACHER_ROLES = ['teacher'];
const STUDENT_ROLES = ['student'];

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>

          {/* ── Public ──────────────────────────────────────────────────── */}
          <Route path="/"                          element={<Navigate to="/login" replace />} />
          <Route path="/login"                     element={<LoginPage />} />
          <Route path="/forgot-password"           element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token"     element={<ResetPasswordPage />} />
          <Route path="/force-change-password"     element={<ForceChangePasswordPage />} />
          <Route path="/verify-email/:token"       element={<VerifyEmailPage />} />

          {/* ── Admin ───────────────────────────────────────────────────── */}
          <Route element={<MainLayout allowedRoles={ADMIN_ROLES} />}>
            <Route path="/admin/dashboard"     element={<AdminDashboard />} />
            <Route path="/admin/students"      element={<StudentsPage />} />
            <Route path="/admin/teachers"      element={<TeachersPage />} />
            <Route path="/admin/staff"         element={<StaffPage />} />
            <Route path="/admin/programs"      element={<ProgramsPage />} />
            <Route path="/admin/courses"       element={<CoursesPage />} />
            <Route path="/admin/schedules"     element={<SchedulePage />} />
            <Route path="/admin/grades"        element={<GradesPage />} />
            <Route path="/admin/attendance"    element={<AttendancePage />} />
            <Route path="/admin/exams"         element={<ExamsPage />} />
            <Route path="/admin/fees"          element={<FeesPage />} />
            <Route path="/admin/library"       element={<LibraryPage />} />
            <Route path="/admin/internships"   element={<InternshipsPage />} />
            <Route path="/admin/diplomas"      element={<DiplomasPage />} />
            <Route path="/admin/reports"       element={<ReportsPage />} />
            <Route path="/admin/settings"      element={<SettingsPage />} />
            <Route path="/admin/notifications" element={<NotificationsAdminPage />} />
            <Route path="/admin/archive"       element={<ArchivePage />} />
            <Route path="/admin/jury"          element={<AdminJuryPage />} />
            <Route path="/admin/ues"           element={<UEAdminPage />} />
          </Route>

          {/* ── Teacher ─────────────────────────────────────────────────── */}
          <Route element={<MainLayout allowedRoles={TEACHER_ROLES} />}>
            <Route path="/teacher/dashboard"     element={<TeacherDashboard />} />
            <Route path="/teacher/courses"       element={<TeacherCoursesPage />} />
            <Route path="/teacher/attendance"    element={<TeacherAttendancePage />} />
            <Route path="/teacher/grades"        element={<TeacherGradesPage />} />
            <Route path="/teacher/assignments"   element={<TeacherAssignmentsPage />} />
            <Route path="/teacher/schedule"      element={<TeacherSchedulePage />} />
            <Route path="/teacher/students"      element={<TeacherStudentsPage />} />
            <Route path="/teacher/profile"       element={<TeacherProfilePage />} />
            <Route path="/teacher/notifications" element={<TeacherNotificationsPage />} />
            <Route path="/teacher/jury"          element={<TeacherJuryPage />} />
            <Route path="/teacher/settings"      element={<TeacherSettingsPage />} />
            <Route path="/teacher/exams"         element={<TeacherExamsPage />} />
          </Route>

          {/* ── Student ─────────────────────────────────────────────────── */}
          <Route element={<MainLayout allowedRoles={STUDENT_ROLES} />}>
            <Route path="/student/dashboard"     element={<StudentDashboard />} />
            <Route path="/student/grades"        element={<StudentGradesPage />} />
            <Route path="/student/attendance"    element={<StudentAttendancePage />} />
            <Route path="/student/schedule"      element={<StudentSchedulePage />} />
            <Route path="/student/homework"      element={<StudentHomeworkPage />} />
            <Route path="/student/exams"         element={<StudentExamsPage />} />
            <Route path="/student/fees"          element={<StudentFeesPage />} />
            <Route path="/student/library"       element={<StudentLibraryPage />} />
            <Route path="/student/internship"    element={<StudentInternshipPage />} />
            <Route path="/student/profile"       element={<StudentProfilePage />} />
            <Route path="/student/notifications" element={<StudentNotificationsPage />} />
            <Route path="/student/settings"      element={<StudentSettingsPage />} />
          </Route>

          {/* ── Erreurs ─────────────────────────────────────────────────── */}
          <Route path="/unauthorized" element={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">403</h1>
                <p className="text-gray-500">Accès non autorisé</p>
              </div>
            </div>
          } />
          <Route path="*" element={<Navigate to="/login" replace />} />

        </Routes>
      </AuthProvider>
    </Router>
  );
}