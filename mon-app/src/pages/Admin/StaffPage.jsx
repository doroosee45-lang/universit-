// // pages/admin/StaffPage.jsx
// import { useState, useEffect, useCallback } from 'react';
// import { Plus, Edit, Trash2, Eye, Search, X, ChevronLeft, ChevronRight, Users, User, Mail, Phone, Building, Briefcase } from 'lucide-react';
// import { staffAPI } from '../../services/services';

// /* ─── Google Font injection ─────────────────────────────────────────────── */
// const FONT_LINK = document.createElement('link');
// FONT_LINK.rel = 'stylesheet';
// FONT_LINK.href = 'https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap';
// document.head.appendChild(FONT_LINK);

// /* ─── Design tokens ─────────────────────────────────────────────────────── */
// const T = {
//   navy:    '#0F172A',
//   navyMid: '#1E293B',
//   navyLt:  '#334155',
//   slate:   '#64748B',
//   silver:  '#94A3B8',
//   line:    '#E2E8F0',
//   bg:      '#F8FAFC',
//   white:   '#FFFFFF',
//   gold:    '#F59E0B',
//   goldLt:  '#FEF3C7',
//   goldDk:  '#92400E',
//   emerald: '#059669',
//   emerLt:  '#D1FAE5',
//   emerDk:  '#065F46',
//   indigo:  '#4F46E5',
//   indiLt:  '#EEF2FF',
//   indiDk:  '#3730A3',
//   rose:    '#E11D48',
//   roseLt:  '#FFE4E6',
//   roseDk:  '#9F1239',
//   cyan:    '#0891B2',
//   cyanLt:  '#CFFAFE',
//   cyanDk:  '#164E63',
//   font:    "'Sora', sans-serif",
//   mono:    "'JetBrains Mono', monospace",
// };

// const POSITION_OPTS = [
//   { value: 'scolarite', label: 'Scolarité' },
//   { value: 'bibliotheque', label: 'Bibliothèque' },
//   { value: 'finances', label: 'Finances' },
//   { value: 'secretariat', label: 'Secrétariat' },
//   { value: 'informatique', label: 'Informatique' },
//   { value: 'autre', label: 'Autre' },
// ];

// /* ─── Toast Hook ────────────────────────────────────────────────────────── */
// function useToast() {
//   const [toasts, setToasts] = useState([]);
//   const show = useCallback((msg, type = 'success') => {
//     const id = Date.now();
//     setToasts(t => [...t, { id, msg, type }]);
//     setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
//   }, []);

//   const ToastContainer = () => (
//     <div style={{ position: 'fixed', bottom: 28, right: 28, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
//       {toasts.map(t => (
//         <div key={t.id} style={{
//           padding: '12px 20px',
//           borderRadius: 10,
//           fontSize: 13,
//           fontWeight: 500,
//           fontFamily: T.font,
//           background: t.type === 'error' ? T.roseLt : T.emerLt,
//           color: t.type === 'error' ? T.roseDk : T.emerDk,
//           border: `1px solid ${t.type === 'error' ? '#FECDD3' : '#A7F3D0'}`,
//           boxShadow: '0 8px 24px rgba(0,0,0,.12)',
//           animation: 'slideUp .25s ease',
//         }}>
//           {t.msg}
//         </div>
//       ))}
//     </div>
//   );
//   return { toast: show, ToastContainer };
// }

// /* ─── Spinner ───────────────────────────────────────────────────────────── */
// const Spinner = ({ size = 24 }) => (
//   <div style={{
//     width: size, height: size,
//     border: `2px solid ${T.line}`,
//     borderTopColor: T.indigo,
//     borderRadius: '50%',
//     animation: 'spin .75s linear infinite',
//     flexShrink: 0,
//   }} />
// );

// /* ─── Badge ─────────────────────────────────────────────────────────────── */
// const Badge = ({ children, bg, color }) => (
//   <span style={{
//     display: 'inline-flex', alignItems: 'center',
//     padding: '3px 10px', borderRadius: 20,
//     fontSize: 11, fontWeight: 600,
//     fontFamily: T.font,
//     background: bg, color,
//     letterSpacing: .3,
//   }}>
//     {children}
//   </span>
// );

// /* ─── Button ────────────────────────────────────────────────────────────── */
// function Btn({ children, onClick, variant = 'primary', size = 'md', loading, disabled, type }) {
//   const V = {
//     primary:   { bg: T.navy,    color: T.white,  border: 'none', hover: T.navyMid },
//     gold:      { bg: T.gold,    color: T.navy,   border: 'none', hover: '#D97706' },
//     secondary: { bg: T.white,   color: T.navyLt, border: `1px solid ${T.line}`, hover: T.bg },
//     danger:    { bg: T.roseLt,  color: T.roseDk, border: `1px solid #FECDD3`, hover: '#FFD6DA' },
//     success:   { bg: T.emerLt,  color: T.emerDk, border: 'none', hover: '#BBFADA' },
//     ghost:     { bg: 'transparent', color: T.slate, border: 'none', hover: T.bg },
//   };
//   const S = { sm: { padding: '5px 11px', fontSize: 11 }, md: { padding: '9px 16px', fontSize: 13 }, lg: { padding: '11px 22px', fontSize: 14 }, icon: { padding: 6, width: 32, height: 32 } };
//   const v = V[variant];
//   const isIcon = size === 'icon';
//   return (
//     <button
//       type={type}
//       onClick={onClick}
//       disabled={disabled || loading}
//       style={{
//         background: v.bg, color: v.color, border: v.border,
//         ...(isIcon ? S.icon : S[size]),
//         borderRadius: 9, fontWeight: 600, cursor: (disabled || loading) ? 'not-allowed' : 'pointer',
//         opacity: (disabled || loading) ? .55 : 1,
//         display: 'inline-flex', alignItems: 'center', gap: 6,
//         fontFamily: T.font, transition: 'background .15s, transform .1s',
//         letterSpacing: .2,
//       }}
//       onMouseEnter={e => { if (!disabled && !loading) e.currentTarget.style.background = v.hover; }}
//       onMouseLeave={e => { e.currentTarget.style.background = v.bg; }}
//       onMouseDown={e => { if (!disabled && !loading) e.currentTarget.style.transform = 'scale(.97)'; }}
//       onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
//     >
//       {loading && <Spinner size={14} />}
//       {children}
//     </button>
//   );
// }

