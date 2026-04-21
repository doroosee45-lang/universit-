// // pages/admin/ExamsPage.jsx (version corrigée)
// import { useState, useEffect, useCallback } from 'react';
// import { Plus, Edit, Trash2, Send } from 'lucide-react';
// import { examAPI, ueAPI, programAPI } from '../../services/services';

// // ─── Constants ────────────────────────────────────────────────────────────────
// const SESSION_OPTS = [
//   { value: 'session1', label: 'Session 1' },
//   { value: 'session2', label: 'Session 2' },
//   { value: 'rattrapage', label: 'Rattrapage' },
//   { value: 'mi_session', label: 'Mi-session' },
//   { value: 'recours', label: 'Recours' },
// ];

// const TYPE_OPTS = [
//   { value: 'partiel', label: 'Partiel' },
//   { value: 'final', label: 'Final' },
//   { value: 'rattrapage', label: 'Rattrapage' },
//   { value: 'tp', label: 'TP' },
//   { value: 'oral', label: 'Oral' },
//   { value: 'projet', label: 'Projet' },
// ];

// const STATUS_OPTS = [
//   { value: '', label: 'Tous les statuts' },
//   { value: 'planned', label: 'Planifié' },
//   { value: 'ongoing', label: 'En cours' },
//   { value: 'completed', label: 'Terminé' },
//   { value: 'cancelled', label: 'Annulé' },
// ];

// const getCurrentAcademicYear = () => {
//   const y = new Date().getFullYear();
//   return `${y}-${y + 1}`;
// };

// const formatDateTime = (date) => {
//   if (!date) return '—';
//   const d = new Date(date);
//   return d.toLocaleString('fr-FR');
// };

// const getStatusColor = (status) => {
//   const colors = {
//     planned: { background: '#DBEAFE', color: '#1E40AF' },
//     ongoing: { background: '#FEF3C7', color: '#92400E' },
//     completed: { background: '#D1FAE5', color: '#065F46' },
//     cancelled: { background: '#FEE2E2', color: '#991B1B' },
//   };
//   return colors[status] || colors.planned;
// };

// // ─── Toast Component ──────────────────────────────────────────────────────────
// function useToast() {
//   const [toasts, setToasts] = useState([]);
//   const show = useCallback((msg, type = 'success') => {
//     const id = Date.now();
//     setToasts(t => [...t, { id, msg, type }]);
//     setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
//   }, []);
  
//   const ToastContainer = () => (
//     <div style={styles.toastContainer}>
//       {toasts.map(t => (
//         <div key={t.id} style={{
//           ...styles.toast,
//           background: t.type === 'error' ? '#FEF2F2' : '#F0FDF4',
//           border: `1px solid ${t.type === 'error' ? '#FECACA' : '#BBF7D0'}`,
//           color: t.type === 'error' ? '#991B1B' : '#166534',
//         }}>
//           {t.msg}
//         </div>
//       ))}
//     </div>
//   );
  
//   return { toast: show, ToastContainer };
// }

// // ─── Spinner Component ────────────────────────────────────────────────────────
// function Spinner({ size = 24 }) {
//   return (
//     <div style={{
//       width: size,
//       height: size,
//       border: '2px solid #E5E7EB',
//       borderTopColor: '#4F46E5',
//       borderRadius: '50%',
//       animation: 'spin 0.8s linear infinite',
//     }} />
//   );
// }

// // ─── Badge Component ──────────────────────────────────────────────────────────
// function Badge({ children, style }) {
//   return (
//     <span style={{
//       display: 'inline-flex',
//       alignItems: 'center',
//       padding: '4px 10px',
//       borderRadius: 20,
//       fontSize: 11,
//       fontWeight: 500,
//       ...style,
//     }}>
//       {children}
//     </span>
//   );
// }

// // ─── Button Component ─────────────────────────────────────────────────────────
// function Button({ children, onClick, variant = 'primary', size = 'md', loading, disabled }) {
//   const variants = {
//     primary: { background: '#4F46E5', color: '#fff', border: 'none' },
//     secondary: { background: '#F9FAFB', color: '#374151', border: '1px solid #E5E7EB' },
//     danger: { background: '#FEF2F2', color: '#991B1B', border: '1px solid #FECACA' },
//     ghost: { background: 'transparent', color: '#6B7280', border: 'none' },
//     success: { background: '#D1FAE5', color: '#065F46', border: 'none' },
//   };
  
//   const sizes = {
//     sm: { padding: '4px 10px', fontSize: 12 },
//     md: { padding: '8px 16px', fontSize: 13 },
//     lg: { padding: '10px 20px', fontSize: 14 },
//   };
  
//   return (
//     <button
//       onClick={onClick}
//       disabled={disabled || loading}
//       style={{
//         ...variants[variant],
//         ...sizes[size],
//         borderRadius: 8,
//         fontWeight: 500,
//         cursor: disabled || loading ? 'not-allowed' : 'pointer',
//         opacity: disabled || loading ? 0.6 : 1,
//         display: 'inline-flex',
//         alignItems: 'center',
//         gap: 6,
//         transition: 'all 0.2s',
//       }}
//     >
//       {loading && <Spinner size={16} />}
//       {children}
//     </button>
//   );
// }

// // ─── Card Component ───────────────────────────────────────────────────────────
// function Card({ children, style }) {
//   return (
//     <div style={{
//       background: '#fff',
//       borderRadius: 12,
//       border: '1px solid #E5E7EB',
//       overflow: 'hidden',
//       ...style,
//     }}>
//       {children}
//     </div>
//   );
// }

// // ─── Input Component ──────────────────────────────────────────────────────────
// function Input({ label, value, onChange, placeholder, type = 'text', required }) {
//   return (
//     <div style={{ marginBottom: 16 }}>
//       {label && (
//         <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#6B7280', marginBottom: 6 }}>
//           {label} {required && '*'}
//         </label>
//       )}
//       <input
//         type={type}
//         value={value}
//         onChange={onChange}
//         placeholder={placeholder}
//         required={required}
//         style={{
//           width: '100%',
//           padding: '8px 12px',
//           border: '1px solid #E5E7EB',
//           borderRadius: 8,
//           fontSize: 13,
//           outline: 'none',
//           transition: 'all 0.2s',
//         }}
//         onFocus={(e) => e.target.style.borderColor = '#6366F1'}
//         onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
//       />
//     </div>
//   );
// }

