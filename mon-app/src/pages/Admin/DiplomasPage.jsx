// pages/admin/DiplomasPage.jsx
import { useState, useEffect, useCallback } from 'react';
import {
  Award, Eye, QrCode, Printer, Search, X, GraduationCap,
  ChevronLeft, ChevronRight, RefreshCw, FileText, CheckCircle,
  Download, BookOpen, Shield, Archive, Calendar, Loader2
} from 'lucide-react';
import { studentAPI, gradeAPI } from '../../services/services';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const STORAGE_KEY = 'omedev_documents';
const ARCHIVE_KEY = 'university_archives';

const getCurrentAcademicYear = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth() + 1; // 1-indexed
  return m >= 9 ? `${y}-${y + 1}` : `${y - 1}-${y}`;
};

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '—';
const fmtLong = (d) => d ? new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';
const genId = () => `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

const getMention = (avg) => {
  if (avg >= 16) return { label: 'Très Bien', color: '#9333EA', bg: '#F3E8FF' };
  if (avg >= 14) return { label: 'Bien', color: '#4F46E5', bg: '#EEF2FF' };
  if (avg >= 12) return { label: 'Assez Bien', color: '#0891B2', bg: '#CFFAFE' };
  if (avg >= 10) return { label: 'Passable', color: '#059669', bg: '#D1FAE5' };
  return { label: 'Non validé', color: '#E11D48', bg: '#FFE4E6' };
};

// ─── localStorage helpers ─────────────────────────────────────────────────────
const loadDocs = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
};
const saveDocs = (docs) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(docs)); } catch { /* ignore */ }
};
const pushToArchive = (entry) => {
  try {
    const archives = JSON.parse(localStorage.getItem(ARCHIVE_KEY) || '[]');
    archives.push(entry);
    localStorage.setItem(ARCHIVE_KEY, JSON.stringify(archives));
  } catch { /* ignore */ }
};

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  navy: '#0F172A', navyMid: '#1E293B', navyLt: '#334155',
  slate: '#64748B', silver: '#94A3B8', line: '#E2E8F0',
  bg: '#F8FAFC', white: '#FFFFFF',
  gold: '#F59E0B', goldLt: '#FEF3C7', goldDk: '#92400E',
  emer: '#059669', emerLt: '#D1FAE5', emerDk: '#065F46',
  indigo: '#4F46E5', indiLt: '#EEF2FF', indiDk: '#3730A3',
  rose: '#E11D48', roseLt: '#FFE4E6', roseDk: '#9F1239',
  font: "'Sora', system-ui, sans-serif",
  mono: "'JetBrains Mono', monospace",
};

// ─── Primitives ───────────────────────────────────────────────────────────────
const Spin = ({ size = 20 }) => <Loader2 size={size} style={{ animation: 'spin .7s linear infinite', flexShrink: 0, color: T.indigo }} />;

const Badge = ({ children, bg = T.indiLt, color = T.indigo, mono }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, fontFamily: mono ? T.mono : T.font, background: bg, color, letterSpacing: .3 }}>
    {children}
  </span>
);

function Btn({ children, onClick, variant = 'primary', size = 'md', loading, disabled, type = 'button', style = {} }) {
  const V = {
    primary: { bg: T.navy, color: T.white, border: 'none', hover: T.navyMid },
    gold: { bg: T.gold, color: T.navy, border: 'none', hover: '#D97706' },
    secondary: { bg: T.white, color: T.navyLt, border: `1px solid ${T.line}`, hover: T.bg },
    danger: { bg: T.roseLt, color: T.roseDk, border: '1px solid #FECDD3', hover: '#FFD6DA' },
    ghost: { bg: 'transparent', color: T.slate, border: 'none', hover: T.bg },
    indigo: { bg: T.indigo, color: T.white, border: 'none', hover: T.indiDk },
    success: { bg: T.emerLt, color: T.emerDk, border: 'none', hover: '#BBFADA' },
  };
  const S = { sm: { padding: '5px 11px', fontSize: 11 }, md: { padding: '9px 16px', fontSize: 13 }, lg: { padding: '11px 22px', fontSize: 14 } };
  const v = V[variant];
  return (
    <button type={type} onClick={onClick} disabled={disabled || loading}
      style={{ background: v.bg, color: v.color, border: v.border, ...S[size], borderRadius: 9, fontWeight: 600, cursor: (disabled || loading) ? 'not-allowed' : 'pointer', opacity: (disabled || loading) ? .55 : 1, display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: T.font, transition: 'background .15s', letterSpacing: .2, ...style }}
      onMouseEnter={e => { if (!disabled && !loading) e.currentTarget.style.background = v.hover; }}
      onMouseLeave={e => { e.currentTarget.style.background = v.bg; }}
    >
      {loading && <Spin size={14} />}
      {children}
    </button>
  );
}

const Card = ({ children, style }) => (
  <div style={{ background: T.white, borderRadius: 14, border: `1px solid ${T.line}`, overflow: 'hidden', ...style }}>
    {children}
  </div>
);

function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    const h = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);
  if (!isOpen) return null;
  const widths = { sm: 420, md: 580, lg: 780, xl: 980 };
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.55)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: T.white, borderRadius: 18, width: '100%', maxWidth: widths[size], maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,.22)', animation: 'popIn .22s ease' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: `1px solid ${T.line}`, background: T.bg }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: T.navy, fontFamily: T.font }}>{title}</span>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${T.line}`, background: T.white, cursor: 'pointer', fontSize: 18, color: T.slate, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

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
        <div key={t.id} style={{ padding: '12px 20px', borderRadius: 10, fontSize: 13, fontWeight: 500, fontFamily: T.font, background: t.type === 'error' ? T.roseLt : T.emerLt, color: t.type === 'error' ? T.roseDk : T.emerDk, border: `1px solid ${t.type === 'error' ? '#FECDD3' : '#A7F3D0'}`, boxShadow: '0 8px 24px rgba(0,0,0,.12)' }}>
          {t.msg}
        </div>
      ))}
    </div>
  );
  return { toast: show, ToastContainer };
}

