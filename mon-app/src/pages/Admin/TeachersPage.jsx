import { useState, useEffect, useCallback, useRef } from 'react';
import { teacherAPI } from '../../services/services';

// ─── Palette & tokens ────────────────────────────────────────────────────────
const C = {
  primary: '#4F46E5',
  primaryLight: '#EEF2FF',
  danger: '#EF4444',
  dangerLight: '#FEF2F2',
  green: '#16A34A',
  greenLight: '#F0FDF4',
  orange: '#EA580C',
  orangeLight: '#FFF7ED',
  blue: '#2563EB',
  blueLight: '#EFF6FF',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray900: '#111827',
  white: '#FFFFFF',
};

// ─── Tiny Toast ───────────────────────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((msg, type = 'success') => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);
  const Toast = () => (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          padding: '12px 18px', borderRadius: 10, fontFamily: 'inherit', fontSize: 14, fontWeight: 500,
          background: t.type === 'error' ? C.dangerLight : C.greenLight,
          color: t.type === 'error' ? C.danger : C.green,
          border: `1px solid ${t.type === 'error' ? '#FECACA' : '#BBF7D0'}`,
          boxShadow: '0 4px 12px rgba(0,0,0,.08)',
          animation: 'fadeIn .25s ease',
        }}>{t.msg}</div>
      ))}
    </div>
  );
  return { toast: add, Toast };
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ firstName = '', lastName = '', photo, size = 'sm' }) {
  const dim = size === 'xl' ? 56 : size === 'lg' ? 44 : size === 'md' ? 36 : 30;
  const fs = size === 'xl' ? 20 : size === 'lg' ? 16 : size === 'md' ? 13 : 11;
  const initials = `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();
  const hue = ((firstName + lastName).split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 36) * 10;
  return photo
    ? <img src={photo} alt="" style={{ width: dim, height: dim, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
    : (
      <div style={{
        width: dim, height: dim, borderRadius: '50%', flexShrink: 0,
        background: `hsl(${hue},60%,88%)`, color: `hsl(${hue},60%,35%)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 700, fontSize: fs, fontFamily: 'inherit',
      }}>{initials || '?'}</div>
    );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
function Badge({ children, bg, color, border }) {
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: 20, fontSize: 11,
      fontWeight: 600, background: bg, color, border: `1px solid ${border || 'transparent'}`,
      fontFamily: 'inherit', whiteSpace: 'nowrap',
    }}>{children}</span>
  );
}

function ContractBadge({ type }) {
  const map = {
    permanent: { bg: C.greenLight, color: C.green },
    contractuel: { bg: C.blueLight, color: C.blue },
    vacataire: { bg: C.orangeLight, color: C.orange },
  };
  const s = map[type] || { bg: C.gray100, color: C.gray600 };
  return <Badge bg={s.bg} color={s.color}>{type}</Badge>;
}

// ─── Input ────────────────────────────────────────────────────────────────────
function Input({ label, required, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {label && <label style={{ fontSize: 12, fontWeight: 600, color: C.gray700 }}>{label}{required && ' *'}</label>}
      <input {...props} required={required} style={{
        padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.gray200}`,
        fontSize: 14, fontFamily: 'inherit', outline: 'none', color: C.gray900,
        background: C.white, transition: 'border-color .15s',
        ...props.style,
      }}
        onFocus={e => e.target.style.borderColor = C.primary}
        onBlur={e => e.target.style.borderColor = C.gray200}
      />
    </div>
  );
}

// ─── Select ───────────────────────────────────────────────────────────────────
function Select({ label, options = [], ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {label && <label style={{ fontSize: 12, fontWeight: 600, color: C.gray700 }}>{label}</label>}
      <select {...props} style={{
        padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.gray200}`,
        fontSize: 14, fontFamily: 'inherit', outline: 'none', color: C.gray900,
        background: C.white, cursor: 'pointer',
      }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

// ─── Button ───────────────────────────────────────────────────────────────────
function Btn({ children, variant = 'primary', size = 'md', loading, onClick, type = 'button', style: sx }) {
  const base = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    border: 'none', cursor: loading ? 'wait' : 'pointer', fontFamily: 'inherit',
    fontWeight: 600, borderRadius: 8, transition: 'all .15s', outline: 'none',
  };
  const variants = {
    primary: { background: C.primary, color: C.white, padding: size === 'sm' ? '6px 14px' : '9px 18px', fontSize: size === 'sm' ? 13 : 14 },
    secondary: { background: C.gray100, color: C.gray700, padding: size === 'sm' ? '6px 14px' : '9px 18px', fontSize: 14 },
    danger: { background: C.dangerLight, color: C.danger, padding: '9px 18px', fontSize: 14 },
    ghost: { background: 'transparent', color: C.gray500, padding: '5px', fontSize: 13, borderRadius: 6 },
  };
  return (
    <button type={type} onClick={onClick} disabled={loading}
      style={{ ...base, ...variants[variant], opacity: loading ? .7 : 1, ...sx }}
      onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = '.85'; }}
      onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
    >
      {loading ? '...' : children}
    </button>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function Modal({ open, onClose, title, children, width = 560 }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);
  if (!open) return null;
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: C.white, borderRadius: 16, width: '100%', maxWidth: width,
        maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,.2)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 0' }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: C.gray900 }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: C.gray400, lineHeight: 1 }}>×</button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