// // ─── Select Component ─────────────────────────────────────────────────────────
// function Select({ label, value, onChange, options, required, style }) {
//   return (
//     <div style={{ marginBottom: 16, ...style }}>
//       {label && (
//         <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#6B7280', marginBottom: 6 }}>
//           {label} {required && '*'}
//         </label>
//       )}
//       <select
//         value={value}
//         onChange={onChange}
//         required={required}
//         style={{
//           width: '100%',
//           padding: '8px 12px',
//           border: '1px solid #E5E7EB',
//           borderRadius: 8,
//           fontSize: 13,
//           background: '#fff',
//           outline: 'none',
//           cursor: 'pointer',
//         }}
//       >
//         {options.map(opt => (
//           <option key={opt.value} value={opt.value}>{opt.label}</option>
//         ))}
//       </select>
//     </div>
//   );
// }

// // ─── Modal Component ──────────────────────────────────────────────────────────
// function Modal({ isOpen, onClose, title, children, size = 'md' }) {
//   useEffect(() => {
//     const handler = (e) => e.key === 'Escape' && onClose();
//     document.addEventListener('keydown', handler);
//     return () => document.removeEventListener('keydown', handler);
//   }, [onClose]);
  
//   if (!isOpen) return null;
  
//   const sizes = {
//     sm: { maxWidth: 400 },
//     md: { maxWidth: 600 },
//     lg: { maxWidth: 800 },
//     xl: { maxWidth: 1000 },
//   };
  
//   return (
//     <div onClick={onClose} style={styles.modalOverlay}>
//       <div onClick={e => e.stopPropagation()} style={{ ...styles.modalContent, ...sizes[size] }}>
//         <div style={styles.modalHeader}>
//           <h2 style={styles.modalTitle}>{title}</h2>
//           <button onClick={onClose} style={styles.modalClose}>×</button>
//         </div>
//         {children}
//       </div>
//     </div>
//   );
// }

// // ─── ConfirmDialog Component ──────────────────────────────────────────────────
// function ConfirmDialog({ isOpen, onClose, onConfirm, loading, title, message }) {
//   if (!isOpen) return null;
  
//   return (
//     <div onClick={onClose} style={styles.modalOverlay}>
//       <div onClick={e => e.stopPropagation()} style={{ ...styles.modalContent, maxWidth: 400 }}>
//         <div style={styles.modalHeader}>
//           <h2 style={styles.modalTitle}>{title}</h2>
//           <button onClick={onClose} style={styles.modalClose}>×</button>
//         </div>
//         <div style={{ padding: '20px' }}>
//           <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 20 }}>{message}</p>
//           <div style={{ display: 'flex', gap: 12 }}>
//             <Button variant="secondary" onClick={onClose} style={{ flex: 1, justifyContent: 'center' }}>Annuler</Button>
//             <Button variant="danger" onClick={onConfirm} loading={loading} style={{ flex: 1, justifyContent: 'center' }}>Supprimer</Button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─── Table Component ────────────────────────────────────────────────────────── (CORRIGÉ)
// function Table({ columns, data, loading, emptyText = 'Aucune donnée' }) {
//   if (loading) {
//     return (
//       <div style={{ textAlign: 'center', padding: '48px' }}>
//         <Spinner size={32} />
//       </div>
//     );
//   }
  
//   if (!data || data.length === 0) {
//     return (
//       <div style={{ textAlign: 'center', padding: '48px', color: '#9CA3AF' }}>
//         {emptyText}
//       </div>
//     );
//   }
  
//   return (
//     <div style={{ overflowX: 'auto' }}>
//       <table style={{ width: '100%', borderCollapse: 'collapse' }}>
//         <thead>
//           <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #F3F4F6' }}>
//             {columns.map(col => (
//               <th key={col.key} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6B7280' }}>
//                 {col.header}
//               </th>
//             ))}
//           </tr>
//         </thead>
//         <tbody>
//           {data.map((row, idx) => (
//             <tr key={idx} style={{ borderBottom: '1px solid #F9FAFB' }}>
//               {columns.map(col => (
//                 <td key={col.key} style={{ padding: '12px 16px', fontSize: 13 }}>
//                   {col.render ? col.render(row[col.key], row) : row[col.key]}
//                 </td>
//               ))}
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }

// // ─── Pagination Component ─────────────────────────────────────────────────────
// function Pagination({ page, total, limit, onPageChange }) {
//   const totalPages = Math.ceil(total / limit);
  
//   if (totalPages <= 1) return null;
  
//   return (
//     <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: '16px' }}>
//       <button
//         onClick={() => onPageChange(page - 1)}
//         disabled={page === 1}
//         style={{
//           padding: '6px 12px',
//           borderRadius: 6,
//           border: '1px solid #E5E7EB',
//           background: '#fff',
//           cursor: page === 1 ? 'not-allowed' : 'pointer',
//           opacity: page === 1 ? 0.5 : 1,
//         }}
//       >
//         ←
//       </button>
//       <span style={{ padding: '6px 12px', color: '#6B7280' }}>
//         Page {page} sur {totalPages}
//       </span>
//       <button
//         onClick={() => onPageChange(page + 1)}
//         disabled={page === totalPages}
//         style={{
//           padding: '6px 12px',
//           borderRadius: 6,
//           border: '1px solid #E5E7EB',
//           background: '#fff',
//           cursor: page === totalPages ? 'not-allowed' : 'pointer',
//           opacity: page === totalPages ? 0.5 : 1,
//         }}
//       >
//         →
//       </button>
//     </div>
//   );
// }

// // ─── Exam Form Component ──────────────────────────────────────────────────────
// function ExamForm({ exam, ues, programs, onSave, onCancel }) {
//   const [form, setForm] = useState(exam || {
//     title: '', ue: '', program: '', session: 'session1', type: 'final',
//     startDate: '', endDate: '', duration: 120, maxScore: 20,
//     instructions: '', isPublished: false, academicYear: getCurrentAcademicYear(),
//   });
//   const [loading, setLoading] = useState(false);
//   const { toast, ToastContainer } = useToast();
  
//   const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

