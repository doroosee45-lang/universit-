import { notificationAPI } from '../../services/services';
import { Button, Card, Badge, Spinner } from '../../components/common';
import { useFetch } from '../../components/hooks/UseFetch';
import { formatDateTime } from '../../components/utils/Helpers';
import { Bell, CheckCheck } from 'lucide-react';

const TYPE_STYLES = {
  info: 'bg-blue-100 text-blue-700',
  warning: 'bg-yellow-100 text-yellow-700',
  success: 'bg-green-100 text-green-700',
  alert: 'bg-red-100 text-red-700',
};

export default function TeacherNotificationsPage() {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-500 mt-1">{unread} non lue{unread !== 1 ? 's' : ''}</p>
        </div>
        {unread > 0 && (
          <Button variant="secondary" size="sm" onClick={markAllRead}>
            <CheckCheck size={15} /> Tout marquer comme lu
          </Button>
        )}
      </div>

      {loading ? <div className="flex justify-center py-12"><Spinner size={28} /></div> :
      notifications.length === 0 ? (
        <Card className="p-12 text-center">
          <Bell size={40} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-400">Aucune notification</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map(n => (
            <Card key={n._id} className={`p-4 cursor-pointer hover:shadow-md transition-shadow ${!n.isRead ? 'border-indigo-200 bg-indigo-50/30' : ''}`}
              onClick={() => !n.isRead && markRead(n._id)}>
              <div className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${!n.isRead ? 'bg-indigo-500' : 'bg-transparent'}`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className={`text-sm font-semibold ${!n.isRead ? 'text-gray-900' : 'text-gray-600'}`}>{n.title}</p>
                    <Badge className={TYPE_STYLES[n.type] || 'bg-gray-100 text-gray-600'}>{n.type}</Badge>
                  </div>
                  <p className="text-sm text-gray-500">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{formatDateTime(n.createdAt)}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}