// import { useState } from 'react';
// import { NavLink, useNavigate } from 'react-router-dom';
// import {
//   LayoutDashboard, Users, GraduationCap, BookOpen, ClipboardList,
//   Calendar, DollarSign, Library, Briefcase, FileText, Settings,
//   Bell, LogOut, ChevronLeft, ChevronRight, School, BarChart3,
//   UserCheck, BookMarked, Award, ClipboardCheck, Menu, X
// } from 'lucide-react';
// import { useAuth } from '../context/AuthContext';
// import { Avatar } from '../common';

// const NAV_ITEMS = {
//   admin: [
//     { label: 'Tableau de bord', icon: LayoutDashboard, to: '/admin/dashboard' },
//     { label: 'Étudiants', icon: GraduationCap, to: '/admin/students' },
//     { label: 'Enseignants', icon: Users, to: '/admin/teachers' },
//     { label: 'Personnel', icon: UserCheck, to: '/admin/staff' },
//     { label: 'Filières & UE', icon: BookMarked, to: '/admin/programs' },
//     { label: 'Cours', icon: BookOpen, to: '/admin/courses' },
//     { label: 'Emploi du temps', icon: Calendar, to: '/admin/schedules' },
//     { label: 'Notes & Évaluations', icon: ClipboardList, to: '/admin/grades' },
//     { label: 'Présences', icon: ClipboardCheck, to: '/admin/attendance' },
//     { label: 'Examens', icon: FileText, to: '/admin/exams' },
//     { label: 'Frais de scolarité', icon: DollarSign, to: '/admin/fees' },
//     { label: 'Bibliothèque', icon: Library, to: '/admin/library' },
//     { label: 'Stages', icon: Briefcase, to: '/admin/internships' },
//     { label: 'Personnelle', icon: Users, to: './admin/staff' },
//     { label: 'Diplômes', icon: Award, to: '/admin/diplomas' },
//     { label: 'Rapports', icon: BarChart3, to: '/admin/reports' },
//     { label: 'Archivage', icon: BarChart3, to: '/admin/archivePage' },
//     { label: 'Paramètres', icon: Settings, to: '/admin/settings' },

//   ],
//   super_admin: [
//     { label: 'Tableau de bord', icon: LayoutDashboard, to: '/admin/dashboard' },
//     { label: 'Étudiants', icon: GraduationCap, to: '/admin/students' },
//     { label: 'Enseignants', icon: Users, to: '/admin/teachers' },
//     { label: 'Filières & UE', icon: BookMarked, to: '/admin/programs' },
//     { label: 'Cours', icon: BookOpen, to: '/admin/courses' },
//     { label: 'Emploi du temps', icon: Calendar, to: '/admin/schedules' },
//     { label: 'Notes & Évaluations', icon: ClipboardList, to: '/admin/grades' },
//     { label: 'Présences', icon: ClipboardCheck, to: '/admin/attendance' },
//     { label: 'Examens', icon: FileText, to: '/admin/exams' },
//     { label: 'Frais de scolarité', icon: DollarSign, to: '/admin/fees' },
//     { label: 'Bibliothèque', icon: Library, to: '/admin/library' },
//     { label: 'Stages', icon: Briefcase, to: '/admin/internships' },
//     { label: 'Personnelle', icon: Users, to: './admin/staff' },
//     { label: 'Diplômes', icon: Award, to: '/admin/diplomas' },
//     { label: 'Rapports', icon: BarChart3, to: '/admin/reports' },
//     { label: 'Archivage', icon: BarChart3, to: '/admin/archivePage' },
//     { label: 'Paramètres', icon: Settings, to: '/admin/settings' },
//   ],

