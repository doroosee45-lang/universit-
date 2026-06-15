import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider } from './components/context/AuthContext';
import { MainLayout } from './components/layout/MainLayout';
import { GraduationCap, Home } from 'lucide-react';

// Auth pages
import LoginPage               from './pages/Auth/LoginPage';
import ForgotPasswordPage      from './pages/Auth/ForgotPasswordPage';
import ResetPasswordPage       from './pages/Auth/ResetPasswordPage';
import VerifyEmailPage         from './pages/Auth/VerifyEmailPage';
import ForceChangePasswordPage from './pages/Auth/Forcechangepasswordpage';
import ActivateAccountPage     from './pages/Auth/ActivateAccountPage';

// Admin pages
import AdminDashboard          from './pages/Admin/AdminDashboard';
import StudentsPage            from './pages/Admin/StudentsPage';
import TeachersPage            from './pages/Admin/TeachersPage';
import StaffPage               from './pages/Admin/StaffPage';
import ProgramsPage            from './pages/Admin/ProgramsPage';
import UEAdminPage             from './pages/Admin/UEAdminPage';
import CoursesPage             from './pages/Admin/CoursesPage';
import SchedulePage            from './pages/Admin/SchedulePage';
import GradesPage              from './pages/Admin/GradesPage';
import AttendancePage          from './pages/Admin/AttendancePage';
import ExamsPage               from './pages/Admin/ExamsPage';
import AdminJuryPage           from './pages/Admin/AdminJuryPage';
import FeesPage                from './pages/Admin/FeesPage';
import LibraryPage             from './pages/Admin/LibraryPage';
import InternshipsPage         from './pages/Admin/InternshipsPage';
import DiplomasPage            from './pages/Admin/DiplomasPage';
import ReportsPage             from './pages/Admin/ReportsPage';
import ArchivePage             from './pages/Admin/ArchivePage';
import NotificationsAdminPage  from './pages/Admin/NotificationsAdminPage';
import SettingsPage            from './pages/Admin/SettingsPage';

// Teacher pages
import TeacherDashboard        from './pages/Teacher/TeacherDashboard';
import TeacherCoursesPage      from './pages/Teacher/TeacherCoursesPage';
import TeacherAttendancePage   from './pages/Teacher/TeacherAttendancePage';
import TeacherGradesPage       from './pages/Teacher/TeacherGradesPage';
import TeacherAssignmentsPage  from './pages/Teacher/TeacherAssignmentsPage';
import TeacherExamsPage        from './pages/Teacher/TeacherExamsPage';
import TeacherSchedulePage     from './pages/Teacher/TeacherSchedulePage';
import TeacherStudentsPage     from './pages/Teacher/TeacherStudentsPage';
import TeacherJuryPage         from './pages/Teacher/TeacherJurry';
import TeacherNotificationsPage from './pages/Teacher/TeacherNotificationsPage';
import TeacherProfilePage      from './pages/Teacher/TeacherProfilePage';
import TeacherSettingsPage     from './pages/Teacher/TeacherSettingsPage';

// Student pages
import StudentDashboard        from './pages/Student/StudentDashboard';
import StudentGradesPage       from './pages/Student/StudentGradesPage';
import StudentCoursesPage      from './pages/Student/Studentcoursespage';
import StudentAttendancePage   from './pages/Student/StudentAttendancePage';
import StudentSchedulePage     from './pages/Student/StudentSchedulePage';
import StudentHomeworkPage     from './pages/Student/StudentHomeworkPage';
import StudentExamsPage        from './pages/Student/StudentExamsPage';
import StudentFeesPage         from './pages/Student/StudentFeesPage';
import StudentLibraryPage      from './pages/Student/StudentLibraryPage';
import StudentInternshipPage   from './pages/Student/StudentInternshipPage';
import StudentProfilePage      from './pages/Student/StudentProfilePage';
import StudentNotificationsPage from './pages/Student/StudentNotificationsPage';
import StudentSettingsPage     from './pages/Student/StudentSettingsPage';

const ADMIN_ROLES   = ['admin', 'super_admin', 'staff', 'department_head'];
const TEACHER_ROLES = ['teacher'];
const STUDENT_ROLES = ['student'];

function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50 p-4">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <GraduationCap size={40} className="text-indigo-500" />
        </div>
        <h1 className="text-7xl font-black text-indigo-600 mb-2">404</h1>
        <h2 className="text-2xl font-bold text-gray-800 mb-3">Page introuvable</h2>
        <p className="text-gray-500 mb-8 leading-relaxed">
          La page que vous cherchez n'existe pas ou a été déplacée.
        </p>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
        >
          <Home size={16} />
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}

