import { notificationAPI } from '../../services/services';
import { Button, Card, Badge, Spinner } from '../../components/common';
import { useFetch } from '../../components/hooks/UseFetch'
import { formatDateTime } from '../../components/utils/Helpers';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';

const TYPE_STYLES = {
  info: 'bg-blue-100 text-blue-700',
  warning: 'bg-yellow-100 text-yellow-700',
  success: 'bg-green-100 text-green-700',
  alert: 'bg-red-100 text-red-700',
};

const TYPE_ICONS = {
  info: 'ℹ️',
  warning: '⚠️',
  success: '✅',
  alert: '🔔',
};

export default function StudentNotificationsPage() {
  const { data, loading, refetch } = useFetch(notificationAPI.getAll);
  const notifications = data || [];
  const unread = notifications.filter(n => !n.isRead).length;

  const markAllRead = async () => {
    await notificationAPI.markAllAsRead();
    refetch();
  };

  const markRead = async (id) => {
    await notificationAPI.markAsRead(id);
    refetch();
  };

  const deleteNotif = async (id) => {
    await notificationAPI.delete(id);
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          {unread > 0 && (
            <p className="text-sm text-indigo-600 mt-1 font-medium">{unread} non lue{unread !== 1 ? 's' : ''}</p>
          )}
        </div>
        {unread > 0 && (
          <Button variant="secondary" size="sm" onClick={markAllRead}>
            <CheckCheck size={15} /> Tout marquer comme lu
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner size={28} /></div>
      ) : notifications.length === 0 ? (
        <Card className="p-12 text-center">
          <Bell size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">Aucune notification</p>
          <p className="text-gray-400 text-sm mt-1">Vous êtes à jour !</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map(n => (
            <Card key={n._id}
              className={`p-4 transition-all hover:shadow-md ${!n.isRead ? 'border-indigo-200 bg-gradient-to-r from-indigo-50/50 to-white' : ''}`}>
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                  !n.isRead ? 'bg-indigo-100' : 'bg-gray-100'
                }`}>
                  {TYPE_ICONS[n.type] || '🔔'}
                </div>
                <div className="flex-1 cursor-pointer" onClick={() => !n.isRead && markRead(n._id)}>
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <p className={`text-sm font-semibold ${!n.isRead ? 'text-gray-900' : 'text-gray-600'}`}>
                      {n.title}
                    </p>
                    <Badge className={TYPE_STYLES[n.type] || 'bg-gray-100 text-gray-600'}>{n.type}</Badge>
                    {!n.isRead && (
                      <span className="w-2 h-2 bg-indigo-500 rounded-full" />
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{formatDateTime(n.createdAt)}</p>
                  {n.link && (
                    <a href={n.link} className="text-xs text-indigo-600 hover:underline mt-1 inline-block">
                      Voir plus →
                    </a>
                  )}
                </div>
                <button onClick={() => deleteNotif(n._id)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors shrink-0">
                  <Trash2 size={14} className="text-gray-400 hover:text-red-500" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