//   teacher: [
//     { label: 'Tableau de bord', icon: LayoutDashboard, to: '/teacher/dashboard' },
//     { label: 'Mes cours', icon: BookOpen, to: '/teacher/courses' },
//     { label: 'Présences', icon: ClipboardCheck, to: '/teacher/attendance' },
//     { label: 'Notes', icon: ClipboardList, to: '/teacher/grades' },
//     { label: 'Devoirs', icon: FileText, to: '/teacher/assignments' },
//     { label: 'Emploi du temps', icon: Calendar, to: '/teacher/schedule' },
//     { label: 'Étudiants', icon: GraduationCap, to: '/teacher/students' },
//     { label: 'Délibérations', icon: Award, to: '/teacher/juries' },
//     { label: 'Notifications', icon: Bell, to: '/teacher/notifications' },
//     { label: 'Archivage', icon: BarChart3, to: '/teacher/archivePage' },
//     { label: 'Profil', icon: Users, to: '/teacher/profile' },
//   ],
//   student: [
//     { label: 'Tableau de bord', icon: LayoutDashboard, to: '/student/dashboard' },
//     { label: 'Mes notes', icon: ClipboardList, to: '/student/grades' },
//     { label: 'Présences', icon: ClipboardCheck, to: '/student/attendance' },
//     { label: 'Emploi du temps', icon: Calendar, to: '/student/schedule' },
//     { label: 'Devoirs', icon: FileText, to: '/student/homework' },
//     { label: 'Examens', icon: School, to: '/student/exams' },
//     { label: 'Frais scolaires', icon: DollarSign, to: '/student/fees' },
//     { label: 'Bibliothèque', icon: Library, to: '/student/library' },
//     { label: 'Stages', icon: Briefcase, to: '/student/internship' },
//     { label: 'Notifications', icon: Bell, to: '/student/notifications' },
//     { label: 'Archivage', icon: BarChart3, to: '/student/archivePage' },
//     { label: 'Profil', icon: Users, to: '/student/profile' },
//   ],
//   staff: [
//     { label: 'Tableau de bord', icon: LayoutDashboard, to: '/admin/dashboard' },
//     { label: 'Étudiants', icon: GraduationCap, to: '/admin/students' },
//     { label: 'Frais de scolarité', icon: DollarSign, to: '/admin/fees' },
//     { label: 'Bibliothèque', icon: Library, to: '/admin/library' },
//     { label: 'Stages', icon: Briefcase, to: '/admin/internships' },
//     { label: 'Archivage', icon: BarChart3, to: '/admin/archivePage' },
//     { label: 'Rapports', icon: BarChart3, to: '/admin/reports' },
//   ],
// };

// export const Sidebar = ({ collapsed, onToggle }) => {
//   const { user, logout, isAdmin, isSuperAdmin } = useAuth();
//   const navigate = useNavigate();
//   const role = user?.role || 'student';
//   const items = NAV_ITEMS[role] || NAV_ITEMS.student;

//   const handleLogout = () => {
//     logout();
//     navigate('/login');
//   };

//   return (
//     <aside className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-gray-900 text-white transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
//       {/* Header */}
//       <div className="flex items-center justify-between px-4 py-5 border-b border-gray-800">
//         {!collapsed && (
//           <div className="flex items-center gap-2.5">
//             <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
//               <School size={18} className="text-white" />
//             </div>
//             <div>
//               <p className="text-sm font-bold text-white leading-tight">UniManage</p>
//               <p className="text-[10px] text-gray-400">Système Universitaire</p>
//             </div>
//           </div>
//         )}
//         {collapsed && (
//           <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mx-auto">
//             <School size={18} className="text-white" />
//           </div>
//         )}
//         {!collapsed && (
//           <button onClick={onToggle} className="p-1.5 rounded-lg hover:bg-gray-800 transition-colors">
//             <ChevronLeft size={16} className="text-gray-400" />
//           </button>
//         )}
//       </div>

//       {/* Nav items */}
//       <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5 scrollbar-thin">
//         {items.map((item) => (
//           <NavLink
//             key={item.to}
//             to={item.to}
//             className={({ isActive }) =>
//               `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group
//               ${isActive ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`
//             }
//           >
//             <item.icon size={18} className="shrink-0" />
//             {!collapsed && <span className="truncate">{item.label}</span>}
//             {collapsed && (
//               <div className="absolute left-16 bg-gray-800 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
//                 {item.label}
//               </div>
//             )}
//           </NavLink>
//         ))}
//       </nav>

