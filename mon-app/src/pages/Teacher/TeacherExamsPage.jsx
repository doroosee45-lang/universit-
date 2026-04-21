


// pages/teacher/TeacherExamsPage.jsx
import { useState, useEffect, useCallback } from 'react';
import { Calendar, MapPin, Clock, X, Users, BookOpen, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { examAPI } from '../../services/services';
import { useAuth } from '../../components/context/AuthContext';
import { formatDate } from '../../components/utils/Helpers';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatDateShort = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
};
const formatTime = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
};
const isToday = (date) => {
  const d = new Date(date), now = new Date();
  return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
};
const isTomorrow = (date) => {
  const d = new Date(date);
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  return d.getDate() === tomorrow.getDate() && d.getMonth() === tomorrow.getMonth() && d.getFullYear() === tomorrow.getFullYear();
};
const getDayLabel = (date) => {
  if (isToday(date)) return 'Aujourd\'hui';
  if (isTomorrow(date)) return 'Demain';
  return null;
};

// ─── Constants ────────────────────────────────────────────────────────────────
const STATUS_META = {
  planned:   { label: 'Planifié',  bg: '#EEF2FF', color: '#4338CA', border: '#C7D2FE' },
  ongoing:   { label: 'En cours',  bg: '#FFF7ED', color: '#C2410C', border: '#FED7AA' },
  completed: { label: 'Terminé',   bg: '#F0FDF4', color: '#166534', border: '#BBF7D0' },
  cancelled: { label: 'Annulé',    bg: '#FFF1F2', color: '#9F1239', border: '#FECDD3' },
};

// ─── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({ message, type, onClose }) => {
  if (!message) return null;
  return (
    <div style={{
      position: 'fixed', top: 20, right: 20, zIndex: 9999,
      padding: '12px 18px', borderRadius: 10, fontSize: 13, fontWeight: 500,
      boxShadow: '0 4px 20px rgba(0,0,0,.12)',
      background: type === 'error' ? '#FFF1F2' : '#F0FDF4',
      border: `1px solid ${type === 'error' ? '#FECDD3' : '#BBF7D0'}`,
      color: type === 'error' ? '#9F1239' : '#166534',
      display: 'flex', alignItems: 'center', gap: 10,
    }}>
      {message}
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>
        <X size={14} />
      </button>
    </div>
  );
};

// ─── Spinner ─────────────────────────────────────────────────────────────────
const Spinner = ({ size = 24 }) => (
  <div style={{
    width: size, height: size, borderRadius: '50%',
    border: '2px solid #E0E7FF', borderTopColor: '#6366F1',
    animation: 'spin .75s linear infinite', display: 'inline-block',
  }} />
);

// ─── Badge ───────────────────────────────────────────────────────────────────
const Badge = ({ children, bg, color }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 9px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: bg, color }}>
    {children}
  </span>
);

