


// pages/student/StudentExamsPage.jsx
import { useState, useEffect, useCallback } from 'react';
import { FileText, Calendar, MapPin, Clock, X, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { examAPI } from '../../services/services';
import { useAuth } from '../../components/context/AuthContext';
import { formatDate } from '../../components/utils/Helpers';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatDateShort = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
};
const formatTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
};
const getDaysLeft = (date) => {
  const diff = new Date(date) - new Date();
  return Math.max(0, Math.ceil(diff / 86400000));
};

// ─── Constants ────────────────────────────────────────────────────────────────
const STATUS_META = {
  planned:   { label: 'Planifié',  bg: '#EEF2FF', color: '#4338CA' },
  ongoing:   { label: 'En cours',  bg: '#FFF7ED', color: '#C2410C' },
  completed: { label: 'Terminé',   bg: '#F0FDF4', color: '#166534' },
  cancelled: { label: 'Annulé',    bg: '#FFF1F2', color: '#9F1239' },
};
const TYPE_META = {
  partiel:    { label: 'Partiel' }, final: { label: 'Final' },
  rattrapage: { label: 'Rattrapage' }, tp: { label: 'TP' },
  oral:       { label: 'Oral' }, projet: { label: 'Projet' },
};

// ─── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({ message, type, onClose }) => {
  if (!message) return null;
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      padding: '12px 18px', borderRadius: 10, fontSize: 13, fontWeight: 500,
      boxShadow: '0 4px 20px rgba(0,0,0,.12)',
      background: type === 'error' ? '#FFF1F2' : '#F0FDF4',
      border: `1px solid ${type === 'error' ? '#FECDD3' : '#BBF7D0'}`,
      color: type === 'error' ? '#9F1239' : '#166534',
      display: 'flex', alignItems: 'center', gap: 10,
    }}>
      {message}
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', lineHeight: 1 }}>
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
  <span style={{
    display: 'inline-flex', alignItems: 'center', padding: '3px 9px',
    borderRadius: 20, fontSize: 11, fontWeight: 600, background: bg, color,
  }}>
    {children}
  </span>
);

// ─── Countdown Card (prochain examen) ─────────────────────────────────────────
function UpcomingCard({ exam }) {
  const days = getDaysLeft(exam.startDate);
  const urgent = days <= 3;
  const soon = days <= 7;

  return (
    <div style={{
      background: '#fff', borderRadius: 14,
      border: `2px solid ${urgent ? '#FEE2E2' : soon ? '#FEF3C7' : '#E0E7FF'}`,
      padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12,
      boxShadow: '0 2px 8px rgba(99,102,241,.06)',
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: urgent ? '#FFF1F2' : '#EEF2FF',
          }}>
            <FileText size={15} color={urgent ? '#F43F5E' : '#6366F1'} />
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: 0, lineHeight: 1.3 }}>{exam.title}</p>
            <p style={{ fontSize: 11, color: '#9CA3AF', margin: 0 }}>
              {exam.ue?.code} · {exam.session}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 8 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#6B7280' }}>
            <Calendar size={12} /> {formatDateShort(exam.startDate)}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#6B7280' }}>
            <Clock size={12} /> {formatTime(exam.startDate)}
          </span>
          {(exam.room?.name || exam.room) && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#6B7280' }}>
              <MapPin size={12} /> {exam.room?.name || exam.room}
            </span>
          )}
        </div>
      </div>
      <div style={{ textAlign: 'center', flexShrink: 0 }}>
        <div style={{
          width: 56, height: 56, borderRadius: 12, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: urgent ? '#FFF1F2' : soon ? '#FFFBEB' : '#EEF2FF',
        }}>
          <span style={{ fontSize: 20, fontWeight: 800, color: urgent ? '#F43F5E' : soon ? '#D97706' : '#6366F1', lineHeight: 1 }}>
            {days}
          </span>
          <span style={{ fontSize: 10, color: urgent ? '#F43F5E' : soon ? '#D97706' : '#9CA3AF', fontWeight: 600 }}>
            {days <= 1 ? 'DEMAIN' : 'JOURS'}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── ExamCard ─────────────────────────────────────────────────────────────────