//       {/* User */}
//       <div className="p-3 border-t border-gray-800">
//         {!collapsed ? (
//           <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-800 transition-colors">
//             <Avatar firstName={user?.firstName} lastName={user?.lastName} photo={user?.profilePhoto} size="sm" />
//             <div className="flex-1 min-w-0">
//               <p className="text-sm font-medium text-white truncate">{user?.firstName} {user?.lastName}</p>
//               <p className="text-xs text-gray-400 truncate capitalize">{role.replace('_', ' ')}</p>
//             </div>
//             <button onClick={handleLogout} className="p-1.5 rounded-lg hover:bg-gray-700 transition-colors" title="Déconnexion">
//               <LogOut size={15} className="text-gray-400" />
//             </button>
//           </div>
//         ) : (
//           <div className="flex flex-col items-center gap-2">
//             <Avatar firstName={user?.firstName} lastName={user?.lastName} photo={user?.profilePhoto} size="sm" />
//             <button onClick={handleLogout} className="p-1.5 rounded-lg hover:bg-gray-800 transition-colors">
//               <LogOut size={14} className="text-gray-400" />
//             </button>
//           </div>
//         )}
//       </div>

//       {/* Collapse toggle when collapsed */}
//       {collapsed && (
//         <button onClick={onToggle} className="absolute -right-3 top-20 w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center shadow-lg border border-gray-600 hover:bg-gray-600 transition-colors">
//           <ChevronRight size={12} className="text-white" />
//         </button>
//       )}
//     </aside>
//   );
// };

import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, ClipboardList,
  Calendar, DollarSign, Library, Briefcase, FileText, Settings,
  Bell, LogOut, ChevronLeft, ChevronRight, School, BarChart3,
  UserCheck, BookMarked, Award, ClipboardCheck, Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Avatar avec effet de glow
const SimpleAvatar = ({ firstName, lastName, photo, size = 'sm' }) => {
  const getInitials = () => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return `${first}${last}`.toUpperCase() || '?';
  };

  const sizeClass = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';

  if (photo) {
    return (
      <img
        src={photo}
        alt={`${firstName} ${lastName}`}
        className={`${sizeClass} rounded-full object-cover ring-2 ring-indigo-500/20 shadow-md transition-all duration-300 group-hover:ring-indigo-500/40`}
      />
    );
  }

  return (
    <div className={`${sizeClass} rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-medium shadow-md ring-2 ring-indigo-500/20 transition-all duration-300 group-hover:scale-105 group-hover:ring-indigo-500/40`}>
      {getInitials()}
    </div>
  );
};

