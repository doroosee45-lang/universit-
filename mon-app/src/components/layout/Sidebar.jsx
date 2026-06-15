import { NavLink, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, ClipboardList,
  Calendar, DollarSign, Library, Briefcase, FileText, Settings,
  Bell, LogOut, ChevronLeft, ChevronRight, School, BarChart3,
  UserCheck, BookMarked, Award, ClipboardCheck, X,
  Archive, Scale, FileCheck, Layers, User, PenLine, LibraryBig,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SimpleAvatar = ({ firstName, lastName, photo, size = 'sm' }) => {
  const initials = `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase() || '?';
  const sizeClass = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';
  if (photo) {
    return (
      <img
        src={photo}
        alt={`${firstName} ${lastName}`}
        className={`${sizeClass} rounded-full object-cover ring-2 ring-white/20 shadow`}
      />
    );
  }
  return (
    <div className={`${sizeClass} rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white font-semibold shadow ring-2 ring-white/20`}>
      {initials}
    </div>
  );
};

// ─── Navigation items par rôle ─────────────────────────────────────────────
// Utiliser `{ section: 'Nom' }` pour insérer un séparateur de section.
// Chaque item de nav a : label, icon, to.

const NAV_ITEMS = {
  admin: [
    { section: 'Général' },
    { label: 'Tableau de bord',   icon: LayoutDashboard, to: '/admin/dashboard' },

    { section: 'Utilisateurs' },
    { label: 'Étudiants',         icon: GraduationCap,   to: '/admin/students' },
    { label: 'Enseignants',       icon: Users,           to: '/admin/teachers' },
    { label: 'Personnel',         icon: UserCheck,       to: '/admin/staff' },

    { section: 'Programme' },
    { label: 'Filières',          icon: BookMarked,      to: '/admin/programs' },
    { label: 'Unités (UE)',       icon: Layers,          to: '/admin/ues' },
    { label: 'Cours',             icon: BookOpen,        to: '/admin/courses' },
    { label: 'Emploi du temps',   icon: Calendar,        to: '/admin/schedules' },

    { section: 'Évaluation' },
    { label: 'Notes',             icon: ClipboardList,   to: '/admin/grades' },
    { label: 'Présences',         icon: ClipboardCheck,  to: '/admin/attendance' },
    { label: 'Examens',           icon: FileCheck,       to: '/admin/exams' },
    { label: 'Délibérations',     icon: Scale,           to: '/admin/jury' },

    { section: 'Administration' },
    { label: 'Frais de scolarité',icon: DollarSign,      to: '/admin/fees' },
    { label: 'Bibliothèque',      icon: Library,         to: '/admin/library' },
    { label: 'Stages',            icon: Briefcase,       to: '/admin/internships' },
    { label: 'Diplômes',          icon: Award,           to: '/admin/diplomas' },

    { section: 'Système' },
    { label: 'Rapports',          icon: BarChart3,       to: '/admin/reports' },
    { label: 'Archives',          icon: Archive,         to: '/admin/archive' },
    { label: 'Notifications',     icon: Bell,            to: '/admin/notifications' },
    { label: 'Paramètres',        icon: Settings,        to: '/admin/settings' },
  ],

  super_admin: [
    { section: 'Général' },
    { label: 'Tableau de bord',   icon: LayoutDashboard, to: '/admin/dashboard' },

    { section: 'Utilisateurs' },
    { label: 'Étudiants',         icon: GraduationCap,   to: '/admin/students' },
    { label: 'Enseignants',       icon: Users,           to: '/admin/teachers' },
    { label: 'Personnel',         icon: UserCheck,       to: '/admin/staff' },

    { section: 'Programme' },
    { label: 'Filières',          icon: BookMarked,      to: '/admin/programs' },
    { label: 'Unités (UE)',       icon: Layers,          to: '/admin/ues' },
    { label: 'Cours',             icon: BookOpen,        to: '/admin/courses' },
    { label: 'Emploi du temps',   icon: Calendar,        to: '/admin/schedules' },

    { section: 'Évaluation' },
    { label: 'Notes',             icon: ClipboardList,   to: '/admin/grades' },
    { label: 'Présences',         icon: ClipboardCheck,  to: '/admin/attendance' },
    { label: 'Examens',           icon: FileCheck,       to: '/admin/exams' },
    { label: 'Délibérations',     icon: Scale,           to: '/admin/jury' },

    { section: 'Administration' },
    { label: 'Frais de scolarité',icon: DollarSign,      to: '/admin/fees' },
    { label: 'Bibliothèque',      icon: Library,         to: '/admin/library' },
    { label: 'Stages',            icon: Briefcase,       to: '/admin/internships' },
    { label: 'Diplômes',          icon: Award,           to: '/admin/diplomas' },

    { section: 'Système' },
    { label: 'Rapports',          icon: BarChart3,       to: '/admin/reports' },
    { label: 'Archives',          icon: Archive,         to: '/admin/archive' },
    { label: 'Notifications',     icon: Bell,            to: '/admin/notifications' },
    { label: 'Paramètres',        icon: Settings,        to: '/admin/settings' },
  ],

  department_head: [
    { section: 'Général' },
    { label: 'Tableau de bord',   icon: LayoutDashboard, to: '/admin/dashboard' },

    { section: 'Académique' },
    { label: 'Étudiants',         icon: GraduationCap,   to: '/admin/students' },
    { label: 'Filières',          icon: BookMarked,      to: '/admin/programs' },
    { label: 'Cours',             icon: BookOpen,        to: '/admin/courses' },

    { section: 'Évaluation' },
    { label: 'Notes',             icon: ClipboardList,   to: '/admin/grades' },
    { label: 'Examens',           icon: FileCheck,       to: '/admin/exams' },
    { label: 'Rapports',          icon: BarChart3,       to: '/admin/reports' },
  ],

  staff: [
    { section: 'Général' },
    { label: 'Tableau de bord',   icon: LayoutDashboard, to: '/admin/dashboard' },

    { section: 'Gestion' },
    { label: 'Étudiants',         icon: GraduationCap,   to: '/admin/students' },
    { label: 'Frais de scolarité',icon: DollarSign,      to: '/admin/fees' },
    { label: 'Bibliothèque',      icon: Library,         to: '/admin/library' },
    { label: 'Stages',            icon: Briefcase,       to: '/admin/internships' },

    { section: 'Système' },
    { label: 'Rapports',          icon: BarChart3,       to: '/admin/reports' },
    { label: 'Archives',          icon: Archive,         to: '/admin/archive' },
  ],

  teacher: [
    { section: 'Général' },
    { label: 'Tableau de bord',   icon: LayoutDashboard, to: '/teacher/dashboard' },

    { section: 'Enseignement' },
    { label: 'Mes cours',         icon: BookOpen,        to: '/teacher/courses' },
    { label: 'Présences',         icon: ClipboardCheck,  to: '/teacher/attendance' },
    { label: 'Notes',             icon: ClipboardList,   to: '/teacher/grades' },
    { label: 'Devoirs',           icon: PenLine,         to: '/teacher/assignments' },
    { label: 'Examens',           icon: FileCheck,       to: '/teacher/exams' },

    { section: 'Organisation' },
    { label: 'Emploi du temps',   icon: Calendar,        to: '/teacher/schedule' },
    { label: 'Étudiants',         icon: GraduationCap,   to: '/teacher/students' },
    { label: 'Délibérations',     icon: Scale,           to: '/teacher/jury' },

    { section: 'Personnel' },
    { label: 'Notifications',     icon: Bell,            to: '/teacher/notifications' },
    { label: 'Profil',            icon: User,            to: '/teacher/profile' },
    { label: 'Paramètres',        icon: Settings,        to: '/teacher/settings' },
  ],

  student: [
    { section: 'Général' },
    { label: 'Tableau de bord',   icon: LayoutDashboard, to: '/student/dashboard' },

    { section: 'Académique' },
    { label: 'Mes notes',         icon: ClipboardList,   to: '/student/grades' },
    { label: 'Mes cours',         icon: BookOpen,        to: '/student/courses' },
    { label: 'Présences',         icon: ClipboardCheck,  to: '/student/attendance' },
    { label: 'Emploi du temps',   icon: Calendar,        to: '/student/schedule' },
    { label: 'Devoirs',           icon: PenLine,         to: '/student/homework' },
    { label: 'Examens',           icon: FileCheck,       to: '/student/exams' },

    { section: 'Services' },
    { label: 'Frais scolaires',   icon: DollarSign,      to: '/student/fees' },
    { label: 'Bibliothèque',      icon: Library,         to: '/student/library' },
    { label: 'Stages',            icon: Briefcase,       to: '/student/internship' },

    { section: 'Personnel' },
    { label: 'Notifications',     icon: Bell,            to: '/student/notifications' },
    { label: 'Profil',            icon: User,            to: '/student/profile' },
    { label: 'Paramètres',        icon: Settings,        to: '/student/settings' },
  ],
};

const ROLE_BADGES = {
  super_admin:     { label: 'Super Admin',     color: 'text-yellow-400' },
  admin:           { label: 'Administrateur',  color: 'text-blue-400'   },
  teacher:         { label: 'Enseignant',      color: 'text-green-400'  },
  student:         { label: 'Étudiant',        color: 'text-indigo-400' },
  staff:           { label: 'Personnel',       color: 'text-gray-400'   },
  department_head: { label: 'Chef Dép.',       color: 'text-purple-400' },
};

export const Sidebar = ({ collapsed, onToggle, mobileOpen, onMobileClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const role = user?.role || 'student';
  const items = NAV_ITEMS[role] || NAV_ITEMS.student;
  const badge = ROLE_BADGES[role] || { label: role, color: 'text-gray-400' };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavClick = () => {
    if (onMobileClose) onMobileClose();
  };

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-40 flex flex-col
      bg-[#0f172a] text-white shadow-2xl
      transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]
      w-64
      ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      md:translate-x-0
      ${collapsed ? 'md:w-[68px]' : 'md:w-64'}
    `}>

      {/* ── Marque ────────────────────────────────── */}
      <div className="relative flex items-center justify-between px-4 py-4 border-b border-white/[0.06] shrink-0">
        {/* Logo + titre (visible quand non collapsé) */}
        <Link to="/" className={`flex items-center gap-3 min-w-0 ${collapsed ? 'md:hidden' : ''}`} style={{ textDecoration:'none' }}>
          <div className="relative shrink-0">
            <div className="absolute inset-0 bg-indigo-500 rounded-xl blur-md opacity-40" />
            <div className="relative w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
              <School size={19} className="text-white" />
            </div>
          </div>
          <div className="min-w-0">
            <p className="text-[15px] font-bold text-white leading-tight tracking-tight truncate">Omedev School</p>
            <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">Gestion Universitaire</p>
          </div>
        </Link>

        {/* Icône seule quand collapsé sur desktop */}
        <Link to="/" className={`relative mx-auto ${collapsed ? 'md:block' : 'md:hidden'} hidden`} style={{ textDecoration:'none' }}>
          <div className="absolute inset-0 bg-indigo-500 rounded-xl blur-md opacity-40" />
          <div className="relative w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center">
            <School size={19} className="text-white" />
          </div>
        </Link>

        {/* Bouton fermer (mobile) */}
        <button
          onClick={onMobileClose}
          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors md:hidden"
        >
          <X size={16} className="text-slate-400" />
        </button>

        {/* Bouton collapse (desktop) */}
        <button
          onClick={onToggle}
          className={`p-1.5 rounded-lg hover:bg-white/10 transition-colors hidden md:flex items-center justify-center ${collapsed ? 'md:hidden' : ''}`}
        >
          <ChevronLeft size={16} className="text-slate-400" />
        </button>
      </div>

      {/* ── Navigation ────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-0.5 scrollbar-thin">
        {items.map((item, idx) => {
          // Section header
          if (item.section) {
            return (
              <div
                key={`s-${idx}`}
                className={`pt-4 pb-1.5 px-1 first:pt-2 ${collapsed ? 'md:hidden' : ''}`}
              >
                <p className="text-[9.5px] font-bold text-slate-500 uppercase tracking-[0.1em] select-none">
                  {item.section}
                </p>
              </div>
            );
          }

          // Navigation link
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={handleNavClick}
              className={({ isActive }) => `
                relative flex items-center gap-3 px-2.5 py-2 rounded-lg text-[13px] font-medium
                transition-all duration-150 group
                ${isActive
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-900/50'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
                }
              `}
            >
              <item.icon
                size={17}
                className="shrink-0"
              />

              {/* Label (masqué en mode collapsé sur desktop) */}
              <span className={`truncate ${collapsed ? 'md:hidden' : ''}`}>
                {item.label}
              </span>

              {/* Tooltip en mode collapsé */}
              {collapsed && (
                <div className="
                  absolute left-full ml-3 px-2.5 py-1.5
                  bg-slate-800 text-white text-xs rounded-lg shadow-xl
                  border border-white/10 whitespace-nowrap
                  opacity-0 group-hover:opacity-100
                  pointer-events-none z-50
                  transition-opacity duration-150
                  hidden md:block
                ">
                  {item.label}
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-800" />
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* ── Utilisateur ────────────────────────────── */}
      <div className="px-2.5 py-3 border-t border-white/[0.06] shrink-0">
        <div className={`flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/[0.05] transition-colors ${collapsed ? 'md:justify-center' : ''}`}>
          <SimpleAvatar
            firstName={user?.firstName}
            lastName={user?.lastName}
            photo={user?.profilePhoto}
          />

          <div className={`flex-1 min-w-0 ${collapsed ? 'md:hidden' : ''}`}>
            <p className="text-[13px] font-semibold text-white truncate leading-tight">
              {user?.firstName} {user?.lastName}
            </p>
            <p className={`text-[11px] font-medium truncate mt-0.5 ${badge.color}`}>
              {badge.label}
            </p>
          </div>

          <button
            onClick={handleLogout}
            title="Déconnexion"
            className={`p-1.5 rounded-lg hover:bg-red-500/20 transition-colors shrink-0 ${collapsed ? 'md:hidden' : ''}`}
          >
            <LogOut size={14} className="text-slate-500 hover:text-red-400 transition-colors" />
          </button>
        </div>

        {/* Déconnexion seul en mode collapsé */}
        {collapsed && (
          <button
            onClick={handleLogout}
            title="Déconnexion"
            className="hidden md:flex w-full items-center justify-center mt-1 p-2 rounded-lg hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={15} className="text-slate-500 hover:text-red-400 transition-colors" />
          </button>
        )}
      </div>

      {/* ── Bouton expand (desktop collapsé) ────────── */}
      {collapsed && (
        <button
          onClick={onToggle}
          className="
            absolute -right-3 top-[72px] w-6 h-6
            bg-slate-700 rounded-full border border-slate-600
            hidden md:flex items-center justify-center
            hover:bg-indigo-600 hover:border-indigo-500
            transition-all duration-200 shadow-lg
          "
        >
          <ChevronRight size={12} className="text-white" />
        </button>
      )}
    </aside>
  );
};
