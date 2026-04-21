// // pages/admin/LibraryPage.jsx
// import { useState, useEffect, useCallback } from 'react';
// import { Plus, Edit, Trash2, BookOpen, RotateCcw, Search, X, User, Calendar, FileText, Download } from 'lucide-react';
// import { libraryAPI } from '../../services/services';

// // ─── Constants ────────────────────────────────────────────────────────────────
// const CATEGORY_OPTS = [
//   { value: '', label: 'Toutes les catégories' },
//   { value: 'manuel', label: 'Manuel' },
//   { value: 'these', label: 'Thèse' },
//   { value: 'memoire', label: 'Mémoire' },
//   { value: 'periodique', label: 'Périodique' },
//   { value: 'ebook', label: 'E-Book' },
//   { value: 'reference', label: 'Référence' },
//   { value: 'autre', label: 'Autre' },
// ];

// const BORROWER_TYPES = [
//   { value: 'student', label: 'Étudiant' },
//   { value: 'staff', label: 'Personnel' },
//   { value: 'teacher', label: 'Enseignant' },
//   { value: 'external', label: 'Externe' },
// ];

// const formatDate = (date) => {
//   if (!date) return '—';
//   const d = new Date(date);
//   return d.toLocaleDateString('fr-FR');
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
//     success: { background: '#D1FAE5', color: '#065F46', border: 'none' },
//     warning: { background: '#FEF3C7', color: '#92400E', border: 'none' },
//     ghost: { background: 'transparent', color: '#6B7280', border: 'none' },
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
// function Input({ label, value, onChange, placeholder, type = 'text', required, min }) {
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
//         min={min}
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

// // ─── StatCard Component ───────────────────────────────────────────────────────
// function StatCard({ title, value, icon, color }) {
//   const colors = {
//     indigo: { background: '#EEF2FF', color: '#4338CA' },
//     blue: { background: '#DBEAFE', color: '#1E40AF' },
//     green: { background: '#D1FAE5', color: '#065F46' },
//     amber: { background: '#FEF3C7', color: '#92400E' },
//     red: { background: '#FEE2E2', color: '#991B1B' },
//   };
  
//   return (
//     <div style={{
//       background: '#fff',
//       borderRadius: 12,
//       padding: '16px',
//       border: '1px solid #E5E7EB',
//       display: 'flex',
//       alignItems: 'center',
//       gap: 12,
//     }}>
//       <div style={{
//         width: 48,
//         height: 48,
//         borderRadius: 12,
//         background: colors[color]?.background || '#F3F4F6',
//         color: colors[color]?.color || '#6B7280',
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'center',
//       }}>
//         {icon}
//       </div>
//       <div>
//         <p style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 500 }}>{title}</p>
//         <p style={{ fontSize: 24, fontWeight: 700, color: '#111' }}>{value}</p>
//       </div>
//     </div>
//   );
// }

// // ─── Table Component ──────────────────────────────────────────────────────────
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

// // ─── SearchInput Component ────────────────────────────────────────────────────
// function SearchInput({ value, onChange, placeholder }) {
//   return (
//     <div style={{ position: 'relative', flex: 1 }}>
//       <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
//       <input
//         type="text"
//         value={value}
//         onChange={(e) => onChange(e.target.value)}
//         placeholder={placeholder}
//         style={{
//           width: '100%',
//           padding: '8px 12px 8px 36px',
//           border: '1px solid #E5E7EB',
//           borderRadius: 8,
//           fontSize: 13,
//           outline: 'none',
//         }}
//         onFocus={(e) => e.target.style.borderColor = '#6366F1'}
//         onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
//       />
//     </div>
//   );
// }

// // ─── Book Form Component ──────────────────────────────────────────────────────
// function BookForm({ book, onSave, onCancel }) {
//   const [form, setForm] = useState(book || {
//     title: '', author: '', isbn: '', publisher: '', publicationYear: '',
//     category: 'manuel', domain: '', language: 'Français',
//     totalQuantity: 1, availableQuantity: 1, location: '',
//     description: '', isDigital: false, digitalUrl: '',
//   });
//   const [loading, setLoading] = useState(false);
//   const { toast, ToastContainer } = useToast();
//   const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!form.title || !form.author) {
//       toast('Titre et auteur sont obligatoires', 'error');
//       return;
//     }
//     setLoading(true);
//     try {
//       if (book?._id) await libraryAPI.updateBook(book._id, form);
//       else await libraryAPI.createBook(form);
//       toast(book ? 'Livre mis à jour' : 'Livre ajouté avec succès');
//       onSave();
//     } catch (err) {
//       toast(err.message || 'Erreur lors de la sauvegarde', 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const categoryOpts = CATEGORY_OPTS.filter(o => o.value);

//   return (
//     <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
//       <ToastContainer />
      
//       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
//         <Input label="Titre" value={form.title} onChange={e => set('title', e.target.value)} required />
//         <Input label="Auteur" value={form.author} onChange={e => set('author', e.target.value)} required />
//       </div>
      
//       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
//         <Input label="ISBN" value={form.isbn} onChange={e => set('isbn', e.target.value)} />
//         <Input label="Éditeur" value={form.publisher} onChange={e => set('publisher', e.target.value)} />
//       </div>
      
//       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
//         <Select label="Catégorie" value={form.category} onChange={e => set('category', e.target.value)} options={categoryOpts} />
//         <Input label="Domaine" value={form.domain} onChange={e => set('domain', e.target.value)} placeholder="Informatique, Droit..." />
//       </div>
      
//       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
//         <Input label="Quantité totale" type="number" min="1" value={form.totalQuantity} onChange={e => set('totalQuantity', +e.target.value)} />
//         <Input label="Disponibles" type="number" min="0" value={form.availableQuantity} onChange={e => set('availableQuantity', +e.target.value)} />
//         <Input label="Année publication" type="number" value={form.publicationYear} onChange={e => set('publicationYear', +e.target.value)} />
//       </div>
      
//       <Input label="Localisation (Rayon/Étagère)" value={form.location} onChange={e => set('location', e.target.value)} />
      
