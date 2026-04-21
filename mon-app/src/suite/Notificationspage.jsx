import { useState } from 'react';
import { Bell, Check, CheckCheck, Trash2 } from 'lucide-react';
import { notificationAPI } from '../../api/services';
import { Button, Card, Badge, useToast, Spinner } from '../../components/common';
import { useFetch } from '../../hooks/useFetch';
import { formatDateTime } from '../../utils/helpers';

const TYPE_STYLES = {
  info: { bg: 'bg-blue-50 border-blue-100', dot: 'bg-blue-500', icon: '📢' },
  success: { bg: 'bg-green-50 border-green-100', dot: 'bg-green-500', icon: '✅' },
  warning: { bg: 'bg-amber-50 border-amber-100', dot: 'bg-amber-500', icon: '⚠️' },
  error: { bg: 'bg-red-50 border-red-100', dot: 'bg-red-500', icon: '🚨' },
};

export default function NotificationsPage() {
  const { toast, ToastContainer } = useToast();
  const { data: notifs, loading, refetch } = useFetch(notificationAPI.getAll);
  const notifList = notifs?.data || notifs || [];

  const markRead = async (id) => {
    try { await notificationAPI.markAsRead(id); refetch(); }
    catch (err) { toast(err.message, 'error'); }
  };

  const markAllRead = async () => {
    try { await notificationAPI.markAllAsRead(); refetch(); toast('Toutes les notifications marquées comme lues'); }
    catch (err) { toast(err.message, 'error'); }
  };

  const deleteNotif = async (id) => {
    try { await notificationAPI.delete(id); refetch(); }
    catch (err) { toast(err.message, 'error'); }
  };

  const unread = notifList.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6 max-w-2xl">
      <ToastContainer />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-500 mt-1">
            {unread > 0 ? <><span className="font-semibold text-indigo-600">{unread}</span> non lue(s)</> : 'Tout est à jour'}
          </p>
        </div>
        {unread > 0 && (
          <Button variant="secondary" size="sm" onClick={markAllRead}>
            <CheckCheck size={14} /> Tout marquer lu
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size={32} /></div>
      ) : notifList.length === 0 ? (
        <Card className="p-16 text-center text-gray-400">
          <Bell size={48} className="mx-auto mb-4 opacity-30" />
          <p className="font-medium">Aucune notification</p>
          <p className="text-sm">Vous serez notifié ici des événements importants</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifList.map(n => {
            const style = TYPE_STYLES[n.type] || TYPE_STYLES.info;
            return (
              <Card key={n._id} className={`p-4 border transition-all ${!n.isRead ? style.bg : 'bg-white'}`}>
                <div className="flex items-start gap-3">
                  <div className="text-xl shrink-0 mt-0.5">{style.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className={`text-sm font-semibold ${!n.isRead ? 'text-gray-900' : 'text-gray-700'}`}>{n.title}</p>
                        <p className="text-sm text-gray-500 mt-0.5">{n.message}</p>
                        <p className="text-xs text-gray-400 mt-1.5">{formatDateTime(n.createdAt)}</p>
                      </div>
                      {!n.isRead && <div className={`w-2 h-2 rounded-full ${style.dot} shrink-0 mt-1`} />}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {!n.isRead && (
                      <Button size="icon" variant="ghost" onClick={() => markRead(n._id)} title="Marquer lu">
                        <Check size={14} className="text-green-600" />
                      </Button>
                    )}
                    <Button size="icon" variant="ghost" onClick={() => deleteNotif(n._id)} title="Supprimer">
                      <Trash2 size={14} className="text-red-500" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}