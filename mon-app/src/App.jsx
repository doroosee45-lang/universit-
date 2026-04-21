import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './components/context/AuthContext';
import { MainLayout } from './components/layout/MainLayout';

// Auth pages

import LoginPage from './pages/auth/LoginPage';
import ForgotPasswordPage from './pages/Auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/Auth/ResetPasswordPage';
import VerifyEmailPage from './pages/Auth/VerifyEmailPage';
import ForceChangePasswordPage from './pages/Auth/ForceChangePasswordPage';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import StudentsPage from './pages/Admin/StudentsPage';
import TeachersPage from './pages/admin/TeachersPage';
import StaffPage from './pages/admin/StaffPage';
import ProgramsPage from './pages/admin/ProgramsPage';
import CoursesPage from './pages/admin/CoursesPage';
import SchedulePage from './pages/admin/SchedulePage';
import GradesPage from './pages/admin/GradesPage';
import AttendancePage from './pages/admin/AttendancePage';
import ExamsPage from './pages/admin/ExamsPage';
import FeesPage from './pages/admin/FeesPage';
import LibraryPage from './pages/admin/LibraryPage';
import InternshipsPage from './pages/admin/InternshipsPage';
import DiplomasPage from './pages/admin/DiplomasPage';
import ReportsPage from './pages/admin/ReportsPage';
import SettingsPage from './pages/admin/SettingsPage';
import NotificationsAdminPage from './pages/admin/NotificationsAdminPage';
import ArchivePage from './pages/admin/ArchivePage';
import AdminJuryPage from './pages/Admin/AdminJuryPage';        // ✅ chemin corrigé
import UEAdminPage from './pages/admin/UEAdminPage';

// Teacher pages
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherCoursesPage from './pages/teacher/TeacherCoursesPage';
import TeacherAttendancePage from './pages/teacher/TeacherAttendancePage';
import TeacherGradesPage from './pages/teacher/TeacherGradesPage';
import TeacherAssignmentsPage from './pages/teacher/TeacherAssignmentsPage';
import TeacherSchedulePage from './pages/teacher/TeacherSchedulePage';
import TeacherStudentsPage from './pages/teacher/TeacherStudentsPage';
import TeacherProfilePage from './pages/teacher/TeacherProfilePage';
import TeacherNotificationsPage from './pages/teacher/TeacherNotificationsPage';
import TeacherJuryPage from './pages/Teacher/TeacherJurry';    // ✅ import corrigé
import TeacherSettingsPage from './pages/Teacher/TeacherSettingsPage'
import TeacherExamsPage from './pages/Teacher/TeacherExamsPage'

// Student pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentGradesPage from './pages/student/StudentGradesPage';
import StudentAttendancePage from './pages/student/StudentAttendancePage';
import StudentSchedulePage from './pages/student/StudentSchedulePage';
import StudentHomeworkPage from './pages/student/StudentHomeworkPage';

import StudentCourses from './pages/Student/Studentcoursespage';
import StudentExamsPage from './pages/student/StudentExamsPage';
import StudentFeesPage from './pages/student/StudentFeesPage';
import StudentLibraryPage from './pages/student/StudentLibraryPage';
import StudentInternshipPage from './pages/student/StudentInternshipPage';
import StudentProfilePage from './pages/student/StudentProfilePage';
import StudentNotificationsPage from './pages/student/StudentNotificationsPage';
import StudentSettingsPage from './pages/Student/StudentSettingsPage'
import StudentCoursesPage from './pages/Student/Studentcoursespage';

const ADMIN_ROLES = ['admin', 'super_admin', 'staff', 'department_head'];
const TEACHER_ROLES = ['teacher'];
const STUDENT_ROLES = ['student'];

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/force-change-password" element={<ForceChangePasswordPage />} />
          <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
          <Route path="/" element={<Navigate to="/login" replace />} />



          {/* Admin routes */}
          <Route element={<MainLayout allowedRoles={ADMIN_ROLES} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/students" element={<StudentsPage />} />
            <Route path="/admin/teachers" element={<TeachersPage />} />
            <Route path="/admin/staff" element={<StaffPage />} />
            <Route path="/admin/programs" element={<ProgramsPage />} />
            <Route path="/admin/courses" element={<CoursesPage />} />
            <Route path="/admin/schedules" element={<SchedulePage />} />
            <Route path="/admin/grades" element={<GradesPage />} />
            <Route path="/admin/attendance" element={<AttendancePage />} />
            <Route path="/admin/exams" element={<ExamsPage />} />
            <Route path="/admin/fees" element={<FeesPage />} />
            <Route path="/admin/library" element={<LibraryPage />} />
            <Route path="/admin/internships" element={<InternshipsPage />} />
            <Route path="/admin/diplomas" element={<DiplomasPage />} />
            <Route path="/admin/reports" element={<ReportsPage />} />
            <Route path="/admin/settings" element={<SettingsPage />} />
            <Route path="/admin/notifications" element={<NotificationsAdminPage />} />
            <Route path="/admin/archivePage" element={<ArchivePage />} />
            <Route path="/admin/jury" element={<AdminJuryPage />} />
            <Route path="/admin/ues" element={<UEAdminPage />} />
          </Route>

          {/* Teacher routes */}
          <Route element={<MainLayout allowedRoles={TEACHER_ROLES} />}>
            <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
            <Route path="/teacher/courses" element={<TeacherCoursesPage />} />
            <Route path="/teacher/attendance" element={<TeacherAttendancePage />} />
            <Route path="/teacher/grades" element={<TeacherGradesPage />} />
            <Route path="/teacher/assignments" element={<TeacherAssignmentsPage />} />
            <Route path="/teacher/schedule" element={<TeacherSchedulePage />} />
            <Route path="/teacher/students" element={<TeacherStudentsPage />} />
            <Route path="/teacher/profile" element={<TeacherProfilePage />} />
            <Route path="/teacher/notifications" element={<TeacherNotificationsPage />} />
            <Route path="/teacher/jury" element={<TeacherJuryPage />} />
            <Route path="/teacher/settings" element={<TeacherSettingsPage />} />
            <Route path="/teacher/examsPage" element={<TeacherExamsPage />} />

          </Route>

          {/* Student routes */}
          <Route element={<MainLayout allowedRoles={STUDENT_ROLES} />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/grades" element={<StudentGradesPage />} />
            <Route path="/student/attendance" element={<StudentAttendancePage />} />
            <Route path="/student/schedule" element={<StudentSchedulePage />} />
            <Route path="/student/homework" element={<StudentHomeworkPage />} />
            <Route path="/student/exams" element={<StudentExamsPage />} />
            <Route path="/student/fees" element={<StudentFeesPage />} />
            <Route path="/student/library" element={<StudentLibraryPage />} />
            <Route path="/student/internship" element={<StudentInternshipPage />} />
            <Route path="/student/profile" element={<StudentProfilePage />} />
            <Route path="/student/notifications" element={<StudentNotificationsPage />} />
            <Route path="/student/settings" element={<StudentSettingsPage />} />
            <Route path="/student/courses" element={<StudentCoursesPage />} />
          </Route>

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