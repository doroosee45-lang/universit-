import { useState } from 'react';
import toast from 'react-hot-toast';
import { Send, Trash2, Bell, Users, CheckCheck } from 'lucide-react';
import { notificationAPI } from '../../services/services';
import { formatDateTime } from '../../components/utils/Helpers';

/* ── Options ──────────────────────────────────────────────────────────────── */
const TYPE_OPTS = [
  { value: 'info',    label: 'Information' },
  { value: 'warning', label: 'Avertissement' },
  { value: 'success', label: 'Succès' },
  { value: 'alert',   label: 'Alerte' },
];

const ROLE_OPTS = [
  { value: '',          label: 'Utilisateur spécifique' },
  { value: 'student',   label: 'Tous les étudiants' },
  { value: 'teacher',   label: 'Tous les enseignants' },
  { value: 'staff',     label: 'Tout le personnel' },
  { value: 'admin',     label: 'Administrateurs' },
];

const TYPE_COLORS = {
  info:    { bg: '#eff6ff', color: '#1d4ed8', dot: '#3b82f6' },
  warning: { bg: '#fffbeb', color: '#92400e', dot: '#f59e0b' },
  success: { bg: '#f0fdf4', color: '#166534', dot: '#22c55e' },
  alert:   { bg: '#fef2f2', color: '#991b1b', dot: '#ef4444' },
};

/* ── Helpers UI ───────────────────────────────────────────────────────────── */
function TypeBadge({ type }) {
  const c = TYPE_COLORS[type] || { bg: '#f3f4f6', color: '#374151', dot: '#9ca3af' };
  const labels = { info: 'Info', warning: 'Avertissement', success: 'Succès', alert: 'Alerte' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 600,
      background: c.bg, color: c.color,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.dot, display: 'inline-block' }} />
      {labels[type] || type}
    </span>
  );
}