// /* ─── Card ──────────────────────────────────────────────────────────────── */
// const Card = ({ children, style }) => (
//   <div style={{
//     background: T.white, borderRadius: 14,
//     border: `1px solid ${T.line}`,
//     overflow: 'hidden', ...style,
//   }}>
//     {children}
//   </div>
// );

// /* ─── Avatar ────────────────────────────────────────────────────────────── */
// const Avatar = ({ firstName, lastName, photo, size = 'sm' }) => {
//   const sizes = { sm: 32, md: 40, lg: 56 };
//   const dimension = sizes[size];
//   const initial = firstName?.[0] || lastName?.[0] || '?';
//   return (
//     <div style={{
//       width: dimension, height: dimension, borderRadius: dimension / 2,
//       background: `linear-gradient(135deg, ${T.indigo}, ${T.indiDk})`,
//       display: 'flex', alignItems: 'center', justifyContent: 'center',
//       color: T.white, fontWeight: 600, fontSize: dimension * 0.4,
//       flexShrink: 0,
//     }}>
//       {photo ? <img src={photo} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : initial.toUpperCase()}
//     </div>
//   );
// };

// /* ─── Input ─────────────────────────────────────────────────────────────── */
// function Field({ label, value, onChange, placeholder, type = 'text', required }) {
//   const [focus, setFocus] = useState(false);
//   return (
//     <div style={{ marginBottom: 16 }}>
//       {label && <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: T.slate, marginBottom: 6, letterSpacing: .4, textTransform: 'uppercase' }}>
//         {label}{required && <span style={{ color: T.rose }}> *</span>}
//       </label>}
//       <input
//         type={type} value={value} onChange={onChange} placeholder={placeholder} required={required}
//         onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
//         style={{
//           width: '100%', padding: '9px 13px', border: `1.5px solid ${focus ? T.indigo : T.line}`,
//           borderRadius: 9, fontSize: 13, fontFamily: T.font, outline: 'none',
//           background: focus ? T.indiLt : T.white, transition: 'all .18s', color: T.navy,
//           boxSizing: 'border-box',
//         }}
//       />
//     </div>
//   );
// }

// /* ─── Select ────────────────────────────────────────────────────────────── */
// function Sel({ label, value, onChange, options, style }) {
//   return (
//     <div style={{ marginBottom: 16, ...style }}>
//       {label && <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: T.slate, marginBottom: 6, letterSpacing: .4, textTransform: 'uppercase' }}>{label}</label>}
//       <select
//         value={value} onChange={onChange}
//         style={{
//           width: '100%', padding: '9px 13px', border: `1.5px solid ${T.line}`,
//           borderRadius: 9, fontSize: 13, fontFamily: T.font, background: T.white,
//           outline: 'none', cursor: 'pointer', color: T.navy,
//         }}
//       >
//         {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
//       </select>
//     </div>
//   );
// }

// /* ─── Modal ─────────────────────────────────────────────────────────────── */
// function Modal({ isOpen, onClose, title, children, size = 'md' }) {
//   useEffect(() => {
//     const h = (e) => e.key === 'Escape' && onClose();
//     document.addEventListener('keydown', h);
//     return () => document.removeEventListener('keydown', h);
//   }, [onClose]);

//   if (!isOpen) return null;

//   const widths = { sm: 400, md: 580, lg: 780, xl: 980 };

//   return (
//     <div onClick={onClose} style={{
//       position: 'fixed', inset: 0, background: 'rgba(15,23,42,.5)',
//       backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center',
//       justifyContent: 'center', zIndex: 1000, padding: 16,
//     }}>
//       <div onClick={e => e.stopPropagation()} style={{
//         background: T.white, borderRadius: 18, width: '100%',
//         maxWidth: widths[size], maxHeight: '92vh', overflowY: 'auto',
//         boxShadow: '0 24px 64px rgba(0,0,0,.22)',
//         animation: 'popIn .22s cubic-bezier(.34,1.56,.64,1)',
//       }}>
//         <div style={{
//           display: 'flex', justifyContent: 'space-between', alignItems: 'center',
//           padding: '20px 24px', borderBottom: `1px solid ${T.line}`,
//           background: T.bg,
//         }}>
//           <span style={{ fontSize: 16, fontWeight: 700, color: T.navy, fontFamily: T.font }}>{title}</span>
//           <button onClick={onClose} style={{
//             width: 32, height: 32, borderRadius: 8, border: `1px solid ${T.line}`,
//             background: T.white, cursor: 'pointer', fontSize: 18, color: T.slate,
//             display: 'flex', alignItems: 'center', justifyContent: 'center',
//           }}>×</button>
//         </div>
//         {children}
//       </div>
//     </div>
//   );
// }

// /* ─── Stat Card ─────────────────────────────────────────────────────────── */
// function StatCard({ title, value, icon, accent }) {
//   return (
//     <div style={{
//       background: T.white, borderRadius: 14,
//       border: `1px solid ${T.line}`,
//       padding: '20px 22px',
//       display: 'flex', alignItems: 'center', gap: 16,
//       position: 'relative', overflow: 'hidden',
//     }}>
//       <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: accent, borderRadius: '14px 0 0 14px' }} />
//       <div style={{
//         width: 46, height: 46, borderRadius: 12,
//         background: accent + '18', color: accent,
//         display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
//       }}>
//         {icon}
//       </div>
//       <div>
//         <p style={{ fontSize: 11, color: T.silver, fontWeight: 600, letterSpacing: .5, textTransform: 'uppercase', margin: 0 }}>{title}</p>
//         <p style={{ fontSize: 28, fontWeight: 700, color: T.navy, margin: 0, fontFamily: T.mono, lineHeight: 1.2 }}>{value}</p>
//       </div>
//     </div>
//   );
// }

// /* ─── Section Header ────────────────────────────────────────────────────── */
// const SectionHeader = ({ title, sub }) => (
//   <div style={{ padding: '16px 20px', borderBottom: `1px solid ${T.line}`, background: T.bg }}>
//     <h2 style={{ fontSize: 13, fontWeight: 700, color: T.navy, margin: 0 }}>{title}</h2>
//     {sub && <p style={{ fontSize: 11, color: T.silver, margin: '3px 0 0', letterSpacing: .2 }}>{sub}</p>}
//   </div>
// );