//       <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
//         <input
//           type="checkbox"
//           id="isDigital"
//           checked={form.isDigital}
//           onChange={e => set('isDigital', e.target.checked)}
//           style={{ width: 16, height: 16, cursor: 'pointer' }}
//         />
//         <label htmlFor="isDigital" style={{ fontSize: 13, color: '#374151', cursor: 'pointer' }}>
//           Ressource numérique
//         </label>
//       </div>
      
//       {form.isDigital && (
//         <Input label="URL numérique" value={form.digitalUrl} onChange={e => set('digitalUrl', e.target.value)} />
//       )}
      
//       <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
//         <Button variant="secondary" onClick={onCancel} style={{ flex: 1, justifyContent: 'center' }}>Annuler</Button>
//         <Button type="submit" loading={loading} style={{ flex: 1, justifyContent: 'center' }}>
//           {book ? 'Mettre à jour' : 'Ajouter le livre'}
//         </Button>
//       </div>
//     </form>
//   );
// }

// // ─── Borrow Modal Component ───────────────────────────────────────────────────
// function BorrowModal({ onSave, onCancel }) {
//   const [books, setBooks] = useState([]);
//   const [loadingBooks, setLoadingBooks] = useState(true);
//   const [form, setForm] = useState({ book: '', borrower: '', borrowerType: 'student' });
//   const [loading, setLoading] = useState(false);
//   const { toast, ToastContainer } = useToast();

//   useEffect(() => {
//     loadBooks();
//   }, []);

//   const loadBooks = async () => {
//     try {
//       const res = await libraryAPI.getBooks({ available: 'true', limit: 200 });
//       setBooks(res.data?.data || res.data || []);
//     } catch (error) {
//       toast('Erreur chargement livres', 'error');
//     } finally {
//       setLoadingBooks(false);
//     }
//   };

