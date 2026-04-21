// pages/jury/TeacherJuryPage.jsx
import { useState, useEffect, useCallback } from 'react';
import { Award, CheckCircle, Eye, FileText, Search, X, GraduationCap, Users, ShieldCheck, ChevronLeft, ChevronRight, ThumbsUp } from 'lucide-react';
import { deliberationAPI } from '../../services/services';
import { useAuth } from '../../components/context/AuthContext';

/* ─── Google Font injection ─────────────────────────────────────────────── */
const FONT_LINK = document.createElement('link');
FONT_LINK.rel = 'stylesheet';
FONT_LINK.href = 'https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap';
document.head.appendChild(FONT_LINK);

/* ─── Design tokens (identique à DiplomasPage) ─────────────────────────── */
const T = {
  navy:    '#0F172A',
  navyMid: '#1E293B',
  navyLt:  '#334155',
  slate:   '#64748B',
  silver:  '#94A3B8',
  line:    '#E2E8F0',
  bg:      '#F8FAFC',
  white:   '#FFFFFF',
  gold:    '#F59E0B',
  goldLt:  '#FEF3C7',
  goldDk:  '#92400E',
  emerald: '#059669',
  emerLt:  '#D1FAE5',
  emerDk:  '#065F46',
  indigo:  '#4F46E5',
  indiLt:  '#EEF2FF',
  indiDk:  '#3730A3',
  rose:    '#E11D48',
  roseLt:  '#FFE4E6',
  roseDk:  '#9F1239',
  cyan:    '#0891B2',
  cyanLt:  '#CFFAFE',
  cyanDk:  '#164E63',
  font:    "'Sora', sans-serif",
  mono:    "'JetBrains Mono', monospace",
};

/* ─── Helpers ───────────────────────────────────────────────────────────── */
const getMention = (avg) => {
  if (avg >= 16) return { label: 'Très Bien',  color: '#9333EA', bg: '#F3E8FF' };
  if (avg >= 14) return { label: 'Bien',        color: T.indigo,  bg: T.indiLt };
  if (avg >= 12) return { label: 'Assez Bien',  color: T.cyan,    bg: T.cyanLt };
  if (avg >= 10) return { label: 'Passable',    color: T.emerald, bg: T.emerLt };
  return             { label: 'Non validé',    color: T.rose,    bg: T.roseLt };
};

/* ─── Toast ─────────────────────────────────────────────────────────────── */
function useToast() {
  const [toasts, setToasts] = useState([]);
  const show = useCallback((msg, type = 'success') => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);

  const ToastContainer = () => (
    <div style={{ position: 'fixed', bottom: 28, right: 28, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          padding: '12px 20px', borderRadius: 10, fontSize: 13, fontWeight: 500,
          fontFamily: T.font, background: t.type === 'error' ? T.roseLt : T.emerLt,
          color: t.type === 'error' ? T.roseDk : T.emerDk,
          border: `1px solid ${t.type === 'error' ? '#FECDD3' : '#A7F3D0'}`,
          boxShadow: '0 8px 24px rgba(0,0,0,.12)', animation: 'slideUp .25s ease',
        }}>{t.msg}</div>
      ))}
    </div>
  );
  return { toast: show, ToastContainer };
}

/* ─── Spinner ───────────────────────────────────────────────────────────── */
const Spinner = ({ size = 24 }) => (
  <div style={{ width: size, height: size, border: `2px solid ${T.line}`, borderTopColor: T.indigo, borderRadius: '50%', animation: 'spin .75s linear infinite', flexShrink: 0 }} />
);

/* ─── Badge ─────────────────────────────────────────────────────────────── */
const Badge = ({ children, bg, color }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, fontFamily: T.font, background: bg, color, letterSpacing: .3 }}>{children}</span>
);