// /* ─── Table ─────────────────────────────────────────────────────────────── */
// function Table({ columns, data, loading }) {
//   if (loading) return (
//     <div style={{ display: 'flex', justifyContent: 'center', padding: 56 }}>
//       <Spinner size={36} />
//     </div>
//   );
//   if (!data?.length) return (
//     <div style={{ textAlign: 'center', padding: 56, color: T.silver }}>
//       <Users size={40} style={{ margin: '0 auto 12px', display: 'block', opacity: .35 }} />
//       <p style={{ fontFamily: T.font, fontSize: 13 }}>Aucun personnel trouvé</p>
//     </div>
//   );
//   return (
//     <div style={{ overflowX: 'auto' }}>
//       <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: T.font }}>
//         <thead>
//           <tr style={{ background: T.bg }}>
//             {columns.map(c => (
//               <th key={c.key} style={{ padding: '11px 18px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: T.silver, letterSpacing: .6, textTransform: 'uppercase', borderBottom: `1px solid ${T.line}` }}>
//                 {c.header}
//               </th>
//             ))}
//           </tr>
//         </thead>
//         <tbody>
//           {data.map((row, i) => (
//             <tr key={i} style={{ borderBottom: `1px solid ${T.line}`, transition: 'background .12s' }}
//               onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
//               onMouseLeave={e => e.currentTarget.style.background = T.white}>
//               {columns.map(c => (
//                 <td key={c.key} style={{ padding: '13px 18px', fontSize: 13, color: T.navyLt, verticalAlign: 'middle' }}>
//                   {c.render ? c.render(row[c.key], row) : row[c.key]}
//                 </td>
//               ))}
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }

// /* ─── Pagination ────────────────────────────────────────────────────────── */
// function Pagination({ page, total, limit, onPageChange }) {
//   const pages = Math.ceil(total / limit);
//   if (pages <= 1) return null;
//   return (
//     <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, padding: '16px' }}>
//       <button onClick={() => onPageChange(page - 1)} disabled={page === 1}
//         style={{ width: 32, height: 32, border: `1px solid ${T.line}`, borderRadius: 8, background: T.white, cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? .4 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//         <ChevronLeft size={16} color={T.slate} />
//       </button>
//       <span style={{ fontSize: 12, color: T.slate, fontFamily: T.font }}>Page <strong>{page}</strong> sur {pages}</span>
//       <button onClick={() => onPageChange(page + 1)} disabled={page === pages}
//         style={{ width: 32, height: 32, border: `1px solid ${T.line}`, borderRadius: 8, background: T.white, cursor: page === pages ? 'not-allowed' : 'pointer', opacity: page === pages ? .4 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//         <ChevronRight size={16} color={T.slate} />
//       </button>
//     </div>
//   );
// }

// /* ─── Staff API ─────────────────────────────────────────────────────────── */
// const staffAPI = {
//   getAll: async (params) => {
//     const query = new URLSearchParams(params).toString();
//     const response = await api.get(`/users/staff${query ? `?${query}` : ''}`);
//     return response;
//   },
//   create: async (data) => {
//     const response = await api.post('/auth/register', { ...data, role: 'staff' });
//     return response;
//   },
//   update: async (id, data) => {
//     const response = await api.put(`/users/${id}`, data);
//     return response;
//   },
//   delete: async (id) => {
//     const response = await api.delete(`/users/${id}`);
//     return response;
//   },
// };

// /* ─── Staff Form Modal ──────────────────────────────────────────────────── */function StaffFormModal({ staff, onSave, onCancel }) {
//   const [form, setForm] = useState(staff || {
//     firstName: '', lastName: '', email: '', phone: '',
//     department: '', position: 'secretariat',
//   });
//   const [loading, setLoading] = useState(false);
//   const { toast, ToastContainer } = useToast();

//   const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       if (staff?._id) {
//         await staffAPI.update(staff._id, form); // ✅ Utilise staffAPI importé
//         toast('Personnel mis à jour avec succès ✓');
//       } else {
//         await staffAPI.create({ ...form, password: form.password || 'Staff@123' }); // ✅ Utilise staffAPI importé
//         toast('Personnel créé avec succès ✓');
//       }
//       setTimeout(onSave, 900);
//     } catch (err) {
//       toast(err.response?.data?.message || err.message || 'Une erreur est survenue', 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
//       <ToastContainer />
//       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
//         <Field label="Prénom" value={form.firstName} onChange={set('firstName')} required />
//         <Field label="Nom" value={form.lastName} onChange={set('lastName')} required />
//       </div>
//       <Field label="Email" type="email" value={form.email} onChange={set('email')} required />
//       <Field label="Téléphone" value={form.phone || ''} onChange={set('phone')} />
//       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
//         <Field label="Département" value={form.department || ''} onChange={set('department')} />
//         <Sel label="Poste" value={form.position} onChange={set('position')} options={POSITION_OPTS} />
//       </div>
//       {!staff && (
//         <Field label="Mot de passe" type="password" placeholder="Laissez vide pour 'Staff@123'" onChange={set('password')} />
//       )}
//       <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
//         <Btn variant="secondary" onClick={onCancel} style={{ flex: 1, justifyContent: 'center' }}>Annuler</Btn>
//         <Btn type="submit" variant="primary" loading={loading} style={{ flex: 1, justifyContent: 'center' }}>
//           {staff ? 'Mettre à jour' : 'Créer'}
//         </Btn>
//       </div>
//     </form>
//   );
// }

// /* ─── Staff View Modal ──────────────────────────────────────────────────── */
// function StaffViewModal({ staff, onClose }) {
//   if (!staff) return null;
//   const positionLabel = POSITION_OPTS.find(p => p.value === staff.position)?.label || staff.position || '—';
  
