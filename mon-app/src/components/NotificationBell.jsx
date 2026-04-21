// components/NotificationBell.jsx
import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { api } from '../services/api';

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications/my-notifications');
        const unread = res.data.filter(n => !n.read).length;
        setUnreadCount(unread);
      } catch (err) { console.error(err); }
    };
    fetchNotifications();
  }, []);

  return (
    <div style={{ position: 'relative' }}>
      <Bell size={20} />
      {unreadCount > 0 && (
        <span style={{ position: 'absolute', top: -8, right: -8, background: 'red', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: 10 }}>
          {unreadCount}
        </span>
      )}
    </div>
  );
}