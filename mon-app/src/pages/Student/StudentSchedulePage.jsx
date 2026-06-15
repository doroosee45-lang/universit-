// pages/Student/StudentSchedulePage.jsx
import { useState, useEffect, useCallback } from 'react';
import { Calendar, Clock, MapPin, BookOpen, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { scheduleAPI } from '../../services/services';
import { useAuth } from '../../components/context/AuthContext';

// ─── Constants ────────────────────────────────────────────────────────────────
const DAYS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const DAYS_SHORT = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
const WORK_DAYS = [0, 1, 2, 3, 4, 5, 6];

const TYPE_CFG = {
  CM: { bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE', label: 'CM' },
  TD: { bg: '#F0FDF4', color: '#15803D', border: '#BBF7D0', label: 'TD' },
  TP: { bg: '#FFF7ED', color: '#C2410C', border: '#FED7AA', label: 'TP' },
};
const getTypeCfg = (t) => TYPE_CFG[t] || { bg: '#EEF2FF', color: '#4338CA', border: '#C7D2FE', label: t || '—' };

const C = {
  primary: '#4F46E5', primaryLight: '#EEF2FF',
  gray50: '#F9FAFB', gray100: '#F3F4F6', gray200: '#E5E7EB',
  gray300: '#D1D5DB', gray400: '#9CA3AF', gray500: '#6B7280',
  gray600: '#4B5563', gray700: '#374151', gray900: '#111827', white: '#FFFFFF',
};

const timeToMin  = (t) => { const [h, m] = (t || '00:00').split(':').map(Number); return h * 60 + m; };
const fmtDuration = (s, e) => {
  const diff = timeToMin(e) - timeToMin(s);
  return diff >= 60 ? `${Math.floor(diff / 60)}h${diff % 60 > 0 ? diff % 60 : ''}` : `${diff}min`;
};
const getTodayDayOfWeek = () => {
  const d = new Date().getDay();
  return WORK_DAYS.includes(d) ? d : WORK_DAYS[0];
};

// ─── Session Card ─────────────────────────────────────────────────────────────
function SessionCard({ s, isNow }) {
  const cfg = getTypeCfg(s.course?.type);
  return (
    <div style={{
      display: 'flex', gap: 14,
      background: isNow ? cfg.bg : C.white,
      border: `1px solid ${isNow ? cfg.border : C.gray200}`,
      borderLeft: `4px solid ${isNow ? cfg.color : C.gray300}`,
      borderRadius: 10, padding: '13px 16px',
      boxShadow: isNow ? `0 4px 16px ${cfg.border}` : '0 1px 4px rgba(0,0,0,.05)',
      position: 'relative',
    }}>
      {isNow && (
        <div style={{ position: 'absolute', top: 10, right: 12, display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: cfg.color, animation: 'pulse 1.5s infinite', display: 'inline-block' }} />
          <span style={{ fontSize: 10, fontWeight: 700, color: cfg.color }}>EN COURS</span>
        </div>
      )}

      <div style={{ minWidth: 54, textAlign: 'center', paddingTop: 2 }}>
        <p style={{ fontSize: 14, fontWeight: 800, color: isNow ? cfg.color : C.gray700, margin: 0, fontFamily: 'monospace' }}>{s.startTime}</p>
        <div style={{ width: 1, height: 20, background: C.gray200, margin: '4px auto' }} />
        <p style={{ fontSize: 12, color: C.gray400, margin: 0, fontFamily: 'monospace' }}>{s.endTime}</p>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 5 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.gray900, margin: 0 }}>
            {s.course?.title || s.course?.code || 'Cours inconnu'}
          </h3>
          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
            {cfg.label}
          </span>
        </div>
        <p style={{ fontSize: 12, color: C.gray500, margin: 0 }}>
          {s.course?.code && <span style={{ fontFamily: 'monospace', background: C.gray100, padding: '1px 5px', borderRadius: 4, marginRight: 6 }}>{s.course.code}</span>}
          {fmtDuration(s.startTime, s.endTime)}
        </p>
        <div style={{ display: 'flex', gap: 14, marginTop: 8, flexWrap: 'wrap' }}>
          {s.room && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: C.gray500 }}>
              <MapPin size={12} color={C.gray400} />{s.room}
            </span>
          )}
          {(s.teacher?.firstName || s.teacher?.lastName) && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: C.gray500 }}>
              <Users size={12} color={C.gray400} />{s.teacher.firstName} {s.teacher.lastName}
            </span>
          )}
          {s.group && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: C.gray500 }}>
              <BookOpen size={12} color={C.gray400} />Groupe {s.group}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Week Overview Sidebar ────────────────────────────────────────────────────