// ─── SurveillanceCard ─────────────────────────────────────────────────────────
function SurveillanceCard({ exam }) {
  const statusMeta = STATUS_META[exam.status] || STATUS_META.planned;
  const dayLabel = getDayLabel(exam.startDate);
  const isOngoing = exam.status === 'ongoing';

  return (
    <div style={{
      background: '#fff', borderRadius: 14,
      border: `1px solid ${isOngoing ? '#FED7AA' : '#F3F4F6'}`,
      overflow: 'hidden', transition: 'box-shadow .2s, transform .2s',
      boxShadow: isOngoing ? '0 4px 16px rgba(249,115,22,.12)' : '0 1px 3px rgba(0,0,0,.04)',
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(99,102,241,.12)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = isOngoing ? '0 4px 16px rgba(249,115,22,.12)' : '0 1px 3px rgba(0,0,0,.04)'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      {/* ── Header ── */}
      <div style={{
        padding: '14px 18px 12px',
        background: isOngoing ? 'linear-gradient(135deg,#FFF7ED,#FFEDD5)' : '#FAFAFA',
        borderBottom: '1px solid #F3F4F6',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: '0 0 4px', lineHeight: 1.4, wordBreak: 'break-word' }}>
              {exam.title}
            </p>
            <p style={{ fontSize: 12, color: '#9CA3AF', margin: 0 }}>
              {exam.ue?.code} · {exam.ue?.title}
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
            <Badge bg={statusMeta.bg} color={statusMeta.color}>{statusMeta.label}</Badge>
            {dayLabel && (
              <Badge bg={dayLabel === 'Aujourd\'hui' ? '#FFF7ED' : '#EEF2FF'} color={dayLabel === 'Aujourd\'hui' ? '#C2410C' : '#4338CA'}>
                {dayLabel}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* ── Corps ── */}
      <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* Date & créneau */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
          background: '#F8FAFC', borderRadius: 10,
        }}>
          <Calendar size={16} color="#6366F1" />
          <div>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#374151', margin: 0 }}>
              {formatDateShort(exam.startDate)}
            </p>
            <p style={{ fontSize: 12, color: '#9CA3AF', margin: 0 }}>
              {formatTime(exam.startDate)} → {formatTime(exam.endDate)}
              {exam.duration && ` · ${exam.duration} min`}
            </p>
          </div>
        </div>

        {/* Salle */}
        <InfoRow icon={MapPin} label="Salle" value={exam.room?.name || exam.room || '—'} />

        {/* Session */}
        <InfoRow icon={Users} label="Session" value={exam.session || '—'} />

        {/* Filière / Promotion */}
        {(exam.program?.name || exam.promotion) && (
          <InfoRow
            icon={BookOpen}
            label="Filière"
            value={[exam.program?.name, exam.promotion].filter(Boolean).join(' · ')}
          />
        )}

        {/* Instructions si présentes */}
        {exam.instructions && (
          <div style={{
            marginTop: 4, padding: '10px 12px', background: '#FFFBEB',
            borderRadius: 8, borderLeft: '3px solid #F59E0B',
          }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: '#92400E', margin: '0 0 3px', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Consignes
            </p>
            <p style={{ fontSize: 12, color: '#78350F', margin: 0, lineHeight: 1.6 }}>
              {exam.instructions}
            </p>
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div style={{
        padding: '10px 18px', borderTop: '1px solid #F9FAFB',
        background: '#FAFAFA', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span style={{ fontSize: 11, color: '#9CA3AF' }}>
          Note max : <strong style={{ color: '#374151' }}>{exam.maxScore || 20}</strong>
        </span>
        <span style={{ fontSize: 11, color: exam.isPublished ? '#166534' : '#9CA3AF', fontWeight: 600 }}>
          {exam.isPublished ? '● Publié' : '○ Non publié'}
        </span>
      </div>
    </div>
  );
}

const InfoRow = ({ icon: Icon, label, value }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    <Icon size={13} color="#C4C9D4" style={{ flexShrink: 0 }} />
    <span style={{ fontSize: 12, color: '#9CA3AF', minWidth: 48 }}>{label} :</span>
    <span style={{ fontSize: 12, color: '#374151', fontWeight: 500 }}>{value}</span>
  </div>
);

// ─── Timeline groupée par date ────────────────────────────────────────────────
function TimelineSection({ label, exams }) {
  if (!exams.length) return null;
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 1 }}>
          {label}
        </span>
        <div style={{ flex: 1, height: 1, background: '#F3F4F6' }} />
        <span style={{
          fontSize: 11, padding: '2px 8px', borderRadius: 10,
          background: '#EEF2FF', color: '#6366F1', fontWeight: 600,
        }}>
          {exams.length}
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
        {exams.map(exam => <SurveillanceCard key={exam._id} exam={exam} />)}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function TeacherExamsPage() {
  const { user } = useAuth();
  const [toast, setToast] = useState({ message: '', type: '' });
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('upcoming'); // 'upcoming' | 'past' | 'all'

  const loadExams = useCallback(async () => {
    if (!user?._id) return;
    setLoading(true);
    try {
      // Appel API dédié au planning de surveillance du professeur connecté
      const res = await examAPI.getTeacherExams();
      const data = res.data?.data ?? res.data ?? [];
      setExams(Array.isArray(data) ? [...data].sort((a, b) => new Date(a.startDate) - new Date(b.startDate)) : []);
    } catch (err) {
      setToast({ message: 'Erreur lors du chargement des surveillances', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  useEffect(() => { loadExams(); }, [loadExams]);

  const now = new Date();
  const upcoming = exams.filter(e => new Date(e.startDate) >= now);
  const past = exams.filter(e => new Date(e.startDate) < now);
  const todayExams = exams.filter(e => isToday(e.startDate));

  const displayed = filter === 'upcoming' ? upcoming : filter === 'past' ? past : exams;

  const tabStyle = (active) => ({
    padding: '7px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
    cursor: 'pointer', border: 'none', transition: 'all .15s',
    background: active ? '#6366F1' : 'transparent',
    color: active ? '#fff' : '#6B7280',
  });

  return (
    <div style={{
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '24px', maxWidth: 1200, margin: '0 auto',
      minHeight: '100vh', background: '#F8FAFC',
    }}>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: '' })} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* En-tête */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Calendar size={22} color="#6366F1" /> Programme de Surveillance
          </h1>
          <p style={{ fontSize: 13, color: '#9CA3AF', marginTop: 4 }}>Vos examens à surveiller</p>
        </div>

        {/* Compteurs */}
        <div style={{ display: 'flex', gap: 10 }}>
          {[
            { label: 'Total', value: exams.length, bg: '#EEF2FF', color: '#6366F1' },
            { label: 'À venir', value: upcoming.length, bg: '#F0FDF4', color: '#166534' },
            ...(todayExams.length > 0 ? [{ label: "Aujourd'hui", value: todayExams.length, bg: '#FFF7ED', color: '#C2410C' }] : []),
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center', padding: '8px 14px', background: s.bg, borderRadius: 10 }}>
              <p style={{ fontSize: 20, fontWeight: 800, color: s.color, margin: 0 }}>{s.value}</p>
              <p style={{ fontSize: 11, color: s.color, margin: 0, fontWeight: 600 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Alerte si examen aujourd'hui */}
      {todayExams.length > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px',
          background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 12, marginBottom: 20,
        }}>
          <AlertCircle size={18} color="#F97316" />
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#C2410C', margin: 0 }}>
              Vous avez {todayExams.length} surveillance{todayExams.length > 1 ? 's' : ''} aujourd'hui
            </p>
            <p style={{ fontSize: 12, color: '#9A3412', margin: 0 }}>
              {todayExams.map(e => `${e.title} (${formatTime(e.startDate)})`).join(' · ')}
            </p>
          </div>
        </div>
      )}

      {/* Onglets */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#fff', border: '1px solid #F3F4F6', borderRadius: 10, padding: 4, width: 'fit-content' }}>
        {[
          { key: 'upcoming', label: `À venir (${upcoming.length})` },
          { key: 'past', label: `Passés (${past.length})` },
          { key: 'all', label: `Tous (${exams.length})` },
        ].map(tab => (
          <button key={tab.key} onClick={() => setFilter(tab.key)} style={tabStyle(filter === tab.key)}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenu */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 280 }}>
          <Spinner size={36} />
        </div>
      ) : displayed.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #F3F4F6', padding: '64px 24px', textAlign: 'center' }}>
          <Calendar size={40} color="#D1D5DB" style={{ marginBottom: 12 }} />
          <p style={{ fontSize: 15, color: '#9CA3AF', margin: 0 }}>
            {filter === 'upcoming' ? 'Aucune surveillance à venir' : filter === 'past' ? 'Aucune surveillance passée' : 'Aucune surveillance programmée'}
          </p>
        </div>
      ) : (
        <div>
          {/* Groupement : aujourd'hui → cette semaine → autres (uniquement pour "À venir") */}
          {filter === 'upcoming' ? (
            <>
              <TimelineSection
                label="Aujourd'hui"
                exams={displayed.filter(e => isToday(e.startDate))}
              />
              <TimelineSection
                label="Cette semaine"
                exams={displayed.filter(e => {
                  if (isToday(e.startDate)) return false;
                  const d = new Date(e.startDate);
                  const in7 = new Date(); in7.setDate(in7.getDate() + 7);
                  return d <= in7;
                })}
              />
              <TimelineSection
                label="Plus tard"
                exams={displayed.filter(e => {
                  if (isToday(e.startDate)) return false;
                  const d = new Date(e.startDate);
                  const in7 = new Date(); in7.setDate(in7.getDate() + 7);
                  return d > in7;
                })}
              />
            </>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
              {displayed.map(exam => <SurveillanceCard key={exam._id} exam={exam} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}