//   return (
//     <div style={{ padding: '24px' }}>
//       <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, background: T.bg, borderRadius: 12, marginBottom: 20 }}>
//         <Avatar firstName={staff.firstName} lastName={staff.lastName} size="lg" />
//         <div>
//           <h3 style={{ fontWeight: 700, color: T.navy, fontSize: 16, margin: 0 }}>{staff.firstName} {staff.lastName}</h3>
//           <p style={{ fontSize: 13, color: T.indigo, margin: '4px 0 0' }}>{positionLabel}</p>
//         </div>
//       </div>
//       <div style={{ background: T.bg, borderRadius: 10, padding: '12px 16px', marginBottom: 12 }}>
//         <p style={{ fontSize: 10, color: T.silver, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: .5, fontWeight: 600 }}>Email</p>
//         <p style={{ fontSize: 13, fontWeight: 500, color: T.navy, margin: 0 }}>{staff.email}</p>
//       </div>
//       <div style={{ background: T.bg, borderRadius: 10, padding: '12px 16px', marginBottom: 12 }}>
//         <p style={{ fontSize: 10, color: T.silver, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: .5, fontWeight: 600 }}>Téléphone</p>
//         <p style={{ fontSize: 13, fontWeight: 500, color: T.navy, margin: 0 }}>{staff.phone || '—'}</p>
//       </div>
//       <div style={{ background: T.bg, borderRadius: 10, padding: '12px 16px' }}>
//         <p style={{ fontSize: 10, color: T.silver, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: .5, fontWeight: 600 }}>Département</p>
//         <p style={{ fontSize: 13, fontWeight: 500, color: T.navy, margin: 0 }}>{staff.department || '—'}</p>
//       </div>
//     </div>
//   );
// }

// /* ─── Confirm Dialog ────────────────────────────────────────────────────── */
// function ConfirmDialog({ isOpen, onClose, onConfirm, loading, title, message }) {
//   if (!isOpen) return null;
//   return (
//     <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
//       <div style={{ padding: 24 }}>
//         <p style={{ fontSize: 14, color: T.navyLt, marginBottom: 24 }}>{message}</p>
//         <div style={{ display: 'flex', gap: 10 }}>
//           <Btn variant="secondary" onClick={onClose} style={{ flex: 1, justifyContent: 'center' }}>Annuler</Btn>
//           <Btn variant="danger" onClick={onConfirm} loading={loading} style={{ flex: 1, justifyContent: 'center' }}>Confirmer</Btn>
//         </div>
//       </div>
//     </Modal>
//   );
// }

// /* ─── Main Page ─────────────────────────────────────────────────────────── */
// export default function StaffPage() {
//   const { toast, ToastContainer } = useToast();

//   const [data, setData] = useState([]);
//   const [total, setTotal] = useState(0);
//   const [page, setPage] = useState(1);
//   const [limit] = useState(20);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');

//   const [modal, setModal] = useState({ open: false, staff: null });
//   const [viewModal, setViewModal] = useState({ open: false, staff: null });
//   const [deleteDialog, setDeleteDialog] = useState({ open: false, staff: null });
//   const [deleting, setDeleting] = useState(false);

//   const fetchStaff = useCallback(async () => {
//     setLoading(true);
//     try {
//       const params = { page, limit };
//       if (searchTerm) params.search = searchTerm;
//       const response = await staffAPI.getAll(params);
//       const staffData = response?.data?.data || response?.data || [];
//       setData(staffData);
//       setTotal(response?.data?.total || response?.total || staffData.length);
//     } catch (err) {
//       console.error('Error fetching staff:', err);
//       toast('Erreur lors du chargement du personnel', 'error');
//       setData([]);
//       setTotal(0);
//     } finally {
//       setLoading(false);
//     }
//   }, [page, limit, searchTerm, toast]);

//   useEffect(() => {
//     fetchStaff();
//   }, [fetchStaff]);

//   const handleDelete = async () => {
//     setDeleting(true);
//     try {
//       if (deleteDialog.staff?._id) {
//         await staffAPI.delete(deleteDialog.staff._id);
//         toast('Personnel supprimé avec succès ✓');
//         fetchStaff();
//       }
//       setDeleteDialog({ open: false, staff: null });
//     } catch (err) {
//       toast(err.response?.data?.message || err.message || 'Erreur lors de la suppression', 'error');
//     } finally {
//       setDeleting(false);
//     }
//   };

//   const columns = [
//     {
//       header: 'Personnel',
//       key: 'firstName',
//       render: (_, row) => (
//         <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
//           <Avatar firstName={row.firstName} lastName={row.lastName} photo={row.profilePhoto} size="sm" />
//           <div>
//             <p style={{ fontWeight: 600, color: T.navy, margin: 0, fontSize: 13 }}>{row.firstName} {row.lastName}</p>
//             <p style={{ fontSize: 11, color: T.silver, margin: 0, fontFamily: T.mono }}>{row.employeeId || row._id?.slice(-6) || '—'}</p>
//           </div>
//         </div>
//       )
//     },
//     {
//       header: 'Email',
//       key: 'email',
//       render: v => <span style={{ fontSize: 12, color: T.slate }}>{v}</span>
//     },
//     {
//       header: 'Département',
//       key: 'department',
//       render: v => v || '—'
//     },
//     {
//       header: 'Poste',
//       key: 'position',
//       render: v => {
//         const pos = POSITION_OPTS.find(p => p.value === v);
//         return <Badge bg={T.indiLt} color={T.indigo}>{pos?.label || v || 'Secrétariat'}</Badge>;
//       }
//     },
//     {
//       header: 'Statut',
//       key: 'isActive',
//       render: v => v !== false
//         ? <Badge bg={T.emerLt} color={T.emerDk}>Actif</Badge>
//         : <Badge bg={T.roseLt} color={T.roseDk}>Inactif</Badge>
//     },
//     {
//       header: 'Actions',
//       key: '_id',
//       render: (_, row) => (
//         <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
//           <Btn size="icon" variant="ghost" onClick={() => setViewModal({ open: true, staff: row })}>
//             <Eye size={15} color={T.slate} />
//           </Btn>
//           <Btn size="icon" variant="ghost" onClick={() => setModal({ open: true, staff: row })}>
//             <Edit size={15} color={T.indigo} />
//           </Btn>
//           <Btn size="icon" variant="ghost" onClick={() => setDeleteDialog({ open: true, staff: row })}>
//             <Trash2 size={15} color={T.rose} />
//           </Btn>
//         </div>
//       )
//     },
//   ];

