// pages/admin/DiplomasPage.jsx
import { useState, useEffect, useCallback } from 'react';
import {
  Award, CheckCircle, Eye, QrCode, Printer,
  Search, X, GraduationCap, Users, ChevronLeft,
  ChevronRight, Download, RefreshCw,
} from 'lucide-react';
import { studentAPI } from '../../services/services';

/* ─── Google Fonts ───────────────────────────────────────────────────────── */
if (!document.getElementById('diploma-fonts')) {
  const link = document.createElement('link');
  link.id   = 'diploma-fonts';
  link.rel  = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap';
  document.head.appendChild(link);
}

/* ─── Tokens ─────────────────────────────────────────────────────────────── */
const T = {
  navy:   '#0F172A', navyMid:'#1E293B', navyLt:'#334155',
  slate:  '#64748B', silver:'#94A3B8',  line:'#E2E8F0',
  bg:     '#F8FAFC', white:'#FFFFFF',
  gold:   '#F59E0B', goldLt:'#FEF3C7',  goldDk:'#92400E',
  emer:   '#059669', emerLt:'#D1FAE5',  emerDk:'#065F46',
  indigo: '#4F46E5', indiLt:'#EEF2FF',  indiDk:'#3730A3',
  rose:   '#E11D48', roseLt:'#FFE4E6',  roseDk:'#9F1239',
  purple: '#9333EA', purpLt:'#F3E8FF',
  font:   "'Sora', sans-serif",
  mono:   "'JetBrains Mono', monospace",
};

/* ─── Helpers ────────────────────────────────────────────────────────────── */
const getMention = (avg) => {
  if (avg >= 16) return { label: 'Très Bien',  color: T.purple, bg: T.purpLt };
  if (avg >= 14) return { label: 'Bien',        color: T.indigo, bg: T.indiLt };
  if (avg >= 12) return { label: 'Assez Bien',  color: '#0891B2', bg: '#CFFAFE' };
  if (avg >= 10) return { label: 'Passable',    color: T.emer,   bg: T.emerLt };
  return             { label: 'Non validé',   color: T.rose,   bg: T.roseLt };
};

const fmt = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '—';
const fmtLong = (d) => d ? new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';

/* ─── useToast ───────────────────────────────────────────────────────────── */
function useToast() {
  const [toasts, setToasts] = useState([]);
  const show = useCallback((msg, type = 'success') => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);
  const ToastContainer = () => (
    <div style={{ position:'fixed', bottom:24, right:24, zIndex:9999, display:'flex', flexDirection:'column', gap:8 }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          padding:'12px 20px', borderRadius:10, fontSize:13, fontWeight:500, fontFamily:T.font,
          background: t.type==='error' ? T.roseLt : T.emerLt,
          color:      t.type==='error' ? T.roseDk  : T.emerDk,
          border:`1px solid ${t.type==='error' ? '#FECDD3' : '#A7F3D0'}`,
          boxShadow:'0 8px 24px rgba(0,0,0,.12)', animation:'slideUp .25s ease',
        }}>{t.msg}</div>
      ))}
    </div>
  );
  return { toast: show, ToastContainer };
}

/* ─── Spinner ────────────────────────────────────────────────────────────── */
const Spinner = ({ size=24, color=T.indigo }) => (
  <div style={{
    width:size, height:size, flexShrink:0,
    border:`2.5px solid ${T.line}`, borderTopColor:color,
    borderRadius:'50%', animation:'spin .75s linear infinite',
  }} />
);

/* ─── Badge ──────────────────────────────────────────────────────────────── */
const Badge = ({ children, bg, color, mono }) => (
  <span style={{
    display:'inline-flex', alignItems:'center',
    padding:'3px 10px', borderRadius:20,
    fontSize:11, fontWeight:600,
    fontFamily: mono ? T.mono : T.font,
    background:bg, color, letterSpacing:.3,
  }}>{children}</span>
);

