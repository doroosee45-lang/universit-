// pages/admin/SchedulePage.jsx
import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, X, Calendar, Clock, MapPin, Users, BookOpen, ChevronDown } from 'lucide-react';
import { scheduleAPI, courseAPI, teacherAPI, programAPI } from '../../services/services';

// ─── Palette ────────────────────────────────────────────────────────────────
const C = {
  primary: '#4F46E5', primaryLight: '#EEF2FF', primaryDark: '#3730A3',
  danger: '#EF4444', dangerLight: '#FEF2F2',
  gray50: '#F9FAFB', gray100: '#F3F4F6', gray200: '#E5E7EB',
  gray300: '#D1D5DB', gray400: '#9CA3AF', gray500: '#6B7280',
  gray700: '#374151', gray900: '#111827', white: '#FFFFFF',
};

// ─── Course type colors ───────────────────────────────────────────────────────
const TYPE_CFG = {
  CM: { bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE', label: 'CM' },
  TD: { bg: '#F0FDF4', color: '#15803D', border: '#BBF7D0', label: 'TD' },
  TP: { bg: '#FFF7ED', color: '#C2410C', border: '#FED7AA', label: 'TP' },
};
const getTypeCfg = (type) => TYPE_CFG[type] || { bg: '#EEF2FF', color: '#4338CA', border: '#C7D2FE', label: type || '—' };

// ─── Day config ───────────────────────────────────────────────────────────────
const DAYS = { 0: 'Dimanche', 1: 'Lundi', 2: 'Mardi', 3: 'Mercredi', 4: 'Jeudi', 5: 'Vendredi', 6: 'Samedi' };
const DAYS_SHORT = { 0: 'Dim', 1: 'Lun', 2: 'Mar', 3: 'Mer', 4: 'Jeu', 5: 'Ven', 6: 'Sam' };
const WORK_DAYS = [0, 1, 2, 3, 4, 5, 6];

// ─── Timetable config ─────────────────────────────────────────────────────────
const START_H = 7;
const END_H   = 20;
const SLOT_H  = 64; // px per hour
const TOTAL_H = (END_H - START_H) * SLOT_H;
const HOURS   = Array.from({ length: END_H - START_H + 1 }, (_, i) => START_H + i);

const timeToMin  = (t) => { const [h, m] = (t || '00:00').split(':').map(Number); return h * 60 + m; };
const topPx      = (t) => (timeToMin(t) - START_H * 60) / 60 * SLOT_H;
const heightPx   = (s, e) => Math.max((timeToMin(e) - timeToMin(s)) / 60 * SLOT_H, 28);

// ─── Helpers ─────────────────────────────────────────────────────────────────
const getCurrentAcademicYear = () => {
  const y = new Date().getFullYear(), m = new Date().getMonth() + 1;
  return m >= 9 ? `${y}-${y + 1}` : `${y - 1}-${y}`;
};
const SEMESTERS = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8'];
const TIME_OPTIONS = Array.from({ length: 25 }, (_, i) => {
  const h = 7 + Math.floor(i / 2), m = i % 2 === 0 ? '00' : '30';
  return `${String(h).padStart(2, '0')}:${m}`;
});

// ─── Toast ────────────────────────────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([]);
  const show = useCallback((msg, type = 'success') => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);
  const ToastContainer = () => (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          padding: '11px 16px', borderRadius: 10, fontSize: 13, fontWeight: 500,
          boxShadow: '0 4px 20px rgba(0,0,0,.12)',
          background: t.type === 'error' ? '#FFF1F2' : '#F0FDF4',
          border: `1px solid ${t.type === 'error' ? '#FECDD3' : '#BBF7D0'}`,
          color: t.type === 'error' ? '#9F1239' : '#166534',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span>{t.type === 'error' ? '✕' : '✓'}</span>{t.msg}
        </div>
      ))}
    </div>
  );
  return { toast: show, ToastContainer };
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
const Spinner = ({ size = 20 }) => (
  <div style={{ width: size, height: size, borderRadius: '50%', border: '2px solid #E0E7FF', borderTopColor: C.primary, animation: 'spin .7s linear infinite', display: 'inline-block' }} />
);