// ─── Input ────────────────────────────────────────────────────────────────────
function Field({ label, value, onChange, type = 'text', required, readOnly, placeholder }) {
  const [focus, setFocus] = useState(false);
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: T.slate, marginBottom: 5, letterSpacing: .4, textTransform: 'uppercase' }}>{label}{required && <span style={{ color: T.rose }}> *</span>}</label>}
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} required={required} readOnly={readOnly}
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        style={{ width: '100%', padding: '9px 13px', border: `1.5px solid ${focus ? T.indigo : T.line}`, borderRadius: 9, fontSize: 13, fontFamily: T.font, outline: 'none', background: readOnly ? T.bg : T.white, color: T.navy, boxSizing: 'border-box', transition: 'all .18s', cursor: readOnly ? 'default' : 'text' }}
      />
    </div>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
const StatCard = ({ title, value, icon, accent, sub }) => (
  <div style={{ background: T.white, borderRadius: 14, border: `1px solid ${T.line}`, padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 14, position: 'relative', overflow: 'hidden' }}>
    <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: accent, borderRadius: '14px 0 0 14px' }} />
    <div style={{ width: 44, height: 44, borderRadius: 12, background: accent + '20', color: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icon}</div>
    <div>
      <p style={{ fontSize: 11, color: T.silver, fontWeight: 600, letterSpacing: .5, textTransform: 'uppercase', margin: 0 }}>{title}</p>
      <p style={{ fontSize: 26, fontWeight: 700, color: T.navy, margin: 0, fontFamily: T.mono, lineHeight: 1.2 }}>{value}</p>
      {sub && <p style={{ fontSize: 11, color: T.silver, margin: '2px 0 0' }}>{sub}</p>}
    </div>
  </div>
);