//   const ueOpts = [{ value: '', label: 'Sélectionner une UE' }, ...(ues || []).map(u => ({ value: u._id, label: `${u.code} - ${u.title}` }))];
//   const progOpts = [{ value: '', label: 'Sélectionner une filière' }, ...(programs || []).map(p => ({ value: p._id, label: p.name }))];

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!form.title || !form.ue || !form.program || !form.startDate || !form.endDate) {
//       toast('Veuillez remplir tous les champs obligatoires', 'error');
//       return;
//     }
//     setLoading(true);
//     try {
//       if (exam?._id) await examAPI.update(exam._id, form);
//       else await examAPI.create(form);
//       toast(exam ? 'Examen mis à jour' : 'Examen créé avec succès');
//       onSave();
//     } catch (err) {
//       toast(err.message || 'Erreur lors de la sauvegarde', 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
//       <ToastContainer />
      
//       <Input label="Titre de l'examen" value={form.title} onChange={e => set('title', e.target.value)} required />
      
//       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
//         <Select label="UE" value={form.ue} onChange={e => set('ue', e.target.value)} options={ueOpts} required />
//         <Select label="Filière" value={form.program} onChange={e => set('program', e.target.value)} options={progOpts} required />
//       </div>
      
//       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
//         <Select label="Session" value={form.session} onChange={e => set('session', e.target.value)} options={SESSION_OPTS} />
//         <Select label="Type" value={form.type} onChange={e => set('type', e.target.value)} options={TYPE_OPTS} />
//       </div>
      
//       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
//         <Input label="Début" type="datetime-local" value={form.startDate?.substring(0, 16)} onChange={e => set('startDate', e.target.value)} required />
//         <Input label="Fin" type="datetime-local" value={form.endDate?.substring(0, 16)} onChange={e => set('endDate', e.target.value)} required />
//       </div>
      
//       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
//         <Input label="Durée (minutes)" type="number" value={form.duration} onChange={e => set('duration', +e.target.value)} />
//         <Input label="Note maximale" type="number" value={form.maxScore} onChange={e => set('maxScore', +e.target.value)} />
//       </div>
      
//       <Input label="Consignes" value={form.instructions} onChange={e => set('instructions', e.target.value)} />
      
//       <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
//         <input
//           type="checkbox"
//           id="published"
//           checked={form.isPublished}
//           onChange={e => set('isPublished', e.target.checked)}
//           style={{ width: 16, height: 16, cursor: 'pointer' }}
//         />
//         <label htmlFor="published" style={{ fontSize: 13, color: '#374151', cursor: 'pointer' }}>
//           Publier l'examen
//         </label>
//       </div>
      
//       <div style={{ display: 'flex', gap: 12, marginTop: 20, paddingTop: 16, borderTop: '1px solid #E5E7EB' }}>
//         <Button variant="secondary" onClick={onCancel} style={{ flex: 1, justifyContent: 'center' }}>Annuler</Button>
//         <Button type="submit" loading={loading} style={{ flex: 1, justifyContent: 'center' }}>
//           {exam ? 'Mettre à jour' : 'Créer l\'examen'}
//         </Button>
//       </div>
//     </form>
//   );
// }

// // ─── Main Exams Page ─────────────────────────────────────────────────────────
// export default function ExamsPage() {
//   const { toast, ToastContainer } = useToast();
  
//   const [ues, setUes] = useState([]);
//   const [programs, setPrograms] = useState([]);
//   const [exams, setExams] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [page, setPage] = useState(1);
//   const [total, setTotal] = useState(0);
//   const [limit] = useState(20);
//   const [filters, setFilters] = useState({ status: '', session: '' });
  
//   const [modal, setModal] = useState({ open: false, exam: null });
//   const [deleteDialog, setDeleteDialog] = useState({ open: false, exam: null });
//   const [deleting, setDeleting] = useState(false);

//   useEffect(() => {
//     loadUEs();
//     loadPrograms();
//   }, []);

//   useEffect(() => {
//     loadExams();
//   }, [page, filters]);

//   const loadUEs = async () => {
//     try {
//       const res = await ueAPI.getAll({ limit: 200 });
//       setUes(res.data?.data || res.data || []);
//     } catch (error) {
//       console.error('Erreur chargement UE:', error);
//     }
//   };

//   const loadPrograms = async () => {
//     try {
//       const res = await programAPI.getAll({ limit: 100 });
//       setPrograms(res.data?.data || res.data || []);
//     } catch (error) {
//       console.error('Erreur chargement programmes:', error);
//     }
//   };

//   const loadExams = async () => {
//     setLoading(true);
//     try {
//       const params = { page, limit, ...filters };
//       Object.keys(params).forEach(key => !params[key] && delete params[key]);
//       const res = await examAPI.getAll(params);
//       setExams(res.data?.data || res.data || []);
//       setTotal(res.data?.total || res.total || 0);
//     } catch (error) {
//       console.error('Erreur chargement examens:', error);
//       toast('Erreur lors du chargement des examens', 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleFilter = (key, value) => {
//     setFilters(prev => ({ ...prev, [key]: value }));
//     setPage(1);
//   };

//   const handleDelete = async () => {
//     setDeleting(true);
//     try {
//       await examAPI.delete(deleteDialog.exam._id);
//       setDeleteDialog({ open: false, exam: null });
//       loadExams();
//       toast('Examen supprimé avec succès');
//     } catch (err) {
//       toast(err.message || 'Erreur lors de la suppression', 'error');
//     } finally {
//       setDeleting(false);
//     }
//   };

//   const publishResults = async (examId) => {
//     try {
//       await examAPI.publishResults(examId);
//       loadExams();
//       toast('Résultats publiés avec succès');
//     } catch (err) {
//       toast(err.message || 'Erreur lors de la publication', 'error');
//     }
//   };

//   const columns = [
//     {
//       header: 'Examen',
//       key: 'title',
//       render: (v, row) => (
//         <div>
//           <div style={{ fontWeight: 500, color: '#111' }}>{v}</div>
//           <div style={{ fontSize: 11, color: '#9CA3AF' }}>{row.ue?.code} • {row.program?.name}</div>
//         </div>
//       )
//     },
//     {
//       header: 'Session / Type',
//       key: 'session',
//       render: (v, row) => (
//         <div style={{ display: 'flex', gap: 4 }}>
//           <Badge style={{
//             background: v === 'session1' ? '#DBEAFE' : v === 'session2' ? '#FFF3E0' : '#F3E8FF',
//             color: v === 'session1' ? '#1E40AF' : v === 'session2' ? '#9C4D0E' : '#9333EA'
//           }}>{v}</Badge>
//           <Badge style={{ background: '#F3F4F6', color: '#6B7280' }}>{row.type}</Badge>
//         </div>
//       )
//     },
//     { header: 'Début', key: 'startDate', render: v => formatDateTime(v) },
//     { header: 'Durée', key: 'duration', render: v => v ? `${v} min` : '—' },
//     {
//       header: 'Statut',
//       key: 'status',
//       render: v => {
//         const colors = getStatusColor(v);
//         return <Badge style={{ background: colors.background, color: colors.color }}>{v === 'planned' ? 'Planifié' : v === 'ongoing' ? 'En cours' : v === 'completed' ? 'Terminé' : 'Annulé'}</Badge>;
//       }
//     },
//     {
//       header: 'Publié',
//       key: 'isPublished',
//       render: v => v ? <Badge style={{ background: '#D1FAE5', color: '#065F46' }}>✓ Publié</Badge> : <Badge style={{ background: '#F3F4F6', color: '#9CA3AF' }}>Non publié</Badge>
//     },
//     {
//       header: 'Actions',
//       key: '_id',
//       render: (_, row) => (
//         <div style={{ display: 'flex', gap: 4 }}>
//           <Button size="sm" variant="ghost" onClick={() => setModal({ open: true, exam: row })}>
//             <Edit size={13} />
//           </Button>
//           {row.status === 'completed' && !row.isPublished && (
//             <Button size="sm" variant="success" onClick={() => publishResults(row._id)}>
//               <Send size={13} /> Publier
//             </Button>
//           )}
//           <Button size="sm" variant="ghost" onClick={() => setDeleteDialog({ open: true, exam: row })}>
//             <Trash2 size={13} />
//           </Button>
//         </div>
//       )
//     },
//   ];

//   const sessionFilterOpts = [
//     { value: '', label: 'Toutes les sessions' },
//     ...SESSION_OPTS
//   ];

//   return (
//     <div style={styles.container}>
//       <ToastContainer />
      
//       <style>{`
//         @keyframes spin {
//           to { transform: rotate(360deg); }
//         }
//       `}</style>

//       <div style={styles.header}>
//         <div>
//           <h1 style={styles.title}>📝 Gestion des Examens</h1>
//           <p style={styles.subtitle}>{total} examen{total > 1 ? 's' : ''}</p>
//         </div>
//         <Button onClick={() => setModal({ open: true, exam: null })}>
//           <Plus size={16} /> Planifier un examen
//         </Button>
//       </div>

//       <Card style={{ padding: 16, marginBottom: 20 }}>
//         <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
//           <Select
//             value={filters.session}
//             onChange={e => handleFilter('session', e.target.value)}
//             options={sessionFilterOpts}
//             style={{ width: 160 }}
//           />
//           <Select
//             value={filters.status}
//             onChange={e => handleFilter('status', e.target.value)}
//             options={STATUS_OPTS}
//             style={{ width: 160 }}
//           />
//         </div>
//       </Card>

//       <Card>
//         <Table columns={columns} data={exams} loading={loading} emptyText="Aucun examen trouvé" />
//         <Pagination page={page} total={total} limit={limit} onPageChange={setPage} />
//       </Card>

//       <Modal
//         isOpen={modal.open}
//         onClose={() => setModal({ open: false, exam: null })}
//         title={modal.exam ? 'Modifier l\'examen' : 'Planifier un examen'}
//         size="lg"
//       >
//         <ExamForm
//           exam={modal.exam}
//           ues={ues}
//           programs={programs}
//           onSave={() => {
//             setModal({ open: false, exam: null });
//             loadExams();
//           }}
//           onCancel={() => setModal({ open: false, exam: null })}
//         />
        
//       </Modal>

//       <ConfirmDialog
//         isOpen={deleteDialog.open}
//         onClose={() => setDeleteDialog({ open: false, exam: null })}
//         onConfirm={handleDelete}
//         loading={deleting}
//         title="Supprimer l'examen"
//         message={`Supprimer l'examen "${deleteDialog.exam?.title}" ? Cette action est irréversible.`}
//       />
//     </div>
//   );
// }

// // ─── Styles ───────────────────────────────────────────────────────────────────
// const styles = {
//   container: {
//     fontFamily: 'system-ui, -apple-system, sans-serif',
//     padding: '24px',
//     maxWidth: 1400,
//     margin: '0 auto',
//     minHeight: '100vh',
//     background: '#F9FAFB',
//   },
  
//   toastContainer: {
//     position: 'fixed',
//     bottom: 24,
//     right: 24,
//     zIndex: 9999,
//     display: 'flex',
//     flexDirection: 'column',
//     gap: 8,
//   },
  
//   toast: {
//     padding: '12px 20px',
//     borderRadius: 12,
//     fontSize: 14,
//     fontWeight: 500,
//     boxShadow: '0 4px 12px rgba(0,0,0,.15)',
//     animation: 'fadeUp 0.2s ease',
//   },
  
//   header: {
//     display: 'flex',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     flexWrap: 'wrap',
//     gap: 16,
//     marginBottom: 24,
//   },
  
//   title: {
//     fontSize: 24,
//     fontWeight: 700,
//     color: '#111',
//     margin: 0,
//   },
  
//   subtitle: {
//     fontSize: 13,
//     color: '#6B7280',
//     marginTop: 4,
//   },
  
//   modalOverlay: {
//     position: 'fixed',
//     inset: 0,
//     background: 'rgba(0,0,0,0.4)',
//     backdropFilter: 'blur(4px)',
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//     zIndex: 1000,
//     padding: 16,
//   },
  
//   modalContent: {
//     background: '#fff',
//     borderRadius: 16,
//     width: '100%',
//     maxHeight: '90vh',
//     overflowY: 'auto',
//     boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
//   },
  
//   modalHeader: {
//     display: 'flex',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: '20px 24px',
//     borderBottom: '1px solid #E5E7EB',
//   },
  
//   modalTitle: {
//     fontSize: 18,
//     fontWeight: 600,
//     color: '#111',
//     margin: 0,
//   },
  
//   modalClose: {
//     width: 32,
//     height: 32,
//     borderRadius: 8,
//     border: 'none',
//     background: '#F3F4F6',
//     cursor: 'pointer',
//     fontSize: 18,
//     color: '#6B7280',
//     transition: 'all 0.2s',
//   },
// };




// pages/admin/ExamsPage.jsx
import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, Send, ChevronLeft, ChevronRight, X, BookOpen, Clock, Users, Calendar, Tag } from 'lucide-react';
import { examAPI, ueAPI, programAPI } from '../../services/services';