//   const bookOptions = [
//     { value: '', label: 'Sélectionner un livre' },
//     ...books.map(b => ({ value: b._id, label: `${b.title} (${b.availableQuantity} dispo.)` }))
//   ];

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!form.book || !form.borrower) {
//       toast('Veuillez remplir tous les champs', 'error');
//       return;
//     }
//     setLoading(true);
//     try {
//       await libraryAPI.borrowBook(form);
//       toast('Emprunt enregistré avec succès');
//       onSave();
//     } catch (err) {
//       toast(err.message || 'Erreur lors de l\'emprunt', 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
//       <ToastContainer />
      
//       <Select
//         label="Livre"
//         value={form.book}
//         onChange={e => setForm(f => ({ ...f, book: e.target.value }))}
//         options={bookOptions}
//         required
//       />
      
//       <Input
//         label="ID Emprunteur"
//         value={form.borrower}
//         onChange={e => setForm(f => ({ ...f, borrower: e.target.value }))}
//         required
//         placeholder="ID de l'étudiant ou du personnel"
//       />
      
//       <Select
//         label="Type"
//         value={form.borrowerType}
//         onChange={e => setForm(f => ({ ...f, borrowerType: e.target.value }))}
//         options={BORROWER_TYPES}
//       />
      
//       <div style={{ padding: 12, background: '#DBEAFE', borderRadius: 12, marginTop: 16 }}>
//         <p style={{ fontSize: 13, color: '#1E40AF' }}>📚 Durée de prêt : <strong>14 jours</strong></p>
//       </div>
      
//       <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
//         <Button variant="secondary" onClick={onCancel} style={{ flex: 1, justifyContent: 'center' }}>Annuler</Button>
//         <Button type="submit" loading={loading} style={{ flex: 1, justifyContent: 'center' }}>
//           <BookOpen size={15} /> Enregistrer l'emprunt
//         </Button>
//       </div>
//     </form>
//   );
// }

// // ─── Main Library Page ────────────────────────────────────────────────────────
// export default function LibraryPage() {
//   const { toast, ToastContainer } = useToast();
  
//   const [tab, setTab] = useState('books');
//   const [books, setBooks] = useState([]);
//   const [loans, setLoans] = useState([]);
//   const [overdueLoans, setOverdueLoans] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [loadingLoans, setLoadingLoans] = useState(false);
//   const [page, setPage] = useState(1);
//   const [total, setTotal] = useState(0);
//   const [limit] = useState(20);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [categoryFilter, setCategoryFilter] = useState('');
  
//   const [bookModal, setBookModal] = useState({ open: false, book: null });
//   const [borrowModal, setBorrowModal] = useState(false);
//   const [deleteDialog, setDeleteDialog] = useState({ open: false, book: null });
//   const [deleting, setDeleting] = useState(false);

//   useEffect(() => {
//     loadBooks();
//   }, [page, searchTerm, categoryFilter]);

//   useEffect(() => {
//     if (tab === 'loans') loadLoans();
//     if (tab === 'overdue') loadOverdueLoans();
//   }, [tab]);

//   const loadBooks = async () => {
//     setLoading(true);
//     try {
//       const params = { page, limit };
//       if (searchTerm) params.search = searchTerm;
//       if (categoryFilter) params.category = categoryFilter;
//       const res = await libraryAPI.getBooks(params);
//       setBooks(res.data?.data || res.data || []);
//       setTotal(res.data?.total || res.total || 0);
//     } catch (error) {
//       console.error('Erreur chargement livres:', error);
//       toast('Erreur lors du chargement des livres', 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const loadLoans = async () => {
//     setLoadingLoans(true);
//     try {
//       const res = await libraryAPI.getActiveLoans();
//       setLoans(res.data?.data || res.data || []);
//     } catch (error) {
//       console.error('Erreur chargement emprunts:', error);
//     } finally {
//       setLoadingLoans(false);
//     }
//   };

//   const loadOverdueLoans = async () => {
//     try {
//       const res = await libraryAPI.getOverdueLoans();
//       setOverdueLoans(res.data?.data || res.data || []);
//     } catch (error) {
//       console.error('Erreur chargement retards:', error);
//     }
//   };

//   const handleDelete = async () => {
//     setDeleting(true);
//     try {
//       await libraryAPI.deleteBook(deleteDialog.book._id);
//       setDeleteDialog({ open: false, book: null });
//       loadBooks();
//       toast('Livre supprimé avec succès');
//     } catch (err) {
//       toast(err.message || 'Erreur lors de la suppression', 'error');
//     } finally {
//       setDeleting(false);
//     }
//   };

//   const handleReturn = async (loanId) => {
//     try {
//       await libraryAPI.returnBook(loanId);
//       loadLoans();
//       loadOverdueLoans();
//       toast('Retour enregistré avec succès');
//     } catch (err) {
//       toast(err.message || 'Erreur lors du retour', 'error');
//     }
//   };

//   const bookColumns = [
//     {
//       header: 'Livre',
//       key: 'title',
//       render: (v, row) => (
//         <div>
//           <div style={{ fontWeight: 500, color: '#111' }}>{v}</div>
//           <div style={{ fontSize: 11, color: '#9CA3AF' }}>{row.author} {row.isbn ? `• ISBN: ${row.isbn}` : ''}</div>
//         </div>
//       )
//     },
//     {
//       header: 'Catégorie',
//       key: 'category',
//       render: v => <Badge style={{ background: '#EEF2FF', color: '#4338CA' }}>{v}</Badge>
//     },
//     { header: 'Domaine', key: 'domain', render: v => v || '—' },
//     {
//       header: 'Stock',
//       key: 'availableQuantity',
//       render: (v, row) => (
//         <span style={{ fontWeight: 600, color: v === 0 ? '#DC2626' : '#059669' }}>
//           {v} / {row.totalQuantity}
//         </span>
//       )
//     },
//     { header: 'Localisation', key: 'location', render: v => v || '—' },
//     {
//       header: 'Type',
//       key: 'isDigital',
//       render: v => v ? <Badge style={{ background: '#F3E8FF', color: '#9333EA' }}>Numérique</Badge> : <Badge style={{ background: '#F3F4F6', color: '#6B7280' }}>Physique</Badge>
//     },
//     {
//       header: 'Actions',
//       key: '_id',
//       render: (_, row) => (
//         <div style={{ display: 'flex', gap: 4 }}>
//           <Button size="sm" variant="ghost" onClick={() => setBookModal({ open: true, book: row })}>
//             <Edit size={13} />
//           </Button>
//           <Button size="sm" variant="ghost" onClick={() => setDeleteDialog({ open: true, book: row })}>
//             <Trash2 size={13} />
//           </Button>
//         </div>
//       )
//     },
//   ];

//   const loanColumns = [
//     {
//       header: 'Livre',
//       key: 'book',
//       render: (_, row) => (
//         <div>
//           <div style={{ fontWeight: 500, color: '#111' }}>{row.book?.title}</div>
//           <div style={{ fontSize: 11, color: '#9CA3AF' }}>{row.book?.author}</div>
//         </div>
//       )
//     },
//     {
//       header: 'Emprunteur',
//       key: 'borrower',
//       render: (_, row) => `${row.student?.firstName || ''} ${row.student?.lastName || ''}` || row.borrowerId || '—'
//     },
//     { header: 'Emprunté le', key: 'loanDate', render: v => formatDate(v) },
//     {
//       header: 'À rendre le',
//       key: 'dueDate',
//       render: v => {
//         const isOverdue = new Date(v) < new Date();
//         return <span style={{ color: isOverdue ? '#DC2626' : '#111', fontWeight: isOverdue ? 600 : 400 }}>{formatDate(v)}</span>;
//       }
//     },
//     {
//       header: 'Statut',
//       key: 'status',
//       render: v => <Badge style={{ background: v === 'overdue' ? '#FEE2E2' : '#D1FAE5', color: v === 'overdue' ? '#991B1B' : '#065F46' }}>{v === 'overdue' ? 'En retard' : 'Actif'}</Badge>
//     },
//     {
//       header: 'Actions',
//       key: '_id',
//       render: (_, row) => (
//         <Button size="sm" variant="success" onClick={() => handleReturn(row._id)}>
//           <RotateCcw size={13} /> Retour
//         </Button>
//       )
//     },
//   ];

//   const totalBooks = total;
//   const activeLoansCount = loans.length;
//   const overdueCount = overdueLoans.length;

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
//           <h1 style={styles.title}>📚 Bibliothèque Universitaire</h1>
//           <p style={styles.subtitle}>Catalogue et gestion des prêts</p>
//         </div>
//         <div style={{ display: 'flex', gap: 12 }}>
//           <Button variant="secondary" onClick={() => setBorrowModal(true)}>
//             <BookOpen size={15} /> Enregistrer un emprunt
//           </Button>
//           <Button onClick={() => setBookModal({ open: true, book: null })}>
//             <Plus size={16} /> Ajouter un livre
//           </Button>
//         </div>
//       </div>

//       {/* Stats */}
//       <div style={styles.statsGrid}>
//         <StatCard title="Total livres" value={totalBooks} icon={<BookOpen size={22} />} color="indigo" />
//         <StatCard title="Emprunts actifs" value={activeLoansCount} icon={<BookOpen size={22} />} color="blue" />
//         <StatCard title="Retards" value={overdueCount} icon={<BookOpen size={22} />} color="red" />
//       </div>

//       {/* Tabs */}
//       <div style={{ display: 'flex', gap: 0, borderRadius: 12, overflow: 'hidden', border: '1px solid #E5E7EB', width: 'fit-content', marginBottom: 20, background: '#fff' }}>
//         {[
//           { id: 'books', label: 'Catalogue' },
//           { id: 'loans', label: 'Emprunts actifs' },
//           { id: 'overdue', label: 'Retards', badge: overdueCount }
//         ].map(item => (
//           <button
//             key={item.id}
//             onClick={() => setTab(item.id)}
//             style={{
//               padding: '10px 20px',
//               fontSize: 13,
//               fontWeight: 500,
//               background: tab === item.id ? '#4F46E5' : '#fff',
//               color: tab === item.id ? '#fff' : '#6B7280',
//               border: 'none',
//               cursor: 'pointer',
//               transition: 'all 0.2s',
//             }}
//           >
//             {item.label}
//             {item.badge > 0 && (
//               <span style={{
//                 marginLeft: 8,
//                 background: tab === item.id ? 'rgba(255,255,255,0.25)' : '#FEE2E2',
//                 color: tab === item.id ? '#fff' : '#DC2626',
//                 padding: '2px 6px',
//                 borderRadius: 20,
//                 fontSize: 11,
//               }}>
//                 {item.badge}
//               </span>
//             )}
//           </button>
//         ))}
//       </div>

//       {/* Books Tab */}
//       {tab === 'books' && (
//         <Card>
//           <div style={{ padding: 16, borderBottom: '1px solid #F3F4F6' }}>
//             <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
//               <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Rechercher par titre, auteur, ISBN..." />
//               <Select
//                 value={categoryFilter}
//                 onChange={e => setCategoryFilter(e.target.value)}
//                 options={CATEGORY_OPTS}
//                 style={{ width: 180, marginBottom: 0 }}
//               />
//             </div>
//           </div>
//           <Table columns={bookColumns} data={books} loading={loading} emptyText="Aucun livre trouvé" />
//           <Pagination page={page} total={total} limit={limit} onPageChange={setPage} />
//         </Card>
//       )}

//       {/* Loans Tab */}
//       {tab === 'loans' && (
//         <Card>
//           <Table columns={loanColumns} data={loans} loading={loadingLoans} emptyText="Aucun emprunt actif" />
//         </Card>
//       )}

//       {/* Overdue Tab */}
//       {tab === 'overdue' && (
//         <Card>
//           <Table columns={loanColumns} data={overdueLoans} loading={false} emptyText="Aucun retard" />
//         </Card>
//       )}

//       {/* Book Modal */}
//       <Modal isOpen={bookModal.open} onClose={() => setBookModal({ open: false, book: null })} title={bookModal.book ? 'Modifier le livre' : 'Ajouter un livre'} size="lg">
//         <BookForm
//           book={bookModal.book}
//           onSave={() => {
//             setBookModal({ open: false, book: null });
//             loadBooks();
//           }}
//           onCancel={() => setBookModal({ open: false, book: null })}
//         />
//       </Modal>

//       {/* Borrow Modal */}
//       <Modal isOpen={borrowModal} onClose={() => setBorrowModal(false)} title="Enregistrer un emprunt" size="sm">
//         <BorrowModal
//           onSave={() => {
//             setBorrowModal(false);
//             loadLoans();
//             loadOverdueLoans();
//           }}
//           onCancel={() => setBorrowModal(false)}
//         />
//       </Modal>

//       {/* Delete Confirmation */}
//       <ConfirmDialog
//         isOpen={deleteDialog.open}
//         onClose={() => setDeleteDialog({ open: false, book: null })}
//         onConfirm={handleDelete}
//         loading={deleting}
//         title="Supprimer le livre"
//         message={`Supprimer "${deleteDialog.book?.title}" du catalogue ? Cette action est irréversible.`}
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
  
//   statsGrid: {
//     display: 'grid',
//     gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
//     gap: 16,
//     marginBottom: 20,
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



// pages/admin/LibraryPage.jsx
import { useState, useEffect, useCallback } from 'react';
import {
  Plus, Edit, Trash2, BookOpen, RotateCcw, Search,
  X, AlertCircle, CheckCircle, Clock, FileText,
} from 'lucide-react';
import { libraryAPI } from '../../services/services';

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORY_OPTS = [
  { value: '',           label: 'Toutes les catégories' },
  { value: 'manuel',     label: 'Manuel'                },
  { value: 'these',      label: 'Thèse'                 },
  { value: 'memoire',    label: 'Mémoire'               },
  { value: 'periodique', label: 'Périodique'            },
  { value: 'ebook',      label: 'E-Book'                },
  { value: 'reference',  label: 'Référence'             },
  { value: 'autre',      label: 'Autre'                 },
];

const BORROWER_TYPES = [
  { value: 'student',  label: 'Étudiant'   },
  { value: 'staff',    label: 'Personnel'  },
  { value: 'teacher',  label: 'Enseignant' },
  { value: 'external', label: 'Externe'    },
];

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '—';

// ─── Base UI ──────────────────────────────────────────────────────────────────
function Spinner({ size = 24 }) {
  return (
    <div style={{
      width: size, height: size,
      border: '2px solid #E5E7EB', borderTopColor: '#4F46E5',
      borderRadius: '50%', animation: 'spin .7s linear infinite', flexShrink: 0,
    }} />
  );
}

function Toast({ message, type, onClose }) {
  if (!message) return null;
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '12px 18px', borderRadius: 12, fontSize: 13, fontWeight: 500,
      boxShadow: '0 8px 24px rgba(0,0,0,.15)',
      background: type === 'error' ? '#FEF2F2' : '#F0FDF4',
      border: `1px solid ${type === 'error' ? '#FECACA' : '#BBF7D0'}`,
      color: type === 'error' ? '#991B1B' : '#166534',
    }}>
      {type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
      {message}
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: 4 }}>
        <X size={14} />
      </button>
    </div>
  );
}