function WeekOverview({ byDay, activeDay, onSelectDay }) {
  const today = new Date().getDay();
  return (
    <div style={{ background: C.white, border: `1px solid ${C.gray200}`, borderRadius: 12, padding: '14px 16px' }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: C.gray400, textTransform: 'uppercase', letterSpacing: '.08em', margin: '0 0 12px' }}>Semaine</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {WORK_DAYS.map(d => {
          const count = byDay[d]?.length || 0;
          const active = d === activeDay;
          const isToday = d === today;
          return (
            <button key={d} onClick={() => onSelectDay(d)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 10px', borderRadius: 8, border: 'none', background: active ? C.primaryLight : 'transparent', cursor: 'pointer' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: active ? 700 : 500, color: active ? C.primary : C.gray600 }}>
                {isToday && <span style={{ width: 5, height: 5, borderRadius: '50%', background: C.primary, display: 'inline-block' }} />}
                {DAYS[d]}
              </span>
              {count > 0 ? (
                <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 20, background: active ? C.primary : C.gray100, color: active ? C.white : C.gray500 }}>
                  {count}
                </span>
              ) : <span style={{ fontSize: 10, color: C.gray300 }}>—</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function StudentSchedulePage() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [activeDay, setActiveDay] = useState(getTodayDayOfWeek());
  const [semester,  setSemester]  = useState('');

  const loadSchedules = useCallback(async () => {
    if (!user) return;
    setLoading(true); setError('');
    try {
      const programId = user.program?._id || user.program;
      const params = { limit: 500 };
      if (programId) params.program  = programId;
      if (semester)  params.semester = semester;
      const res = await scheduleAPI.getAll(params);
      const data = res?.data?.data ?? res?.data ?? [];
      setSchedules(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du chargement');
    } finally { setLoading(false); }
  }, [user, semester]);

  useEffect(() => { loadSchedules(); }, [loadSchedules]);

  const byDay = {};
  WORK_DAYS.forEach(d => (byDay[d] = []));
  schedules.forEach(s => { if (byDay[s.dayOfWeek] !== undefined) byDay[s.dayOfWeek].push(s); });
  WORK_DAYS.forEach(d => byDay[d].sort((a, b) => timeToMin(a.startTime) - timeToMin(b.startTime)));

  const now = new Date();
  const currentMin = now.getHours() * 60 + now.getMinutes();
  const isNow = (s) => s.dayOfWeek === now.getDay() && timeToMin(s.startTime) <= currentMin && currentMin < timeToMin(s.endTime);

  const todaySessions   = byDay[now.getDay()] || [];
  const activeSessions  = byDay[activeDay] || [];
  const totalHours      = schedules.reduce((acc, s) => acc + (timeToMin(s.endTime) - timeToMin(s.startTime)) / 60, 0);

  const SEMESTERS = ['S1','S2','S3','S4','S5','S6','S7','S8'];

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: C.gray50, minHeight: '100vh', padding: '20px 24px' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:.4} }
        .schedule-layout { display: grid; grid-template-columns: 1fr 220px; gap: 18px; align-items: start; }
        @media (max-width: 768px) { .schedule-layout { grid-template-columns: 1fr; } .schedule-sidebar { order: -1; } }
      `}</style>

      {/* En-tête */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 22 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: C.gray900, margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Calendar size={22} color={C.primary} /> Mon Emploi du Temps
          </h1>
          <p style={{ fontSize: 13, color: C.gray400, marginTop: 4 }}>
            {schedules.length} séance{schedules.length !== 1 ? 's' : ''} · {totalHours.toFixed(0)}h/semaine
            {user?.program?.name && ` · ${user.program.name}`}
          </p>
        </div>
        <select value={semester} onChange={e => setSemester(e.target.value)} style={{ padding: '7px 11px', border: `1px solid ${C.gray200}`, borderRadius: 8, fontSize: 13, background: C.white, outline: 'none', cursor: 'pointer', color: C.gray700 }}>
          <option value="">Tous les semestres</option>
          {SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: 22 }}>
        {[
          { label: 'Séances/semaine', value: schedules.length, icon: Calendar, color: C.primary,  bg: C.primaryLight },
          { label: 'Heures/semaine',  value: `${totalHours.toFixed(0)}h`, icon: Clock, color: '#0891B2', bg: '#ECFEFF' },
          { label: "Aujourd'hui",     value: todaySessions.length, icon: BookOpen, color: '#059669', bg: '#ECFDF5' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.gray200}`, padding: '14px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ fontSize: 22, fontWeight: 800, color, margin: 0 }}>{value}</p>
                <p style={{ fontSize: 11, color: C.gray400, margin: '3px 0 0' }}>{label}</p>
              </div>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={16} color={color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="schedule-layout">
        <div>
          {/* Day selector */}
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 16 }}>
            {WORK_DAYS.map(d => {
              const count = byDay[d]?.length || 0;
              const active = d === activeDay;
              const isToday = d === now.getDay();
              return (
                <button key={d} onClick={() => setActiveDay(d)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '9px 16px', borderRadius: 10, border: `2px solid ${active ? C.primary : C.gray200}`, background: active ? C.primary : C.white, cursor: 'pointer', flexShrink: 0 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: active ? C.white : C.gray500, textTransform: 'uppercase', letterSpacing: '.05em' }}>{DAYS_SHORT[d]}</span>
                  {count > 0 ? (
                    <span style={{ fontSize: 11, fontWeight: 700, width: 20, height: 20, borderRadius: '50%', background: active ? 'rgba(255,255,255,.25)' : C.primaryLight, color: active ? C.white : C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{count}</span>
                  ) : <span style={{ fontSize: 11, color: active ? 'rgba(255,255,255,.4)' : C.gray300 }}>—</span>}
                  {isToday && <span style={{ width: 5, height: 5, borderRadius: '50%', background: active ? C.white : C.primary }} />}
                </button>
              );
            })}
          </div>

          {/* Day title */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: C.gray900, margin: 0 }}>
              {DAYS[activeDay]}
              {activeDay === now.getDay() && <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: C.primaryLight, color: C.primary, marginLeft: 8 }}>Aujourd'hui</span>}
            </h2>
            <div style={{ display: 'flex', gap: 6 }}>
              {[
                { onClick: () => { const i = WORK_DAYS.indexOf(activeDay); setActiveDay(WORK_DAYS[(i - 1 + WORK_DAYS.length) % WORK_DAYS.length]); }, Icon: ChevronLeft },
                { onClick: () => { const i = WORK_DAYS.indexOf(activeDay); setActiveDay(WORK_DAYS[(i + 1) % WORK_DAYS.length]); }, Icon: ChevronRight },
              ].map(({ onClick, Icon }) => (
                <button key={Icon.displayName} onClick={onClick} style={{ width: 28, height: 28, borderRadius: 7, border: `1px solid ${C.gray200}`, background: C.white, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={14} color={C.gray500} />
                </button>
              ))}
            </div>
          </div>

          {/* Sessions */}
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid #E0E7FF', borderTopColor: C.primary, animation: 'spin .7s linear infinite' }} />
            </div>
          ) : error ? (
            <div style={{ background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: 10, padding: '14px 16px', color: '#9F1239', fontSize: 13 }}>{error}</div>
          ) : activeSessions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 24px', background: C.white, borderRadius: 12, border: `1px solid ${C.gray200}` }}>
              <Calendar size={36} color={C.gray300} style={{ marginBottom: 10 }} />
              <p style={{ fontSize: 14, color: C.gray500, margin: 0 }}>Pas de cours ce jour</p>
              <p style={{ fontSize: 12, color: C.gray400, marginTop: 6 }}>Profitez de votre journée libre !</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {activeSessions.map(s => <SessionCard key={s._id} s={s} isNow={isNow(s)} />)}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="schedule-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <WeekOverview byDay={byDay} activeDay={activeDay} onSelectDay={setActiveDay} />

          <div style={{ background: C.white, border: `1px solid ${C.gray200}`, borderRadius: 12, padding: '14px 16px' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: C.gray400, textTransform: 'uppercase', letterSpacing: '.08em', margin: '0 0 10px' }}>Types de cours</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {Object.entries(TYPE_CFG).map(([type, cfg]) => (
                <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: cfg.bg, border: `1.5px solid ${cfg.color}`, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: cfg.color }}>{type}</span>
                  <span style={{ fontSize: 11, color: C.gray400 }}>
                    {type === 'CM' ? 'Cours Magistral' : type === 'TD' ? 'Travaux Dirigés' : 'Travaux Pratiques'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