/* ── Modal d'envoi ────────────────────────────────────────────────────────── */
function SendNotifModal({ onClose, onSent }) {
  const [form, setForm] = useState({ title: '', message: '', type: 'info', recipientRole: '', recipient: '', link: '' });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) {
      toast.error('Titre et message sont obligatoires');
      return;
    }
    setLoading(true);
    try {
      await notificationAPI.send?.({ ...form }) || Promise.resolve();
      toast.success('Notification envoyée avec succès');
      onSent();
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || 'Erreur lors de l\'envoi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: 28, width: '100%', maxWidth: 520, boxShadow: '0 24px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontWeight: 700, fontSize: 17, color: '#111827' }}>Envoyer une notification</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#9ca3af' }}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Titre */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Titre *</label>
            <input value={form.title} onChange={e => set('title', e.target.value)} required placeholder="Titre de la notification"
              style={{ width: '100%', padding: '9px 14px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = '#6366f1'}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          {/* Message */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Message *</label>
            <textarea value={form.message} onChange={e => set('message', e.target.value)} required rows={3}
              placeholder="Contenu de la notification..."
              style={{ width: '100%', padding: '9px 14px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = '#6366f1'}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          {/* Type + Destinataires */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Type</label>
              <select value={form.type} onChange={e => set('type', e.target.value)}
                style={{ width: '100%', padding: '9px 14px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, outline: 'none', background: '#fff', fontFamily: 'inherit', boxSizing: 'border-box' }}>
                {TYPE_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Destinataires</label>
              <select value={form.recipientRole} onChange={e => set('recipientRole', e.target.value)}
                style={{ width: '100%', padding: '9px 14px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, outline: 'none', background: '#fff', fontFamily: 'inherit', boxSizing: 'border-box' }}>
                {ROLE_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {/* Lien optionnel */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Lien (optionnel)</label>
            <input value={form.link} onChange={e => set('link', e.target.value)} placeholder="/admin/dashboard"
              style={{ width: '100%', padding: '9px 14px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = '#6366f1'}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          {/* Boutons */}
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button type="button" onClick={onClose}
              style={{ flex: 1, padding: '10px', border: '1.5px solid #e5e7eb', borderRadius: 10, background: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
              Annuler
            </button>
            <button type="submit" disabled={loading}
              style={{ flex: 1, padding: '10px', border: 'none', borderRadius: 10, background: loading ? '#a5b4fc' : '#6366f1', color: '#fff', fontWeight: 600, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {loading ? 'Envoi...' : <><Send size={14} /> Envoyer</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Page principale ──────────────────────────────────────────────────────── */
export default function NotificationsAdminPage() {
  const [notifList, setNotifList] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [sendModal, setSendModal] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await notificationAPI.getAll();
      const data = res.data?.data ?? res.data ?? [];
      setNotifList(Array.isArray(data) ? data : []);
    } catch {
      setNotifList([]);
    } finally {
      setLoading(false);
    }
  };

  useState(() => { load(); }, []);

  const handleDelete = async (id) => {
    try {
      await notificationAPI.delete(id);
      setNotifList(prev => prev.filter(n => n._id !== id));
      toast.success('Notification supprimée');
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllAsRead?.();
      setNotifList(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('Toutes les notifications marquées comme lues');
    } catch {
      toast.error('Erreur');
    }
  };

  const unread = notifList.filter(n => !n.isRead).length;
  const broadcasts = notifList.filter(n => n.isBroadcast).length;

  return (
    <div style={{ padding: '0 0 40px', fontFamily: 'Poppins, sans-serif' }}>

      {/* En-tête */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: 0 }}>Notifications</h1>
          <p style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>
            {unread} notification{unread !== 1 ? 's' : ''} non lue{unread !== 1 ? 's' : ''}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {unread > 0 && (
            <button onClick={handleMarkAllRead} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', border: '1.5px solid #e5e7eb', borderRadius: 10, background: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', color: '#374151' }}>
              <CheckCheck size={15} /> Tout marquer lu
            </button>
          )}
          <button onClick={() => setSendModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', border: 'none', borderRadius: 10, background: '#6366f1', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
            <Send size={15} /> Envoyer une notification
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { icon: <Bell size={20} color="#6366f1" />, bg: '#eef2ff', label: 'Total', value: notifList.length },
          { icon: <Bell size={20} color="#3b82f6" />, bg: '#eff6ff', label: 'Non lues', value: unread },
          { icon: <Users size={20} color="#8b5cf6" />, bg: '#f5f3ff', label: 'Diffusions', value: broadcasts },
        ].map((s, i) => (
          <div key={i} style={{ background: '#fff', border: '1px solid #f3f4f6', borderRadius: 16, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {s.icon}
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500 }}>{s.label}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#111827' }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tableau */}
      <div style={{ background: '#fff', border: '1px solid #f3f4f6', borderRadius: 16, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#9ca3af' }}>
            <div style={{ width: 32, height: 32, border: '3px solid #e5e7eb', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
            Chargement...
          </div>
        ) : notifList.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <Bell size={40} color="#d1d5db" style={{ margin: '0 auto 12px' }} />
            <p style={{ color: '#9ca3af', fontWeight: 500 }}>Aucune notification</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #f3f4f6' }}>
                {['Notification', 'Type', 'Destinataire', 'Date', 'Statut', ''].map(h => (
                  <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {notifList.map((n, i) => (
                <tr key={n._id || i} style={{ borderBottom: '1px solid #f9fafb', transition: 'background .15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {/* Notification */}
                  <td style={{ padding: '14px 16px', maxWidth: 320 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: !n.isRead ? '#6366f1' : '#e5e7eb', marginTop: 5, flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: 14, fontWeight: !n.isRead ? 700 : 500, color: '#111827' }}>{n.title}</div>
                        <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 260 }}>{n.message}</div>
                      </div>
                    </div>
                  </td>

                  {/* Type */}
                  <td style={{ padding: '14px 16px' }}>
                    <TypeBadge type={n.type} />
                  </td>

                  {/* Destinataire */}
                  <td style={{ padding: '14px 16px' }}>
                    {n.isBroadcast
                      ? <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 600, background: '#f5f3ff', color: '#7c3aed' }}>Diffusion</span>
                      : n.recipientRole
                        ? <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 600, background: '#eef2ff', color: '#4338ca', textTransform: 'capitalize' }}>{n.recipientRole}</span>
                        : <span style={{ fontSize: 12, color: '#9ca3af' }}>Individuel</span>
                    }
                  </td>

                  {/* Date */}
                  <td style={{ padding: '14px 16px', fontSize: 13, color: '#6b7280', whiteSpace: 'nowrap' }}>
                    {formatDateTime(n.createdAt)}
                  </td>

                  {/* Statut */}
                  <td style={{ padding: '14px 16px' }}>
                    {n.isRead
                      ? <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 600, background: '#f3f4f6', color: '#6b7280' }}>Lue</span>
                      : <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 600, background: '#eef2ff', color: '#4338ca' }}>Non lue</span>
                    }
                  </td>

                  {/* Action */}
                  <td style={{ padding: '14px 16px' }}>
                    <button onClick={() => handleDelete(n._id)}
                      style={{ padding: '6px 10px', border: 'none', borderRadius: 8, background: '#fef2f2', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                      <Trash2 size={14} color="#ef4444" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {sendModal && (
        <SendNotifModal
          onClose={() => setSendModal(false)}
          onSent={() => { setSendModal(false); load(); }}
        />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