function useToast() {
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const show = useCallback((msg, type = 'success') => {
    setToast({ message: msg, type });
    setTimeout(() => setToast({ message: '', type: 'success' }), 3500);
  }, []);
  const ToastEl = <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />;
  return { toast: show, ToastEl };
}

function Badge({ children, bg, color }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '3px 10px', borderRadius: 20,
      fontSize: 11, fontWeight: 600, background: bg, color,
    }}>{children}</span>
  );
}

function Btn({ children, onClick, variant = 'primary', size = 'md', loading, disabled, type = 'button', fullWidth }) {
  const V = {
    primary  : { background: '#4F46E5', color: '#fff',    border: 'none'                  },
    secondary: { background: '#F9FAFB', color: '#374151', border: '1px solid #E5E7EB'     },
    danger   : { background: '#FEF2F2', color: '#991B1B', border: '1px solid #FECACA'     },
    success  : { background: '#D1FAE5', color: '#065F46', border: '1px solid #A7F3D0'     },
    warning  : { background: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A'     },
    ghost    : { background: 'transparent', color: '#6B7280', border: 'none'              },
  };
  const S = {
    sm: { padding: '4px 10px',  fontSize: 12 },
    md: { padding: '8px 16px',  fontSize: 13 },
    lg: { padding: '10px 22px', fontSize: 14 },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled || loading}
      style={{
        ...V[variant], ...S[size], borderRadius: 8, fontWeight: 500,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled || loading ? 0.6 : 1,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        transition: 'all .15s', width: fullWidth ? '100%' : undefined,
      }}>
      {loading && <Spinner size={14} />}
      {children}
    </button>
  );
}