// ─── Pagination ───────────────────────────────────────────────────────────────
function Pagination({ page, total, limit, onPageChange }) {
  const pages = Math.ceil(total / limit);
  if (pages <= 1) return null;
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, padding: 16, borderTop: `1px solid ${T.line}` }}>
      <button onClick={() => onPageChange(page - 1)} disabled={page === 1} style={{ width: 32, height: 32, border: `1px solid ${T.line}`, borderRadius: 8, background: T.white, cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? .4 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronLeft size={16} /></button>
      <span style={{ fontSize: 12, color: T.slate }}>Page <strong style={{ color: T.navy }}>{page}</strong> / {pages} — {total} résultat{total > 1 ? 's' : ''}</span>
      <button onClick={() => onPageChange(page + 1)} disabled={page === pages} style={{ width: 32, height: 32, border: `1px solid ${T.line}`, borderRadius: 8, background: T.white, cursor: page === pages ? 'not-allowed' : 'pointer', opacity: page === pages ? .4 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronRight size={16} /></button>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// DOCUMENT VIEW MODALS (print-ready)
// ══════════════════════════════════════════════════════════════════════════════

// ─── Diplôme visuel ───────────────────────────────────────────────────────────
function DiplomaView({ doc, onClose }) {
  const { student, diplomaNumber, graduationDate, mention, juryPresident, registrar } = doc;
  const avg = student?.generalAverage;
  const m = avg != null ? getMention(avg) : null;
  return (
    <div style={{ padding: '28px 28px 24px' }}>
      <div className="print-area">
        <div style={{ textAlign: 'center', marginBottom: 22, paddingBottom: 18, borderBottom: `1px solid ${T.line}` }}>
          <div style={{ width: 72, height: 72, background: `linear-gradient(135deg, ${T.gold}, #FBBF24)`, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', boxShadow: '0 8px 28px rgba(245,158,11,.35)' }}>
            <GraduationCap size={36} color={T.navy} />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: T.navy, margin: '0 0 4px' }}>DIPLÔME UNIVERSITAIRE</h2>
          <p style={{ fontSize: 14, color: T.slate, fontWeight: 500, margin: '0 0 4px' }}>Collège Omedev</p>
          <p style={{ fontSize: 12, color: T.silver, fontFamily: T.mono, margin: 0 }}>N° {diplomaNumber || '—'}</p>
        </div>

        <p style={{ textAlign: 'center', fontSize: 13, color: T.slate, margin: '0 0 16px' }}>
          Nous, soussignés, certifions que
        </p>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <p style={{ fontSize: 22, fontWeight: 800, color: T.navy, margin: '0 0 4px' }}>{student?.firstName} {student?.lastName}</p>
          <p style={{ fontSize: 12, color: T.silver, fontFamily: T.mono, margin: 0 }}>Matricule : {student?.studentId || '—'}</p>
          {student?.dateOfBirth && <p style={{ fontSize: 12, color: T.slate, margin: '4px 0 0' }}>Né(e) le {fmtDate(student.dateOfBirth)}</p>}
        </div>

        <div style={{ background: T.bg, borderRadius: 12, padding: '16px 20px', marginBottom: 18 }}>
          <p style={{ fontSize: 12, color: T.silver, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: .5, fontWeight: 600 }}>A obtenu le diplôme de</p>
          <p style={{ fontSize: 16, fontWeight: 700, color: T.navy, margin: '0 0 4px' }}>{student?.program?.name || '—'}</p>
          <p style={{ fontSize: 12, color: T.slate, margin: 0 }}>Niveau {student?.level} — Année académique {student?.academicYear || getCurrentAcademicYear()}</p>
        </div>

        {(avg != null || mention) && (
          <div style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
            {avg != null && (
              <div style={{ flex: 1, background: T.navy, borderRadius: 12, padding: '14px 18px' }}>
                <p style={{ fontSize: 10, color: T.silver, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: .5, fontWeight: 600 }}>Moyenne générale</p>
                <p style={{ fontSize: 28, fontWeight: 700, color: T.gold, margin: 0, fontFamily: T.mono }}>{avg}<span style={{ fontSize: 13, color: T.silver }}>/20</span></p>
              </div>
            )}
            {m && (
              <div style={{ flex: 1, background: m.bg, borderRadius: 12, padding: '14px 18px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <p style={{ fontSize: 10, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: .5, fontWeight: 600, color: m.color + '99' }}>Mention</p>
                <p style={{ fontSize: 20, fontWeight: 700, color: m.color, margin: 0 }}>{mention || m.label}</p>
              </div>
            )}
          </div>
        )}

        <div style={{ fontSize: 13, color: T.slate, marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 5 }}>
          {graduationDate && <p style={{ margin: 0 }}>📅 Délivré le {fmtLong(graduationDate)}</p>}
          {juryPresident && <p style={{ margin: 0 }}>👤 Président du jury : <strong>{juryPresident}</strong></p>}
          {registrar && <p style={{ margin: 0 }}>✍️ Responsable scolarité : <strong>{registrar}</strong></p>}
        </div>

        <div style={{ textAlign: 'center', padding: 14, background: T.bg, borderRadius: 12, marginBottom: 20 }}>
          <QrCode size={52} color={T.navyLt} style={{ margin: '0 auto 6px', display: 'block' }} />
          <p style={{ fontSize: 10, color: T.silver, margin: 0, letterSpacing: .4, textTransform: 'uppercase', fontWeight: 600 }}>Code de vérification d'authenticité</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <Btn variant="secondary" onClick={onClose} style={{ flex: 1, justifyContent: 'center' }}>Fermer</Btn>
        <Btn variant="primary" onClick={() => window.print()} style={{ flex: 1, justifyContent: 'center' }}>
          <Printer size={15} /> Imprimer
        </Btn>
      </div>
    </div>
  );
}

// ─── Relevé de notes visuel ───────────────────────────────────────────────────
function TranscriptView({ doc, onClose }) {
  const { student, grades = [], academicYear, semester, generatedAt } = doc;
  const totalCoef = grades.reduce((s, g) => s + (g.ue?.coefficient || 1), 0);
  const avg = totalCoef > 0 ? grades.reduce((s, g) => s + (g.finalAverage || 0) * (g.ue?.coefficient || 1), 0) / totalCoef : null;
  const totalECTS = grades.reduce((s, g) => s + (g.ectsObtained || 0), 0);
  const mention = avg != null ? getMention(avg) : null;

  return (
    <div style={{ padding: '28px 28px 24px' }}>
      {/* En-tête */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, paddingBottom: 16, borderBottom: `1px solid ${T.line}` }}>
        <div>
          <p style={{ fontSize: 11, color: T.silver, margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: .5, fontWeight: 600 }}>Collège Omedev</p>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: T.navy, margin: '0 0 2px' }}>Relevé de Notes</h2>
          <p style={{ fontSize: 12, color: T.slate, margin: 0 }}>{academicYear} {semester ? `— ${semester}` : '— Tous semestres'}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: 12, color: T.silver, margin: '0 0 2px' }}>Généré le {fmtDate(generatedAt)}</p>
          <p style={{ fontSize: 19, fontWeight: 800, color: T.navy, margin: 0 }}>{student?.firstName} {student?.lastName}</p>
          <p style={{ fontSize: 11, color: T.silver, fontFamily: T.mono, margin: 0 }}>{student?.studentId}</p>
        </div>
      </div>

      {/* Infos étudiant */}
      <div style={{ background: T.bg, borderRadius: 10, padding: '12px 16px', marginBottom: 16, display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        {[['Filière', student?.program?.name || '—'], ['Niveau', student?.level || '—'], ['Semestre', student?.currentSemester || '—'], ['Année acad.', student?.academicYear || '—']].map(([l, v]) => (
          <div key={l}>
            <p style={{ fontSize: 10, color: T.silver, margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: .4, fontWeight: 600 }}>{l}</p>
            <p style={{ fontSize: 13, fontWeight: 600, color: T.navy, margin: 0 }}>{v}</p>
          </div>
        ))}
      </div>

      {/* Tableau notes */}
      {grades.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 32, color: T.silver }}>
          <BookOpen size={32} style={{ margin: '0 auto 10px', display: 'block', opacity: .3 }} />
          <p style={{ fontSize: 13, margin: 0 }}>Aucune note disponible pour cette période</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', marginBottom: 16 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: T.font, fontSize: 12 }}>
            <thead>
              <tr style={{ background: T.navy }}>
                {['Code UE', 'Intitulé', 'Sem.', 'Coef.', 'CC', 'Partiel', 'Final', 'Moy.', 'ECTS', 'Mention', 'Validé'].map(h => (
                  <th key={h} style={{ padding: '9px 12px', textAlign: 'left', color: T.white, fontWeight: 600, fontSize: 10, textTransform: 'uppercase', letterSpacing: .4, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {grades.map((g, i) => {
                const m = g.finalAverage != null ? getMention(g.finalAverage) : null;
                const cc = g.assessments?.find(a => a.type === 'controle_continu')?.score;
                const partiel = g.assessments?.find(a => a.type === 'examen_partiel')?.score;
                const final = g.assessments?.find(a => a.type === 'examen_final')?.score;
                return (
                  <tr key={g._id || i} style={{ background: i % 2 === 0 ? T.white : T.bg }}>
                    <td style={{ padding: '8px 12px', fontFamily: T.mono, color: T.indigo, fontWeight: 600 }}>{g.ue?.code || '—'}</td>
                    <td style={{ padding: '8px 12px', color: T.navyLt, fontWeight: 500, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.ue?.title || '—'}</td>
                    <td style={{ padding: '8px 12px', color: T.slate }}>{g.semester || '—'}</td>
                    <td style={{ padding: '8px 12px', fontWeight: 700, color: T.navy, textAlign: 'center' }}>{g.ue?.coefficient || 1}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'center', color: T.slate }}>{cc ?? '—'}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'center', color: T.slate }}>{partiel ?? '—'}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'center', color: T.slate }}>{final ?? '—'}</td>
                    <td style={{ padding: '8px 12px', fontWeight: 700, textAlign: 'center', color: m?.color || T.slate, fontFamily: T.mono }}>{g.finalAverage?.toFixed(2) ?? '—'}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 600, color: T.emer }}>{g.ectsObtained || 0}/{g.ue?.credits || 0}</td>
                    <td style={{ padding: '8px 12px' }}>{m ? <Badge bg={m.bg} color={m.color}>{m.label}</Badge> : '—'}</td>
                    <td style={{ padding: '8px 12px' }}>
                      {g.isValidated
                        ? <Badge bg={T.emerLt} color={T.emerDk}>✓</Badge>
                        : <Badge bg={T.roseLt} color={T.roseDk}>✗</Badge>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Résumé */}
      {grades.length > 0 && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          {[
            { label: 'Moyenne générale', value: avg != null ? `${avg.toFixed(2)}/20` : '—', color: mention?.color || T.slate },
            { label: 'ECTS obtenus', value: `${totalECTS} crédits`, color: T.emer },
            { label: 'UE validées', value: `${grades.filter(g => g.isValidated).length}/${grades.length}`, color: T.indigo },
            { label: 'Mention', value: mention?.label || '—', color: mention?.color || T.slate },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ flex: 1, minWidth: 100, background: T.bg, borderRadius: 10, padding: '12px 16px' }}>
              <p style={{ fontSize: 10, color: T.silver, margin: '0 0 3px', textTransform: 'uppercase', letterSpacing: .4, fontWeight: 600 }}>{label}</p>
              <p style={{ fontSize: 15, fontWeight: 700, color, margin: 0, fontFamily: T.mono }}>{value}</p>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: 10 }}>
        <Btn variant="secondary" onClick={onClose} style={{ flex: 1, justifyContent: 'center' }}>Fermer</Btn>
        <Btn variant="primary" onClick={() => window.print()} style={{ flex: 1, justifyContent: 'center' }}>
          <Printer size={15} /> Imprimer
        </Btn>
      </div>
    </div>
  );
}

// ─── Attestation de réussite visuelle ─────────────────────────────────────────
function AttestationView({ doc, onClose }) {
  const { student, academicYear, mention, juryPresident, registrar, generatedAt, attestationNumber } = doc;
  const avg = student?.generalAverage;
  const m = (mention && getMention(12)) || (avg != null ? getMention(avg) : null);

  return (
    <div style={{ padding: '28px 28px 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: 24, paddingBottom: 18, borderBottom: `1px solid ${T.line}` }}>
        <div style={{ width: 64, height: 64, background: `linear-gradient(135deg, ${T.emer}, #34D399)`, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', boxShadow: '0 6px 20px rgba(5,150,105,.3)' }}>
          <Shield size={32} color={T.white} />
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: T.navy, margin: '0 0 4px' }}>ATTESTATION DE RÉUSSITE</h2>
        <p style={{ fontSize: 13, color: T.slate, fontWeight: 500, margin: '0 0 4px' }}>Collège Omedev</p>
        <p style={{ fontSize: 11, color: T.silver, fontFamily: T.mono, margin: 0 }}>Réf. {attestationNumber || '—'}</p>
      </div>

      <p style={{ textAlign: 'center', fontSize: 13, color: T.slate, margin: '0 0 14px' }}>Nous certifions que</p>

      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <p style={{ fontSize: 20, fontWeight: 800, color: T.navy, margin: '0 0 4px' }}>{student?.firstName} {student?.lastName}</p>
        <p style={{ fontSize: 12, color: T.silver, fontFamily: T.mono, margin: 0 }}>Matricule : {student?.studentId || '—'}</p>
        {student?.dateOfBirth && <p style={{ fontSize: 12, color: T.slate, margin: '4px 0 0' }}>Né(e) le {fmtDate(student.dateOfBirth)}</p>}
      </div>

      <div style={{ background: T.emerLt, borderRadius: 12, padding: '16px 20px', marginBottom: 18, textAlign: 'center' }}>
        <p style={{ fontSize: 13, color: T.emerDk, margin: '0 0 4px', fontWeight: 500 }}>a validé avec succès la formation</p>
        <p style={{ fontSize: 17, fontWeight: 700, color: T.navy, margin: '0 0 4px' }}>{student?.program?.name || '—'}</p>
        <p style={{ fontSize: 12, color: T.slate, margin: 0 }}>Niveau {student?.level} — Année académique {academicYear || getCurrentAcademicYear()}</p>
      </div>

      {avg != null && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
          <div style={{ flex: 1, background: T.navy, borderRadius: 10, padding: '12px 16px' }}>
            <p style={{ fontSize: 10, color: T.silver, margin: '0 0 3px', textTransform: 'uppercase', letterSpacing: .5, fontWeight: 600 }}>Moyenne générale</p>
            <p style={{ fontSize: 24, fontWeight: 700, color: T.gold, margin: 0, fontFamily: T.mono }}>{avg}<span style={{ fontSize: 12, color: T.silver }}>/20</span></p>
          </div>
          {m && (
            <div style={{ flex: 1, background: m.bg, borderRadius: 10, padding: '12px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <p style={{ fontSize: 10, margin: '0 0 3px', textTransform: 'uppercase', letterSpacing: .5, fontWeight: 600, color: m.color + '99' }}>Mention</p>
              <p style={{ fontSize: 18, fontWeight: 700, color: m.color, margin: 0 }}>{mention || m.label}</p>
            </div>
          )}
        </div>
      )}

      <div style={{ fontSize: 12, color: T.slate, marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <p style={{ margin: 0 }}>📅 Délivrée le {fmtLong(generatedAt)}</p>
        {juryPresident && <p style={{ margin: 0 }}>👤 Président du jury : <strong>{juryPresident}</strong></p>}
        {registrar && <p style={{ margin: 0 }}>✍️ Responsable scolarité : <strong>{registrar}</strong></p>}
      </div>

      <div style={{ textAlign: 'center', padding: 12, background: T.bg, borderRadius: 12, marginBottom: 20 }}>
        <QrCode size={44} color={T.navyLt} style={{ margin: '0 auto 5px', display: 'block' }} />
        <p style={{ fontSize: 10, color: T.silver, margin: 0, textTransform: 'uppercase', letterSpacing: .4, fontWeight: 600 }}>Vérification authentique</p>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <Btn variant="secondary" onClick={onClose} style={{ flex: 1, justifyContent: 'center' }}>Fermer</Btn>
        <Btn variant="primary" onClick={() => window.print()} style={{ flex: 1, justifyContent: 'center' }}>
          <Printer size={15} /> Imprimer
        </Btn>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// GENERATION MODALS
// ══════════════════════════════════════════════════════════════════════════════

function GenerateDiplomaModal({ student, onSave, onCancel }) {
  const [form, setForm] = useState({
    diplomaNumber: `DIP-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
    graduationDate: new Date().toISOString().slice(0, 10),
    mention: student?.generalAverage ? getMention(student.generalAverage).label : '',
    juryPresident: '',
    registrar: '',
    notes: '',
  });
  const [saving, setSaving] = useState(false);
  const { toast, ToastContainer } = useToast();
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const avg = student?.generalAverage;
  const m = avg != null ? getMention(avg) : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.diplomaNumber || !form.graduationDate) { toast('Champs obligatoires manquants', 'error'); return; }
    setSaving(true);
    try {
      await new Promise(r => setTimeout(r, 600));
      onSave(form); // ✅ passe formData au parent
    } catch (err) {
      toast(err?.message || 'Erreur lors de la génération', 'error');
    } finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: 24 }}>
      <ToastContainer />
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', background: T.navy, borderRadius: 12, marginBottom: 22 }}>
        <div style={{ width: 44, height: 44, borderRadius: 10, background: T.gold, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <GraduationCap size={22} color={T.navy} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 700, color: T.white, fontSize: 15, margin: 0 }}>{student?.firstName} {student?.lastName}</p>
          <p style={{ fontSize: 11, color: T.silver, margin: '2px 0 0', fontFamily: T.mono }}>{student?.studentId} — {student?.program?.name || '—'}</p>
        </div>
        {m && <div style={{ textAlign: 'right' }}><p style={{ fontFamily: T.mono, fontSize: 18, fontWeight: 700, color: T.gold, margin: 0 }}>{avg}<span style={{ fontSize: 11, color: T.silver }}>/20</span></p><Badge bg={m.bg} color={m.color}>{m.label}</Badge></div>}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 18px' }}>
        <Field label="N° de diplôme" value={form.diplomaNumber} onChange={set('diplomaNumber')} required />
        <Field label="Date de graduation" type="date" value={form.graduationDate} onChange={set('graduationDate')} required />
      </div>
      <Field label="Mention" value={form.mention} onChange={set('mention')} placeholder="ex : Très Bien" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 18px' }}>
        <Field label="Président du jury" value={form.juryPresident} onChange={set('juryPresident')} />
        <Field label="Responsable scolarité" value={form.registrar} onChange={set('registrar')} />
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        <Btn variant="secondary" onClick={onCancel} style={{ flex: 1, justifyContent: 'center' }}>Annuler</Btn>
        <Btn type="submit" variant="gold" loading={saving} style={{ flex: 1, justifyContent: 'center' }}><Award size={15} /> Émettre le diplôme</Btn>
      </div>
    </form>
  );
}

function GenerateTranscriptModal({ student, onSave, onCancel, toast }) {
  const [academicYear, setAcademicYear] = useState(student?.academicYear || getCurrentAcademicYear());
  const [semester, setSemester] = useState('');
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const sems = ['', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6'];

  useEffect(() => {
    if (!student?._id) return;
    setLoading(true);
    gradeAPI.getStudentTranscript(student._id, { academicYear, ...(semester ? { semester } : {}) })
      .then(res => setGrades(res?.data || []))
      .catch(() => setGrades([]))
      .finally(() => setLoading(false));
  }, [student?._id, academicYear, semester]);

  const handleGenerate = () => {
    onSave({ academicYear, semester, grades });
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', background: T.indiLt, borderRadius: 12, marginBottom: 20 }}>
        <BookOpen size={20} color={T.indigo} />
        <div>
          <p style={{ fontWeight: 700, color: T.navy, margin: 0 }}>{student?.firstName} {student?.lastName}</p>
          <p style={{ fontSize: 11, color: T.slate, margin: 0, fontFamily: T.mono }}>{student?.studentId} — {student?.program?.name}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px', marginBottom: 18 }}>
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: T.slate, marginBottom: 6, textTransform: 'uppercase', letterSpacing: .4 }}>Année académique</label>
          <input value={academicYear} onChange={e => setAcademicYear(e.target.value)}
            style={{ width: '100%', padding: '9px 13px', border: `1.5px solid ${T.line}`, borderRadius: 9, fontSize: 13, fontFamily: T.font, outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: T.slate, marginBottom: 6, textTransform: 'uppercase', letterSpacing: .4 }}>Semestre</label>
          <select value={semester} onChange={e => setSemester(e.target.value)}
            style={{ width: '100%', padding: '9px 13px', border: `1.5px solid ${T.line}`, borderRadius: 9, fontSize: 13, fontFamily: T.font, background: T.white, outline: 'none', boxSizing: 'border-box' }}>
            {sems.map(s => <option key={s} value={s}>{s || 'Tous les semestres'}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 32 }}><Spin size={28} /></div>
      ) : (
        <div style={{ background: T.bg, borderRadius: 10, padding: '12px 16px', marginBottom: 20, display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <div><p style={{ fontSize: 10, color: T.silver, margin: '0 0 2px', textTransform: 'uppercase', fontWeight: 600 }}>UEs trouvées</p><p style={{ fontSize: 20, fontWeight: 700, color: T.navy, margin: 0 }}>{grades.length}</p></div>
          <div><p style={{ fontSize: 10, color: T.silver, margin: '0 0 2px', textTransform: 'uppercase', fontWeight: 600 }}>ECTS totaux</p><p style={{ fontSize: 20, fontWeight: 700, color: T.emer, margin: 0 }}>{grades.reduce((s, g) => s + (g.ectsObtained || 0), 0)}</p></div>
          <div><p style={{ fontSize: 10, color: T.silver, margin: '0 0 2px', textTransform: 'uppercase', fontWeight: 600 }}>UE validées</p><p style={{ fontSize: 20, fontWeight: 700, color: T.indigo, margin: 0 }}>{grades.filter(g => g.isValidated).length}/{grades.length}</p></div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10 }}>
        <Btn variant="secondary" onClick={onCancel} style={{ flex: 1, justifyContent: 'center' }}>Annuler</Btn>
        <Btn variant="indigo" onClick={handleGenerate} disabled={loading} style={{ flex: 1, justifyContent: 'center' }}>
          <FileText size={15} /> Générer le relevé
        </Btn>
      </div>
    </div>
  );
}

function GenerateAttestationModal({ student, onSave, onCancel }) {
  const [form, setForm] = useState({
    academicYear: student?.academicYear || getCurrentAcademicYear(),
    mention: student?.generalAverage ? getMention(student.generalAverage).label : '',
    juryPresident: '',
    registrar: '',
  });
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await new Promise(r => setTimeout(r, 500));
    onSave(form);
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: T.emerLt, borderRadius: 12, marginBottom: 20 }}>
        <Shield size={20} color={T.emer} />
        <div>
          <p style={{ fontWeight: 700, color: T.navy, margin: 0 }}>{student?.firstName} {student?.lastName}</p>
          <p style={{ fontSize: 11, color: T.slate, margin: 0 }}>{student?.program?.name} — Niveau {student?.level}</p>
        </div>
      </div>

      <Field label="Année académique" value={form.academicYear} onChange={set('academicYear')} required />
      <Field label="Mention obtenue" value={form.mention} onChange={set('mention')} placeholder="ex : Bien" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
        <Field label="Président du jury" value={form.juryPresident} onChange={set('juryPresident')} />
        <Field label="Responsable scolarité" value={form.registrar} onChange={set('registrar')} />
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        <Btn variant="secondary" onClick={onCancel} style={{ flex: 1, justifyContent: 'center' }}>Annuler</Btn>
        <Btn type="submit" variant="success" loading={saving} style={{ flex: 1, justifyContent: 'center' }}>
          <Shield size={15} /> Générer l'attestation
        </Btn>
      </div>
    </form>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// STUDENTS TABLE
// ══════════════════════════════════════════════════════════════════════════════
function StudentsTable({ data, loading, onAction, docs, tab }) {
  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 64, gap: 12 }}>
      <Spin size={36} />
      <p style={{ color: T.silver, fontSize: 13, margin: 0 }}>Chargement des étudiants…</p>
    </div>
  );
  if (!data?.length) return (
    <div style={{ textAlign: 'center', padding: 64, color: T.silver }}>
      <GraduationCap size={40} style={{ margin: '0 auto 12px', display: 'block', opacity: .3 }} />
      <p style={{ fontSize: 13, fontWeight: 600, color: T.navyLt, margin: '0 0 4px' }}>Aucun étudiant trouvé</p>
    </div>
  );

  const Icon = tab === 'diplomas' ? Award : tab === 'transcripts' ? BookOpen : Shield;
  const hasDoc = (s) => docs.some(d => d.studentId === s._id && d.type === tab);
  const getDoc = (s) => docs.find(d => d.studentId === s._id && d.type === tab);

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: T.font }}>
        <thead>
          <tr style={{ background: T.bg }}>
            {['Étudiant', 'Matricule', 'Filière / Niveau', 'Année acad.', 'Statut', 'Actions'].map(h => (
              <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: T.silver, letterSpacing: .6, textTransform: 'uppercase', borderBottom: `1px solid ${T.line}`, whiteSpace: 'nowrap' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((s, i) => {
            const done = hasDoc(s);
            const doc = getDoc(s);
            return (
              <tr key={s._id || i} style={{ borderBottom: `1px solid ${T.line}` }}
                onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                onMouseLeave={e => e.currentTarget.style.background = T.white}>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 9, background: done ? T.emerLt : T.indiLt, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: done ? T.emer : T.indigo }}>{(s.firstName?.[0] || '')}{(s.lastName?.[0] || '')}</span>
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, color: T.navy, margin: 0, fontSize: 13 }}>{s.firstName} {s.lastName}</p>
                      <p style={{ fontSize: 11, color: T.silver, margin: 0 }}>{s.email}</p>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ fontFamily: T.mono, fontSize: 12, color: T.slate, background: T.bg, padding: '3px 8px', borderRadius: 6 }}>{s.studentId || '—'}</span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <p style={{ color: T.navyLt, margin: 0, fontSize: 13, fontWeight: 500 }}>{s.program?.name || '—'}</p>
                  <p style={{ color: T.silver, margin: 0, fontSize: 11 }}>{s.level} — {s.currentSemester}</p>
                </td>
                <td style={{ padding: '12px 16px', fontSize: 12, color: T.slate }}>{s.academicYear || '—'}</td>
                <td style={{ padding: '12px 16px' }}>
                  <Badge bg={done ? T.emerLt : T.goldLt} color={done ? T.emerDk : T.goldDk}>
                    {done ? '✓ Généré' : '● Disponible'}
                  </Badge>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {!done ? (
                      <Btn size="sm" variant={tab === 'diplomas' ? 'gold' : tab === 'transcripts' ? 'indigo' : 'success'} onClick={() => onAction('generate', s)}>
                        <Icon size={13} /> Générer
                      </Btn>
                    ) : (
                      <>
                        <Btn size="sm" variant="ghost" onClick={() => onAction('view', s, doc)}><Eye size={13} /> Voir</Btn>
                        <Btn size="sm" variant="ghost" onClick={() => onAction('generate', s)}><RefreshCw size={13} /> Regénérer</Btn>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PAGE PRINCIPALE
// ══════════════════════════════════════════════════════════════════════════════
export default function DiplomasPage() {
  const { toast, ToastContainer } = useToast();

  // Données étudiants
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 20;
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [yearFilter, setYearFilter] = useState(getCurrentAcademicYear());

  // Onglet actif
  const [tab, setTab] = useState('diplomas'); // diplomas | transcripts | attestations | archive

  // Documents générés (localStorage)
  const [docs, setDocs] = useState(loadDocs);

  // Modals
  const [genModal, setGenModal] = useState({ open: false, student: null });
  const [viewModal, setViewModal] = useState({ open: false, doc: null });

  // ─── Charger étudiants ────────────────────────────────────────────────────
  const loadStudents = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT };
      if (search) params.search = search;
      if (levelFilter) params.level = levelFilter;
      if (yearFilter) params.academicYear = yearFilter;
      const res = await studentAPI.getAll(params);
      const list = res?.data?.data || res?.data?.students || res?.data || [];
      const count = res?.data?.total || res?.total || list.length;
      setStudents(list);
      setTotal(count);
    } catch (err) {
      toast('Erreur lors du chargement des étudiants', 'error');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, levelFilter, yearFilter]);

  useEffect(() => { loadStudents(); }, [loadStudents]);

  // ─── Persistance docs ─────────────────────────────────────────────────────
  const addDoc = (docEntry) => {
    setDocs(prev => {
      // Remplacer si déjà existant (même étudiant, même type)
      const filtered = prev.filter(d => !(d.studentId === docEntry.studentId && d.type === docEntry.type && (docEntry.type !== 'transcripts' || d.academicYear === docEntry.academicYear)));
      const next = [...filtered, docEntry];
      saveDocs(next);
      return next;
    });
    // Archivage automatique
    pushToArchive({
      id: docEntry.id,
      type: 'diplomes',
      label: { diplomas: 'Diplôme', transcripts: 'Relevé de notes', attestations: 'Attestation' }[docEntry.type] || 'Document',
      name: `${docEntry.type === 'diplomas' ? 'Diplôme' : docEntry.type === 'transcripts' ? 'Relevé de notes' : 'Attestation'} — ${docEntry.studentName}`,
      date: docEntry.generatedAt,
      size: 50000,
      items: 1,
      academicYear: docEntry.academicYear || getCurrentAcademicYear(),
      status: 'archived',
      archivedBy: 'admin',
      retentionPeriod: 'permanent',
      metadata: { source: 'document_generation', docType: docEntry.type, studentId: docEntry.studentId }
    });
  };

  // ─── Actions ──────────────────────────────────────────────────────────────
  const handleAction = (action, student, existingDoc) => {
    if (action === 'generate') {
      setGenModal({ open: true, student });
    } else if (action === 'view' && existingDoc) {
      setViewModal({ open: true, doc: existingDoc });
    }
  };

  const handleSaveDiploma = (formData) => {
    const student = genModal.student;
    const doc = {
      id: genId(),
      type: 'diplomas',
      studentId: student._id,
      studentName: `${student.firstName} ${student.lastName}`,
      academicYear: student.academicYear || getCurrentAcademicYear(),
      generatedAt: new Date().toISOString(),
      student,
      ...formData,
    };
    addDoc(doc);
    setGenModal({ open: false, student: null });
    toast(`✓ Diplôme de ${student.firstName} ${student.lastName} émis et archivé`);
  };

  const handleSaveTranscript = (formData) => {
    const student = genModal.student;
    const doc = {
      id: genId(),
      type: 'transcripts',
      studentId: student._id,
      studentName: `${student.firstName} ${student.lastName}`,
      academicYear: formData.academicYear,
      generatedAt: new Date().toISOString(),
      student,
      ...formData,
    };
    addDoc(doc);
    setGenModal({ open: false, student: null });
    toast(`✓ Relevé de notes de ${student.firstName} ${student.lastName} généré et archivé`);
  };

  const handleSaveAttestation = (formData) => {
    const student = genModal.student;
    const doc = {
      id: genId(),
      type: 'attestations',
      attestationNumber: `ATT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      studentId: student._id,
      studentName: `${student.firstName} ${student.lastName}`,
      academicYear: formData.academicYear,
      generatedAt: new Date().toISOString(),
      student,
      ...formData,
    };
    addDoc(doc);
    setGenModal({ open: false, student: null });
    toast(`✓ Attestation de ${student.firstName} ${student.lastName} générée et archivée`);
  };

  // ─── Stats ────────────────────────────────────────────────────────────────
  const diplomas = docs.filter(d => d.type === 'diplomas');
  const transcripts = docs.filter(d => d.type === 'transcripts');
  const attestations = docs.filter(d => d.type === 'attestations');

  const levelOptions = [
    { value: '', label: 'Tous les niveaux' },
    ...['L1', 'L2', 'L3', 'M1', 'M2', 'BTS1', 'BTS2', 'BUT1', 'BUT2', 'BUT3'].map(l => ({ value: l, label: l }))
  ];

  const tabs = [
    { id: 'diplomas', label: 'Diplômes', icon: Award, count: diplomas.length },
    { id: 'transcripts', label: 'Relevés de notes', icon: BookOpen, count: transcripts.length },
    { id: 'attestations', label: 'Attestations', icon: Shield, count: attestations.length },
    { id: 'archive', label: 'Documents générés', icon: Archive, count: docs.length },
  ];

  const tabAccent = { diplomas: T.gold, transcripts: T.indigo, attestations: T.emer, archive: T.navyLt };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: T.font, maxWidth: 1440, margin: '0 auto', minHeight: '100vh', background: '#F1F5F9' }}>
      <ToastContainer />
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes popIn { from { opacity:0; transform:scale(.94); } to { opacity:1; transform:scale(1); } }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 48, height: 48, background: T.navy, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GraduationCap size={24} color={T.gold} />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: T.navy, margin: 0 }}>Documents Officiels</h1>
            <p style={{ fontSize: 12, color: T.silver, margin: 0 }}>Diplômes · Relevés de notes · Attestations — Année {getCurrentAcademicYear()}</p>
          </div>
        </div>
        <Btn variant="ghost" onClick={loadStudents}><RefreshCw size={14} /> Actualiser</Btn>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 22 }}>
        <StatCard title="Étudiants" value={total} icon={<GraduationCap size={20} />} accent={T.navyMid} />
        <StatCard title="Diplômes émis" value={diplomas.length} icon={<Award size={20} />} accent={T.gold}
          sub={diplomas.length > 0 ? `${Math.round(diplomas.length / (total || 1) * 100)}% du total` : undefined} />
        <StatCard title="Relevés générés" value={transcripts.length} icon={<BookOpen size={20} />} accent={T.indigo} />
        <StatCard title="Attestations" value={attestations.length} icon={<Shield size={20} />} accent={T.emer} />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px',
            borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer',
            border: tab === t.id ? `2px solid ${tabAccent[t.id]}` : `1px solid ${T.line}`,
            background: tab === t.id ? tabAccent[t.id] + '15' : T.white,
            color: tab === t.id ? tabAccent[t.id] : T.slate,
            transition: 'all .15s'
          }}>
            <t.icon size={15} /> {t.label}
            {t.count > 0 && (
              <span style={{ background: tab === t.id ? tabAccent[t.id] : T.bg, color: tab === t.id ? T.white : T.slate, borderRadius: 20, padding: '1px 7px', fontSize: 10, fontWeight: 700 }}>{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Filters (only for student tabs) */}
      {tab !== 'archive' && (
        <Card style={{ padding: '14px 18px', marginBottom: 18 }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: T.silver }} />
              <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Nom, prénom, matricule…"
                style={{ width: '100%', padding: '9px 13px 9px 32px', border: `1.5px solid ${T.line}`, borderRadius: 9, fontSize: 13, fontFamily: T.font, outline: 'none', background: T.bg, boxSizing: 'border-box' }} />
            </div>
            <select value={levelFilter} onChange={e => { setLevelFilter(e.target.value); setPage(1); }}
              style={{ padding: '9px 13px', border: `1.5px solid ${T.line}`, borderRadius: 9, fontSize: 13, fontFamily: T.font, background: T.white, outline: 'none', cursor: 'pointer', minWidth: 140 }}>
              {levelOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Calendar size={14} color={T.silver} />
              <input value={yearFilter} onChange={e => { setYearFilter(e.target.value); setPage(1); }} placeholder="2025-2026"
                style={{ padding: '9px 13px', border: `1.5px solid ${T.line}`, borderRadius: 9, fontSize: 13, fontFamily: T.font, outline: 'none', width: 110 }} />
            </div>
            {(search || levelFilter) && (
              <Btn size="sm" variant="ghost" onClick={() => { setSearch(''); setLevelFilter(''); setPage(1); }}><X size={13} /> Réinitialiser</Btn>
            )}
          </div>
        </Card>
      )}

      {/* Contenu selon onglet */}
      {tab !== 'archive' ? (
        <Card>
          <div style={{ padding: '14px 20px', borderBottom: `1px solid ${T.line}`, background: T.bg, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: 13, fontWeight: 700, color: T.navy, margin: 0 }}>
                {tab === 'diplomas' ? 'Émission de diplômes' : tab === 'transcripts' ? 'Génération de relevés de notes' : 'Génération d\'attestations de réussite'}
              </h2>
              <p style={{ fontSize: 11, color: T.silver, margin: '2px 0 0' }}>
                {tab === 'diplomas' && 'Cliquez sur "Générer" pour émettre un diplôme officiel pour un étudiant'}
                {tab === 'transcripts' && 'Génère un relevé de notes complet avec toutes les UE et moyennes'}
                {tab === 'attestations' && 'Certifie officiellement qu\'un étudiant a validé sa formation'}
              </p>
            </div>
            {loading && <Spin size={18} />}
          </div>
          <StudentsTable data={students} loading={loading} onAction={handleAction} docs={docs} tab={tab} />
          <Pagination page={page} total={total} limit={LIMIT} onPageChange={setPage} />
        </Card>
      ) : (
        /* ─── Archive des documents générés ─── */
        <Card>
          <div style={{ padding: '14px 20px', borderBottom: `1px solid ${T.line}`, background: T.bg, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: 13, fontWeight: 700, color: T.navy, margin: 0 }}>Documents générés ({docs.length})</h2>
              <p style={{ fontSize: 11, color: T.silver, margin: '2px 0 0' }}>Tous les documents officiels émis — archivés automatiquement</p>
            </div>
          </div>
          {docs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 64, color: T.silver }}>
              <Archive size={40} style={{ margin: '0 auto 12px', display: 'block', opacity: .25 }} />
              <p style={{ fontSize: 13, fontWeight: 600, color: T.navyLt, margin: '0 0 4px' }}>Aucun document généré</p>
              <p style={{ fontSize: 12, margin: 0 }}>Les diplômes, relevés et attestations apparaîtront ici</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: T.font }}>
                <thead>
                  <tr style={{ background: T.bg }}>
                    {['Type', 'Étudiant', 'Matricule', 'Année acad.', 'Généré le', 'Détails', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: T.silver, letterSpacing: .6, textTransform: 'uppercase', borderBottom: `1px solid ${T.line}`, whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...docs].reverse().map((doc, i) => {
                    const typeInfo = {
                      diplomas:     { label: 'Diplôme',    bg: T.goldLt,  color: T.goldDk,  icon: Award },
                      transcripts:  { label: 'Relevé',     bg: T.indiLt,  color: T.indiDk,  icon: BookOpen },
                      attestations: { label: 'Attestation', bg: T.emerLt, color: T.emerDk,  icon: Shield },
                    }[doc.type] || { label: doc.type, bg: T.bg, color: T.slate, icon: FileText };
                    const TIcon = typeInfo.icon;
                    return (
                      <tr key={doc.id || i} style={{ borderBottom: `1px solid ${T.line}` }}
                        onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                        onMouseLeave={e => e.currentTarget.style.background = T.white}>
                        <td style={{ padding: '12px 16px' }}>
                          <Badge bg={typeInfo.bg} color={typeInfo.color}>
                            <TIcon size={11} style={{ marginRight: 4 }} />{typeInfo.label}
                          </Badge>
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: 600, color: T.navy, fontSize: 13 }}>{doc.studentName}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ fontFamily: T.mono, fontSize: 12, color: T.slate, background: T.bg, padding: '2px 8px', borderRadius: 6 }}>{doc.student?.studentId || '—'}</span>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 12, color: T.slate }}>{doc.academicYear || '—'}</td>
                        <td style={{ padding: '12px 16px', fontSize: 12, color: T.slate }}>{fmtDate(doc.generatedAt)}</td>
                        <td style={{ padding: '12px 16px', fontSize: 12, color: T.slate }}>
                          {doc.type === 'diplomas' && doc.diplomaNumber && <span style={{ fontFamily: T.mono, fontSize: 11 }}>{doc.diplomaNumber}</span>}
                          {doc.type === 'transcripts' && <span>{(doc.grades || []).length} UE</span>}
                          {doc.type === 'attestations' && doc.attestationNumber && <span style={{ fontFamily: T.mono, fontSize: 11 }}>{doc.attestationNumber}</span>}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <Btn size="sm" variant="ghost" onClick={() => setViewModal({ open: true, doc })}><Eye size={13} /> Voir</Btn>
                            <Btn size="sm" variant="ghost" onClick={() => {
                              const updated = docs.filter(d => d.id !== doc.id);
                              setDocs(updated);
                              saveDocs(updated);
                              toast('Document supprimé des archives locales', 'error');
                            }}><X size={13} /></Btn>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* ─── Modal Génération ─── */}
      <Modal
        isOpen={genModal.open}
        onClose={() => setGenModal({ open: false, student: null })}
        title={tab === 'diplomas' ? 'Émettre un diplôme' : tab === 'transcripts' ? 'Générer un relevé de notes' : 'Générer une attestation de réussite'}
        size="md"
      >
        {genModal.student && tab === 'diplomas' && (
          <GenerateDiplomaModal
            student={genModal.student}
            onSave={handleSaveDiploma}
            onCancel={() => setGenModal({ open: false, student: null })}
          />
        )}
        {genModal.student && tab === 'transcripts' && (
          <GenerateTranscriptModal
            student={genModal.student}
            onSave={handleSaveTranscript}
            onCancel={() => setGenModal({ open: false, student: null })}
            toast={toast}
          />
        )}
        {genModal.student && tab === 'attestations' && (
          <GenerateAttestationModal
            student={genModal.student}
            onSave={handleSaveAttestation}
            onCancel={() => setGenModal({ open: false, student: null })}
          />
        )}
      </Modal>

      {/* ─── Modal Visualisation ─── */}
      <Modal
        isOpen={viewModal.open}
        onClose={() => setViewModal({ open: false, doc: null })}
        title={viewModal.doc?.type === 'diplomas' ? '🎓 Diplôme' : viewModal.doc?.type === 'transcripts' ? '📋 Relevé de notes' : '🛡️ Attestation de réussite'}
        size="lg"
      >
        {viewModal.doc?.type === 'diplomas' && (
          <DiplomaView doc={viewModal.doc} onClose={() => setViewModal({ open: false, doc: null })} />
        )}
        {viewModal.doc?.type === 'transcripts' && (
          <TranscriptView doc={viewModal.doc} onClose={() => setViewModal({ open: false, doc: null })} />
        )}
        {viewModal.doc?.type === 'attestations' && (
          <AttestationView doc={viewModal.doc} onClose={() => setViewModal({ open: false, doc: null })} />
        )}
      </Modal>
    </div>
  );
}