/* ─── Button ─────────────────────────────────────────────────────────────── */
function Btn({ children, onClick, variant='primary', size='md', loading, disabled, type='button', style={} }) {
  const V = {
    primary:   { bg:T.navy,    color:T.white,  border:'none',                   hover:T.navyMid },
    gold:      { bg:T.gold,    color:T.navy,   border:'none',                   hover:'#D97706' },
    secondary: { bg:T.white,   color:T.navyLt, border:`1px solid ${T.line}`,    hover:T.bg },
    danger:    { bg:T.roseLt,  color:T.roseDk, border:`1px solid #FECDD3`,      hover:'#FFD6DA' },
    success:   { bg:T.emerLt,  color:T.emerDk, border:'none',                   hover:'#BBFADA' },
    ghost:     { bg:'transparent', color:T.slate, border:'none',                 hover:T.bg },
    indigo:    { bg:T.indigo,  color:T.white,  border:'none',                   hover:T.indiDk },
  };
  const S = { sm:{padding:'5px 11px',fontSize:11}, md:{padding:'9px 16px',fontSize:13}, lg:{padding:'11px 22px',fontSize:14} };
  const v = V[variant];
  return (
    <button type={type} onClick={onClick} disabled={disabled||loading}
      style={{ background:v.bg, color:v.color, border:v.border, ...S[size],
        borderRadius:9, fontWeight:600, cursor:(disabled||loading)?'not-allowed':'pointer',
        opacity:(disabled||loading)?.55:1, display:'inline-flex', alignItems:'center', gap:6,
        fontFamily:T.font, transition:'background .15s', letterSpacing:.2, ...style }}
      onMouseEnter={e=>{ if(!disabled&&!loading) e.currentTarget.style.background=v.hover; }}
      onMouseLeave={e=>{ e.currentTarget.style.background=v.bg; }}
    >
      {loading && <Spinner size={14} />}
      {children}
    </button>
  );
}

/* ─── Card ───────────────────────────────────────────────────────────────── */
const Card = ({ children, style }) => (
  <div style={{ background:T.white, borderRadius:14, border:`1px solid ${T.line}`, overflow:'hidden', ...style }}>
    {children}
  </div>
);

