import { useState, useEffect, useRef } from 'react';
import { Bell, Search, Menu, X, ChevronRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationAPI } from '../../services/api';
import { Avatar, Badge } from '../common';
import { formatDateTime } from '../utils/Helpers';

// ─── Mapping chemin → titre de page ──────────────────────────────────────────
const PAGE_TITLES = {
  // Admin
  '/admin/dashboard':     { crumb: ['Administration'],                     title: 'Tableau de bord'    },
  '/admin/students':      { crumb: ['Administration', 'Utilisateurs'],     title: 'Étudiants'           },
  '/admin/teachers':      { crumb: ['Administration', 'Utilisateurs'],     title: 'Enseignants'         },
  '/admin/staff':         { crumb: ['Administration', 'Utilisateurs'],     title: 'Personnel'           },
  '/admin/programs':      { crumb: ['Administration', 'Programme'],        title: 'Filières'            },
  '/admin/ues':           { crumb: ['Administration', 'Programme'],        title: 'Unités (UE)'         },
  '/admin/courses':       { crumb: ['Administration', 'Programme'],        title: 'Cours'               },
  '/admin/schedules':     { crumb: ['Administration', 'Programme'],        title: 'Emploi du temps'     },
  '/admin/grades':        { crumb: ['Administration', 'Évaluation'],       title: 'Notes & Évaluations' },
  '/admin/attendance':    { crumb: ['Administration', 'Évaluation'],       title: 'Présences'           },
  '/admin/exams':         { crumb: ['Administration', 'Évaluation'],       title: 'Examens'             },
  '/admin/jury':          { crumb: ['Administration', 'Évaluation'],       title: 'Délibérations'       },
  '/admin/fees':          { crumb: ['Administration', 'Gestion'],          title: 'Frais de scolarité'  },
  '/admin/library':       { crumb: ['Administration', 'Gestion'],          title: 'Bibliothèque'        },
  '/admin/internships':   { crumb: ['Administration', 'Gestion'],          title: 'Stages'              },
  '/admin/diplomas':      { crumb: ['Administration', 'Gestion'],          title: 'Diplômes'            },
  '/admin/reports':       { crumb: ['Administration', 'Système'],          title: 'Rapports'            },
  '/admin/archive':       { crumb: ['Administration', 'Système'],          title: 'Archives'            },
  '/admin/notifications': { crumb: ['Administration', 'Système'],          title: 'Notifications'       },
  '/admin/settings':      { crumb: ['Administration', 'Système'],          title: 'Paramètres'          },
  // Teacher
  '/teacher/dashboard':   { crumb: ['Enseignant'],                         title: 'Tableau de bord'    },
  '/teacher/courses':     { crumb: ['Enseignant', 'Enseignement'],         title: 'Mes cours'           },
  '/teacher/attendance':  { crumb: ['Enseignant', 'Enseignement'],         title: 'Présences'           },
  '/teacher/grades':      { crumb: ['Enseignant', 'Enseignement'],         title: 'Notes'               },
  '/teacher/assignments': { crumb: ['Enseignant', 'Enseignement'],         title: 'Devoirs'             },
  '/teacher/exams':       { crumb: ['Enseignant', 'Enseignement'],         title: 'Examens'             },
  '/teacher/schedule':    { crumb: ['Enseignant', 'Organisation'],         title: 'Emploi du temps'     },
  '/teacher/students':    { crumb: ['Enseignant', 'Organisation'],         title: 'Étudiants'           },
  '/teacher/jury':        { crumb: ['Enseignant', 'Organisation'],         title: 'Délibérations'       },
  '/teacher/notifications':{ crumb: ['Enseignant', 'Personnel'],           title: 'Notifications'       },
  '/teacher/profile':     { crumb: ['Enseignant', 'Personnel'],            title: 'Profil'              },
  '/teacher/settings':    { crumb: ['Enseignant', 'Personnel'],            title: 'Paramètres'          },
  // Student
  '/student/dashboard':   { crumb: ['Étudiant'],                           title: 'Tableau de bord'    },
  '/student/grades':      { crumb: ['Étudiant', 'Académique'],             title: 'Mes notes'           },
  '/student/courses':     { crumb: ['Étudiant', 'Académique'],             title: 'Mes cours'           },
  '/student/attendance':  { crumb: ['Étudiant', 'Académique'],             title: 'Présences'           },
  '/student/schedule':    { crumb: ['Étudiant', 'Académique'],             title: 'Emploi du temps'     },
  '/student/homework':    { crumb: ['Étudiant', 'Académique'],             title: 'Devoirs'             },
  '/student/exams':       { crumb: ['Étudiant', 'Académique'],             title: 'Examens'             },
  '/student/fees':        { crumb: ['Étudiant', 'Services'],               title: 'Frais scolaires'     },
  '/student/library':     { crumb: ['Étudiant', 'Services'],               title: 'Bibliothèque'        },
  '/student/internship':  { crumb: ['Étudiant', 'Services'],               title: 'Stages'              },
  '/student/notifications':{ crumb: ['Étudiant', 'Personnel'],             title: 'Notifications'       },
  '/student/profile':     { crumb: ['Étudiant', 'Personnel'],              title: 'Profil'              },
  '/student/settings':    { crumb: ['Étudiant', 'Personnel'],              title: 'Paramètres'          },
};