function ExamCard({ exam }) {
  const statusMeta = STATUS_META[exam.status] || STATUS_META.planned;
  const typeMeta = TYPE_META[exam.type] || { label: exam.type };
  const isPast = new Date(exam.startDate) < new Date();

  return (
    <div style={{
      background: '#fff', borderRadius: 14, border: '1px solid #F3F4F6',
      overflow: 'hidden', opacity: isPast ? 0.8 : 1,
      boxShadow: '0 1px 3px rgba(0,0,0,.04)', transition: 'box-shadow .2s, transform .2s',
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(99,102,241,.10)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,.04)'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      {/* Header */}
      <div style={{ padding: '14px 16px 12px', borderBottom: '1px solid #F9FAFB', background: '#FAFAFA' }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: '0 0 4px', lineHeight: 1.4 }}>
          {exam.title}
        </p>
        <p style={{ fontSize: 12, color: '#9CA3AF', margin: 0 }}>
          {exam.ue?.code} · {exam.ue?.title}
        </p>
      </div>

      {/* Badges */}
      <div style={{ padding: '10px 16px 8px', display: 'flex', flexWrap: 'wrap', gap: 5 }}>
        <Badge bg="#EEF2FF" color="#4338CA">{typeMeta.label}</Badge>
        <Badge bg="#F5F3FF" color="#7C3AED">{exam.session}</Badge>
        <Badge bg={statusMeta.bg} color={statusMeta.color}>{statusMeta.label}</Badge>
      </div>

      {/* Infos */}
      <div style={{ padding: '4px 16px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <InfoRow icon={Calendar} text={`${formatDateShort(exam.startDate)} à ${formatTime(exam.startDate)}`} />
        {exam.endDate && <InfoRow icon={Clock} text={`Fin : ${formatTime(exam.endDate)} · ${exam.duration || '—'} min`} />}
        {(exam.room?.name || exam.room) && <InfoRow icon={MapPin} text={`Salle : ${exam.room?.name || exam.room}`} />}
        <InfoRow icon={BookOpen} text={`Note max : ${exam.maxScore || 20}`} />
      </div>

      {/* Instructions */}
      {exam.instructions && (
        <div style={{ margin: '0 16px 14px', padding: '10px 12px', background: '#F8FAFC', borderRadius: 8, borderLeft: '3px solid #6366F1' }}>
          <p style={{ fontSize: 12, color: '#6B7280', margin: 0, lineHeight: 1.6 }}>{exam.instructions}</p>
        </div>
      )}
    </div>
  );
}

const InfoRow = ({ icon: Icon, text }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
    <Icon size={12} color="#C4C9D4" />
    <span style={{ fontSize: 12, color: '#6B7280' }}>{text}</span>
  </div>
);

// ─── Pagination ───────────────────────────────────────────────────────────────
const Pagination = ({ page, total, limit, onPageChange }) => {
  const totalPages = Math.ceil(total / limit);
  if (totalPages <= 1) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '16px 0' }}>
      <button onClick={() => onPageChange(page - 1)} disabled={page === 1}
        style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #E5E7EB', background: '#fff', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? .4 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <ChevronLeft size={14} />
      </button>
      <span style={{ fontSize: 13, color: '#6B7280' }}>Page {page} / {Math.ceil(total / limit)}</span>
      <button onClick={() => onPageChange(page + 1)} disabled={page === totalPages}
        style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #E5E7EB', background: '#fff', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? .4 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <ChevronRight size={14} />
      </button>
    </div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function StudentExamsPage() {
  const { user } = useAuth();
  const [toast, setToast] = useState({ message: '', type: '' });
  const [exams, setExams] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(9);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ session: '', status: '' });

  const loadExams = useCallback(async () => {
    if (!user?._id) return;
    setLoading(true);
    try {
      // isPublished: true → seuls les examens publiés par l'admin sont visibles
      // Le backend filtre automatiquement selon le programme/promotion de l'étudiant via JWT
      const params = { page, limit, isPublished: true, ...filters };
      Object.keys(params).forEach(k => (params[k] === '' || params[k] == null) && delete params[k]);
      const res = await examAPI.getAll(params);
      const data = res?.data?.data ?? res?.data ?? [];
      setExams(Array.isArray(data) ? data : []);
      setTotal(res?.data?.total ?? res?.total ?? 0);
    } catch (err) {
      setToast({ message: 'Erreur lors du chargement des examens', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [user?._id, page, limit, filters]);

  useEffect(() => { loadExams(); }, [loadExams]);

  // Sépare prochains vs passés
  const now = new Date();
  const upcoming = exams.filter(e => new Date(e.startDate) >= now);
  const past = exams.filter(e => new Date(e.startDate) < now);

  const filterStyle = {
    padding: '7px 12px', border: '1px solid #E5E7EB', borderRadius: 8,
    fontSize: 13, background: '#fff', cursor: 'pointer', outline: 'none', color: '#374151',
  };

  return (
    <div style={{
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '24px', maxWidth: 1200, margin: '0 auto',
      minHeight: '100vh', background: '#F8FAFC',
    }}>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: '' })} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* En-tête */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
          <FileText size={22} color="#6366F1" /> Mes Examens
        </h1>
        <p style={{ fontSize: 13, color: '#9CA3AF', marginTop: 4 }}>Calendrier de vos examens publiés</p>
      </div>

      {/* ── Prochains examens (top 3) ── */}
      {!loading && upcoming.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
            Prochains examens
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {upcoming.slice(0, 3).map(exam => (
              <UpcomingCard key={exam._id} exam={exam} />
            ))}
          </div>
        </div>
      )}

      {/* ── Filtres ── */}
      <div style={{
        background: '#fff', borderRadius: 12, border: '1px solid #F3F4F6',
        padding: '12px 16px', marginBottom: 20, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center',
      }}>
        <select value={filters.session} onChange={e => { setFilters(f => ({ ...f, session: e.target.value })); setPage(1); }} style={filterStyle}>
          <option value="">Toutes les sessions</option>
          <option value="session1">Session 1</option>
          <option value="session2">Session 2</option>
          <option value="rattrapage">Rattrapage</option>
        </select>
        <select value={filters.status} onChange={e => { setFilters(f => ({ ...f, status: e.target.value })); setPage(1); }} style={filterStyle}>
          <option value="">Tous les statuts</option>
          <option value="planned">Planifié</option>
          <option value="ongoing">En cours</option>
          <option value="completed">Terminé</option>
        </select>
        {(filters.session || filters.status) && (
          <button
            onClick={() => { setFilters({ session: '', status: '' }); setPage(1); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <X size={12} /> Réinitialiser
          </button>
        )}
        <span style={{ marginLeft: 'auto', fontSize: 12, color: '#9CA3AF' }}>
          {total} examen{total !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── Grille ── */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
          <Spinner size={32} />
        </div>
      ) : exams.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #F3F4F6', padding: '60px 24px', textAlign: 'center' }}>
          <FileText size={40} color="#D1D5DB" style={{ marginBottom: 12 }} />
          <p style={{ fontSize: 15, color: '#9CA3AF', margin: 0 }}>Aucun examen publié pour le moment</p>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
            {exams.map(exam => <ExamCard key={exam._id} exam={exam} />)}
          </div>
          <Pagination page={page} total={total} limit={limit} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}