/* ─── StatCard ───────────────────────────────────────────────────────────── */
const StatCard = ({ title, value, icon, accent, sub }) => (
  <div style={{
    background:T.white, borderRadius:14, border:`1px solid ${T.line}`,
    padding:'20px 22px', display:'flex', alignItems:'center', gap:16,
    position:'relative', overflow:'hidden',
  }}>
    <div style={{ position:'absolute', left:0, top:0, bottom:0, width:4, background:accent, borderRadius:'14px 0 0 14px' }} />
    <div style={{ width:46, height:46, borderRadius:12, background:accent+'20', color:accent, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
      {icon}
    </div>
    <div>
      <p style={{ fontSize:11, color:T.silver, fontWeight:600, letterSpacing:.5, textTransform:'uppercase', margin:0 }}>{title}</p>
      <p style={{ fontSize:28, fontWeight:700, color:T.navy, margin:0, fontFamily:T.mono, lineHeight:1.2 }}>{value}</p>
      {sub && <p style={{ fontSize:11, color:T.silver, margin:'2px 0 0' }}>{sub}</p>}
    </div>
  </div>
);

/* ─── Modal ──────────────────────────────────────────────────────────────── */
function Modal({ isOpen, onClose, title, children, size='md' }) {
  useEffect(() => {
    const h = (e) => e.key==='Escape' && onClose();
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);
  if (!isOpen) return null;
  const widths = { sm:400, md:560, lg:760, xl:960 };
  return (
    <div onClick={onClose} style={{
      position:'fixed', inset:0, background:'rgba(15,23,42,.55)',
      backdropFilter:'blur(6px)', display:'flex', alignItems:'center',
      justifyContent:'center', zIndex:1000, padding:16,
    }}>
      <div onClick={e=>e.stopPropagation()} style={{
        background:T.white, borderRadius:18, width:'100%',
        maxWidth:widths[size], maxHeight:'92vh', overflowY:'auto',
        boxShadow:'0 24px 64px rgba(0,0,0,.22)', animation:'popIn .22s ease',
      }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
          padding:'20px 24px', borderBottom:`1px solid ${T.line}`, background:T.bg }}>
          <span style={{ fontSize:16, fontWeight:700, color:T.navy, fontFamily:T.font }}>{title}</span>
          <button onClick={onClose} style={{
            width:32, height:32, borderRadius:8, border:`1px solid ${T.line}`,
            background:T.white, cursor:'pointer', fontSize:18, color:T.slate,
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ─── Input ──────────────────────────────────────────────────────────────── */
function Field({ label, value, onChange, placeholder, type='text', required, readOnly }) {
  const [focus, setFocus] = useState(false);
  return (
    <div style={{ marginBottom:16 }}>
      {label && <label style={{ display:'block', fontSize:11, fontWeight:600, color:T.slate, marginBottom:6, letterSpacing:.4, textTransform:'uppercase' }}>
        {label}{required && <span style={{ color:T.rose }}> *</span>}
      </label>}
      <input
        type={type} value={value} onChange={onChange} placeholder={placeholder}
        required={required} readOnly={readOnly}
        onFocus={()=>setFocus(true)} onBlur={()=>setFocus(false)}
        style={{
          width:'100%', padding:'9px 13px',
          border:`1.5px solid ${focus ? T.indigo : T.line}`,
          borderRadius:9, fontSize:13, fontFamily:T.font, outline:'none',
          background: readOnly ? T.bg : (focus ? T.indiLt : T.white),
          color:T.navy, boxSizing:'border-box', transition:'all .18s',
          cursor: readOnly ? 'default' : 'text',
        }}
      />
    </div>
  );
}

/* ─── Select ─────────────────────────────────────────────────────────────── */
function Sel({ label, value, onChange, options, style={} }) {
  return (
    <div style={{ marginBottom:16, ...style }}>
      {label && <label style={{ display:'block', fontSize:11, fontWeight:600, color:T.slate, marginBottom:6, letterSpacing:.4, textTransform:'uppercase' }}>{label}</label>}
      <select value={value} onChange={onChange}
        style={{ width:'100%', padding:'9px 13px', border:`1.5px solid ${T.line}`,
          borderRadius:9, fontSize:13, fontFamily:T.font, background:T.white,
          outline:'none', cursor:'pointer', color:T.navy }}>
        {options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

/* ─── Pagination ─────────────────────────────────────────────────────────── */
function Pagination({ page, total, limit, onPageChange }) {
  const pages = Math.ceil(total / limit);
  if (pages <= 1) return null;
  return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:10, padding:16, borderTop:`1px solid ${T.line}` }}>
      <button onClick={()=>onPageChange(page-1)} disabled={page===1}
        style={{ width:32, height:32, border:`1px solid ${T.line}`, borderRadius:8, background:T.white, cursor:page===1?'not-allowed':'pointer', opacity:page===1?.4:1, display:'flex', alignItems:'center', justifyContent:'center' }}>
        <ChevronLeft size={16} color={T.slate} />
      </button>
      <span style={{ fontSize:12, color:T.slate, fontFamily:T.font }}>
        Page <strong style={{ color:T.navy }}>{page}</strong> sur {pages} — {total} résultat{total>1?'s':''}
      </span>
      <button onClick={()=>onPageChange(page+1)} disabled={page===pages}
        style={{ width:32, height:32, border:`1px solid ${T.line}`, borderRadius:8, background:T.white, cursor:page===pages?'not-allowed':'pointer', opacity:page===pages?.4:1, display:'flex', alignItems:'center', justifyContent:'center' }}>
        <ChevronRight size={16} color={T.slate} />
      </button>
    </div>
  );
}

/* ─── Generate Diploma Modal ─────────────────────────────────────────────── */
function GenerateDiplomaModal({ student, onSave, onCancel }) {
  const [form, setForm] = useState({
    diplomaNumber:  `DIP-${new Date().getFullYear()}-${String(Math.floor(Math.random()*9000)+1000)}`,
    graduationDate: new Date().toISOString().slice(0,10),
    mention:        student?.generalAverage ? getMention(student.generalAverage).label : '',
    juryPresident:  '',
    registrar:      '',
    notes:          '',
  });
  const [saving, setSaving] = useState(false);
  const { toast, ToastContainer } = useToast();

  const set = (key) => (e) => setForm(f=>({...f,[key]:e.target.value}));
  const mention = student?.generalAverage != null ? getMention(student.generalAverage) : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.diplomaNumber || !form.graduationDate) {
      toast('Veuillez remplir les champs obligatoires', 'error'); return;
    }
    setSaving(true);
    try {
      // Appel API réel via studentAPI.issueDiploma ou fallback
      if (studentAPI?.issueDiploma) {
        await studentAPI.issueDiploma(student._id, form);
      } else {
        // Simulation d'une sauvegarde (à remplacer par votre endpoint)
        await new Promise(r => setTimeout(r, 800));
      }
      toast('Diplôme généré avec succès ✓');
      setTimeout(onSave, 900);
    } catch (err) {
      toast(err?.message || 'Erreur lors de la génération', 'error');
    } finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding:24 }}>
      <ToastContainer />

      {/* Student banner */}
      <div style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 18px', background:T.navy, borderRadius:12, marginBottom:24 }}>
        <div style={{ width:44, height:44, borderRadius:10, background:T.gold, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <GraduationCap size={22} color={T.navy} />
        </div>
        <div style={{ flex:1 }}>
          <p style={{ fontWeight:700, color:T.white, fontSize:15, margin:0 }}>
            {student?.firstName} {student?.lastName}
          </p>
          <p style={{ fontSize:11, color:T.silver, margin:'2px 0 0', fontFamily:T.mono }}>{student?.studentId}</p>
          <p style={{ fontSize:11, color:T.silver, margin:'1px 0 0' }}>{student?.program?.name || '—'}</p>
        </div>
        {mention && (
          <div style={{ textAlign:'right' }}>
            <p style={{ fontFamily:T.mono, fontSize:18, fontWeight:700, color:T.gold, margin:0 }}>
              {student.generalAverage}<span style={{ fontSize:12, color:T.silver }}>/20</span>
            </p>
            <Badge bg={mention.bg} color={mention.color}>{mention.label}</Badge>
          </div>
        )}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 20px' }}>
        <Field label="N° de diplôme" value={form.diplomaNumber} onChange={set('diplomaNumber')} required />
        <Field label="Date de graduation" type="date" value={form.graduationDate} onChange={set('graduationDate')} required />
      </div>
      <Field label="Mention" value={form.mention} onChange={set('mention')} placeholder="ex : Très Bien" />
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 20px' }}>
        <Field label="Président du jury" value={form.juryPresident} onChange={set('juryPresident')} />
        <Field label="Responsable scolarité" value={form.registrar} onChange={set('registrar')} />
      </div>
      <Field label="Observations (facultatif)" value={form.notes} onChange={set('notes')} />

      <div style={{ display:'flex', gap:10, marginTop:8 }}>
        <Btn variant="secondary" onClick={onCancel} style={{ flex:1, justifyContent:'center' }}>Annuler</Btn>
        <Btn type="submit" variant="gold" loading={saving} style={{ flex:1, justifyContent:'center' }}>
          <Award size={15} /> Générer le diplôme
        </Btn>
      </div>
    </form>
  );
}

/* ─── Diploma View Modal ─────────────────────────────────────────────────── */
function DiplomaViewModal({ student, diploma, onClose }) {
  const data = diploma || student;
  if (!data) return null;

  const avg = data.generalAverage ?? diploma?.generalAverage;
  const mention = avg != null ? getMention(avg) : null;

  return (
    <div style={{ padding:'28px 28px 24px' }}>
      {/* Header */}
      <div style={{ textAlign:'center', marginBottom:24, paddingBottom:20, borderBottom:`1px solid ${T.line}` }}>
        <div style={{
          width:72, height:72,
          background:`linear-gradient(135deg, ${T.gold}, #FBBF24)`,
          borderRadius:20, display:'flex', alignItems:'center', justifyContent:'center',
          margin:'0 auto 14px', boxShadow:'0 8px 28px rgba(245,158,11,.35)',
        }}>
          <GraduationCap size={36} color={T.navy} />
        </div>
        <h3 style={{ fontSize:20, fontWeight:700, color:T.navy, margin:'0 0 4px' }}>Diplôme Universitaire</h3>
        <p style={{ fontSize:12, color:T.silver, fontFamily:T.mono, margin:0 }}>
          N° {diploma?.diplomaNumber || 'En attente'}
        </p>
      </div>

      {/* Étudiant */}
      <div style={{ marginBottom:18 }}>
        <p style={{ fontSize:11, color:T.silver, margin:'0 0 4px', textTransform:'uppercase', fontWeight:600, letterSpacing:.4 }}>Décerné à</p>
        <p style={{ fontSize:20, fontWeight:700, color:T.navy, margin:'0 0 2px' }}>
          {data.firstName} {data.lastName}
        </p>
        <p style={{ fontSize:12, color:T.slate, margin:0, fontFamily:T.mono }}>{data.studentId}</p>
        {data.dateOfBirth && <p style={{ fontSize:12, color:T.slate, margin:'4px 0 0' }}>Né(e) le {fmt(data.dateOfBirth)}</p>}
      </div>

      {/* Programme */}
      <div style={{ background:T.bg, borderRadius:10, padding:'14px 16px', marginBottom:16 }}>
        <p style={{ fontSize:11, color:T.silver, margin:'0 0 3px', textTransform:'uppercase', letterSpacing:.5, fontWeight:600 }}>Formation</p>
        <p style={{ fontSize:15, fontWeight:600, color:T.navy, margin:0 }}>{data.program?.name || '—'}</p>
        <p style={{ fontSize:12, color:T.slate, margin:'3px 0 0' }}>
          Niveau {data.level} — {data.academicYear || '2024-2025'}
        </p>
      </div>

      {/* Moyenne + mention */}
      {avg != null && (
        <div style={{ display:'flex', gap:12, marginBottom:18 }}>
          <div style={{ flex:1, background:T.navy, borderRadius:10, padding:'14px 16px' }}>
            <p style={{ fontSize:10, color:T.silver, margin:'0 0 4px', textTransform:'uppercase', letterSpacing:.5, fontWeight:600 }}>Moyenne générale</p>
            <p style={{ fontSize:26, fontWeight:700, color:T.gold, margin:0, fontFamily:T.mono }}>
              {avg}<span style={{ fontSize:13, color:T.silver }}>/20</span>
            </p>
          </div>
          {mention && (
            <div style={{ flex:1, background:mention.bg, borderRadius:10, padding:'14px 16px', display:'flex', flexDirection:'column', justifyContent:'center' }}>
              <p style={{ fontSize:10, color:mention.color+'99', margin:'0 0 4px', textTransform:'uppercase', letterSpacing:.5, fontWeight:600 }}>Mention</p>
              <p style={{ fontSize:18, fontWeight:700, color:mention.color, margin:0 }}>{mention.label}</p>
            </div>
          )}
        </div>
      )}

      {/* Infos diplôme */}
      {diploma && (
        <div style={{ fontSize:12, color:T.slate, marginBottom:18, display:'flex', flexDirection:'column', gap:5 }}>
          {diploma.graduationDate && <p style={{ margin:0 }}>📅 Délivré le {fmtLong(diploma.graduationDate)}</p>}
          {diploma.juryPresident  && <p style={{ margin:0 }}>👤 Président du jury : {diploma.juryPresident}</p>}
          {diploma.registrar      && <p style={{ margin:0 }}>✍️ Scolarité : {diploma.registrar}</p>}
        </div>
      )}

      {/* QR */}
      <div style={{ textAlign:'center', padding:'14px', background:T.bg, borderRadius:12, marginBottom:20 }}>
        <QrCode size={48} color={T.navyLt} style={{ margin:'0 auto 6px', display:'block' }} />
        <p style={{ fontSize:10, color:T.silver, margin:0, letterSpacing:.4, textTransform:'uppercase', fontWeight:600 }}>QR Code d'authentification</p>
      </div>

      <div style={{ display:'flex', gap:10 }}>
        <Btn variant="secondary" onClick={onClose} style={{ flex:1, justifyContent:'center' }}>Fermer</Btn>
        <Btn variant="primary" onClick={()=>window.print()} style={{ flex:1, justifyContent:'center' }}>
          <Printer size={15} /> Imprimer
        </Btn>
      </div>
    </div>
  );
}

/* ─── Table ──────────────────────────────────────────────────────────────── */
function StudentsTable({ data, loading, onGenerate, onView, issuedMap }) {
  if (loading) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:64, gap:12 }}>
      <Spinner size={36} />
      <p style={{ color:T.silver, fontSize:13, fontFamily:T.font, margin:0 }}>Chargement des étudiants…</p>
    </div>
  );

  if (!data?.length) return (
    <div style={{ textAlign:'center', padding:64, color:T.silver }}>
      <GraduationCap size={44} style={{ margin:'0 auto 12px', display:'block', opacity:.3 }} />
      <p style={{ fontFamily:T.font, fontSize:14, fontWeight:600, color:T.navyLt, margin:'0 0 4px' }}>Aucun étudiant trouvé</p>
      <p style={{ fontFamily:T.font, fontSize:12, margin:0 }}>Essayez de modifier vos filtres</p>
    </div>
  );

  return (
    <div style={{ overflowX:'auto' }}>
      <table style={{ width:'100%', borderCollapse:'collapse', fontFamily:T.font }}>
        <thead>
          <tr style={{ background:T.bg }}>
            {['Étudiant','Matricule','Filière / Niveau','Moy. générale','Mention','Statut','Actions'].map(h => (
              <th key={h} style={{ padding:'11px 16px', textAlign:'left', fontSize:10, fontWeight:700, color:T.silver, letterSpacing:.6, textTransform:'uppercase', borderBottom:`1px solid ${T.line}`, whiteSpace:'nowrap' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((s, i) => {
            const avg  = s.generalAverage;
            const m    = avg != null ? getMention(avg) : null;
            const done = issuedMap[s._id];
            return (
              <tr key={s._id || i}
                style={{ borderBottom:`1px solid ${T.line}`, transition:'background .12s' }}
                onMouseEnter={e=>e.currentTarget.style.background='#F8FAFC'}
                onMouseLeave={e=>e.currentTarget.style.background=T.white}>

                {/* Nom */}
                <td style={{ padding:'13px 16px', verticalAlign:'middle' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{
                      width:34, height:34, borderRadius:9,
                      background: done ? T.emerLt : T.indiLt,
                      display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
                    }}>
                      <span style={{ fontSize:13, fontWeight:700, color: done ? T.emer : T.indigo }}>
                        {(s.firstName?.[0]||'')}{(s.lastName?.[0]||'')}
                      </span>
                    </div>
                    <div>
                      <p style={{ fontWeight:600, color:T.navy, margin:0, fontSize:13 }}>{s.firstName} {s.lastName}</p>
                      <p style={{ fontSize:11, color:T.silver, margin:0 }}>{s.email}</p>
                    </div>
                  </div>
                </td>

                {/* Matricule */}
                <td style={{ padding:'13px 16px', verticalAlign:'middle' }}>
                  <span style={{ fontFamily:T.mono, fontSize:12, color:T.slate, background:T.bg, padding:'3px 8px', borderRadius:6 }}>
                    {s.studentId || '—'}
                  </span>
                </td>

                {/* Filière */}
                <td style={{ padding:'13px 16px', verticalAlign:'middle' }}>
                  <p style={{ color:T.navyLt, margin:0, fontSize:13, fontWeight:500 }}>{s.program?.name || '—'}</p>
                  <p style={{ color:T.silver, margin:0, fontSize:11 }}>{s.level} — {s.currentSemester}</p>
                </td>

                {/* Moyenne */}
                <td style={{ padding:'13px 16px', verticalAlign:'middle' }}>
                  {avg != null
                    ? <span style={{ fontFamily:T.mono, fontSize:14, fontWeight:700, color: m?.color || T.slate }}>{avg}<span style={{ fontSize:11, color:T.silver }}>/20</span></span>
                    : <span style={{ color:T.silver, fontSize:12 }}>—</span>
                  }
                </td>

                {/* Mention */}
                <td style={{ padding:'13px 16px', verticalAlign:'middle' }}>
                  {m ? <Badge bg={m.bg} color={m.color}>{m.label}</Badge> : <span style={{ color:T.silver, fontSize:12 }}>—</span>}
                </td>

                {/* Statut */}
                <td style={{ padding:'13px 16px', verticalAlign:'middle' }}>
                  <Badge bg={done ? T.emerLt : T.goldLt} color={done ? T.emerDk : T.goldDk}>
                    {done ? '✓ Diplômé' : '● Éligible'}
                  </Badge>
                </td>

                {/* Actions */}
                <td style={{ padding:'13px 16px', verticalAlign:'middle' }}>
                  <div style={{ display:'flex', gap:6 }}>
                    {!done ? (
                      <Btn size="sm" variant="gold" onClick={()=>onGenerate(s)}>
                        <Award size={13} /> Émettre
                      </Btn>
                    ) : (
                      <Btn size="sm" variant="ghost" onClick={()=>onView(s, issuedMap[s._id])}>
                        <Eye size={13} /> Voir
                      </Btn>
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

/* ─── Main Page ──────────────────────────────────────────────────────────── */
export default function DiplomasPage() {
  const { toast, ToastContainer } = useToast();

  const [students,   setStudents]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [page,       setPage]       = useState(1);
  const [total,      setTotal]      = useState(0);
  const LIMIT = 20;

  const [search,     setSearch]     = useState('');
  const [statusFilter, setStatusFilter] = useState('eligible'); // eligible | all | diplomated
  const [levelFilter,  setLevelFilter]  = useState('');

  // Map studentId -> diploma data (pour marquer les diplômés)
  const [issuedMap, setIssuedMap] = useState({});

  const [genModal,  setGenModal]  = useState({ open:false, student:null });
  const [viewModal, setViewModal] = useState({ open:false, student:null, diploma:null });

  /* Charger les étudiants via studentAPI.getAll / getAllStudents */
  const loadStudents = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT, populate: 'program' };
      if (search)      params.search = search;
      if (levelFilter) params.level  = levelFilter;

      // On utilise les méthodes qui existent réellement dans studentAPI
      let res;
      if (typeof studentAPI?.getAll === 'function') {
        res = await studentAPI.getAll(params);
      } else if (typeof studentAPI?.getAllStudents === 'function') {
        res = await studentAPI.getAllStudents(params);
      } else if (typeof studentAPI?.getStudents === 'function') {
        res = await studentAPI.getStudents(params);
      } else {
        throw new Error('Aucune méthode studentAPI disponible');
      }

      let list  = res?.data?.data || res?.data?.students || res?.data || res?.students || [];
      let count = res?.data?.total || res?.total || list.length;

      // Filtrage côté client si nécessaire
      if (statusFilter === 'eligible')   list = list.filter(s => !issuedMap[s._id]);
      if (statusFilter === 'diplomated') list = list.filter(s =>  issuedMap[s._id]);

      setStudents(list);
      setTotal(count);
    } catch (err) {
      console.error('loadStudents:', err);
      toast('Erreur lors du chargement des étudiants', 'error');
      setStudents([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, search, levelFilter, statusFilter, issuedMap, toast]);

  useEffect(() => { loadStudents(); }, [loadStudents]);

  /* Diplômes émis : chargés depuis localStorage pour persistance locale
     (jusqu'à ce que votre API /diplomas soit disponible) */
  useEffect(() => {
    try {
      const stored = JSON.parse(sessionStorage.getItem('issued_diplomas') || '{}');
      setIssuedMap(stored);
    } catch { /* ignore */ }
  }, []);

  const saveIssued = (studentId, diplomaData) => {
    setIssuedMap(prev => {
      const next = { ...prev, [studentId]: diplomaData };
      try { sessionStorage.setItem('issued_diplomas', JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  };

  /* Stats */
  const diplomatedCount = Object.keys(issuedMap).length;
  const eligibleCount   = students.filter(s => !issuedMap[s._id]).length;

  /* Après génération */
  const handleGenerated = (student, formData) => {
    saveIssued(student._id, {
      ...formData,
      student,
      issuedAt: new Date().toISOString(),
    });
    setGenModal({ open:false, student:null });
    toast(`Diplôme de ${student.firstName} ${student.lastName} émis avec succès ✓`);
  };

  const levelOptions = [
    { value:'',  label:'Tous les niveaux' },
    { value:'L1', label:'Licence 1' }, { value:'L2', label:'Licence 2' },
    { value:'L3', label:'Licence 3' }, { value:'M1', label:'Master 1' },
    { value:'M2', label:'Master 2' },
  ];

  const statusOptions = [
    { value:'all',        label:'Tous les étudiants' },
    { value:'eligible',   label:'Éligibles (sans diplôme)' },
    { value:'diplomated', label:'Déjà diplômés' },
  ];

  return (
    <div style={{ fontFamily:T.font, padding:24, maxWidth:1440, margin:'0 auto', minHeight:'100vh', background:'#F1F5F9' }}>
      <ToastContainer />
      <style>{`
        @keyframes spin    { to { transform:rotate(360deg); } }
        @keyframes slideUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }
        @keyframes popIn   { from { opacity:0; transform:scale(.94); } to { opacity:1; transform:scale(1); } }
      `}</style>

      {/* Page Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12, marginBottom:28 }}>
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <div style={{ width:44, height:44, background:T.navy, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <GraduationCap size={22} color={T.gold} />
          </div>
          <div>
            <h1 style={{ fontSize:22, fontWeight:700, color:T.navy, margin:0 }}>Gestion des Diplômes</h1>
            <p style={{ fontSize:12, color:T.silver, margin:0 }}>Émission et suivi des diplômes — Année {new Date().getFullYear()}</p>
          </div>
        </div>
        <Btn variant="ghost" onClick={loadStudents} style={{ gap:6 }}>
          <RefreshCw size={14} /> Actualiser
        </Btn>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:16, marginBottom:24 }}>
        <StatCard title="Total étudiants"  value={total}           icon={<Users size={20} />}        accent={T.indigo} />
        <StatCard title="Éligibles"        value={eligibleCount}   icon={<CheckCircle size={20} />}  accent={T.emer}   />
        <StatCard title="Diplômes émis"    value={diplomatedCount} icon={<Award size={20} />}        accent={T.gold}
          sub={diplomatedCount > 0 ? `${Math.round(diplomatedCount/(total||1)*100)}% du total` : undefined}
        />
      </div>

      {/* Info banner */}
      <Card style={{ marginBottom:20 }}>
        <div style={{ padding:'18px 22px', background:T.navy, display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
          <Award size={18} color={T.gold} style={{ flexShrink:0 }} />
          <p style={{ fontSize:13, color:T.white, margin:0, fontWeight:500 }}>
            Les diplômes sont émis après validation des délibérations finales.
          </p>
          <div style={{ marginLeft:'auto', display:'flex', gap:16 }}>
            {['📄 Relevés de notes','🔲 Vérification QR','📋 Supplément au diplôme'].map(f => (
              <span key={f} style={{ fontSize:11, color:T.silver, whiteSpace:'nowrap' }}>{f}</span>
            ))}
          </div>
        </div>
      </Card>

      {/* Filters */}
      <Card style={{ padding:'14px 18px', marginBottom:20 }}>
        <div style={{ display:'flex', gap:12, flexWrap:'wrap', alignItems:'flex-end' }}>
          {/* Search */}
          <div style={{ flex:1, minWidth:220, position:'relative', marginBottom:0 }}>
            <Search size={14} style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', color:T.silver }} />
            <input
              value={search}
              onChange={e=>{ setSearch(e.target.value); setPage(1); }}
              placeholder="Nom, prénom, matricule…"
              style={{ width:'100%', padding:'9px 13px 9px 34px', border:`1.5px solid ${T.line}`,
                borderRadius:9, fontSize:13, fontFamily:T.font, outline:'none',
                color:T.navy, background:T.bg, boxSizing:'border-box' }}
            />
            {search && (
              <button onClick={()=>{setSearch(''); setPage(1);}}
                style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:T.silver }}>
                <X size={14} />
              </button>
            )}
          </div>
          {/* Level */}
          <div style={{ minWidth:160 }}>
            <Sel value={levelFilter} onChange={e=>{setLevelFilter(e.target.value); setPage(1);}} options={levelOptions} style={{ marginBottom:0 }} />
          </div>
          {/* Status */}
          <div style={{ minWidth:200 }}>
            <Sel value={statusFilter} onChange={e=>{setStatusFilter(e.target.value); setPage(1);}} options={statusOptions} style={{ marginBottom:0 }} />
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div style={{ padding:'14px 20px', borderBottom:`1px solid ${T.line}`, background:T.bg, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <h2 style={{ fontSize:13, fontWeight:700, color:T.navy, margin:0 }}>Liste des étudiants</h2>
            <p style={{ fontSize:11, color:T.silver, margin:'2px 0 0' }}>
              {statusFilter==='eligible'   && 'Étudiants éligibles à la diplomation'}
              {statusFilter==='diplomated' && 'Étudiants ayant déjà reçu leur diplôme'}
              {statusFilter==='all'        && 'Tous les étudiants de l\'établissement'}
            </p>
          </div>
          {loading && <Spinner size={18} />}
        </div>

        <StudentsTable
          data={students}
          loading={loading}
          issuedMap={issuedMap}
          onGenerate={(s)=>setGenModal({ open:true, student:s })}
          onView={(s, diploma)=>setViewModal({ open:true, student:s, diploma })}
        />
        <Pagination page={page} total={total} limit={LIMIT} onPageChange={setPage} />
      </Card>

      {/* Modal — Générer un diplôme */}
      <Modal
        isOpen={genModal.open}
        onClose={()=>setGenModal({ open:false, student:null })}
        title="Émettre un diplôme"
        size="md"
      >
        <GenerateDiplomaModal
          student={genModal.student}
          onSave={(formData)=>handleGenerated(genModal.student, formData)}
          onCancel={()=>setGenModal({ open:false, student:null })}
        />
      </Modal>

      {/* Modal — Voir un diplôme */}
      <Modal
        isOpen={viewModal.open}
        onClose={()=>setViewModal({ open:false, student:null, diploma:null })}
        title="Détails du diplôme"
        size="md"
      >
        <DiplomaViewModal
          student={viewModal.student}
          diploma={viewModal.diploma}
          onClose={()=>setViewModal({ open:false, student:null, diploma:null })}
        />
      </Modal>
    </div>
  );
}