// ─── Constants ────────────────────────────────────────────────────────────────
const SESSION_OPTS = [
  { value: 'session1', label: 'Session 1' },
  { value: 'session2', label: 'Session 2' },
  { value: 'rattrapage', label: 'Rattrapage' },
  { value: 'mi_session', label: 'Mi-session' },
  { value: 'recours', label: 'Recours' },
];

const TYPE_OPTS = [
  { value: 'partiel', label: 'Partiel' },
  { value: 'final', label: 'Final' },
  { value: 'rattrapage', label: 'Rattrapage' },
  { value: 'tp', label: 'TP' },
  { value: 'oral', label: 'Oral' },
  { value: 'projet', label: 'Projet' },
];

const STATUS_OPTS = [
  { value: '', label: 'Tous les statuts' },
  { value: 'planned', label: 'Planifié' },
  { value: 'ongoing', label: 'En cours' },
  { value: 'completed', label: 'Terminé' },
  { value: 'cancelled', label: 'Annulé' },
];

const STATUS_META = {
  planned:   { label: 'Planifié',  bg: '#EEF2FF', color: '#4338CA', dot: '#6366F1' },
  ongoing:   { label: 'En cours',  bg: '#FFF7ED', color: '#C2410C', dot: '#F97316' },
  completed: { label: 'Terminé',   bg: '#F0FDF4', color: '#166534', dot: '#22C55E' },
  cancelled: { label: 'Annulé',    bg: '#FFF1F2', color: '#9F1239', dot: '#F43F5E' },
};