// ─── Modal ────────────────────────────────────────────────────────────────────
const Modal = ({ open, onClose, title, children, width = 520 }) => {
  useEffect(() => {
    if (!open) return;
    const h = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.45)', backdropFilter: 'blur(3px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: C.white, borderRadius: 16, width: '100%', maxWidth: width, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,.25)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 22px', borderBottom: `1px solid ${C.gray100}`, position: 'sticky', top: 0, background: C.white, zIndex: 1, borderRadius: '16px 16px 0 0' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: C.gray900, margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 7, border: 'none', background: C.gray100, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.gray500 }}>
            <X size={14} />
          </button>
        </div>
        <div style={{ padding: '20px 22px' }}>{children}</div>
      </div>
    </div>
  );
};

// ─── Field ────────────────────────────────────────────────────────────────────
const fStyle = { width: '100%', padding: '8px 11px', border: `1px solid ${C.gray200}`, borderRadius: 8, fontSize: 13, outline: 'none', background: C.white, boxSizing: 'border-box', color: C.gray900 };
const Field = ({ label, required, children }) => (
  <div style={{ marginBottom: 13 }}>
    {label && <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.gray700, marginBottom: 5 }}>{label}{required && <span style={{ color: '#EF4444' }}> *</span>}</label>}
    {children}
  </div>
);