const inputStyle = {
  width: '100%', padding: '8px 12px', border: '1px solid #D1D5DB',
  borderRadius: 8, fontSize: 13, outline: 'none', background: '#fff', boxSizing: 'border-box',
};

function Field({ label, required, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && (
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>
          {label}{required && <span style={{ color: '#EF4444' }}> *</span>}
        </label>
      )}
      {children}
    </div>
  );
}

function Input({ label, required, ...props }) {
  return (
    <Field label={label} required={required}>
      <input style={inputStyle} required={required} {...props}
        onFocus={e => e.target.style.borderColor = '#6366F1'}
        onBlur={e => e.target.style.borderColor = '#D1D5DB'} />
    </Field>
  );
}

function Select({ label, required, value, onChange, options }) {
  return (
    <Field label={label} required={required}>
      <select value={value} onChange={onChange} required={required}
        style={{ ...inputStyle, cursor: 'pointer' }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </Field>
  );
}

function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    const h = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);
  if (!isOpen) return null;
  const W = { sm: 420, md: 580, lg: 800 };
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)',
      backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 1000, padding: 16,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#fff', borderRadius: 16, width: '100%',
        maxWidth: W[size], maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,.2)',
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '18px 24px', borderBottom: '1px solid #E5E7EB',
          position: 'sticky', top: 0, background: '#fff', zIndex: 1,
        }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: '#111', margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{
            width: 30, height: 30, borderRadius: 8, border: 'none',
            background: '#F3F4F6', cursor: 'pointer', fontSize: 18, color: '#6B7280',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, bg, iconColor }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 12, padding: 18,
      border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: 14,
    }}>
      <div style={{
        width: 46, height: 46, borderRadius: 12, background: bg, color: iconColor,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>{icon}</div>
      <div>
        <p style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, marginBottom: 2 }}>{title}</p>
        <p style={{ fontSize: 22, fontWeight: 800, color: '#111' }}>{value}</p>
      </div>
    </div>
  );
}

function ConfirmModal({ message, confirmLabel = 'Supprimer', confirmVariant = 'danger', onConfirm, onCancel, loading }) {
  return (
    <div style={{ padding: '20px 24px' }}>
      <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.7, marginBottom: 24 }}>{message}</p>
      <div style={{ display: 'flex', gap: 12 }}>
        <Btn variant="secondary" onClick={onCancel} fullWidth>Annuler</Btn>
        <Btn variant={confirmVariant} onClick={onConfirm} loading={loading} fullWidth>{confirmLabel}</Btn>
      </div>
    </div>
  );
}