const TYPE_META = {
  partiel:    { label: 'Partiel',    bg: '#EEF2FF', color: '#4338CA' },
  final:      { label: 'Final',      bg: '#FDF4FF', color: '#7E22CE' },
  rattrapage: { label: 'Rattrapage', bg: '#FFF7ED', color: '#C2410C' },
  tp:         { label: 'TP',         bg: '#F0FDF4', color: '#166534' },
  oral:       { label: 'Oral',       bg: '#EFF6FF', color: '#1D4ED8' },
  projet:     { label: 'Projet',     bg: '#FDF2F8', color: '#9D174D' },
};

const getCurrentAcademicYear = () => {
  const y = new Date().getFullYear();
  return `${y}-${y + 1}`;
};

const formatDateTime = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const formatDateShort = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
};

// ─── useToast ────────────────────────────────────────────────────────────────
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
          padding: '12px 18px', borderRadius: 10, fontSize: 13, fontWeight: 500,
          boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
          background: t.type === 'error' ? '#FFF1F2' : '#F0FDF4',
          border: `1px solid ${t.type === 'error' ? '#FECDD3' : '#BBF7D0'}`,
          color: t.type === 'error' ? '#9F1239' : '#166534',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ fontSize: 15 }}>{t.type === 'error' ? '✕' : '✓'}</span>
          {t.msg}
        </div>
      ))}
    </div>
  );

  return { toast: show, ToastContainer };
}

// ─── Spinner ─────────────────────────────────────────────────────────────────
const Spinner = ({ size = 20 }) => (
  <div style={{
    width: size, height: size, borderRadius: '50%',
    border: '2px solid #E0E7FF', borderTopColor: '#6366F1',
    animation: 'spin 0.75s linear infinite', display: 'inline-block',
  }} />
);

// ─── Badge ───────────────────────────────────────────────────────────────────
const Badge = ({ children, bg, color }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', padding: '3px 9px',
    borderRadius: 20, fontSize: 11, fontWeight: 600, letterSpacing: 0.2,
    background: bg, color,
  }}>
    {children}
  </span>
);

// ─── StatusDot ───────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const meta = STATUS_META[status] || STATUS_META.planned;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 9px', borderRadius: 20, fontSize: 11, fontWeight: 600,
      background: meta.bg, color: meta.color,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: meta.dot, display: 'inline-block' }} />
      {meta.label}
    </span>
  );
};

// ─── IconButton ──────────────────────────────────────────────────────────────
const IconBtn = ({ icon: Icon, onClick, title, color = '#6B7280', bgHover = '#F3F4F6', size = 14 }) => {
  const [hov, setHov] = useState(false);
  return (
    <button
      title={title}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: 30, height: 30, borderRadius: 7, border: 'none',
        background: hov ? bgHover : 'transparent',
        color, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.15s',
      }}
    >
      <Icon size={size} />
    </button>
  );
};

// ─── Button ──────────────────────────────────────────────────────────────────
const Btn = ({ children, onClick, variant = 'primary', loading, disabled, size = 'md' }) => {
  const styles = {
    primary: { background: '#6366F1', color: '#fff', border: 'none' },
    secondary: { background: '#F9FAFB', color: '#374151', border: '1px solid #E5E7EB' },
    danger: { background: '#FFF1F2', color: '#9F1239', border: '1px solid #FECDD3' },
    success: { background: '#F0FDF4', color: '#166534', border: '1px solid #BBF7D0' },
  };
  const sizes = {
    sm: { padding: '5px 12px', fontSize: 12 },
    md: { padding: '8px 16px', fontSize: 13 },
    lg: { padding: '10px 22px', fontSize: 14 },
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        ...styles[variant], ...sizes[size],
        borderRadius: 8, fontWeight: 600, cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled || loading ? 0.65 : 1,
        display: 'inline-flex', alignItems: 'center', gap: 7, transition: 'all 0.15s',
      }}
    >
      {loading && <Spinner size={14} />}
      {children}
    </button>
  );
};