// ─── Schedule Form ────────────────────────────────────────────────────────────
function ScheduleForm({ schedule, courses, teachers, programs, onSave, onCancel }) {
  const [form, setForm] = useState({
    course: schedule?.course?._id || schedule?.course || '',
    teacher: schedule?.teacher?._id || schedule?.teacher || '',
    program: schedule?.program?._id || schedule?.program || '',
    semester: schedule?.semester || 'S1',
    group: schedule?.group || '',
    room: schedule?.room || '',
    dayOfWeek: schedule?.dayOfWeek ?? 1,
    startTime: schedule?.startTime || '08:00',
    endTime: schedule?.endTime || '10:00',
    academicYear: schedule?.academicYear || getCurrentAcademicYear(),
    notes: schedule?.notes || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.course || !form.teacher || !form.program) { setError('Cours, enseignant et filière sont obligatoires.'); return; }
    if (timeToMin(form.endTime) <= timeToMin(form.startTime)) { setError("L'heure de fin doit être après l'heure de début."); return; }
    setLoading(true); setError('');
    try {
      if (schedule?._id) await scheduleAPI.update(schedule._id, form);
      else await scheduleAPI.create(form);
      onSave();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Erreur lors de la sauvegarde.');
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div style={{ background: '#FFF1F2', border: '1px solid #FECDD3', color: '#9F1239', borderRadius: 8, padding: '9px 13px', fontSize: 13, marginBottom: 14 }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Cours" required>
          <select value={form.course} onChange={e => set('course', e.target.value)} required style={{ ...fStyle, cursor: 'pointer' }}>
            <option value="">— Sélectionner —</option>
            {courses.map(c => <option key={c._id} value={c._id}>{c.code} – {c.title}</option>)}
          </select>
        </Field>
        <Field label="Enseignant" required>
          <select value={form.teacher} onChange={e => set('teacher', e.target.value)} required style={{ ...fStyle, cursor: 'pointer' }}>
            <option value="">— Sélectionner —</option>
            {teachers.map(t => <option key={t._id} value={t._id}>{t.firstName} {t.lastName}</option>)}
          </select>
        </Field>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Filière" required>
          <select value={form.program} onChange={e => set('program', e.target.value)} required style={{ ...fStyle, cursor: 'pointer' }}>
            <option value="">— Sélectionner —</option>
            {programs.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
        </Field>
        <Field label="Semestre">
          <select value={form.semester} onChange={e => set('semester', e.target.value)} style={{ ...fStyle, cursor: 'pointer' }}>
            {SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Salle" required>
          <input value={form.room} onChange={e => set('room', e.target.value)} required placeholder="Ex: Amphi A, Salle B12" style={fStyle} />
        </Field>
        <Field label="Groupe">
          <input value={form.group} onChange={e => set('group', e.target.value)} placeholder="G1, G2, tous..." style={fStyle} />
        </Field>
      </div>

      <Field label="Jour">
        <select value={form.dayOfWeek} onChange={e => set('dayOfWeek', +e.target.value)} style={{ ...fStyle, cursor: 'pointer' }}>
          {WORK_DAYS.map(d => <option key={d} value={d}>{DAYS[d]}</option>)}
        </select>
      </Field>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Heure début">
          <select value={form.startTime} onChange={e => set('startTime', e.target.value)} style={{ ...fStyle, cursor: 'pointer' }}>
            {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Heure fin">
          <select value={form.endTime} onChange={e => set('endTime', e.target.value)} style={{ ...fStyle, cursor: 'pointer' }}>
            {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </Field>
      </div>

      <Field label="Année académique">
        <input value={form.academicYear} onChange={e => set('academicYear', e.target.value)} placeholder="2025-2026" style={fStyle} />
      </Field>

      <Field label="Notes (optionnel)">
        <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} placeholder="Informations complémentaires..." style={{ ...fStyle, resize: 'vertical' }} />
      </Field>

      <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
        <button type="button" onClick={onCancel} style={{ flex: 1, padding: '9px', background: C.gray100, border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', color: C.gray700 }}>Annuler</button>
        <button type="submit" disabled={loading} style={{ flex: 1, padding: '9px', background: C.primary, border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', color: C.white, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, opacity: loading ? .7 : 1 }}>
          {loading && <Spinner size={13} />}
          {schedule ? 'Mettre à jour' : 'Créer la séance'}
        </button>
      </div>
    </form>
  );
}

// ─── Session Block (in timetable) ─────────────────────────────────────────────
function SessionBlock({ s, onEdit, onDelete }) {
  const [hov, setHov] = useState(false);
  const cfg = getTypeCfg(s.course?.type);
  const top = topPx(s.startTime);
  const h   = heightPx(s.startTime, s.endTime);
  const compact = h < 52;

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position: 'absolute', left: 3, right: 3,
        top, height: h,
        background: cfg.bg, border: `1px solid ${cfg.border}`,
        borderLeft: `3px solid ${cfg.color}`,
        borderRadius: 7, padding: compact ? '3px 6px' : '5px 8px',
        overflow: 'hidden', cursor: 'pointer',
        boxShadow: hov ? '0 4px 12px rgba(0,0,0,.12)' : '0 1px 3px rgba(0,0,0,.06)',
        transition: 'box-shadow .15s, transform .15s',
        transform: hov ? 'scale(1.01)' : 'scale(1)',
        zIndex: hov ? 10 : 1,
      }}
      onClick={() => onEdit(s)}
    >
      {/* Titre */}
      <p style={{ fontSize: compact ? 10 : 11, fontWeight: 700, color: cfg.color, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {s.course?.code || s.course?.title || '—'}
      </p>
      {!compact && (
        <>
          <p style={{ fontSize: 10, color: C.gray500, margin: '1px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {s.startTime}–{s.endTime}
          </p>
          <p style={{ fontSize: 10, color: C.gray500, margin: '1px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {s.room || '—'}
            {s.group ? ` · ${s.group}` : ''}
          </p>
        </>
      )}

      {/* Hover actions */}
      {hov && (
        <div style={{ position: 'absolute', top: 3, right: 3, display: 'flex', gap: 3 }} onClick={e => e.stopPropagation()}>
          <button onClick={() => onEdit(s)} style={{ width: 20, height: 20, borderRadius: 4, border: 'none', background: 'rgba(255,255,255,.85)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Edit2 size={10} color={C.primary} />
          </button>
          <button onClick={() => onDelete(s._id)} style={{ width: 20, height: 20, borderRadius: 4, border: 'none', background: 'rgba(255,255,255,.85)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Trash2 size={10} color="#EF4444" />
          </button>
        </div>
      )}

      {/* Type badge top-right (when not hovering) */}
      {!hov && !compact && (
        <span style={{ position: 'absolute', top: 4, right: 5, fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 8, background: C.white + 'CC', color: cfg.color }}>
          {cfg.label}
        </span>
      )}
    </div>
  );
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
const ConfirmDelete = ({ open, onClose, onConfirm, loading }) => {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.45)', backdropFilter: 'blur(3px)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: C.white, borderRadius: 14, width: '100%', maxWidth: 380, boxShadow: '0 25px 60px rgba(0,0,0,.25)', overflow: 'hidden' }}>
        <div style={{ padding: '20px 22px 0' }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: '#FFF1F2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <Trash2 size={18} color="#F43F5E" />
          </div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: C.gray900, margin: '0 0 6px' }}>Supprimer cette séance ?</h3>
          <p style={{ fontSize: 13, color: C.gray500, margin: 0 }}>Cette action est irréversible.</p>
        </div>
        <div style={{ display: 'flex', gap: 10, padding: '18px 22px' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '8px', background: C.gray100, border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', color: C.gray700 }}>Annuler</button>
          <button onClick={onConfirm} disabled={loading} style={{ flex: 1, padding: '8px', background: '#EF4444', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', color: C.white, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            {loading && <Spinner size={12} />} Supprimer
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminSchedulePage() {
  const { toast, ToastContainer } = useToast();
  const [schedules, setSchedules] = useState([]);
  const [courses,   setCourses]   = useState([]);
  const [teachers,  setTeachers]  = useState([]);
  const [programs,  setPrograms]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [loadingRef, setLoadingRef] = useState(true);

  const [filters, setFilters] = useState({ program: '', semester: '' });
  const [modal,   setModal]   = useState({ open: false, schedule: null });
  const [deleting, setDeleting] = useState({ open: false, id: null, loading: false });

  // Fetch references
  useEffect(() => {
    Promise.all([
      courseAPI.getAll({ limit: 500 }),
      teacherAPI.getAll({ limit: 200 }),
      programAPI.getAll({ limit: 100 }),
    ]).then(([cRes, tRes, pRes]) => {
      setCourses(cRes?.data?.data ?? cRes?.data ?? []);
      setTeachers(tRes?.data?.data ?? tRes?.data ?? []);
      setPrograms(pRes?.data?.data ?? pRes?.data ?? []);
    }).catch(() => {}).finally(() => setLoadingRef(false));
  }, []);

  const loadSchedules = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.program)  params.program  = filters.program;
      if (filters.semester) params.semester = filters.semester;
      const res = await scheduleAPI.getAll(params);
      const data = res?.data?.data ?? res?.data ?? res ?? [];
      setSchedules(Array.isArray(data) ? data : []);
    } catch { toast('Erreur lors du chargement', 'error'); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { loadSchedules(); }, [loadSchedules]);

  const handleDelete = async () => {
    setDeleting(d => ({ ...d, loading: true }));
    try {
      await scheduleAPI.delete(deleting.id);
      toast('Séance supprimée');
      setDeleting({ open: false, id: null, loading: false });
      loadSchedules();
    } catch { toast('Erreur lors de la suppression', 'error'); setDeleting(d => ({ ...d, loading: false })); }
  };

  // Group by day
  const byDay = {};
  WORK_DAYS.forEach(d => (byDay[d] = []));
  schedules.forEach(s => { if (byDay[s.dayOfWeek] !== undefined) byDay[s.dayOfWeek].push(s); });

  const totalSessions = schedules.length;
  const totalHoursPerWeek = schedules.reduce((acc, s) => acc + (timeToMin(s.endTime) - timeToMin(s.startTime)) / 60, 0);

  const filterSel = { padding: '7px 11px', border: `1px solid ${C.gray200}`, borderRadius: 8, fontSize: 13, background: C.white, outline: 'none', cursor: 'pointer', color: C.gray700 };

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", color: C.gray900, minHeight: '100vh', background: C.gray50, padding: '20px 24px' }}>
      <ToastContainer />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* ── En-tête ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 22 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: C.gray900, margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Calendar size={22} color={C.primary} /> Emploi du Temps
          </h1>
          <p style={{ fontSize: 13, color: C.gray400, marginTop: 4 }}>
            {totalSessions} séance{totalSessions !== 1 ? 's' : ''} · {totalHoursPerWeek.toFixed(0)}h/semaine
          </p>
        </div>
        <button
          onClick={() => setModal({ open: true, schedule: null })}
          style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', background: C.primary, color: C.white, border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
        >
          <Plus size={15} /> Nouvelle séance
        </button>
      </div>

      {/* ── Filtres ── */}
      <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.gray200}`, padding: '12px 16px', marginBottom: 18, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <select value={filters.program} onChange={e => setFilters(f => ({ ...f, program: e.target.value }))} style={filterSel}>
          <option value="">Toutes les filières</option>
          {programs.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
        </select>
        <select value={filters.semester} onChange={e => setFilters(f => ({ ...f, semester: e.target.value }))} style={filterSel}>
          <option value="">Tous les semestres</option>
          {SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        {(filters.program || filters.semester) && (
          <button onClick={() => setFilters({ program: '', semester: '' })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.gray400, fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
            <X size={12} /> Réinitialiser
          </button>
        )}

        {/* Légende types */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
          {Object.entries(TYPE_CFG).map(([type, cfg]) => (
            <span key={type} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: cfg.color }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: cfg.bg, border: `1.5px solid ${cfg.color}` }} />
              {type}
            </span>
          ))}
        </div>
      </div>

      {/* ── Grille Timetable ── */}
      {loading || loadingRef ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
          <Spinner size={36} />
        </div>
      ) : (
        <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.gray200}`, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: '52px repeat(6, 1fr)', borderBottom: `1px solid ${C.gray200}` }}>
            <div style={{ padding: '10px 0', background: C.gray50 }} />
            {WORK_DAYS.map(d => {
              const count = byDay[d].length;
              return (
                <div key={d} style={{ padding: '10px 8px', background: C.gray50, borderLeft: `1px solid ${C.gray200}`, textAlign: 'center' }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: C.gray500, textTransform: 'uppercase', letterSpacing: '.05em', margin: 0 }}>{DAYS_SHORT[d]}</p>
                  <p style={{ fontSize: 10, color: count > 0 ? C.primary : C.gray400, margin: '2px 0 0', fontWeight: count > 0 ? 700 : 400 }}>
                    {count > 0 ? `${count} séance${count > 1 ? 's' : ''}` : 'libre'}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Grid body */}
          <div style={{ overflowY: 'auto', maxHeight: '70vh' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '52px repeat(6, 1fr)', minHeight: TOTAL_H + 20 }}>
              {/* Time column */}
              <div style={{ position: 'relative', borderRight: `1px solid ${C.gray200}` }}>
                {HOURS.map(h => (
                  <div key={h} style={{ position: 'absolute', top: (h - START_H) * SLOT_H - 7, left: 0, right: 0, textAlign: 'right', paddingRight: 8 }}>
                    <span style={{ fontSize: 10, color: C.gray400, fontWeight: 600, fontFamily: 'monospace' }}>{String(h).padStart(2, '0')}h</span>
                  </div>
                ))}
              </div>

              {/* Day columns */}
              {WORK_DAYS.map(d => (
                <div key={d} style={{ position: 'relative', borderLeft: `1px solid ${C.gray200}`, minHeight: TOTAL_H }}>
                  {/* Hour grid lines */}
                  {HOURS.map(h => (
                    <div key={h} style={{ position: 'absolute', top: (h - START_H) * SLOT_H, left: 0, right: 0, height: 1, background: h % 2 === 0 ? C.gray200 : C.gray100 }} />
                  ))}

                  {/* 30-min lines */}
                  {HOURS.slice(0, -1).map(h => (
                    <div key={`${h}.5`} style={{ position: 'absolute', top: (h - START_H) * SLOT_H + SLOT_H / 2, left: 0, right: 0, height: 1, background: C.gray100 }} />
                  ))}

                  {/* Session blocks */}
                  {byDay[d].map(s => (
                    <SessionBlock
                      key={s._id}
                      s={s}
                      onEdit={(s) => setModal({ open: true, schedule: s })}
                      onDelete={(id) => setDeleting({ open: true, id, loading: false })}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && !loadingRef && schedules.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 24px', background: C.white, borderRadius: 14, border: `1px solid ${C.gray200}`, marginTop: 0 }}>
          <Calendar size={40} color={C.gray300} style={{ marginBottom: 12 }} />
          <p style={{ fontSize: 15, color: C.gray500, margin: 0 }}>Aucune séance dans l'emploi du temps</p>
          <p style={{ fontSize: 13, color: C.gray400, marginTop: 6 }}>Créez votre première séance pour commencer</p>
          <button onClick={() => setModal({ open: true, schedule: null })} style={{ marginTop: 16, padding: '9px 20px', background: C.primary, color: C.white, border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 7 }}>
            <Plus size={14} /> Nouvelle séance
          </button>
        </div>
      )}

      {/* ── Modal Formulaire ── */}
      <Modal
        open={modal.open}
        onClose={() => setModal({ open: false, schedule: null })}
        title={modal.schedule ? 'Modifier la séance' : 'Nouvelle séance'}
        width={560}
      >
        <ScheduleForm
          schedule={modal.schedule}
          courses={courses}
          teachers={teachers}
          programs={programs}
          onSave={() => {
            setModal({ open: false, schedule: null });
            toast(modal.schedule ? 'Séance mise à jour' : 'Séance créée avec succès');
            loadSchedules();
          }}
          onCancel={() => setModal({ open: false, schedule: null })}
        />
      </Modal>

      {/* ── Confirm Delete ── */}
      <ConfirmDelete
        open={deleting.open}
        loading={deleting.loading}
        onClose={() => setDeleting({ open: false, id: null, loading: false })}
        onConfirm={handleDelete}
      />
    </div>
  );
}