export const Header = ({ onMenuToggle, collapsed }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [notifOpen, setNotifOpen]       = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread]             = useState(0);
  const [searchOpen, setSearchOpen]     = useState(false);
  const notifRef = useRef(null);

  const pageInfo = PAGE_TITLES[location.pathname] || { crumb: [], title: 'Omedev School' };

  useEffect(() => { loadNotifications(); }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const loadNotifications = async () => {
    try {
      const res      = await notificationAPI.getAll();
      const countRes = await notificationAPI.getUnreadCount();
      setNotifications((res.data || []).slice(0, 8));
      setUnread(countRes.data?.count || 0);
    } catch {}
  };

  const markRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnread(prev => Math.max(0, prev - 1));
    } catch {}
  };

  const notifPath = user?.role === 'student'
    ? '/student/notifications'
    : user?.role === 'teacher'
      ? '/teacher/notifications'
      : '/admin/notifications';

  return (
    <>
      <header className={`
        fixed top-0 right-0 z-30 h-16 bg-white border-b border-gray-100/80
        flex items-center justify-between px-4 sm:px-5
        transition-all duration-300
        left-0 ${collapsed ? 'md:left-[68px]' : 'md:left-64'}
      `}>

        {/* ── Gauche : hamburger + breadcrumb ─────── */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Hamburger mobile */}
          <button
            onClick={onMenuToggle}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors md:hidden shrink-0"
            aria-label="Menu"
          >
            <Menu size={20} className="text-gray-600" />
          </button>

          {/* Breadcrumb / titre de page */}
          <div className="hidden sm:flex items-center gap-1.5 min-w-0">
            {pageInfo.crumb.map((segment, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <span className="text-xs text-gray-400 font-medium truncate">{segment}</span>
                <ChevronRight size={12} className="text-gray-300 shrink-0" />
              </span>
            ))}
            <span className="text-sm font-semibold text-gray-800 truncate">{pageInfo.title}</span>
          </div>

          {/* Titre seul sur mobile */}
          <span className="sm:hidden text-sm font-semibold text-gray-800 truncate">
            {pageInfo.title}
          </span>
        </div>

        {/* ── Droite : recherche + notifs + user ─── */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">

          {/* Barre de recherche desktop */}
          <div className="hidden md:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 w-52 lg:w-64 transition-all focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-100">
            <Search size={14} className="text-gray-400 shrink-0" />
            <input
              placeholder="Rechercher..."
              className="bg-transparent text-sm outline-none text-gray-600 flex-1 placeholder-gray-400 min-w-0"
            />
          </div>

          {/* Icône recherche mobile */}
          <button
            onClick={() => setSearchOpen(o => !o)}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors md:hidden"
            aria-label="Rechercher"
          >
            <Search size={18} className="text-gray-600" />
          </button>

          {/* ── Notifications ─── */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen(o => !o)}
              className="relative p-2 sm:p-2.5 rounded-xl hover:bg-gray-100 transition-colors"
              aria-label="Notifications"
            >
              <Bell size={19} className="text-gray-600" />
              {unread > 0 && (
                <span className="absolute top-1.5 right-1.5 w-[18px] h-[18px] bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold leading-none ring-2 ring-white">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-[52px] w-[calc(100vw-2rem)] max-w-[340px] sm:w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-slide-up">
                {/* Header notif */}
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50/80 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
                    {unread > 0 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-600">
                        {unread} non lues
                      </span>
                    )}
                  </div>
                  <button onClick={() => setNotifOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors">
                    <X size={14} className="text-gray-400" />
                  </button>
                </div>

                {/* Liste */}
                <div className="max-h-[300px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                      <Bell size={28} className="mb-2 opacity-40" />
                      <p className="text-sm">Aucune notification</p>
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n._id}
                        onClick={() => markRead(n._id)}
                        className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors flex items-start gap-3 ${!n.isRead ? 'bg-indigo-50/40' : ''}`}
                      >
                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.isRead ? 'bg-indigo-500' : 'bg-gray-200'}`} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${!n.isRead ? 'text-gray-900' : 'text-gray-500'}`}>
                            {n.title}
                          </p>
                          <p className="text-xs text-gray-400 truncate mt-0.5">{n.message}</p>
                          <p className="text-[10px] text-gray-300 mt-1">{formatDateTime(n.createdAt)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer */}
                <div className="px-4 py-2.5 bg-gray-50/60 border-t border-gray-100">
                  <Link
                    to={notifPath}
                    onClick={() => setNotifOpen(false)}
                    className="text-xs text-indigo-600 font-semibold hover:text-indigo-700 transition-colors"
                  >
                    Voir toutes les notifications →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* ── Utilisateur ─── */}
          <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-gray-100 ml-1">
            <Avatar
              firstName={user?.firstName}
              lastName={user?.lastName}
              photo={user?.profilePhoto}
              size="sm"
            />
            <div className="hidden md:block">
              <p className="text-[13px] font-semibold text-gray-800 leading-tight truncate max-w-[130px]">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-[11px] text-gray-400 capitalize leading-tight mt-0.5">
                {user?.role?.replace('_', ' ')}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Barre de recherche mobile (expandable) */}
      {searchOpen && (
        <div className="fixed top-16 left-0 right-0 z-20 bg-white border-b border-gray-100 px-4 py-3 sm:hidden shadow-md animate-slide-up">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5">
            <Search size={15} className="text-gray-400 shrink-0" />
            <input
              autoFocus
              placeholder="Rechercher..."
              className="bg-transparent text-sm outline-none text-gray-600 flex-1 placeholder-gray-400"
            />
            <button onClick={() => setSearchOpen(false)}>
              <X size={15} className="text-gray-400" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