// ─── Modal ───────────────────────────────────────────────────────────────────
const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  useEffect(() => {
    if (!isOpen) return;
    const h = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  const widths = { sm: 420, md: 600, lg: 780, xl: 960 };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)',
        backdropFilter: 'blur(3px)', zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 16, width: '100%',
          maxWidth: widths[size], maxHeight: '90vh', overflowY: 'auto',
          boxShadow: '0 25px 60px rgba(0,0,0,0.25)',
        }}
      >
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '18px 24px', borderBottom: '1px solid #F3F4F6',
          position: 'sticky', top: 0, background: '#fff', zIndex: 1, borderRadius: '16px 16px 0 0',
        }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: '#111827', margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{
            width: 30, height: 30, borderRadius: 8, border: 'none', background: '#F3F4F6',
            cursor: 'pointer', color: '#6B7280', fontSize: 18, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// ─── ConfirmDialog ────────────────────────────────────────────────────────────
const ConfirmDialog = ({ isOpen, onClose, onConfirm, loading, title, message }) => {
  if (!isOpen) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)',
        backdropFilter: 'blur(3px)', zIndex: 1100,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      }}
    >
      <div onClick={e => e.stopPropagation()} style={{
        background: '#fff', borderRadius: 16, width: '100%', maxWidth: 400,
        boxShadow: '0 25px 60px rgba(0,0,0,0.25)', overflow: 'hidden',
      }}>
        <div style={{ padding: '20px 24px 0' }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, background: '#FFF1F2',
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14,
          }}>
            <Trash2 size={20} color="#F43F5E" />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>{title}</h3>
          <p style={{ fontSize: 13, color: '#6B7280', margin: 0, lineHeight: 1.6 }}>{message}</p>
        </div>
        <div style={{ display: 'flex', gap: 10, padding: '20px 24px' }}>
          <Btn variant="secondary" onClick={onClose} style={{ flex: 1 }}>Annuler</Btn>
          <Btn variant="danger" onClick={onConfirm} loading={loading} style={{ flex: 1 }}>Supprimer</Btn>
        </div>
      </div>
    </div>
  );
};

// ─── FormField ───────────────────────────────────────────────────────────────
const Field = ({ label, required, children }) => (
  <div style={{ marginBottom: 14 }}>
    {label && (
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>
        {label}{required && <span style={{ color: '#F43F5E' }}> *</span>}
      </label>
    )}
    {children}
  </div>
);

const inputStyle = {
  width: '100%', padding: '8px 12px', border: '1px solid #E5E7EB',
  borderRadius: 8, fontSize: 13, outline: 'none', background: '#fff',
  transition: 'border-color 0.15s', boxSizing: 'border-box',
};

const InputEl = ({ value, onChange, type = 'text', placeholder, required, min }) => (
  <input
    type={type} value={value} onChange={onChange} placeholder={placeholder}
    required={required} min={min}
    style={inputStyle}
    onFocus={e => e.target.style.borderColor = '#6366F1'}
    onBlur={e => e.target.style.borderColor = '#E5E7EB'}
  />
);

const SelectEl = ({ value, onChange, options, required }) => (
  <select
    value={value} onChange={onChange} required={required}
    style={{ ...inputStyle, cursor: 'pointer' }}
    onFocus={e => e.target.style.borderColor = '#6366F1'}
    onBlur={e => e.target.style.borderColor = '#E5E7EB'}
  >
    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);

// ─── ExamForm ────────────────────────────────────────────────────────────────
function ExamForm({ exam, ues, programs, onSave, onCancel }) {
  const isEdit = !!exam?._id;
  const [form, setForm] = useState(() => ({
    title: exam?.title || '',
    ue: exam?.ue?._id || exam?.ue || '',
    program: exam?.program?._id || exam?.program || '',
    promotion: exam?.promotion || '',
    session: exam?.session || 'session1',
    type: exam?.type || 'final',
    startDate: exam?.startDate ? exam.startDate.substring(0, 16) : '',
    endDate: exam?.endDate ? exam.endDate.substring(0, 16) : '',
    duration: exam?.duration || 120,
    maxScore: exam?.maxScore || 20,
    room: exam?.room?.name || exam?.room || '',
    instructions: exam?.instructions || '',
    isPublished: exam?.isPublished || false,
    academicYear: exam?.academicYear || getCurrentAcademicYear(),
  }));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const ueOpts = [
    { value: '', label: '— Sélectionner une UE —' },
    ...(ues || []).map(u => ({ value: u._id, label: `${u.code} – ${u.title}` })),
  ];
  const progOpts = [
    { value: '', label: '— Sélectionner une filière —' },
    ...(programs || []).map(p => ({ value: p._id, label: p.name })),
  ];
  const promotionOpts = [
    { value: '', label: '— Toutes les promotions —' },
    { value: 'L1', label: 'Licence 1' },
    { value: 'L2', label: 'Licence 2' },
    { value: 'L3', label: 'Licence 3' },
    { value: 'M1', label: 'Master 1' },
    { value: 'M2', label: 'Master 2' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.title || !form.ue || !form.program || !form.startDate || !form.endDate) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    setLoading(true);
    try {
      const payload = { ...form };
      if (isEdit) await examAPI.update(exam._id, payload);
      else await examAPI.create(payload);
      onSave();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Erreur lors de la sauvegarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: '20px 24px' }}>
      {error && (
        <div style={{
          background: '#FFF1F2', border: '1px solid #FECDD3', color: '#9F1239',
          borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 16,
        }}>
          {error}
        </div>
      )}

      <Field label="Titre de l'examen" required>
        <InputEl value={form.title} onChange={e => set('title', e.target.value)} placeholder="Ex: Examen final Algorithmique" required />
      </Field>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Field label="Unité d'Enseignement (UE)" required>
          <SelectEl value={form.ue} onChange={e => set('ue', e.target.value)} options={ueOpts} required />
        </Field>
        <Field label="Filière" required>
          <SelectEl value={form.program} onChange={e => set('program', e.target.value)} options={progOpts} required />
        </Field>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Field label="Promotion / Niveau">
          <SelectEl value={form.promotion} onChange={e => set('promotion', e.target.value)} options={promotionOpts} />
        </Field>
        <Field label="Année académique">
          <InputEl value={form.academicYear} onChange={e => set('academicYear', e.target.value)} placeholder="2024-2025" />
        </Field>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Field label="Session">
          <SelectEl value={form.session} onChange={e => set('session', e.target.value)} options={SESSION_OPTS} />
        </Field>
        <Field label="Type d'examen">
          <SelectEl value={form.type} onChange={e => set('type', e.target.value)} options={TYPE_OPTS} />
        </Field>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Field label="Date et heure de début" required>
          <InputEl type="datetime-local" value={form.startDate} onChange={e => set('startDate', e.target.value)} required />
        </Field>
        <Field label="Date et heure de fin" required>
          <InputEl type="datetime-local" value={form.endDate} onChange={e => set('endDate', e.target.value)} required />
        </Field>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
        <Field label="Durée (min)">
          <InputEl type="number" value={form.duration} onChange={e => set('duration', +e.target.value)} min="1" />
        </Field>
        <Field label="Note maximale">
          <InputEl type="number" value={form.maxScore} onChange={e => set('maxScore', +e.target.value)} min="1" />
        </Field>
        <Field label="Salle">
          <InputEl value={form.room} onChange={e => set('room', e.target.value)} placeholder="Ex: Amphi A" />
        </Field>
      </div>

      <Field label="Instructions / Consignes">
        <textarea
          value={form.instructions}
          onChange={e => set('instructions', e.target.value)}
          placeholder="Instructions pour les étudiants..."
          rows={3}
          style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
          onFocus={e => e.target.style.borderColor = '#6366F1'}
          onBlur={e => e.target.style.borderColor = '#E5E7EB'}
        />
      </Field>

      <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 20 }}>
        <div
          onClick={() => set('isPublished', !form.isPublished)}
          style={{
            width: 40, height: 22, borderRadius: 11, transition: 'background 0.2s',
            background: form.isPublished ? '#6366F1' : '#D1D5DB',
            position: 'relative', cursor: 'pointer', flexShrink: 0,
          }}
        >
          <div style={{
            position: 'absolute', top: 2, left: form.isPublished ? 20 : 2,
            width: 18, height: 18, borderRadius: '50%', background: '#fff',
            transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          }} />
        </div>
        <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>
          Publier l'examen (visible pour les étudiants)
        </span>
      </label>

      <div style={{ display: 'flex', gap: 10, paddingTop: 16, borderTop: '1px solid #F3F4F6' }}>
        <Btn variant="secondary" onClick={onCancel}>Annuler</Btn>
        <Btn loading={loading} disabled={loading}>
          {isEdit ? 'Mettre à jour' : 'Créer l\'examen'}
        </Btn>
      </div>
    </form>
  );
}