const NAV_ITEMS = {
  admin: [
    { label: 'Tableau de bord', icon: LayoutDashboard, to: '/admin/dashboard' },
    { label: 'Étudiants', icon: GraduationCap, to: '/admin/students' },
    { label: 'Enseignants', icon: Users, to: '/admin/teachers' },
    { label: 'Personnel', icon: UserCheck, to: '/admin/staff' },
    { label: 'Filières & UE', icon: BookMarked, to: '/admin/programs' },
    { label: 'Cours', icon: BookOpen, to: '/admin/courses' },
    { label: 'Unité d\enseignmement', icon: BookOpen, to: '/admin/ues' },
    { label: 'Emploi du temps', icon: Calendar, to: '/admin/schedules' },
    { label: 'Notes & Évaluations', icon: ClipboardList, to: '/admin/grades' },
    { label: 'Présences', icon: ClipboardCheck, to: '/admin/attendance' },
    { label: 'Examens', icon: FileText, to: '/admin/exams' },
    { label: 'Frais de scolarité', icon: DollarSign, to: '/admin/fees' },
    { label: 'Bibliothèque', icon: Library, to: '/admin/library' },
    { label: 'Stages', icon: Briefcase, to: '/admin/internships' },
    { label: 'Diplômes', icon: Award, to: '/admin/diplomas' },
    { label: 'Rapports', icon: BarChart3, to: '/admin/reports' },
    { label: 'Délibérations', icon: Award, to: '/admin/jury' },
    { label: 'Archivage', icon: BarChart3, to: '/admin/archivePage' },
    { label: 'Paramètres', icon: Settings, to: '/admin/settings' },
  ],


  super_admin: [
    { label: 'Tableau de bord', icon: LayoutDashboard, to: '/admin/dashboard' },
    { label: 'Étudiants', icon: GraduationCap, to: '/admin/students' },
    { label: 'Enseignants', icon: Users, to: '/admin/teachers' },
    { label: 'Personnel', icon: UserCheck, to: '/admin/staff' },
    { label: 'Filières & UE', icon: BookMarked, to: '/admin/programs' },
    { label: 'Cours', icon: BookOpen, to: '/admin/courses' },
    { label: 'Unité d\enseignmement', icon: BookOpen, to: '/admin/ues' },
    { label: 'Emploi du temps', icon: Calendar, to: '/admin/schedules' },
    { label: 'Notes & Évaluations', icon: ClipboardList, to: '/admin/grades' },
    { label: 'Présences', icon: ClipboardCheck, to: '/admin/attendance' },
    { label: 'Examens', icon: FileText, to: '/admin/exams' },
    { label: 'Frais de scolarité', icon: DollarSign, to: '/admin/fees' },
    { label: 'Bibliothèque', icon: Library, to: '/admin/library' },
    { label: 'Stages', icon: Briefcase, to: '/admin/internships' },
    { label: 'Diplômes', icon: Award, to: '/admin/diplomas' },
    { label: 'Rapports', icon: BarChart3, to: '/admin/reports' },
    { label: 'Délibérations', icon: Award, to: '/admin/jury' },
    { label: 'Archivage', icon: BarChart3, to: '/admin/archivePage' },
    { label: 'Paramètres', icon: Settings, to: '/admin/settings' },
  ],

  teacher: [
    { label: 'Tableau de bord', icon: LayoutDashboard, to: '/teacher/dashboard' },
    { label: 'Mes cours', icon: BookOpen, to: '/teacher/courses' },
    { label: 'Examens', icon: FileText, to: '/teacher/examsPage' },
    { label: 'Présences', icon: ClipboardCheck, to: '/teacher/attendance' },
    { label: 'Notes', icon: ClipboardList, to: '/teacher/grades' },
    { label: 'Devoirs', icon: FileText, to: '/teacher/assignments' },
    { label: 'Emploi du temps', icon: Calendar, to: '/teacher/schedule' },
    { label: 'Étudiants', icon: GraduationCap, to: '/teacher/students' },
    { label: 'Délibérations', icon: Award, to: '/teacher/jury' },
    { label: 'Notifications', icon: Bell, to: '/teacher/notifications' },
    { label: 'Profil', icon: Users, to: '/teacher/profile' },
    { label: 'Paramètres', icon: Settings, to: '/teacher/settings' },
  ],


  student: [
    { label: 'Tableau de bord', icon: LayoutDashboard, to: '/student/dashboard' },
    { label: 'Mes notes', icon: ClipboardList, to: '/student/grades' },
    { label: 'Mes cours', icon: BookOpen, to: '/student/courses' },
    { label: 'Présences', icon: ClipboardCheck, to: '/student/attendance' },
    { label: 'Emploi du temps', icon: Calendar, to: '/student/schedule' },
    { label: 'Devoirs', icon: FileText, to: '/student/homework' },
    { label: 'Examens', icon: School, to: '/student/exams' },
    { label: 'Frais scolaires', icon: DollarSign, to: '/student/fees' },
    { label: 'Bibliothèque', icon: Library, to: '/student/library' },
    { label: 'Stages', icon: Briefcase, to: '/student/internship' },
    { label: 'Notifications', icon: Bell, to: '/student/notifications' },
    { label: 'Profil', icon: Users, to: '/student/profile' },
    { label: 'Paramètres', icon: Settings, to: '/student/settings' },
  ],

  staff: [
    { label: 'Tableau de bord', icon: LayoutDashboard, to: '/staff/dashboard' },
    { label: 'Étudiants', icon: GraduationCap, to: '/staff/students' },
    { label: 'Frais de scolarité', icon: DollarSign, to: '/staff/fees' },
    { label: 'Bibliothèque', icon: Library, to: '/staff/library' },
    { label: 'Stages', icon: Briefcase, to: '/staff/internships' },
    { label: 'Archivage', icon: BarChart3, to: '/staff/archivePage' },
    { label: 'Rapports', icon: BarChart3, to: '/staff/reports' },
  ],
};