/* ─── Button ────────────────────────────────────────────────────────────── */
function Btn({ children, onClick, variant = 'primary', size = 'md', loading, disabled, type }) {
  const V = {
    primary:   { bg: T.navy,    color: T.white,  border: 'none', hover: T.navyMid },
    gold:      { bg: T.gold,    color: T.navy,   border: 'none', hover: '#D97706' },
    secondary: { bg: T.white,   color: T.navyLt, border: `1px solid ${T.line}`, hover: T.bg },
    danger:    { bg: T.roseLt,  color: T.roseDk, border: `1px solid #FECDD3`, hover: '#FFD6DA' },
    ghost:     { bg: 'transparent', color: T.slate, border: 'none', hover: T.bg },
  };
  const S = { sm: { padding: '5px 11px', fontSize: 11 }, md: { padding: '9px 16px', fontSize: 13 }, lg: { padding: '11px 22px', fontSize: 14 } };
  const v = V[variant];
  return (
    <button type={type} onClick={onClick} disabled={disabled || loading}
      style={{ background: v.bg, color: v.color, border: v.border, ...S[size], borderRadius: 9, fontWeight: 600, cursor: (disabled || loading) ? 'not-allowed' : 'pointer', opacity: (disabled || loading) ? .55 : 1, display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: T.font, transition: 'background .15s, transform .1s', letterSpacing: .2 }}
      onMouseEnter={e => { if (!disabled && !loading) e.currentTarget.style.background = v.hover; }}
      onMouseLeave={e => { e.currentTarget.style.background = v.bg; }}
      onMouseDown={e  => { if (!disabled && !loading) e.currentTarget.style.transform = 'scale(.97)'; }}
      onMouseUp={e    => { e.currentTarget.style.transform = 'scale(1)'; }}>
      {loading && <Spinner size={14} />}
      {children}
    </button>
  );
}

/* ─── Card ──────────────────────────────────────────────────────────────── */
const Card = ({ children, style }) => (
  <div style={{ background: T.white, borderRadius: 14, border: `1px solid ${T.line}`, overflow: 'hidden', ...style }}>{children}</div>
);