//   return (
//     <div style={{ fontFamily: T.font, padding: 24, maxWidth: 1440, margin: '0 auto', minHeight: '100vh', background: '#F1F5F9' }}>
//       <ToastContainer />

//       <style>{`
//         @keyframes spin    { to { transform: rotate(360deg); } }
//         @keyframes slideUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }
//         @keyframes popIn   { from { opacity:0; transform:scale(.94); } to { opacity:1; transform:scale(1); } }
//       `}</style>

//       {/* Page Header */}
//       <div style={{ marginBottom: 28 }}>
//         <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 4 }}>
//           <div style={{
//             width: 42, height: 42, background: T.navy, borderRadius: 12,
//             display: 'flex', alignItems: 'center', justifyContent: 'center',
//           }}>
//             <Users size={22} color={T.gold} />
//           </div>
//           <div>
//             <h1 style={{ fontSize: 22, fontWeight: 700, color: T.navy, margin: 0 }}>Gestion du Personnel</h1>
//             <p style={{ fontSize: 12, color: T.silver, margin: 0 }}>Personnel administratif et technique — {new Date().getFullYear()}</p>
//           </div>
//         </div>
//       </div>

//       {/* Stats */}
//       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16, marginBottom: 24 }}>
//         <StatCard title="Total personnel" value={total} icon={<Users size={20} />} accent={T.indigo} />
//         <StatCard title="Actifs" value={data.filter(s => s.isActive !== false).length} icon={<User size={20} />} accent={T.emerald} />
//         <StatCard title="Départements" value={[...new Set(data.map(s => s.department).filter(Boolean))].length} icon={<Building size={20} />} accent={T.gold} />
//       </div>

//       {/* Filters */}
//       <Card style={{ padding: '14px 18px', marginBottom: 20 }}>
//         <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
//           <div style={{ flex: 1, minWidth: 200, position: 'relative', marginBottom: 0 }}>
//             <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: T.silver }} />
//             <input
//               value={searchTerm}
//               onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
//               placeholder="Rechercher par nom, email..."
//               style={{
//                 width: '100%', padding: '9px 13px 9px 34px',
//                 border: `1.5px solid ${T.line}`, borderRadius: 9,
//                 fontSize: 13, fontFamily: T.font, outline: 'none',
//                 color: T.navy, background: T.bg, boxSizing: 'border-box',
//               }}
//             />
//             {searchTerm && (
//               <button onClick={() => setSearchTerm('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: T.silver }}>
//                 <X size={14} />
//               </button>
//             )}
//           </div>
//         </div>
//       </Card>

//       {/* Table */}
//       <Card>
//         <SectionHeader
//           title="Liste du personnel"
//           sub="Personnel administratif et technique de l'établissement"
//         />
//         <Table columns={columns} data={data} loading={loading} />
//         <Pagination page={page} total={total} limit={limit} onPageChange={setPage} />
//       </Card>

//       {/* Modal Création/Modification */}
//       <Modal isOpen={modal.open} onClose={() => setModal({ open: false, staff: null })} title={modal.staff ? 'Modifier le membre' : 'Nouveau membre du personnel'} size="md">
//         <StaffFormModal
//           staff={modal.staff}
//           onSave={() => {
//             setModal({ open: false, staff: null });
//             fetchStaff();
//           }}
//           onCancel={() => setModal({ open: false, staff: null })}
//         />
//       </Modal>

//       {/* Modal Visualisation */}
//       <Modal isOpen={viewModal.open} onClose={() => setViewModal({ open: false, staff: null })} title="Profil du membre" size="sm">
//         <StaffViewModal staff={viewModal.staff} onClose={() => setViewModal({ open: false, staff: null })} />
//       </Modal>

//       {/* Dialog Confirmation Suppression */}
//       <ConfirmDialog
//         isOpen={deleteDialog.open}
//         onClose={() => setDeleteDialog({ open: false, staff: null })}
//         onConfirm={handleDelete}
//         loading={deleting}
//         title="Supprimer le membre"
//         message={`Confirmer la suppression de ${deleteDialog.staff?.firstName} ${deleteDialog.staff?.lastName} ?`}
//       />
//     </div>
//   );
// }



// pages/admin/StaffPage.jsx
import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Eye, Search, X, ChevronLeft, ChevronRight, Users, User, Mail, Phone, Building, Briefcase } from 'lucide-react';
import { staffAPI } from '../../services/services';

/* ─── Google Font injection ─────────────────────────────────────────────── */
const FONT_LINK = document.createElement('link');
FONT_LINK.rel = 'stylesheet';
FONT_LINK.href = 'https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap';
document.head.appendChild(FONT_LINK);

/* ─── Design tokens ─────────────────────────────────────────────────────── */
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

const POSITION_OPTS = [
  { value: 'scolarite', label: 'Scolarité' },
  { value: 'bibliotheque', label: 'Bibliothèque' },
  { value: 'finances', label: 'Finances' },
  { value: 'secretariat', label: 'Secrétariat' },
  { value: 'informatique', label: 'Informatique' },
  { value: 'autre', label: 'Autre' },
];

/* ─── Toast Hook ────────────────────────────────────────────────────────── */
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
          padding: '12px 20px',
          borderRadius: 10,
          fontSize: 13,
          fontWeight: 500,
          fontFamily: T.font,
          background: t.type === 'error' ? T.roseLt : T.emerLt,
          color: t.type === 'error' ? T.roseDk : T.emerDk,
          border: `1px solid ${t.type === 'error' ? '#FECDD3' : '#A7F3D0'}`,
          boxShadow: '0 8px 24px rgba(0,0,0,.12)',
          animation: 'slideUp .25s ease',
        }}>
          {t.msg}
        </div>
      ))}
    </div>
  );
  return { toast: show, ToastContainer };
}

/* ─── Spinner ───────────────────────────────────────────────────────────── */
const Spinner = ({ size = 24 }) => (
  <div style={{
    width: size, height: size,
    border: `2px solid ${T.line}`,
    borderTopColor: T.indigo,
    borderRadius: '50%',
    animation: 'spin .75s linear infinite',
    flexShrink: 0,
  }} />
);

