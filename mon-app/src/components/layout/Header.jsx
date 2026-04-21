import { useState, useEffect, useRef } from 'react';
import { Bell, Search, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";
import { notificationAPI } from '../../services/api';
import { Avatar, Badge } from '../common';
import { formatDateTime } from '../utils/Helpers';

export const Header = ({ onMenuToggle, collapsed }) => {
  const { user } = useAuth();
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    loadNotifications();
  }, []);

  useEffect(() => {
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setNotifOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const loadNotifications = async () => {
    try {
      const res = await notificationAPI.getAll();
      setNotifications((res.data || []).slice(0, 8));
      const countRes = await notificationAPI.getUnreadCount();
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

  const notifPath = user?.role === 'student' ? '/student/notifications' : '/teacher/notifications';

  return (
    <header className={`fixed top-0 right-0 z-30 h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 transition-all duration-300 ${collapsed ? 'left-16' : 'left-64'}`}>
      {/* Left */}
      <div className="flex items-center gap-4">
        <button onClick={onMenuToggle} className="p-2 rounded-xl hover:bg-gray-100 transition-colors lg:hidden">
          <Menu size={20} className="text-gray-600" />
        </button>
        <div className="hidden md:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 w-72">
          <Search size={15} className="text-gray-400" />
          <input placeholder="Rechercher..." className="bg-transparent text-sm outline-none text-gray-600 flex-1 placeholder-gray-400" />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <div className="relative" ref={ref}>
          <button onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2.5 rounded-xl hover:bg-gray-100 transition-colors">
            <Bell size={20} className="text-gray-600" />
            {unread > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
                {unread > 0 && <Badge className="bg-red-100 text-red-600">{unread} non lues</Badge>}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-center text-gray-400 text-sm py-6">Aucune notification</p>
                ) : (
                  notifications.map(n => (
                    <div key={n._id} onClick={() => markRead(n._id)}
                      className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors ${!n.isRead ? 'bg-indigo-50/50' : ''}`}>
                      <div className="flex items-start gap-2">
                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.isRead ? 'bg-indigo-500' : 'bg-transparent'}`} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${!n.isRead ? 'text-gray-900' : 'text-gray-600'} truncate`}>{n.title}</p>
                          <p className="text-xs text-gray-400 truncate">{n.message}</p>
                          <p className="text-[10px] text-gray-300 mt-0.5">{formatDateTime(n.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="px-4 py-2.5 border-t border-gray-100">
                <Link to={notifPath} onClick={() => setNotifOpen(false)} className="text-xs text-indigo-600 font-medium hover:text-indigo-700">
                  Voir toutes les notifications →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-gray-100">
          <Avatar firstName={user?.firstName} lastName={user?.lastName} photo={user?.profilePhoto} size="sm" />
          <div className="hidden md:block">
            <p className="text-sm font-semibold text-gray-800 leading-tight">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-gray-400 capitalize">{user?.role?.replace('_', ' ')}</p>
          </div>
        </div>
      </div>
    </header>
  );
};