// ─── Table ────────────────────────────────────────────────────────────────────
function Table({ columns, data, loading, emptyText = 'Aucun résultat' }) {
  if (loading) return <div style={{ padding: 48, textAlign: 'center' }}><Spinner size={32} /></div>;
  if (!data?.length) return <div style={{ padding: 48, textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>{emptyText}</div>;
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #F3F4F6' }}>
            {columns.map(c => (
              <th key={c.key} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#9CA3AF', letterSpacing: '.05em', textTransform: 'uppercase' }}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={row._id || i} style={{ borderBottom: '1px solid #F9FAFB' }}
              onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
              onMouseLeave={e => e.currentTarget.style.background = ''}>
              {columns.map(c => (
                <td key={c.key} style={{ padding: '11px 16px', fontSize: 13 }}>
                  {c.render ? c.render(row[c.key], row) : (row[c.key] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Pagination({ page, total, limit, onChange }) {
  const pages = Math.ceil(total / limit);
  if (pages <= 1) return null;
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, padding: 16 }}>
      <Btn variant="secondary" size="sm" onClick={() => onChange(page - 1)} disabled={page === 1}>← Préc.</Btn>
      <span style={{ fontSize: 13, color: '#6B7280' }}>Page {page} / {pages}</span>
      <Btn variant="secondary" size="sm" onClick={() => onChange(page + 1)} disabled={page === pages}>Suiv. →</Btn>
    </div>
  );
}

// ─── Book Form ────────────────────────────────────────────────────────────────
function BookForm({ book, onSave, onCancel }) {
  const { toast, ToastEl } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(book || {
    title: '', author: '', isbn: '', publisher: '', publicationYear: '',
    category: 'manuel', domain: '', language: 'Français',
    totalQuantity: 1, availableQuantity: 1, location: '',
    description: '', isDigital: false, digitalUrl: '',
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const categoryOpts = CATEGORY_OPTS.filter(o => o.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.author) return toast('Titre et auteur obligatoires', 'error');
    setLoading(true);
    try {
      if (book?._id) await libraryAPI.updateBook(book._id, form);
      else           await libraryAPI.createBook(form);
      onSave();
    } catch (err) {
      toast(err?.response?.data?.message || err.message || 'Erreur', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: '20px 24px' }}>
      {ToastEl}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Input label="Titre" required value={form.title} onChange={e => set('title', e.target.value)} />
        <Input label="Auteur" required value={form.author} onChange={e => set('author', e.target.value)} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Input label="ISBN" value={form.isbn} onChange={e => set('isbn', e.target.value)} />
        <Input label="Éditeur" value={form.publisher} onChange={e => set('publisher', e.target.value)} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Select label="Catégorie" value={form.category} onChange={e => set('category', e.target.value)} options={categoryOpts} />
        <Input label="Domaine" value={form.domain} onChange={e => set('domain', e.target.value)} placeholder="Informatique, Droit…" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        <Input label="Qté totale" type="number" min="1" value={form.totalQuantity} onChange={e => set('totalQuantity', +e.target.value)} />
        <Input label="Disponibles" type="number" min="0" value={form.availableQuantity} onChange={e => set('availableQuantity', +e.target.value)} />
        <Input label="Année pub." type="number" value={form.publicationYear} onChange={e => set('publicationYear', +e.target.value)} />
      </div>
      <Input label="Localisation (Rayon/Étagère)" value={form.location} onChange={e => set('location', e.target.value)} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <input type="checkbox" id="isDigital" checked={form.isDigital}
          onChange={e => set('isDigital', e.target.checked)}
          style={{ width: 15, height: 15, cursor: 'pointer' }} />
        <label htmlFor="isDigital" style={{ fontSize: 13, color: '#374151', cursor: 'pointer' }}>
          Ressource numérique
        </label>
      </div>
      {form.isDigital && (
        <Input label="URL numérique" value={form.digitalUrl} onChange={e => set('digitalUrl', e.target.value)} />
      )}
      <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
        <Btn variant="secondary" onClick={onCancel} fullWidth>Annuler</Btn>
        <Btn type="submit" loading={loading} fullWidth>
          {book ? 'Mettre à jour' : <><Plus size={14} /> Ajouter</>}
        </Btn>
      </div>
    </form>
  );
}

// ─── Borrow Modal ─────────────────────────────────────────────────────────────
function BorrowModal({ onSave, onCancel }) {
  const { toast, ToastEl } = useToast();
  const [books, setBooks]       = useState([]);
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [loading, setLoading]   = useState(false);
  const [form, setForm]         = useState({ book: '', borrower: '', borrowerType: 'student' });

  useEffect(() => {
    libraryAPI.getBooks({ available: 'true', limit: 200 })
      .then(r => setBooks(r.data?.data || r.data || []))
      .catch(() => toast('Erreur chargement livres', 'error'))
      .finally(() => setLoadingBooks(false));
  }, []);

  const bookOptions = [
    { value: '', label: loadingBooks ? 'Chargement…' : 'Sélectionner un livre' },
    ...books.map(b => ({ value: b._id, label: `${b.title} (${b.availableQuantity} dispo.)` })),
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.book || !form.borrower) return toast('Veuillez remplir tous les champs', 'error');
    setLoading(true);
    try {
      await libraryAPI.borrowBook(form);
      onSave();
    } catch (err) {
      toast(err?.response?.data?.message || "Erreur lors de l'emprunt", 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: '20px 24px' }}>
      {ToastEl}
      <Select label="Livre" required value={form.book}
        onChange={e => setForm(f => ({ ...f, book: e.target.value }))} options={bookOptions} />
      <Input label="ID Emprunteur" required value={form.borrower}
        onChange={e => setForm(f => ({ ...f, borrower: e.target.value }))}
        placeholder="ID de l'étudiant ou du personnel" />
      <Select label="Type" value={form.borrowerType}
        onChange={e => setForm(f => ({ ...f, borrowerType: e.target.value }))} options={BORROWER_TYPES} />
      <div style={{ background: '#DBEAFE', borderRadius: 10, padding: '10px 14px', marginBottom: 16 }}>
        <p style={{ fontSize: 13, color: '#1E40AF', margin: 0 }}>📚 Durée de prêt : <strong>14 jours</strong></p>
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
        <Btn variant="secondary" onClick={onCancel} fullWidth>Annuler</Btn>
        <Btn type="submit" loading={loading} fullWidth>
          <BookOpen size={14} /> Enregistrer
        </Btn>
      </div>
    </form>
  );
}

// ─── Loan Card ─────────────────────────────────────────────────────────────────
function LoanCard({ loan, onReturn }) {
  const isOverdue = new Date(loan.dueDate) < new Date();
  const daysLeft  = Math.ceil((new Date(loan.dueDate) - new Date()) / (1000 * 60 * 60 * 24));

  return (
    <div style={{
      background: '#fff', borderRadius: 14, border: `1px solid ${isOverdue ? '#FECACA' : '#E5E7EB'}`,
      overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,.05)',
      transition: 'box-shadow .2s',
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,.09)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,.05)'}
    >
      <div style={{ height: 3, background: isOverdue ? '#EF4444' : '#10B981' }} />
      <div style={{ padding: '16px 18px' }}>
        {/* Livre */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
          <div style={{
            width: 40, height: 50, background: '#EEF2FF', borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <BookOpen size={18} style={{ color: '#4F46E5' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#111', marginBottom: 2 }}>
              {loan.book?.title || '—'}
            </div>
            <div style={{ fontSize: 12, color: '#9CA3AF' }}>{loan.book?.author}</div>
          </div>
          <Badge
            bg={isOverdue ? '#FEE2E2' : '#D1FAE5'}
            color={isOverdue ? '#991B1B' : '#065F46'}>
            {isOverdue ? 'En retard' : 'Actif'}
          </Badge>
        </div>

        {/* Emprunteur */}
        <div style={{ background: '#F9FAFB', borderRadius: 8, padding: '8px 12px', marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 2 }}>Emprunteur</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
            {loan.student?.firstName
              ? `${loan.student.firstName} ${loan.student.lastName}`
              : loan.borrowerId || '—'}
          </div>
        </div>

        {/* Dates */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
          <div style={{ background: '#F9FAFB', borderRadius: 8, padding: '8px 12px' }}>
            <div style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 2 }}>Emprunté le</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{fmtDate(loan.loanDate)}</div>
          </div>
          <div style={{ background: isOverdue ? '#FEF2F2' : '#F9FAFB', borderRadius: 8, padding: '8px 12px' }}>
            <div style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 2 }}>À rendre le</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: isOverdue ? '#DC2626' : '#374151' }}>
              {fmtDate(loan.dueDate)}
            </div>
            {isOverdue
              ? <div style={{ fontSize: 10, color: '#EF4444', marginTop: 2 }}>Retard : {Math.abs(daysLeft)} j</div>
              : <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 2 }}>Dans {daysLeft} j</div>
            }
          </div>
        </div>

        {/* Amende */}
        {loan.fineAmount > 0 && (
          <div style={{ background: '#FEF2F2', borderRadius: 8, padding: '7px 12px', marginBottom: 12, display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: '#991B1B' }}>Amende</span>
            <span style={{ fontWeight: 700, color: '#DC2626' }}>{loan.fineAmount} DA</span>
          </div>
        )}

        <Btn size="sm" variant="success" onClick={() => onReturn(loan._id)} fullWidth>
          <RotateCcw size={13} /> Enregistrer le retour
        </Btn>
      </div>
    </div>
  );
}

// ─── Book Card ─────────────────────────────────────────────────────────────────
function BookCard({ book, onEdit, onDelete }) {
  const isAvailable = book.availableQuantity > 0;
  const categoryLabel = CATEGORY_OPTS.find(c => c.value === book.category)?.label || book.category;

  return (
    <div style={{
      background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB',
      overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,.05)',
      transition: 'box-shadow .2s',
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,.09)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,.05)'}
    >
      <div style={{ height: 3, background: isAvailable ? '#10B981' : '#EF4444' }} />
      <div style={{ padding: '16px 18px' }}>
        {/* Header */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
          <div style={{
            width: 44, height: 54, background: '#EEF2FF', borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            {book.isDigital
              ? <FileText size={20} style={{ color: '#7C3AED' }} />
              : <BookOpen size={20} style={{ color: '#4F46E5' }} />}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#111', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {book.title}
            </div>
            <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>{book.author}</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <Badge bg="#EEF2FF" color="#4338CA">{categoryLabel}</Badge>
              {book.isDigital
                ? <Badge bg="#F3E8FF" color="#9333EA">Numérique</Badge>
                : <Badge bg="#F3F4F6" color="#6B7280">Physique</Badge>}
            </div>
          </div>
        </div>

        {/* Infos grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
          <div style={{ background: isAvailable ? '#F0FDF4' : '#FEF2F2', borderRadius: 8, padding: '8px 12px' }}>
            <div style={{ fontSize: 10, color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 2 }}>Stock</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: isAvailable ? '#059669' : '#DC2626' }}>
              {book.availableQuantity}
              <span style={{ fontSize: 11, fontWeight: 400, color: '#9CA3AF' }}> / {book.totalQuantity}</span>
            </div>
          </div>
          <div style={{ background: '#F9FAFB', borderRadius: 8, padding: '8px 12px' }}>
            <div style={{ fontSize: 10, color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 2 }}>Domaine</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {book.domain || '—'}
            </div>
          </div>
        </div>

        {/* Localisation + ISBN */}
        {(book.location || book.isbn) && (
          <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 12, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {book.location && <span>📍 {book.location}</span>}
            {book.isbn && <span>ISBN: {book.isbn}</span>}
          </div>
        )}

        {/* Lien numérique */}
        {book.isDigital && book.digitalUrl && (
          <a href={book.digitalUrl} target="_blank" rel="noreferrer" style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            fontSize: 12, color: '#7C3AED', textDecoration: 'none', marginBottom: 12,
          }}>
            📖 Accès en ligne
          </a>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn size="sm" variant="secondary" onClick={() => onEdit(book)} fullWidth>
            <Edit size={13} /> Modifier
          </Btn>
          <Btn size="sm" variant="danger" onClick={() => onDelete(book)}>
            <Trash2 size={13} />
          </Btn>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function LibraryPage() {
  const { toast, ToastEl } = useToast();
  const [tab, setTab] = useState('books');
  const [books, setBooks]           = useState([]);
  const [loans, setLoans]           = useState([]);
  const [overdueLoans, setOverdueLoans] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [loadingLoans, setLoadingLoans] = useState(false);
  const [page, setPage]             = useState(1);
  const [total, setTotal]           = useState(0);
  const LIMIT = 20;

  const [search, setSearch]         = useState('');
  const [category, setCategory]     = useState('');
  const [bookModal, setBookModal]   = useState({ open: false, book: null });
  const [borrowModal, setBorrowModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ open: false, book: null });
  const [deleting, setDeleting]     = useState(false);

  const loadBooks = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT };
      if (search)   params.search   = search;
      if (category) params.category = category;
      const res = await libraryAPI.getBooks(params);
      setBooks(res.data?.data || res.data || []);
      setTotal(res.data?.total || 0);
    } catch { toast('Erreur chargement livres', 'error'); }
    finally { setLoading(false); }
  }, [page, search, category]);

  const loadLoans = useCallback(async () => {
    setLoadingLoans(true);
    try {
      const res = await libraryAPI.getActiveLoans();
      setLoans(res.data?.data || res.data || []);
    } catch { /* silencieux */ }
    finally { setLoadingLoans(false); }
  }, []);

  const loadOverdue = useCallback(async () => {
    try {
      const res = await libraryAPI.getOverdueLoans();
      setOverdueLoans(res.data?.data || res.data || []);
    } catch { /* silencieux */ }
  }, []);

  useEffect(() => { loadBooks(); }, [loadBooks]);
  useEffect(() => {
    if (tab === 'loans')   loadLoans();
    if (tab === 'overdue') loadOverdue();
  }, [tab]);

  const handleReturn = async (loanId) => {
    try {
      await libraryAPI.returnBook(loanId);
      loadLoans(); loadOverdue();
      toast('Retour enregistré !');
    } catch (err) { toast(err?.response?.data?.message || 'Erreur retour', 'error'); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await libraryAPI.deleteBook(deleteModal.book._id);
      setDeleteModal({ open: false, book: null });
      loadBooks();
      toast('Livre supprimé');
    } catch (err) { toast(err?.response?.data?.message || 'Erreur suppression', 'error'); }
    finally { setDeleting(false); }
  };

  const TABS = [
    { id: 'books',   label: 'Catalogue'       },
    { id: 'loans',   label: 'Emprunts actifs' },
    { id: 'overdue', label: 'Retards', badge: overdueLoans.length },
  ];

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', padding: 24, maxWidth: 1400, margin: '0 auto', minHeight: '100vh', background: '#F9FAFB' }}>
      {ToastEl}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111', margin: 0 }}>📚 Bibliothèque Universitaire</h1>
          <p style={{ fontSize: 13, color: '#9CA3AF', marginTop: 4 }}>Catalogue et gestion des prêts</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Btn variant="secondary" onClick={() => setBorrowModal(true)}>
            <BookOpen size={14} /> Enregistrer un emprunt
          </Btn>
          <Btn onClick={() => setBookModal({ open: true, book: null })}>
            <Plus size={15} /> Ajouter un livre
          </Btn>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 20 }}>
        <StatCard title="Total livres"    value={total}                icon={<BookOpen size={20} />} bg="#EEF2FF" iconColor="#4338CA" />
        <StatCard title="Emprunts actifs" value={loans.length}         icon={<BookOpen size={20} />} bg="#DBEAFE" iconColor="#1E40AF" />
        <StatCard title="Retards"         value={overdueLoans.length}  icon={<Clock size={20} />}    bg="#FEE2E2" iconColor="#991B1B" />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderRadius: 12, overflow: 'hidden', border: '1px solid #E5E7EB', width: 'fit-content', marginBottom: 20, background: '#fff' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '10px 22px', fontSize: 13, fontWeight: 500,
            background: tab === t.id ? '#4F46E5' : '#fff',
            color: tab === t.id ? '#fff' : '#6B7280',
            border: 'none', cursor: 'pointer', transition: 'all .2s',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            {t.label}
            {t.badge > 0 && (
              <span style={{
                background: tab === t.id ? 'rgba(255,255,255,.25)' : '#FEE2E2',
                color: tab === t.id ? '#fff' : '#DC2626',
                padding: '1px 7px', borderRadius: 20, fontSize: 11,
              }}>{t.badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Catalogue ── */}
      {tab === 'books' && (
        <>
          {/* Filtres */}
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: '12px 16px', marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' }} />
                <input value={search} placeholder="Titre, auteur, ISBN…"
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                  style={{ ...inputStyle, paddingLeft: 32 }}
                  onFocus={e => e.target.style.borderColor = '#6366F1'}
                  onBlur={e => e.target.style.borderColor = '#D1D5DB'} />
              </div>
              <select value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}
                style={{ ...inputStyle, width: 190, cursor: 'pointer' }}>
                {CATEGORY_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <span style={{ fontSize: 12, color: '#9CA3AF', marginLeft: 'auto' }}>{total} livre{total !== 1 ? 's' : ''}</span>
            </div>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner size={36} /></div>
          ) : books.length === 0 ? (
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: 48, textAlign: 'center' }}>
              <BookOpen size={40} style={{ color: '#D1D5DB', display: 'block', margin: '0 auto 12px' }} />
              <p style={{ color: '#6B7280', fontSize: 14 }}>Aucun livre trouvé</p>
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
                {books.map(book => (
                  <BookCard key={book._id} book={book}
                    onEdit={b => setBookModal({ open: true, book: b })}
                    onDelete={b => setDeleteModal({ open: true, book: b })} />
                ))}
              </div>
              <div style={{ marginTop: 16 }}>
                <Pagination page={page} total={total} limit={LIMIT} onChange={setPage} />
              </div>
            </>
          )}
        </>
      )}

      {/* ── Emprunts actifs ── */}
      {tab === 'loans' && (
        loadingLoans ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner size={36} /></div>
        ) : loans.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: 48, textAlign: 'center' }}>
            <BookOpen size={40} style={{ color: '#D1D5DB', display: 'block', margin: '0 auto 12px' }} />
            <p style={{ color: '#6B7280', fontSize: 14 }}>Aucun emprunt actif</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
            {loans.map(loan => <LoanCard key={loan._id} loan={loan} onReturn={handleReturn} />)}
          </div>
        )
      )}

      {/* ── Retards ── */}
      {tab === 'overdue' && (
        overdueLoans.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: 48, textAlign: 'center' }}>
            <CheckCircle size={40} style={{ color: '#10B981', display: 'block', margin: '0 auto 12px' }} />
            <p style={{ color: '#6B7280', fontSize: 14 }}>Aucun retard — tout est à jour ✅</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
            {overdueLoans.map(loan => <LoanCard key={loan._id} loan={loan} onReturn={handleReturn} />)}
          </div>
        )
      )}

      {/* Modals */}
      <Modal isOpen={bookModal.open} onClose={() => setBookModal({ open: false, book: null })}
        title={bookModal.book ? 'Modifier le livre' : 'Ajouter un livre'} size="lg">
        <BookForm book={bookModal.book}
          onSave={() => { setBookModal({ open: false, book: null }); loadBooks(); toast(bookModal.book ? 'Livre mis à jour !' : 'Livre ajouté !'); }}
          onCancel={() => setBookModal({ open: false, book: null })} />
      </Modal>

      <Modal isOpen={borrowModal} onClose={() => setBorrowModal(false)} title="Enregistrer un emprunt" size="sm">
        <BorrowModal
          onSave={() => { setBorrowModal(false); loadLoans(); loadOverdue(); toast('Emprunt enregistré !'); }}
          onCancel={() => setBorrowModal(false)} />
      </Modal>

      <Modal isOpen={deleteModal.open} onClose={() => setDeleteModal({ open: false, book: null })} title="Supprimer le livre" size="sm">
        <ConfirmModal
          message={`Supprimer "${deleteModal.book?.title}" du catalogue ? Cette action est irréversible.`}
          onConfirm={handleDelete} onCancel={() => setDeleteModal({ open: false, book: null })}
          loading={deleting} />
      </Modal>
    </div>
  );
}