/* ─── Badge ─────────────────────────────────────────────────────────────── */
const Badge = ({ children, bg, color }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center',
    padding: '3px 10px', borderRadius: 20,
    fontSize: 11, fontWeight: 600,
    fontFamily: T.font,
    background: bg, color,
    letterSpacing: .3,
  }}>
    {children}
  </span>
);

/* ─── Button ────────────────────────────────────────────────────────────── */
function Btn({ children, onClick, variant = 'primary', size = 'md', loading, disabled, type }) {
  const V = {
    primary:   { bg: T.navy,    color: T.white,  border: 'none', hover: T.navyMid },
    gold:      { bg: T.gold,    color: T.navy,   border: 'none', hover: '#D97706' },
    secondary: { bg: T.white,   color: T.navyLt, border: `1px solid ${T.line}`, hover: T.bg },
    danger:    { bg: T.roseLt,  color: T.roseDk, border: `1px solid #FECDD3`, hover: '#FFD6DA' },
    success:   { bg: T.emerLt,  color: T.emerDk, border: 'none', hover: '#BBFADA' },
    ghost:     { bg: 'transparent', color: T.slate, border: 'none', hover: T.bg },
  };
  const S = { sm: { padding: '5px 11px', fontSize: 11 }, md: { padding: '9px 16px', fontSize: 13 }, lg: { padding: '11px 22px', fontSize: 14 }, icon: { padding: 6, width: 32, height: 32 } };
  const v = V[variant];
  const isIcon = size === 'icon';
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        background: v.bg, color: v.color, border: v.border,
        ...(isIcon ? S.icon : S[size]),
        borderRadius: 9, fontWeight: 600, cursor: (disabled || loading) ? 'not-allowed' : 'pointer',
        opacity: (disabled || loading) ? .55 : 1,
        display: 'inline-flex', alignItems: 'center', gap: 6,
        fontFamily: T.font, transition: 'background .15s, transform .1s',
        letterSpacing: .2,
      }}
      onMouseEnter={e => { if (!disabled && !loading) e.currentTarget.style.background = v.hover; }}
      onMouseLeave={e => { e.currentTarget.style.background = v.bg; }}
      onMouseDown={e => { if (!disabled && !loading) e.currentTarget.style.transform = 'scale(.97)'; }}
      onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
    >
      {loading && <Spinner size={14} />}
      {children}
    </button>
  );
}

/* ─── Card ──────────────────────────────────────────────────────────────── */
const Card = ({ children, style }) => (
  <div style={{
    background: T.white, borderRadius: 14,
    border: `1px solid ${T.line}`,
    overflow: 'hidden', ...style,
  }}>
    {children}
  </div>
);

/* ─── Avatar ────────────────────────────────────────────────────────────── */
const Avatar = ({ firstName, lastName, photo, size = 'sm' }) => {
  const sizes = { sm: 32, md: 40, lg: 56 };
  const dimension = sizes[size];
  const initial = firstName?.[0] || lastName?.[0] || '?';
  return (
    <div style={{
      width: dimension, height: dimension, borderRadius: dimension / 2,
      background: `linear-gradient(135deg, ${T.indigo}, ${T.indiDk})`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: T.white, fontWeight: 600, fontSize: dimension * 0.4,
      flexShrink: 0,
    }}>
      {photo ? <img src={photo} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : initial.toUpperCase()}
    </div>
  );
};

/* ─── Input ─────────────────────────────────────────────────────────────── */
function Field({ label, value, onChange, placeholder, type = 'text', required }) {
  const [focus, setFocus] = useState(false);
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: T.slate, marginBottom: 6, letterSpacing: .4, textTransform: 'uppercase' }}>
        {label}{required && <span style={{ color: T.rose }}> *</span>}
      </label>}
      <input
        type={type} value={value} onChange={onChange} placeholder={placeholder} required={required}
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        style={{
          width: '100%', padding: '9px 13px', border: `1.5px solid ${focus ? T.indigo : T.line}`,
          borderRadius: 9, fontSize: 13, fontFamily: T.font, outline: 'none',
          background: focus ? T.indiLt : T.white, transition: 'all .18s', color: T.navy,
          boxSizing: 'border-box',
        }}
      />
    </div>
  );
}

/* ─── Select ────────────────────────────────────────────────────────────── */
function Sel({ label, value, onChange, options, style }) {
  return (
    <div style={{ marginBottom: 16, ...style }}>
      {label && <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: T.slate, marginBottom: 6, letterSpacing: .4, textTransform: 'uppercase' }}>{label}</label>}
      <select
        value={value} onChange={onChange}
        style={{
          width: '100%', padding: '9px 13px', border: `1.5px solid ${T.line}`,
          borderRadius: 9, fontSize: 13, fontFamily: T.font, background: T.white,
          outline: 'none', cursor: 'pointer', color: T.navy,
        }}
      >
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
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(15,23,42,.5)',
      backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 1000, padding: 16,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: T.white, borderRadius: 18, width: '100%',
        maxWidth: widths[size], maxHeight: '92vh', overflowY: 'auto',
        boxShadow: '0 24px 64px rgba(0,0,0,.22)',
        animation: 'popIn .22s cubic-bezier(.34,1.56,.64,1)',
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '20px 24px', borderBottom: `1px solid ${T.line}`,
          background: T.bg,
        }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: T.navy, fontFamily: T.font }}>{title}</span>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: 8, border: `1px solid ${T.line}`,
            background: T.white, cursor: 'pointer', fontSize: 18, color: T.slate,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ─── Stat Card ─────────────────────────────────────────────────────────── */