// ─── ExamCard ─────────────────────────────────────────────────────────────────
function ExamCard({ exam, onEdit, onDelete, onPublish }) {
  const typeMeta = TYPE_META[exam.type] || { label: exam.type, bg: '#F3F4F6', color: '#374151' };

  return (
    <div style={{
      background: '#fff', borderRadius: 14, border: '1px solid #F3F4F6',
      overflow: 'hidden', transition: 'box-shadow 0.2s, transform 0.2s',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(99,102,241,0.12)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      {/* Header coloré */}
      <div style={{
        padding: '14px 16px 12px',
        background: exam.isPublished ? 'linear-gradient(135deg,#EEF2FF,#E0E7FF)' : '#FAFAFA',
        borderBottom: '1px solid #F3F4F6',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: '0 0 4px', lineHeight: 1.4, wordBreak: 'break-word' }}>
              {exam.title}
            </p>
            <p style={{ fontSize: 12, color: '#6B7280', margin: 0 }}>
              {exam.ue?.code || '—'} · {exam.program?.name || '—'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
            <IconBtn icon={Edit2} onClick={() => onEdit(exam)} title="Modifier" color="#6366F1" bgHover="#EEF2FF" />
            <IconBtn icon={Trash2} onClick={() => onDelete(exam)} title="Supprimer" color="#F43F5E" bgHover="#FFF1F2" />
          </div>
        </div>
      </div>

      {/* Corps */}
      <div style={{ padding: '12px 16px' }}>
        {/* Badges */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 12 }}>
          <Badge bg={typeMeta.bg} color={typeMeta.color}>{typeMeta.label}</Badge>
          <Badge bg="#F5F3FF" color="#7C3AED">{exam.session}</Badge>
          {exam.promotion && <Badge bg="#FFF7ED" color="#C2410C">{exam.promotion}</Badge>}
          <StatusBadge status={exam.status || 'planned'} />
        </div>

        {/* Infos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <InfoRow icon={Calendar} label={`${formatDateShort(exam.startDate)} · ${formatTime(exam.startDate)}`} />
          <InfoRow icon={Clock} label={exam.duration ? `${exam.duration} min` : '—'} />
          {exam.room && <InfoRow icon={Users} label={`Salle : ${exam.room?.name || exam.room}`} />}
          <InfoRow icon={Tag} label={`Note max : ${exam.maxScore || 20}`} />
        </div>
      </div>

      {/* Footer */}
      <div style={{
        padding: '10px 16px', borderTop: '1px solid #F9FAFB',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: '#FAFAFA',
      }}>
        <span style={{ fontSize: 11, color: exam.isPublished ? '#166534' : '#9CA3AF', fontWeight: 600 }}>
          {exam.isPublished ? '● Publié' : '○ Non publié'}
        </span>
        {exam.status === 'completed' && !exam.isPublished && (
          <Btn size="sm" variant="success" onClick={() => onPublish(exam._id)}>
            <Send size={11} /> Publier résultats
          </Btn>
        )}
      </div>
    </div>
  );
}

const InfoRow = ({ icon: Icon, label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
    <Icon size={12} color="#9CA3AF" />
    <span style={{ fontSize: 12, color: '#6B7280' }}>{label}</span>
  </div>
);

// ─── Pagination ───────────────────────────────────────────────────────────────
const Pagination = ({ page, total, limit, onPageChange }) => {
  const totalPages = Math.ceil(total / limit);
  if (totalPages <= 1) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '16px 0' }}>
      <button
        onClick={() => onPageChange(page - 1)} disabled={page === 1}
        style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid #E5E7EB', background: '#fff', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <ChevronLeft size={15} />
      </button>
      <span style={{ fontSize: 13, color: '#6B7280' }}>Page {page} sur {totalPages}</span>
      <button
        onClick={() => onPageChange(page + 1)} disabled={page === totalPages}
        style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid #E5E7EB', background: '#fff', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.4 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <ChevronRight size={15} />
      </button>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ExamsPage() {
  const { toast, ToastContainer } = useToast();

  const [ues, setUes] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(12);

  const [filters, setFilters] = useState({ status: '', session: '', program: '', promotion: '' });
  const [modal, setModal] = useState({ open: false, exam: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, exam: null });
  const [deleting, setDeleting] = useState(false);

  // ── Chargements initiaux ──
  useEffect(() => { loadUEs(); loadPrograms(); }, []);
  useEffect(() => { loadExams(); }, [page, filters]);

  const loadUEs = async () => {
    try {
      const res = await ueAPI.getAll({ limit: 200 });
      setUes(res.data?.data || res.data || []);
    } catch { /* silencieux */ }
  };

  const loadPrograms = async () => {
    try {
      const res = await programAPI.getAll({ limit: 100 });
      setPrograms(res.data?.data || res.data || []);
    } catch { /* silencieux */ }
  };

  const loadExams = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit, ...filters };
      Object.keys(params).forEach(k => (params[k] === '' || params[k] == null) && delete params[k]);
      const res = await examAPI.getAll(params);
      setExams(res.data?.data || res.data || []);
      setTotal(res.data?.total || res.total || 0);
    } catch (err) {
      toast('Erreur lors du chargement des examens', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, limit, filters]);

  const handleFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await examAPI.delete(deleteDialog.exam._id);
      setDeleteDialog({ open: false, exam: null });
      toast('Examen supprimé avec succès');
      loadExams();
    } catch (err) {
      toast(err.response?.data?.message || err.message || 'Erreur lors de la suppression', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handlePublish = async (examId) => {
    try {
      await examAPI.publishResults(examId);
      toast('Résultats publiés avec succès');
      loadExams();
    } catch (err) {
      toast(err.response?.data?.message || 'Erreur lors de la publication', 'error');
    }
  };

  const sessionFilterOpts = [{ value: '', label: 'Toutes les sessions' }, ...SESSION_OPTS];
  const promotionOpts = [
    { value: '', label: 'Toutes promotions' },
    { value: 'L1', label: 'Licence 1' }, { value: 'L2', label: 'Licence 2' },
    { value: 'L3', label: 'Licence 3' }, { value: 'M1', label: 'Master 1' },
    { value: 'M2', label: 'Master 2' },
  ];
  const programFilterOpts = [
    { value: '', label: 'Toutes les filières' },
    ...(programs || []).map(p => ({ value: p._id, label: p.name })),
  ];

  const filterSelectStyle = {
    padding: '7px 12px', border: '1px solid #E5E7EB', borderRadius: 8,
    fontSize: 13, background: '#fff', cursor: 'pointer', outline: 'none',
    color: '#374151',
  };

  return (
    <div style={{
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '24px', maxWidth: 1400, margin: '0 auto',
      minHeight: '100vh', background: '#F8FAFC',
    }}>
      <ToastContainer />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* ── En-tête ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <BookOpen size={22} color="#6366F1" /> Gestion des Examens
          </h1>
          <p style={{ fontSize: 13, color: '#9CA3AF', marginTop: 4 }}>
            {total} examen{total !== 1 ? 's' : ''} au total
          </p>
        </div>
        <Btn onClick={() => setModal({ open: true, exam: null })}>
          <Plus size={15} /> Planifier un examen
        </Btn>
      </div>

      {/* ── Filtres ── */}
      <div style={{
        background: '#fff', borderRadius: 12, border: '1px solid #F3F4F6',
        padding: '14px 18px', marginBottom: 20, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center',
      }}>
        <select value={filters.session} onChange={e => handleFilter('session', e.target.value)} style={filterSelectStyle}>
          {sessionFilterOpts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select value={filters.status} onChange={e => handleFilter('status', e.target.value)} style={filterSelectStyle}>
          {STATUS_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select value={filters.program} onChange={e => handleFilter('program', e.target.value)} style={filterSelectStyle}>
          {programFilterOpts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select value={filters.promotion} onChange={e => handleFilter('promotion', e.target.value)} style={filterSelectStyle}>
          {promotionOpts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        {(filters.session || filters.status || filters.program || filters.promotion) && (
          <button
            onClick={() => { setFilters({ status: '', session: '', program: '', promotion: '' }); setPage(1); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <X size={13} /> Réinitialiser
          </button>
        )}
      </div>

      {/* ── Grille de cards ── */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
          <Spinner size={36} />
        </div>
      ) : exams.length === 0 ? (
        <div style={{
          background: '#fff', borderRadius: 14, border: '1px solid #F3F4F6',
          padding: '64px 24px', textAlign: 'center',
        }}>
          <BookOpen size={40} color="#D1D5DB" style={{ marginBottom: 12 }} />
          <p style={{ fontSize: 15, color: '#9CA3AF', margin: 0 }}>Aucun examen trouvé</p>
          <p style={{ fontSize: 13, color: '#D1D5DB', marginTop: 6 }}>Créez votre premier examen pour commencer</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 16,
        }}>
          {exams.map(exam => (
            <ExamCard
              key={exam._id}
              exam={exam}
              onEdit={(e) => setModal({ open: true, exam: e })}
              onDelete={(e) => setDeleteDialog({ open: true, exam: e })}
              onPublish={handlePublish}
            />
          ))}
        </div>
      )}

      <Pagination page={page} total={total} limit={limit} onPageChange={setPage} />

      {/* ── Modal Formulaire ── */}
      <Modal
        isOpen={modal.open}
        onClose={() => setModal({ open: false, exam: null })}
        title={modal.exam ? "Modifier l'examen" : "Planifier un examen"}
        size="lg"
      >
        <ExamForm
          exam={modal.exam}
          ues={ues}
          programs={programs}
          onSave={() => {
            setModal({ open: false, exam: null });
            toast(modal.exam ? 'Examen mis à jour' : 'Examen créé avec succès');
            loadExams();
          }}
          onCancel={() => setModal({ open: false, exam: null })}
        />
      </Modal>

      {/* ── Dialog Suppression ── */}
      <ConfirmDialog
        isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, exam: null })}
        onConfirm={handleDelete}
        loading={deleting}
        title="Supprimer l'examen"
        message={`Êtes-vous sûr de vouloir supprimer "${deleteDialog.exam?.title}" ? Cette action est irréversible.`}
      />
    </div>
  );
}