/* ─── Select ────────────────────────────────────────────────────────────── */
function Sel({ value, onChange, options, style }) {
  return (
    <div style={{ marginBottom: 16, ...style }}>
      <select value={value} onChange={onChange} style={{ width: '100%', padding: '9px 13px', border: `1.5px solid ${T.line}`, borderRadius: 9, fontSize: 13, fontFamily: T.font, background: T.white, outline: 'none', cursor: 'pointer', color: T.navy }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

/* ─── Modal ─────────────────────────────────────────────────────────────── */
function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    const h = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  if (!isOpen) return null;
  const widths = { sm: 400, md: 580, lg: 780, xl: 980 };
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.5)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: T.white, borderRadius: 18, width: '100%', maxWidth: widths[size], maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,.22)', animation: 'popIn .22s cubic-bezier(.34,1.56,.64,1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: `1px solid ${T.line}`, background: T.bg }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: T.navy, fontFamily: T.font }}>{title}</span>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${T.line}`, background: T.white, cursor: 'pointer', fontSize: 18, color: T.slate, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ─── Stat Card ─────────────────────────────────────────────────────────── */
function StatCard({ title, value, icon, accent }) {
  return (
    <div style={{ background: T.white, borderRadius: 14, border: `1px solid ${T.line}`, padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 16, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: accent, borderRadius: '14px 0 0 14px' }} />
      <div style={{ width: 46, height: 46, borderRadius: 12, background: accent + '18', color: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icon}</div>
      <div>
        <p style={{ fontSize: 11, color: T.silver, fontWeight: 600, letterSpacing: .5, textTransform: 'uppercase', margin: 0 }}>{title}</p>
        <p style={{ fontSize: 28, fontWeight: 700, color: T.navy, margin: 0, fontFamily: T.mono, lineHeight: 1.2 }}>{value}</p>
      </div>
    </div>
  );
}

/* ─── Section Header ────────────────────────────────────────────────────── */
const SectionHeader = ({ title, sub }) => (
  <div style={{ padding: '16px 20px', borderBottom: `1px solid ${T.line}`, background: T.bg }}>
    <h2 style={{ fontSize: 13, fontWeight: 700, color: T.navy, margin: 0 }}>{title}</h2>
    {sub && <p style={{ fontSize: 11, color: T.silver, margin: '3px 0 0', letterSpacing: .2 }}>{sub}</p>}
  </div>
);

/* ─── Table ─────────────────────────────────────────────────────────────── */
function Table({ columns, data, loading }) {
  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 56 }}><Spinner size={36} /></div>;
  if (!data?.length) return <div style={{ textAlign: 'center', padding: 56, color: T.silver }}><GraduationCap size={40} style={{ margin: '0 auto 12px', display: 'block', opacity: .35 }} /><p style={{ fontFamily: T.font, fontSize: 13 }}>Aucun étudiant à délibérer</p></div>;
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: T.font }}>
        <thead><tr style={{ background: T.bg }}>
          {columns.map(c => <th key={c.key} style={{ padding: '11px 18px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: T.silver, letterSpacing: .6, textTransform: 'uppercase', borderBottom: `1px solid ${T.line}` }}>{c.header}</th>)}
        </tr></thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} style={{ borderBottom: `1px solid ${T.line}`, transition: 'background .12s' }} onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'} onMouseLeave={e => e.currentTarget.style.background = T.white}>
              {columns.map(c => <td key={c.key} style={{ padding: '13px 18px', fontSize: 13, color: T.navyLt, verticalAlign: 'middle' }}>{c.render ? c.render(row[c.key], row) : row[c.key]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Pagination ────────────────────────────────────────────────────────── */
function Pagination({ page, total, limit, onPageChange }) {
  const pages = Math.ceil(total / limit);
  if (pages <= 1) return null;
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, padding: '16px' }}>
      <button onClick={() => onPageChange(page - 1)} disabled={page === 1} style={{ width: 32, height: 32, border: `1px solid ${T.line}`, borderRadius: 8, background: T.white, cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? .4 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronLeft size={16} color={T.slate} /></button>
      <span style={{ fontSize: 12, color: T.slate, fontFamily: T.font }}>Page <strong>{page}</strong> sur {pages}</span>
      <button onClick={() => onPageChange(page + 1)} disabled={page === pages} style={{ width: 32, height: 32, border: `1px solid ${T.line}`, borderRadius: 8, background: T.white, cursor: page === pages ? 'not-allowed' : 'pointer', opacity: page === pages ? .4 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronRight size={16} color={T.slate} /></button>
    </div>
  );
}

/* ─── Modal de délibération (validation individuelle) ────────────────────── */
function DeliberationModal({ student, onValidate, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [remarks, setRemarks] = useState('');
  const { toast, ToastContainer } = useToast();
  const mention = student?.generalAverage ? getMention(student.generalAverage) : null;

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await deliberationAPI.validate({ studentId: student._id, remarks });
      toast(`Délibération validée pour ${student.firstName} ${student.lastName}`);
      setTimeout(onValidate, 900);
    } catch (err) {
      toast(err.message || 'Erreur lors de la validation', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <ToastContainer />
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 16, background: T.navy, borderRadius: 12, marginBottom: 24 }}>
        <div style={{ width: 44, height: 44, borderRadius: 10, background: T.gold, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><GraduationCap size={22} color={T.navy} /></div>
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 700, color: T.white, fontSize: 14, margin: 0 }}>{student?.firstName} {student?.lastName}</p>
          <p style={{ fontSize: 11, color: T.silver, margin: '2px 0 0', fontFamily: T.mono }}>{student?.studentId}</p>
          <p style={{ fontSize: 11, color: T.silver, margin: '1px 0 0' }}>{student?.program?.name}</p>
        </div>
        {mention && <Badge bg={mention.bg} color={mention.color}>{student.generalAverage}/20 — {mention.label}</Badge>}
      </div>
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: T.navy, margin: '0 0 8px' }}>Observations du jury</p>
        <textarea rows={3} value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Remarques, décisions spéciales..." style={{ width: '100%', padding: '10px', border: `1px solid ${T.line}`, borderRadius: 9, fontSize: 13, fontFamily: T.font, resize: 'vertical' }} />
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <Btn variant="secondary" onClick={onCancel} style={{ flex: 1, justifyContent: 'center' }}>Annuler</Btn>
        <Btn variant="gold" onClick={handleSubmit} loading={loading} style={{ flex: 1, justifyContent: 'center' }}><ThumbsUp size={15} /> Valider</Btn>
      </div>
    </div>
  );
}

/* ─── Modal de génération d'attestation / diplôme ───────────────────────── */
function CertificateModal({ student, onGenerate, onCancel }) {
  const [loading, setLoading] = useState(false);
  const { toast, ToastContainer } = useToast();

  const handleGenerate = async () => {
    setLoading(true);
    try {
      await deliberationAPI.generateCertificate({ studentId: student._id });
      toast(`Certificat généré pour ${student.firstName} ${student.lastName}`);
      setTimeout(onGenerate, 900);
    } catch (err) {
      toast(err.message || 'Erreur de génération', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px', textAlign: 'center' }}>
      <ToastContainer />
      <div style={{ width: 64, height: 64, background: T.goldLt, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}><Award size={32} color={T.goldDk} /></div>
      <h3 style={{ fontSize: 18, fontWeight: 700, color: T.navy, margin: '0 0 8px' }}>Génération du diplôme</h3>
      <p style={{ fontSize: 13, color: T.slate, marginBottom: 24 }}>Voulez-vous émettre le diplôme officiel pour <strong>{student.firstName} {student.lastName}</strong> ?</p>
      <div style={{ display: 'flex', gap: 10 }}>
        <Btn variant="secondary" onClick={onCancel} style={{ flex: 1 }}>Annuler</Btn>
        <Btn variant="gold" onClick={handleGenerate} loading={loading} style={{ flex: 1 }}><FileText size={15} /> Générer</Btn>
      </div>
    </div>
  );
}

/* ─── Composant principal (TeacherJury) ─────────────────────────────────── */
export default function TeacherJury() {
  const { user, isAdmin, isSuperAdmin } = useAuth();
  const { toast, ToastContainer } = useToast();

  const [students, setStudents] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [programFilter, setProgramFilter] = useState('');
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear() + '-' + (new Date().getFullYear() + 1));
  const [session, setSession] = useState('principale');
  const [delibModal, setDelibModal] = useState({ open: false, student: null });
  const [certModal, setCertModal] = useState({ open: false, student: null });
  const [stats, setStats] = useState({ eligible: 0, deliberated: 0, certified: 0 });

  // Charger les étudiants éligibles via l'API deliberation
  const loadStudents = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const params = { page, limit, academicYear, session };
      if (search) params.search = search;
      if (programFilter) params.programId = programFilter;
      const response = await deliberationAPI.getEligibleStudents(params);
      const data = response?.data?.data || response?.data || [];
      const totalCount = response?.data?.total || response?.total || data.length;
      setStudents(Array.isArray(data) ? data : []);
      setTotal(totalCount);
    } catch (err) {
      console.error(err);
      toast(err.message || 'Erreur chargement étudiants', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, programFilter, academicYear, session, user, toast]);

  // Charger les statistiques
  const loadStats = useCallback(async () => {
    if (!user) return;
    try {
      const res = await deliberationAPI.getStats({ academicYear });
      setStats(res?.data || { eligible: 0, deliberated: 0, certified: 0 });
    } catch (err) {
      console.error(err);
    }
  }, [academicYear, user]);

  useEffect(() => {
    if (user) {
      loadStudents();
      loadStats();
    }
  }, [loadStudents, loadStats, user]);

  const refresh = () => {
    loadStudents();
    loadStats();
  };

  const columns = [
    { header: 'Étudiant', key: 'student', render: (_, r) => (
      <div><p style={{ fontWeight: 600, color: T.navy, margin: 0 }}>{r.firstName} {r.lastName}</p><p style={{ fontSize: 11, color: T.silver, margin: 0, fontFamily: T.mono }}>{r.studentId}</p></div>
    )},
    { header: 'Filière', key: 'program', render: (_, r) => <span>{r.program?.name || '—'}</span> },
    { header: 'Moyenne', key: 'generalAverage', render: (v) => v != null ? <span style={{ fontWeight: 700, color: getMention(v).color, fontFamily: T.mono }}>{v}/20</span> : '—' },
    { header: 'Mention', key: 'mention', render: (_, r) => r.generalAverage ? (() => { const m = getMention(r.generalAverage); return <Badge bg={m.bg} color={m.color}>{m.label}</Badge> })() : '—' },
    { header: 'Statut délibération', key: 'hasDeliberated', render: (v) => <Badge bg={v ? T.emerLt : T.goldLt} color={v ? T.emerDk : T.goldDk}>{v ? 'Validé' : 'En attente'}</Badge> },
    { header: 'Certificat', key: 'hasCertificate', render: (v) => v ? <CheckCircle size={14} color={T.emerald} /> : <span style={{ color: T.silver }}>—</span> },
    { header: 'Actions', key: '_id', render: (_, r) => (
      <div style={{ display: 'flex', gap: 6 }}>
        {!r.hasDeliberated && (isAdmin || isSuperAdmin) && (
          <Btn size="sm" variant="gold" onClick={() => setDelibModal({ open: true, student: r })}><ThumbsUp size={13} /> Délibérer</Btn>
        )}
        {r.hasDeliberated && !r.hasCertificate && (
          <Btn size="sm" variant="primary" onClick={() => setCertModal({ open: true, student: r })}><Award size={13} /> Certifier</Btn>
        )}
        {r.hasCertificate && (
          <Btn size="sm" variant="ghost" onClick={() => window.open(`/api/diplomas/${r._id}/pdf`, '_blank')}><Eye size={13} /> Voir</Btn>
        )}
      </div>
    )},
  ];

  const programOptions = [
    { value: '', label: 'Toutes les filières' },
    { value: 'informatique', label: 'Informatique' },
    { value: 'mathematiques', label: 'Mathématiques' },
    { value: 'physique', label: 'Physique' },
    { value: 'chimie', label: 'Chimie' },
    { value: 'biologie', label: 'Biologie' },
  ];

  const sessionOptions = [
    { value: 'principale', label: 'Session principale' },
    { value: 'rattrapage', label: 'Session de rattrapage' },
  ];

  // Attendre que l'utilisateur soit chargé
  if (!user) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: T.font }}><Spinner size={40} /></div>;
  }

  // Seuls les admins peuvent délibérer/certifier, mais les enseignants peuvent consulter
  // (vous pouvez afficher un message si rôle teacher, mais le tableau s'affiche quand même)
  return (
    <div style={{ fontFamily: T.font, padding: 24, maxWidth: 1440, margin: '0 auto', minHeight: '100vh', background: '#F1F5F9' }}>
      <ToastContainer />
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }
        @keyframes popIn { from { opacity:0; transform:scale(.94); } to { opacity:1; transform:scale(1); } }
      `}</style>

      {/* En-tête */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 4 }}>
          <div style={{ width: 42, height: 42, background: T.navy, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ShieldCheck size={22} color={T.gold} /></div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: T.navy, margin: 0 }}>Jury de Délibération</h1>
            <p style={{ fontSize: 12, color: T.silver, margin: 0 }}>Validation des résultats et émission des diplômes — Année {academicYear}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16, marginBottom: 24 }}>
        <StatCard title="Éligibles" value={stats.eligible || students.length} icon={<Users size={20} />} accent={T.indigo} />
        <StatCard title="Délibérés" value={stats.deliberated || students.filter(s => s.hasDeliberated).length} icon={<ThumbsUp size={20} />} accent={T.emerald} />
        <StatCard title="Certifiés" value={stats.certified || students.filter(s => s.hasCertificate).length} icon={<Award size={20} />} accent={T.gold} />
      </div>

      {/* Filtres */}
      <Card style={{ padding: '14px 18px', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: T.silver }} />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Nom, prénom, matricule…" style={{ width: '100%', padding: '9px 13px 9px 34px', border: `1.5px solid ${T.line}`, borderRadius: 9, fontSize: 13, fontFamily: T.font, outline: 'none', color: T.navy, background: T.bg }} />
            {search && <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}><X size={14} /></button>}
          </div>
          <div style={{ minWidth: 160 }}><Sel value={programFilter} onChange={e => { setProgramFilter(e.target.value); setPage(1); }} options={programOptions} style={{ marginBottom: 0 }} /></div>
          <div style={{ minWidth: 160 }}><Sel value={academicYear} onChange={e => setAcademicYear(e.target.value)} options={[{ value: '2023-2024', label: '2023-2024' }, { value: '2024-2025', label: '2024-2025' }]} style={{ marginBottom: 0 }} /></div>
          <div style={{ minWidth: 160 }}><Sel value={session} onChange={e => setSession(e.target.value)} options={sessionOptions} style={{ marginBottom: 0 }} /></div>
        </div>
      </Card>

      {/* Tableau */}
      <Card>
        <SectionHeader title="Liste des étudiants à délibérer" sub="Moyenne générale ≥ 10/20, crédits validés" />
        <Table columns={columns} data={students} loading={loading} />
        <Pagination page={page} total={total} limit={limit} onPageChange={setPage} />
      </Card>

      {/* Modals */}
      <Modal isOpen={delibModal.open} onClose={() => setDelibModal({ open: false, student: null })} title="Délibération du jury" size="md">
        <DeliberationModal student={delibModal.student} onValidate={() => { setDelibModal({ open: false, student: null }); refresh(); }} onCancel={() => setDelibModal({ open: false, student: null })} />
      </Modal>

      <Modal isOpen={certModal.open} onClose={() => setCertModal({ open: false, student: null })} title="Émission du diplôme" size="sm">
        <CertificateModal student={certModal.student} onGenerate={() => { setCertModal({ open: false, student: null }); refresh(); }} onCancel={() => setCertModal({ open: false, student: null })} />
      </Modal>
    </div>
  );
}