function StatCard({ title, value, icon, accent }) {
  return (
    <div style={{
      background: T.white, borderRadius: 14,
      border: `1px solid ${T.line}`,
      padding: '20px 22px',
      display: 'flex', alignItems: 'center', gap: 16,
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: accent, borderRadius: '14px 0 0 14px' }} />
      <div style={{
        width: 46, height: 46, borderRadius: 12,
        background: accent + '18', color: accent,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        {icon}
      </div>
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
  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 56 }}>
      <Spinner size={36} />
    </div>
  );
  if (!data?.length) return (
    <div style={{ textAlign: 'center', padding: 56, color: T.silver }}>
      <Users size={40} style={{ margin: '0 auto 12px', display: 'block', opacity: .35 }} />
      <p style={{ fontFamily: T.font, fontSize: 13 }}>Aucun personnel trouvé</p>
    </div>
  );
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: T.font }}>
        <thead>
          <tr style={{ background: T.bg }}>
            {columns.map(c => (
              <th key={c.key} style={{ padding: '11px 18px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: T.silver, letterSpacing: .6, textTransform: 'uppercase', borderBottom: `1px solid ${T.line}` }}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} style={{ borderBottom: `1px solid ${T.line}`, transition: 'background .12s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
              onMouseLeave={e => e.currentTarget.style.background = T.white}>
              {columns.map(c => (
                <td key={c.key} style={{ padding: '13px 18px', fontSize: 13, color: T.navyLt, verticalAlign: 'middle' }}>
                  {c.render ? c.render(row[c.key], row) : row[c.key]}
                </td>
              ))}
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
      <button onClick={() => onPageChange(page - 1)} disabled={page === 1}
        style={{ width: 32, height: 32, border: `1px solid ${T.line}`, borderRadius: 8, background: T.white, cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? .4 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <ChevronLeft size={16} color={T.slate} />
      </button>
      <span style={{ fontSize: 12, color: T.slate, fontFamily: T.font }}>Page <strong>{page}</strong> sur {pages}</span>
      <button onClick={() => onPageChange(page + 1)} disabled={page === pages}
        style={{ width: 32, height: 32, border: `1px solid ${T.line}`, borderRadius: 8, background: T.white, cursor: page === pages ? 'not-allowed' : 'pointer', opacity: page === pages ? .4 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <ChevronRight size={16} color={T.slate} />
      </button>
    </div>
  );
}

/* ─── Staff Form Modal ──────────────────────────────────────────────────── */
function StaffFormModal({ staff, onSave, onCancel }) {
  const [form, setForm] = useState(staff || {
    firstName: '', lastName: '', email: '', phone: '',
    department: '', position: 'secretariat', password: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast, ToastContainer } = useToast();

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (staff?._id) {
        await staffAPI.update(staff._id, form);
        toast('Personnel mis à jour avec succès ✓');
      } else {
        if (!form.password) form.password = 'Staff@123';
        await staffAPI.create(form);
        toast('Personnel créé avec succès ✓');
      }
      setTimeout(onSave, 900);
    } catch (err) {
      toast(err.response?.data?.message || err.message || 'Une erreur est survenue', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
      <ToastContainer />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
        <Field label="Prénom" value={form.firstName} onChange={set('firstName')} required />
        <Field label="Nom" value={form.lastName} onChange={set('lastName')} required />
      </div>
      <Field label="Email" type="email" value={form.email} onChange={set('email')} required />
      <Field label="Téléphone" value={form.phone || ''} onChange={set('phone')} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
        <Field label="Département" value={form.department || ''} onChange={set('department')} />
        <Sel label="Poste" value={form.position} onChange={set('position')} options={POSITION_OPTS} />
      </div>
      {!staff && (
        <Field label="Mot de passe" type="password" placeholder="Laissez vide pour 'Staff@123'" onChange={set('password')} />
      )}
      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        <Btn variant="secondary" onClick={onCancel} style={{ flex: 1, justifyContent: 'center' }}>Annuler</Btn>
        <Btn type="submit" variant="primary" loading={loading} style={{ flex: 1, justifyContent: 'center' }}>
          {staff ? 'Mettre à jour' : 'Créer'}
        </Btn>
      </div>
    </form>
  );
}

/* ─── Staff View Modal ──────────────────────────────────────────────────── */
function StaffViewModal({ staff, onClose }) {
  if (!staff) return null;
  const positionLabel = POSITION_OPTS.find(p => p.value === staff.position)?.label || staff.position || '—';
  
  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, background: T.bg, borderRadius: 12, marginBottom: 20 }}>
        <Avatar firstName={staff.firstName} lastName={staff.lastName} size="lg" />
        <div>
          <h3 style={{ fontWeight: 700, color: T.navy, fontSize: 16, margin: 0 }}>{staff.firstName} {staff.lastName}</h3>
          <p style={{ fontSize: 13, color: T.indigo, margin: '4px 0 0' }}>{positionLabel}</p>
        </div>
      </div>
      <div style={{ background: T.bg, borderRadius: 10, padding: '12px 16px', marginBottom: 12 }}>
        <p style={{ fontSize: 10, color: T.silver, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: .5, fontWeight: 600 }}>Email</p>
        <p style={{ fontSize: 13, fontWeight: 500, color: T.navy, margin: 0 }}>{staff.email}</p>
      </div>
      <div style={{ background: T.bg, borderRadius: 10, padding: '12px 16px', marginBottom: 12 }}>
        <p style={{ fontSize: 10, color: T.silver, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: .5, fontWeight: 600 }}>Téléphone</p>
        <p style={{ fontSize: 13, fontWeight: 500, color: T.navy, margin: 0 }}>{staff.phone || '—'}</p>
      </div>
      <div style={{ background: T.bg, borderRadius: 10, padding: '12px 16px' }}>
        <p style={{ fontSize: 10, color: T.silver, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: .5, fontWeight: 600 }}>Département</p>
        <p style={{ fontSize: 13, fontWeight: 500, color: T.navy, margin: 0 }}>{staff.department || '—'}</p>
      </div>
    </div>
  );
}

/* ─── Confirm Dialog ────────────────────────────────────────────────────── */
function ConfirmDialog({ isOpen, onClose, onConfirm, loading, title, message }) {
  if (!isOpen) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div style={{ padding: 24 }}>
        <p style={{ fontSize: 14, color: T.navyLt, marginBottom: 24 }}>{message}</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <Btn variant="secondary" onClick={onClose} style={{ flex: 1, justifyContent: 'center' }}>Annuler</Btn>
          <Btn variant="danger" onClick={onConfirm} loading={loading} style={{ flex: 1, justifyContent: 'center' }}>Confirmer</Btn>
        </div>
      </div>
    </Modal>
  );
}

/* ─── Main Page ─────────────────────────────────────────────────────────── */
export default function StaffPage() {
  const { toast, ToastContainer } = useToast();

  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [modal, setModal] = useState({ open: false, staff: null });
  const [viewModal, setViewModal] = useState({ open: false, staff: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, staff: null });
  const [deleting, setDeleting] = useState(false);

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (searchTerm) params.search = searchTerm;
      const response = await staffAPI.getAll(params);
      const staffData = response?.data?.data || response?.data || [];
      setData(staffData);
      setTotal(response?.data?.total || response?.total || staffData.length);
    } catch (err) {
      console.error('Error fetching staff:', err);
      toast('Erreur lors du chargement du personnel', 'error');
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, limit, searchTerm, toast]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      if (deleteDialog.staff?._id) {
        await staffAPI.delete(deleteDialog.staff._id);
        toast('Personnel supprimé avec succès ✓');
        fetchStaff();
      }
      setDeleteDialog({ open: false, staff: null });
    } catch (err) {
      toast(err.response?.data?.message || err.message || 'Erreur lors de la suppression', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      header: 'Personnel',
      key: 'firstName',
      render: (_, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar firstName={row.firstName} lastName={row.lastName} photo={row.profilePhoto} size="sm" />
          <div>
            <p style={{ fontWeight: 600, color: T.navy, margin: 0, fontSize: 13 }}>{row.firstName} {row.lastName}</p>
            <p style={{ fontSize: 11, color: T.silver, margin: 0, fontFamily: T.mono }}>{row.employeeId || row._id?.slice(-6) || '—'}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Email',
      key: 'email',
      render: v => <span style={{ fontSize: 12, color: T.slate }}>{v}</span>
    },
    {
      header: 'Département',
      key: 'department',
      render: v => v || '—'
    },
    {
      header: 'Poste',
      key: 'position',
      render: v => {
        const pos = POSITION_OPTS.find(p => p.value === v);
        return <Badge bg={T.indiLt} color={T.indigo}>{pos?.label || v || 'Secrétariat'}</Badge>;
      }
    },
    {
      header: 'Statut',
      key: 'isActive',
      render: v => v !== false
        ? <Badge bg={T.emerLt} color={T.emerDk}>Actif</Badge>
        : <Badge bg={T.roseLt} color={T.roseDk}>Inactif</Badge>
    },
    {
      header: 'Actions',
      key: '_id',
      render: (_, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Btn size="icon" variant="ghost" onClick={() => setViewModal({ open: true, staff: row })}>
            <Eye size={15} color={T.slate} />
          </Btn>
          <Btn size="icon" variant="ghost" onClick={() => setModal({ open: true, staff: row })}>
            <Edit size={15} color={T.indigo} />
          </Btn>
          <Btn size="icon" variant="ghost" onClick={() => setDeleteDialog({ open: true, staff: row })}>
            <Trash2 size={15} color={T.rose} />
          </Btn>
        </div>
      )
    },
  ];

  return (
    <div style={{ fontFamily: T.font, padding: 24, maxWidth: 1440, margin: '0 auto', minHeight: '100vh', background: '#F1F5F9' }}>
      <ToastContainer />

      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes slideUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }
        @keyframes popIn   { from { opacity:0; transform:scale(.94); } to { opacity:1; transform:scale(1); } }
      `}</style>

      {/* Page Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 4 }}>
          <div style={{
            width: 42, height: 42, background: T.navy, borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Users size={22} color={T.gold} />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: T.navy, margin: 0 }}>Gestion du Personnel</h1>
            <p style={{ fontSize: 12, color: T.silver, margin: 0 }}>Personnel administratif et technique — {new Date().getFullYear()}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16, marginBottom: 24 }}>
        <StatCard title="Total personnel" value={total} icon={<Users size={20} />} accent={T.indigo} />
        <StatCard title="Actifs" value={data.filter(s => s.isActive !== false).length} icon={<User size={20} />} accent={T.emerald} />
        <StatCard title="Départements" value={[...new Set(data.map(s => s.department).filter(Boolean))].length} icon={<Building size={20} />} accent={T.gold} />
      </div>

      {/* Filters avec bouton Ajouter */}
      <Card style={{ padding: '14px 18px', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: T.silver }} />
            <input
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
              placeholder="Rechercher par nom, email..."
              style={{
                width: '100%', padding: '9px 13px 9px 34px',
                border: `1.5px solid ${T.line}`, borderRadius: 9,
                fontSize: 13, fontFamily: T.font, outline: 'none',
                color: T.navy, background: T.bg, boxSizing: 'border-box',
              }}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: T.silver }}>
                <X size={14} />
              </button>
            )}
          </div>
          
          {/* ✅ BOUTON AJOUTER */}
          <Btn onClick={() => setModal({ open: true, staff: null })} variant="primary">
            <Plus size={16} />
            Ajouter un membre
          </Btn>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <SectionHeader
          title="Liste du personnel"
          sub="Personnel administratif et technique de l'établissement"
        />
        <Table columns={columns} data={data} loading={loading} />
        <Pagination page={page} total={total} limit={limit} onPageChange={setPage} />
      </Card>

      {/* Modal Création/Modification */}
      <Modal isOpen={modal.open} onClose={() => setModal({ open: false, staff: null })} title={modal.staff ? 'Modifier le membre' : 'Nouveau membre du personnel'} size="md">
        <StaffFormModal
          staff={modal.staff}
          onSave={() => {
            setModal({ open: false, staff: null });
            fetchStaff();
          }}
          onCancel={() => setModal({ open: false, staff: null })}
        />
      </Modal>

      {/* Modal Visualisation */}
      <Modal isOpen={viewModal.open} onClose={() => setViewModal({ open: false, staff: null })} title="Profil du membre" size="sm">
        <StaffViewModal staff={viewModal.staff} onClose={() => setViewModal({ open: false, staff: null })} />
      </Modal>

      {/* Dialog Confirmation Suppression */}
      <ConfirmDialog
        isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, staff: null })}
        onConfirm={handleDelete}
        loading={deleting}
        title="Supprimer le membre"
        message={`Confirmer la suppression de ${deleteDialog.staff?.firstName} ${deleteDialog.staff?.lastName} ?`}
      />
    </div>
  );
}