export const Sidebar = ({ collapsed, onToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const role = user?.role || 'student';
  const items = NAV_ITEMS[role] || NAV_ITEMS.student;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-40 flex flex-col
      bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800
      text-white shadow-2xl shadow-black/30
      transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
      ${collapsed ? 'w-16' : 'w-64'}
    `}>
      {/* Header avec effet brillant */}
      <div className="relative flex items-center justify-between px-4 py-5 overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 to-transparent pointer-events-none" />
        {!collapsed && (
          <div className="flex items-center gap-2.5 group cursor-default">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500 rounded-lg blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-lg flex items-center justify-center shadow-lg">
                <School size={18} className="text-white drop-shadow-sm" />
              </div>
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-tight tracking-tight">UniManage</p>
              <p className="text-[10px] text-indigo-300/80 font-medium">Système Universitaire</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="relative mx-auto">
            <div className="absolute inset-0 bg-indigo-500 rounded-lg blur-md opacity-50" />
            <div className="relative w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-lg flex items-center justify-center">
              <School size={18} className="text-white" />
            </div>
          </div>
        )}
        {!collapsed && (
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <ChevronLeft size={16} className="text-gray-400 hover:text-white" />
          </button>
        )}
      </div>

      {/* Navigation items avec animation au survol */}
      <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-1.5 scrollbar-thin scrollbar-track-gray-800/50 scrollbar-thumb-indigo-600/50 hover:scrollbar-thumb-indigo-600/70">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `
              relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
              transition-all duration-200 group overflow-hidden
              ${isActive
                ? 'text-white bg-gradient-to-r from-indigo-600 to-indigo-700 shadow-lg shadow-indigo-900/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
              }
            `}
          >
            {/* Effet de lueur au survol */}
            {!collapsed && (
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
            )}
            <item.icon size={18} className="shrink-0 transition-transform duration-200 group-hover:scale-105" />
            {!collapsed && <span className="truncate">{item.label}</span>}
            {collapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap pointer-events-none z-50 border border-white/10 backdrop-blur-sm">
                {item.label}
              </div>
            )}
            {/* Indicateur actif (petite barre) */}
            {collapsed && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-indigo-500 rounded-full opacity-0 transition-opacity duration-200 group-[.active]:opacity-100" />
            )}
          </NavLink>
        ))}
      </nav>

      {/* Section utilisateur avec glassmorphisme */}
      <div className="p-3 border-t border-white/10 bg-gradient-to-t from-black/20 to-transparent">
        {!collapsed ? (
          <div className="flex items-center gap-3 p-2 rounded-xl transition-all duration-200 hover:bg-white/5 group cursor-default">
            <SimpleAvatar
              firstName={user?.firstName}
              lastName={user?.lastName}
              photo={user?.profilePhoto}
              size="sm"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-indigo-300/80 truncate capitalize flex items-center gap-1">
                <Sparkles size={10} className="text-indigo-400" />
                {role.replace('_', ' ')}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg hover:bg-red-500/20 transition-all duration-200 hover:scale-105 active:scale-95 group"
              title="Déconnexion"
            >
              <LogOut size={15} className="text-gray-400 group-hover:text-red-400 transition-colors" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <SimpleAvatar
              firstName={user?.firstName}
              lastName={user?.lastName}
              photo={user?.profilePhoto}
              size="sm"
            />
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg hover:bg-red-500/20 transition-all duration-200 hover:scale-105"
              title="Déconnexion"
            >
              <LogOut size={14} className="text-gray-400 hover:text-red-400 transition-colors" />
            </button>
          </div>
        )}
      </div>

      {/* Bouton toggle flottant amélioré */}
      {collapsed && (
        <button
          onClick={onToggle}
          className="absolute -right-3 top-20 w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center shadow-lg border border-indigo-500/50 hover:bg-indigo-600 transition-all duration-200 hover:scale-110 active:scale-95 group"
        >
          <ChevronRight size={12} className="text-white group-hover:translate-x-0.5 transition-transform" />
        </button>
      )}
    </aside>
  );
};