function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-red-50 p-4">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">🔒</span>
        </div>
        <h1 className="text-7xl font-black text-red-500 mb-2">403</h1>
        <h2 className="text-2xl font-bold text-gray-800 mb-3">Accès refusé</h2>
        <p className="text-gray-500 mb-8 leading-relaxed">
          Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          Contactez votre administrateur si vous pensez que c'est une erreur.
        </p>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
        >
          <Home size={16} />
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* ── Public ──────────────────────────────────── */}
          <Route path="/"                          element={<Navigate to="/login" replace />} />
          <Route path="/login"                     element={<LoginPage />} />
          <Route path="/forgot-password"           element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token"     element={<ResetPasswordPage />} />
          <Route path="/force-change-password"     element={<ForceChangePasswordPage />} />
          <Route path="/verify-email/:token"       element={<VerifyEmailPage />} />
          <Route path="/activate-account/:token"   element={<ActivateAccountPage />} />

          {/* ── Admin / Staff / Department Head ─────────── */}
          <Route element={<MainLayout allowedRoles={ADMIN_ROLES} />}>
            <Route path="/admin/dashboard"         element={<AdminDashboard />} />
            <Route path="/admin/students"          element={<StudentsPage />} />
            <Route path="/admin/teachers"          element={<TeachersPage />} />
            <Route path="/admin/staff"             element={<StaffPage />} />
            <Route path="/admin/programs"          element={<ProgramsPage />} />
            <Route path="/admin/ues"               element={<UEAdminPage />} />
            <Route path="/admin/courses"           element={<CoursesPage />} />
            <Route path="/admin/schedules"         element={<SchedulePage />} />
            <Route path="/admin/grades"            element={<GradesPage />} />
            <Route path="/admin/attendance"        element={<AttendancePage />} />
            <Route path="/admin/exams"             element={<ExamsPage />} />
            <Route path="/admin/jury"              element={<AdminJuryPage />} />
            <Route path="/admin/fees"              element={<FeesPage />} />
            <Route path="/admin/library"           element={<LibraryPage />} />
            <Route path="/admin/internships"       element={<InternshipsPage />} />
            <Route path="/admin/diplomas"          element={<DiplomasPage />} />
            <Route path="/admin/reports"           element={<ReportsPage />} />
            <Route path="/admin/archive"           element={<ArchivePage />} />
            <Route path="/admin/notifications"     element={<NotificationsAdminPage />} />
            <Route path="/admin/settings"          element={<SettingsPage />} />
          </Route>

          {/* ── Enseignant ──────────────────────────────── */}
          <Route element={<MainLayout allowedRoles={TEACHER_ROLES} />}>
            <Route path="/teacher/dashboard"       element={<TeacherDashboard />} />
            <Route path="/teacher/courses"         element={<TeacherCoursesPage />} />
            <Route path="/teacher/attendance"      element={<TeacherAttendancePage />} />
            <Route path="/teacher/grades"          element={<TeacherGradesPage />} />
            <Route path="/teacher/assignments"     element={<TeacherAssignmentsPage />} />
            <Route path="/teacher/exams"           element={<TeacherExamsPage />} />
            <Route path="/teacher/schedule"        element={<TeacherSchedulePage />} />
            <Route path="/teacher/students"        element={<TeacherStudentsPage />} />
            <Route path="/teacher/jury"            element={<TeacherJuryPage />} />
            <Route path="/teacher/notifications"   element={<TeacherNotificationsPage />} />
            <Route path="/teacher/profile"         element={<TeacherProfilePage />} />
            <Route path="/teacher/settings"        element={<TeacherSettingsPage />} />
          </Route>

          {/* ── Étudiant ────────────────────────────────── */}
          <Route element={<MainLayout allowedRoles={STUDENT_ROLES} />}>
            <Route path="/student/dashboard"       element={<StudentDashboard />} />
            <Route path="/student/grades"          element={<StudentGradesPage />} />
            <Route path="/student/courses"         element={<StudentCoursesPage />} />
            <Route path="/student/attendance"      element={<StudentAttendancePage />} />
            <Route path="/student/schedule"        element={<StudentSchedulePage />} />
            <Route path="/student/homework"        element={<StudentHomeworkPage />} />
            <Route path="/student/exams"           element={<StudentExamsPage />} />
            <Route path="/student/fees"            element={<StudentFeesPage />} />
            <Route path="/student/library"         element={<StudentLibraryPage />} />
            <Route path="/student/internship"      element={<StudentInternshipPage />} />
            <Route path="/student/profile"         element={<StudentProfilePage />} />
            <Route path="/student/notifications"   element={<StudentNotificationsPage />} />
            <Route path="/student/settings"        element={<StudentSettingsPage />} />
          </Route>

          {/* ── Erreurs ─────────────────────────────────── */}
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="*"             element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