function ConfirmDialog({ open, onClose, onConfirm, loading, title, message }) {
  if (!open) return null;
  return (
    <Modal open={open} onClose={onClose} title={title} width={420}>
      <p style={{ margin: '0 0 20px', fontSize: 14, color: C.gray600 }}>{message}</p>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <Btn variant="secondary" onClick={onClose}>Annuler</Btn>
        <Btn variant="danger" onClick={onConfirm} loading={loading}>Confirmer</Btn>
      </div>
    </Modal>
  );
}

// ─── Options ─────────────────────────────────────────────────────────────────
const TITLE_OPTIONS = [
  'Professeur', 'Maître de Conférences A', 'Maître de Conférences B',
  'Maître Assistant A', 'Maître Assistant B', "Attaché d'enseignement", 'Vacataire',
].map(t => ({ value: t, label: t }));

const CONTRACT_OPTIONS = [
  { value: 'permanent', label: 'Permanent' },
  { value: 'contractuel', label: 'Contractuel' },
  { value: 'vacataire', label: 'Vacataire' },
];

// ─── Teacher Form ─────────────────────────────────────────────────────────────
function TeacherForm({ teacher, onSave, onCancel }) {
  const [form, setForm] = useState(teacher ? {
    ...teacher,
    specialties: Array.isArray(teacher.specialties) ? teacher.specialties.join(', ') : (teacher.specialties || ''),
  } : {
    firstName: '', lastName: '', email: '', phone: '',
    department: '', title: 'Maître Assistant A', contractType: 'permanent',
    specialties: '', office: '', password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = {
        ...form,
        specialties: form.specialties ? form.specialties.split(',').map(s => s.trim()).filter(Boolean) : [],
      };
      if (!data.password) delete data.password;
      if (teacher?._id) await teacherAPI.update(teacher._id, data);
      else await teacherAPI.create(data);
      onSave();
    } catch (err) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const field = (label, key, type = 'text', extra = {}) => (
    <Input label={label} type={type} value={form[key]} onChange={e => set(key, e.target.value)} {...extra} />
  );

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div style={{ padding: '10px 14px', background: C.dangerLight, color: C.danger, borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
          {error}
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        {field('Prénom', 'firstName', 'text', { required: true })}
        {field('Nom', 'lastName', 'text', { required: true })}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {field('Email', 'email', 'email', { required: true })}
        {field('Téléphone', 'phone')}
        {field('Département', 'department', 'text', { required: true })}
        <Select label="Titre" value={form.title} onChange={e => set('title', e.target.value)} options={TITLE_OPTIONS} />
        <Select label="Type de contrat" value={form.contractType} onChange={e => set('contractType', e.target.value)} options={CONTRACT_OPTIONS} />
        {field('Spécialités (séparées par virgule)', 'specialties', 'text', { placeholder: 'Informatique, IA, Réseaux' })}
        {field('Bureau', 'office')}
        {!teacher && field('Mot de passe (défaut : Enseignant@123)', 'password', 'password')}
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
        <Btn variant="secondary" onClick={onCancel} sx={{ flex: 1 }}>Annuler</Btn>
        <Btn type="submit" loading={loading} sx={{ flex: 1 }}>{teacher ? 'Mettre à jour' : 'Créer'}</Btn>
      </div>
    </form>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────
function Pagination({ page, total, limit, onPage }) {
  const pages = Math.ceil(total / limit) || 1;
  if (pages <= 1) return null;
  const nums = Array.from({ length: pages }, (_, i) => i + 1);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '14px 20px', borderTop: `1px solid ${C.gray100}` }}>
      <Btn variant="ghost" size="sm" onClick={() => onPage(page - 1)} style={{ opacity: page <= 1 ? .4 : 1, pointerEvents: page <= 1 ? 'none' : 'auto' }}>‹</Btn>
      {nums.map(n => (
        <button key={n} onClick={() => onPage(n)} style={{
          width: 32, height: 32, borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 13,
          fontFamily: 'inherit', fontWeight: 600,
          background: n === page ? C.primary : 'transparent',
          color: n === page ? C.white : C.gray600,
          transition: 'all .15s',
        }}>{n}</button>
      ))}
      <Btn variant="ghost" size="sm" onClick={() => onPage(page + 1)} style={{ opacity: page >= pages ? .4 : 1, pointerEvents: page >= pages ? 'none' : 'auto' }}>›</Btn>
      <span style={{ marginLeft: 'auto', fontSize: 12, color: C.gray400 }}>{total} résultat{total > 1 ? 's' : ''}</span>
    </div>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconPlus = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const IconEdit = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const IconTrash = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" />
    <path d="M9 6V4h6v2" />
  </svg>
);
const IconEye = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
  </svg>
);
const IconSearch = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={C.gray400} strokeWidth="2" strokeLinecap="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function TeachersPage() {
  const { toast, Toast } = useToast();
  const [teachers, setTeachers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState({ open: false, teacher: null });
  const [viewModal, setViewModal] = useState({ open: false, teacher: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, teacher: null });
  const [deleting, setDeleting] = useState(false);
  const LIMIT = 10;
  const searchTimer = useRef(null);

  const fetchTeachers = useCallback(async (p = 1, q = '') => {
    setLoading(true);
    try {
      const res = await teacherAPI.getAll({ page: p, limit: LIMIT, search: q });
      setTeachers(res.data || res.teachers || []);
      setTotal(res.total || 0);
    } catch (err) {
      toast(err.message || 'Erreur de chargement', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTeachers(page, search); }, [page]);

  const handleSearch = (val) => {
    setSearch(val);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => { setPage(1); fetchTeachers(1, val); }, 400);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await teacherAPI.delete(deleteDialog.teacher._id);
      toast('Enseignant désactivé');
      setDeleteDialog({ open: false, teacher: null });
      fetchTeachers(page, search);
    } catch (err) {
      toast(err.message || 'Erreur', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleSave = () => {
    setModal({ open: false, teacher: null });
    fetchTeachers(page, search);
    toast('Enseignant sauvegardé');
  };

  // ── Table Skeleton ──
  const SkeletonRow = () => (
    <tr>
      {[240, 160, 120, 140, 90, 50, 80].map((w, i) => (
        <td key={i} style={{ padding: '14px 16px' }}>
          <div style={{ height: 14, width: w, borderRadius: 4, background: C.gray100, animation: 'pulse 1.5s infinite' }} />
        </td>
      ))}
    </tr>
  );

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", color: C.gray900, minHeight: '100vh', background: C.gray50 }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: .45; } }
        * { box-sizing: border-box; }
        tr:hover td { background: ${C.gray50}; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${C.gray200}; border-radius: 3px; }
      `}</style>
      <Toast />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 20px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: C.gray900 }}>Gestion des Enseignants</h1>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: C.gray500 }}>
              {loading ? 'Chargement…' : `${total} enseignant${total > 1 ? 's' : ''} au total`}
            </p>
          </div>
          <Btn onClick={() => setModal({ open: true, teacher: null })}>
            <IconPlus /> Nouvel enseignant
          </Btn>
        </div>

        {/* Search bar */}
        <div style={{ background: C.white, borderRadius: 12, padding: '14px 16px', marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,.06)', border: `1px solid ${C.gray200}` }}>
          <div style={{ position: 'relative', maxWidth: 360 }}>
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}><IconSearch /></span>
            <input
              value={search} onChange={e => handleSearch(e.target.value)}
              placeholder="Rechercher par nom, email..."
              style={{
                width: '100%', padding: '8px 12px 8px 34px', borderRadius: 8,
                border: `1px solid ${C.gray200}`, fontSize: 14, fontFamily: 'inherit',
                outline: 'none', color: C.gray900, background: C.gray50,
              }}
            />
          </div>
        </div>

        {/* Table Card */}
        <div style={{ background: C.white, borderRadius: 14, boxShadow: '0 1px 4px rgba(0,0,0,.06)', border: `1px solid ${C.gray200}`, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: C.gray50, borderBottom: `1px solid ${C.gray200}` }}>
                  {['Enseignant', 'Email', 'Département', 'Titre', 'Contrat', 'Cours', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: C.gray500, textTransform: 'uppercase', letterSpacing: '.05em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array(5).fill(0).map((_, i) => <SkeletonRow key={i} />)
                  : teachers.length === 0
                    ? (
                      <tr>
                        <td colSpan={7} style={{ padding: '48px 20px', textAlign: 'center', color: C.gray400, fontSize: 14 }}>
                          Aucun enseignant trouvé
                        </td>
                      </tr>
                    )
                    : teachers.map(row => (
                      <tr key={row._id} style={{ borderBottom: `1px solid ${C.gray100}`, transition: 'background .1s' }}>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Avatar firstName={row.firstName} lastName={row.lastName} photo={row.profilePhoto} size="sm" />
                            <div>
                              <div style={{ fontWeight: 600, fontSize: 13, color: C.gray900 }}>{row.firstName} {row.lastName}</div>
                              <div style={{ fontSize: 11, color: C.gray400 }}>{row.employeeId || '—'}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px' }}><span style={{ fontSize: 12, color: C.gray600 }}>{row.email}</span></td>
                        <td style={{ padding: '12px 16px' }}><span style={{ fontSize: 13 }}>{row.department}</span></td>
                        <td style={{ padding: '12px 16px' }}><span style={{ fontSize: 12, color: C.gray600, maxWidth: 160, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.title}</span></td>
                        <td style={{ padding: '12px 16px' }}><ContractBadge type={row.contractType} /></td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ fontWeight: 700, color: C.primary, fontSize: 14 }}>{row.courses?.length || 0}</span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', gap: 4 }}>
                            {[
                              { icon: <IconEye />, color: C.gray500, action: () => setViewModal({ open: true, teacher: row }) },
                              { icon: <IconEdit />, color: C.primary, action: () => setModal({ open: true, teacher: row }) },
                              { icon: <IconTrash />, color: C.danger, action: () => setDeleteDialog({ open: true, teacher: row }) },
                            ].map(({ icon, color, action }, i) => (
                              <button key={i} onClick={action} style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                padding: '5px 6px', borderRadius: 6, color, display: 'flex',
                                alignItems: 'center', transition: 'background .12s',
                              }}
                                onMouseEnter={e => e.currentTarget.style.background = C.gray100}
                                onMouseLeave={e => e.currentTarget.style.background = 'none'}
                              >{icon}</button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))
                }
              </tbody>
            </table>
          </div>
          <Pagination page={page} total={total} limit={LIMIT} onPage={setPage} />
        </div>
      </div>

      {/* Create / Edit Modal */}
      <Modal open={modal.open} onClose={() => setModal({ open: false, teacher: null })}
        title={modal.teacher ? "Modifier l'enseignant" : 'Nouvel enseignant'}>
        <TeacherForm teacher={modal.teacher} onSave={handleSave} onCancel={() => setModal({ open: false, teacher: null })} />
      </Modal>

      {/* View Modal */}
      <Modal open={viewModal.open} onClose={() => setViewModal({ open: false, teacher: null })} title="Profil enseignant" width={480}>
        {viewModal.teacher && (() => {
          const t = viewModal.teacher;
          return (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, background: C.primaryLight, borderRadius: 12, marginBottom: 20 }}>
                <Avatar firstName={t.firstName} lastName={t.lastName} photo={t.profilePhoto} size="xl" />
                <div>
                  <div style={{ fontWeight: 800, fontSize: 17, color: C.gray900 }}>{t.firstName} {t.lastName}</div>
                  <div style={{ fontSize: 13, color: C.primary, fontWeight: 600 }}>{t.title}</div>
                  <div style={{ fontSize: 12, color: C.gray500 }}>{t.department}</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                {[
                  ['Email', t.email], ['Téléphone', t.phone || '—'],
                  ['ID Employé', t.employeeId || '—'], ['Contrat', t.contractType],
                  ['Bureau', t.office || '—'], ['Cours', `${t.courses?.length || 0} cours`],
                ].map(([label, value]) => (
                  <div key={label} style={{ background: C.gray50, borderRadius: 10, padding: '10px 12px', border: `1px solid ${C.gray100}` }}>
                    <div style={{ fontSize: 11, color: C.gray400, marginBottom: 2 }}>{label}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.gray800, wordBreak: 'break-word' }}>{value}</div>
                  </div>
                ))}
              </div>
              {t.specialties?.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, color: C.gray400, marginBottom: 8, fontWeight: 600, textTransform: 'uppercase' }}>Spécialités</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {t.specialties.map(s => <Badge key={s} bg={C.primaryLight} color={C.primary}>{s}</Badge>)}
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </Modal>

      {/* Confirm Delete */}
      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, teacher: null })}
        onConfirm={handleDelete}
        loading={deleting}
        title="Désactiver l'enseignant"
        message={`Confirmer la désactivation de ${deleteDialog.teacher?.firstName || ''} ${deleteDialog.teacher?.lastName || ''} ?`}
      />
    </div>
  );
}