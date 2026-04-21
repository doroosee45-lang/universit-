// // import { useState } from 'react';
// // import { BookOpen, Search } from 'lucide-react';
// // import { libraryAPI } from '../../services/services';
// // import { Card, Table, Badge, SearchInput, Select, Pagination, Spinner } from '../../components/common';
// // import { usePagination, useFetch } from '../../components/hooks/UseFetch';
// // import { useAuth } from '../../components/context/AuthContext';
// // import { formatDate } from '../../components/utils/Helpers';

// // const CATEGORY_OPTS = [
// //   { value: '', label: 'Toutes les catégories' },
// //   { value: 'manuel', label: 'Manuel' },
// //   { value: 'these', label: 'Thèse' },
// //   { value: 'memoire', label: 'Mémoire' },
// //   { value: 'periodique', label: 'Périodique' },
// //   { value: 'ebook', label: 'E-Book' },
// //   { value: 'reference', label: 'Référence' },
// // ];

// // export default function StudentLibraryPage() {
// //   const { user } = useAuth();
// //   const [tab, setTab] = useState('catalog');
// //   const { data, total, page, limit, loading, setPage, search } = usePagination(libraryAPI.getBooks);
// //   const { data: myLoans, loading: loansLoading } = useFetch(
// //     () => libraryAPI.getActiveLoans()
// //   );

// //   const loans = (myLoans || []).filter(l => l.student?._id === user?._id || l.student === user?._id);

// //   const bookColumns = [
// //     {
// //       header: 'Livre', key: 'title',
// //       render: (v, row) => (
// //         <div className="flex items-start gap-3">
// //           <div className="w-10 h-12 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0">
// //             <BookOpen size={18} className="text-indigo-600" />
// //           </div>
// //           <div>
// //             <p className="font-medium text-gray-900 text-sm">{v}</p>
// //             <p className="text-xs text-gray-400">{row.author}</p>
// //             {row.isbn && <p className="text-xs text-gray-300 font-mono">ISBN: {row.isbn}</p>}
// //           </div>
// //         </div>
// //       )
// //     },
// //     { header: 'Catégorie', key: 'category', render: v => <Badge className="bg-indigo-100 text-indigo-700 capitalize">{v}</Badge> },
// //     { header: 'Domaine', key: 'domain', render: v => v || '—' },
// //     {
// //       header: 'Disponibilité', key: 'availableQuantity',
// //       render: (v, row) => (
// //         <div>
// //           <span className={`font-bold text-lg ${v === 0 ? 'text-red-500' : 'text-green-600'}`}>{v}</span>
// //           <span className="text-gray-400 text-sm"> / {row.totalQuantity}</span>
// //           <p className="text-xs text-gray-400">{v === 0 ? 'Indisponible' : 'Disponible'}</p>
// //         </div>
// //       )
// //     },
// //     { header: 'Localisation', key: 'location', render: v => v || '—' },
// //     {
// //       header: 'Type', key: 'isDigital',
// //       render: (v, row) => v ? (
// //         <a href={row.digitalUrl} target="_blank" rel="noreferrer" className="text-indigo-600 text-sm hover:underline">
// //           📖 Accès en ligne
// //         </a>
// //       ) : <span className="text-gray-400 text-sm">Physique</span>
// //     },
// //   ];

// //   const loanColumns = [
// //     {
// //       header: 'Livre', key: 'book',
// //       render: (_, row) => (
// //         <div>
// //           <p className="font-medium text-gray-900 text-sm">{row.book?.title}</p>
// //           <p className="text-xs text-gray-400">{row.book?.author}</p>
// //         </div>
// //       )
// //     },
// //     { header: 'Emprunté le', key: 'loanDate', render: v => formatDate(v) },
// //     {
// //       header: 'À rendre le', key: 'dueDate',
// //       render: v => {
// //         const isLate = new Date(v) < new Date();
// //         const daysLeft = Math.ceil((new Date(v) - new Date()) / (1000 * 60 * 60 * 24));
// //         return (
// //           <div>
// //             <span className={`font-medium ${isLate ? 'text-red-600' : daysLeft <= 3 ? 'text-amber-600' : 'text-gray-700'}`}>
// //               {formatDate(v)}
// //             </span>
// //             {isLate ? (
// //               <p className="text-xs text-red-500">En retard de {Math.abs(daysLeft)} jour(s)</p>
// //             ) : (
// //               <p className="text-xs text-gray-400">Dans {daysLeft} jour(s)</p>
// //             )}
// //           </div>
// //         );
// //       }
// //     },
// //     {
// //       header: 'Statut', key: 'status',
// //       render: (v, row) => {
// //         const isLate = new Date(row.dueDate) < new Date();
// //         return <Badge className={isLate ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}>
// //           {isLate ? 'En retard' : 'Actif'}
// //         </Badge>;
// //       }
// //     },
// //     {
// //       header: 'Amende', key: 'fineAmount',
// //       render: v => v > 0 ? <span className="font-bold text-red-600">{v} DA</span> : '—'
// //     },
// //   ];

// //   return (
// //     <div className="space-y-6">
// //       <div>
// //         <h1 className="text-2xl font-bold text-gray-900">Bibliothèque Universitaire</h1>
// //         <p className="text-sm text-gray-500 mt-1">Catalogue et mes emprunts</p>
// //       </div>

// //       {/* Tabs */}
// //       <div className="flex rounded-xl border border-gray-200 overflow-hidden w-fit">
// //         {[['catalog', 'Catalogue'], ['loans', `Mes emprunts ${loans.length > 0 ? `(${loans.length})` : ''}`]].map(([id, label]) => (
// //           <button key={id} onClick={() => setTab(id)}
// //             className={`px-5 py-2.5 text-sm font-medium transition-colors ${tab === id ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
// //             {label}
// //           </button>
// //         ))}
// //       </div>

// //       {tab === 'catalog' && (
// //         <>
// //           <Card className="p-4">
// //             <div className="flex gap-3 flex-wrap">
// //               <SearchInput onChange={v => search({ search: v })} placeholder="Titre, auteur, ISBN..." className="flex-1 min-w-48" />
// //               <Select onChange={e => search({ category: e.target.value })} options={CATEGORY_OPTS} className="w-48" />
// //               <Select onChange={e => search({ available: e.target.value })}
// //                 options={[{ value: '', label: 'Tous' }, { value: 'true', label: 'Disponibles uniquement' }]}
// //                 className="w-48" />
// //             </div>
// //           </Card>
// //           <Card>
// //             <Table columns={bookColumns} data={data} loading={loading} emptyText="Aucun livre trouvé" />
// //             <Pagination page={page} total={total} limit={limit} onPageChange={setPage} />
// //           </Card>
// //         </>
// //       )}

// //       {tab === 'loans' && (
// //         <>
// //           {loans.length === 0 ? (
// //             <Card className="p-12 text-center">
// //               <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
// //               <p className="text-gray-500 font-medium">Aucun emprunt en cours</p>
// //               <p className="text-gray-400 text-sm mt-1">Vous n'avez aucun livre emprunté actuellement.</p>
// //             </Card>
// //           ) : (
// //             <Card>
// //               <Table columns={loanColumns} data={loans} loading={loansLoading} emptyText="Aucun emprunt" />
// //             </Card>
// //           )}

// //           <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
// //             <p className="text-sm text-blue-700 font-medium">ℹ️ Informations</p>
// //             <ul className="mt-2 space-y-1 text-sm text-blue-600">
// //               <li>• Durée de prêt standard : <strong>14 jours</strong></li>
// //               <li>• Renouvellement possible : <strong>1 fois</strong></li>
// //               <li>• Amende en cas de retard : <strong>50 DA/jour</strong></li>
// //             </ul>
// //           </div>
// //         </>
// //       )}
// //     </div>
// //   );
// // }















// // pages/student/StudentLibraryPage.jsx
// import { useState, useEffect, useCallback } from 'react';
// import { BookOpen, Search, X } from 'lucide-react';
// import { libraryAPI } from '../../services/services';
// import { useAuth } from '../../components/context/AuthContext';

// // ---------- Helper local (pas besoin d'importer helpers) ----------
// const formatDate = (date) => {
//   if (!date) return '—';
//   const d = new Date(date);
//   return d.toLocaleDateString('fr-FR');
// };

// // ---------- Composants UI locaux ----------
// const Toast = ({ message, type, onClose }) => {
//   if (!message) return null;
//   const bgColor = type === 'error' ? 'bg-red-500' : 'bg-green-500';
//   return (
//     <div className={`fixed bottom-4 right-4 z-50 ${bgColor} text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2`}>
//       <span>{message}</span>
//       <button onClick={onClose} className="hover:opacity-80"><X size={16} /></button>
//     </div>
//   );
// };

// const Spinner = ({ size = 24 }) => (
//   <div className="flex justify-center items-center">
//     <div className={`border-2 border-indigo-600 border-t-transparent rounded-full animate-spin`} style={{ width: size, height: size }} />
//   </div>
// );

// const Badge = ({ children, className }) => (
//   <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>{children}</span>
// );

// const Card = ({ children, className = "" }) => (
//   <div className={`bg-white rounded-xl shadow-sm border border-gray-100 ${className}`}>{children}</div>
// );

// const Table = ({ columns, data, loading, emptyText = "Aucune donnée" }) => {
//   if (loading) return <div className="flex justify-center py-8"><Spinner size={24} /></div>;
//   if (!data || data.length === 0) return <div className="text-center py-8 text-gray-400 text-sm">{emptyText}</div>;
//   return (
//     <div className="overflow-x-auto">
//       <table className="min-w-full divide-y divide-gray-200">
//         <thead className="bg-gray-50">
//           <tr>
//             {columns.map((col, i) => (
//               <th key={i} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 {col.header}
//               </th>
//             ))}
//           </tr>
//         </thead>
//         <tbody className="bg-white divide-y divide-gray-200">
//           {data.map((row, idx) => (
//             <tr key={row._id || idx} className="hover:bg-gray-50">
//               {columns.map((col, j) => (
//                 <td key={j} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
//                   {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
//                 </td>
//               ))}
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// const Pagination = ({ page, total, limit, onPageChange }) => {
//   const totalPages = Math.ceil(total / limit);
//   if (totalPages <= 1) return null;
//   return (
//     <div className="flex justify-between items-center px-4 py-3 border-t border-gray-200">
//       <button onClick={() => onPageChange(page - 1)} disabled={page === 1} className="px-3 py-1 text-sm bg-gray-100 rounded disabled:opacity-50">Précédent</button>
//       <span className="text-sm text-gray-600">Page {page} / {totalPages}</span>
//       <button onClick={() => onPageChange(page + 1)} disabled={page === totalPages} className="px-3 py-1 text-sm bg-gray-100 rounded disabled:opacity-50">Suivant</button>
//     </div>
//   );
// };

// const Select = ({ value, onChange, options, className = "" }) => (
//   <select value={value} onChange={onChange} className={`border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 ${className}`}>
//     {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
//   </select>
// );

// const SearchInput = ({ value, onChange, placeholder }) => (
//   <div className="relative flex-1 min-w-48">
//     <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
//     <input
//       type="text"
//       value={value}
//       onChange={e => onChange(e.target.value)}
//       placeholder={placeholder}
//       className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
//     />
//   </div>
// );

// // ---------- Helpers ----------
// const CATEGORY_OPTS = [
//   { value: '', label: 'Toutes les catégories' },
//   { value: 'manuel', label: 'Manuel' },
//   { value: 'these', label: 'Thèse' },
//   { value: 'memoire', label: 'Mémoire' },
//   { value: 'periodique', label: 'Périodique' },
//   { value: 'ebook', label: 'E-Book' },
//   { value: 'reference', label: 'Référence' },
// ];

// // ---------- Composant principal ----------
// export default function StudentLibraryPage() {
//   const { user } = useAuth();
//   const [toast, setToast] = useState({ message: '', type: '' });
//   const [tab, setTab] = useState('catalog');
//   const [books, setBooks] = useState([]);
//   const [total, setTotal] = useState(0);
//   const [page, setPage] = useState(1);
//   const [limit] = useState(10);
//   const [loading, setLoading] = useState(false);
//   const [search, setSearch] = useState('');
//   const [category, setCategory] = useState('');
//   const [availableOnly, setAvailableOnly] = useState(false);
//   const [myLoans, setMyLoans] = useState([]);
//   const [loadingLoans, setLoadingLoans] = useState(false);

//   const loadBooks = useCallback(async () => {
//     setLoading(true);
//     try {
//       const params = { page, limit, search, category };
//       if (availableOnly) params.available = 'true';
//       const res = await libraryAPI.getBooks(params);
//       // Extraction sécurisée
//       const data = res?.data?.data ?? res?.data ?? [];
//       setBooks(Array.isArray(data) ? data : []);
//       setTotal(res?.data?.total ?? res?.total ?? 0);
//     } catch (err) {
//       console.error(err);
//       setToast({ message: 'Erreur chargement catalogue', type: 'error' });
//     } finally {
//       setLoading(false);
//     }
//   }, [page, limit, search, category, availableOnly]);

//   const loadMyLoans = useCallback(async () => {
//     setLoadingLoans(true);
//     try {
//       const res = await libraryAPI.getActiveLoans();
//       let loans = res?.data?.data ?? res?.data ?? [];
//       // Filtrer par l'étudiant connecté
//       loans = loans.filter(l => l.student?._id === user?._id || l.student === user?._id);
//       setMyLoans(loans);
//     } catch (err) {
//       console.error(err);
//       setToast({ message: 'Erreur chargement emprunts', type: 'error' });
//     } finally {
//       setLoadingLoans(false);
//     }
//   }, [user?._id]);

//   useEffect(() => {
//     loadBooks();
//   }, [loadBooks]);

//   useEffect(() => {
//     if (tab === 'loans') loadMyLoans();
//   }, [tab, loadMyLoans]);

//   const bookColumns = [
//     {
//       header: 'Livre',
//       key: 'title',
//       render: (v, row) => (
//         <div className="flex items-start gap-3">
//           <div className="w-10 h-12 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0">
//             <BookOpen size={18} className="text-indigo-600" />
//           </div>
//           <div>
//             <p className="font-medium text-gray-900 text-sm">{v}</p>
//             <p className="text-xs text-gray-400">{row.author}</p>
//             {row.isbn && <p className="text-xs text-gray-300 font-mono">ISBN: {row.isbn}</p>}
//           </div>
//         </div>
//       )
//     },
//     {
//       header: 'Catégorie',
//       key: 'category',
//       render: v => <Badge className="bg-indigo-100 text-indigo-700 capitalize">{v}</Badge>
//     },
//     {
//       header: 'Domaine',
//       key: 'domain',
//       render: v => v || '—'
//     },
//     {
//       header: 'Disponibilité',
//       key: 'availableQuantity',
//       render: (v, row) => (
//         <div>
//           <span className={`font-bold text-lg ${v === 0 ? 'text-red-500' : 'text-green-600'}`}>{v}</span>
//           <span className="text-gray-400 text-sm"> / {row.totalQuantity}</span>
//           <p className="text-xs text-gray-400">{v === 0 ? 'Indisponible' : 'Disponible'}</p>
//         </div>
//       )
//     },
//     {
//       header: 'Localisation',
//       key: 'location',
//       render: v => v || '—'
//     },
//     {
//       header: 'Type',
//       key: 'isDigital',
//       render: (v, row) => v
//         ? <a href={row.digitalUrl} target="_blank" rel="noreferrer" className="text-indigo-600 text-sm hover:underline">📖 Accès en ligne</a>
//         : <span className="text-gray-400 text-sm">Physique</span>
//     }
//   ];

//   const loanColumns = [
//     {
//       header: 'Livre',
//       key: 'book',
//       render: (_, row) => (
//         <div>
//           <p className="font-medium text-gray-900 text-sm">{row.book?.title}</p>
//           <p className="text-xs text-gray-400">{row.book?.author}</p>
//         </div>
//       )
//     },
//     {
//       header: 'Emprunté le',
//       key: 'loanDate',
//       render: v => formatDate(v)
//     },
//     {
//       header: 'À rendre le',
//       key: 'dueDate',
//       render: v => {
//         const isLate = new Date(v) < new Date();
//         const daysLeft = Math.ceil((new Date(v) - new Date()) / (1000 * 60 * 60 * 24));
//         return (
//           <div>
//             <span className={`font-medium ${isLate ? 'text-red-600' : daysLeft <= 3 ? 'text-amber-600' : 'text-gray-700'}`}>
//               {formatDate(v)}
//             </span>
//             {isLate
//               ? <p className="text-xs text-red-500">En retard de {Math.abs(daysLeft)} jour(s)</p>
//               : <p className="text-xs text-gray-400">Dans {daysLeft} jour(s)</p>
//             }
//           </div>
//         );
//       }
//     },
//     {
//       header: 'Statut',
//       key: 'status',
//       render: (_, row) => {
//         const isLate = new Date(row.dueDate) < new Date();
//         return <Badge className={isLate ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}>
//           {isLate ? 'En retard' : 'Actif'}
//         </Badge>;
//       }
//     },
//     {
//       header: 'Amende',
//       key: 'fineAmount',
//       render: v => v > 0 ? <span className="font-bold text-red-600">{v} DA</span> : '—'
//     }
//   ];

//   return (
//     <div className="space-y-6">
//       <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: '' })} />
//       <div>
//         <h1 className="text-2xl font-bold text-gray-900">Bibliothèque Universitaire</h1>
//         <p className="text-sm text-gray-500 mt-1">Catalogue et mes emprunts</p>
//       </div>

//       {/* Tabs */}
//       <div className="flex rounded-xl border border-gray-200 overflow-hidden w-fit">
//         <button
//           onClick={() => setTab('catalog')}
//           className={`px-5 py-2.5 text-sm font-medium transition-colors ${
//             tab === 'catalog' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
//           }`}
//         >
//           Catalogue
//         </button>
//         <button
//           onClick={() => setTab('loans')}
//           className={`px-5 py-2.5 text-sm font-medium transition-colors ${
//             tab === 'loans' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
//           }`}
//         >
//           Mes emprunts {myLoans.length > 0 ? `(${myLoans.length})` : ''}
//         </button>
//       </div>

//       {/* Catalogue */}
//       {tab === 'catalog' && (
//         <>
//           <Card className="p-4">
//             <div className="flex gap-3 flex-wrap">
//               <SearchInput value={search} onChange={setSearch} placeholder="Titre, auteur, ISBN..." />
//               <Select value={category} onChange={e => setCategory(e.target.value)} options={CATEGORY_OPTS} className="w-48" />
//               <Select
//                 value={availableOnly ? 'true' : ''}
//                 onChange={e => setAvailableOnly(e.target.value === 'true')}
//                 options={[{ value: '', label: 'Tous' }, { value: 'true', label: 'Disponibles uniquement' }]}
//                 className="w-48"
//               />
//             </div>
//           </Card>
//           <Card>
//             <Table columns={bookColumns} data={books} loading={loading} emptyText="Aucun livre trouvé" />
//             <Pagination page={page} total={total} limit={limit} onPageChange={setPage} />
//           </Card>
//         </>
//       )}

//       {/* Mes emprunts */}
//       {tab === 'loans' && (
//         <>
//           {myLoans.length === 0 ? (
//             <Card className="p-12 text-center">
//               <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
//               <p className="text-gray-500 font-medium">Aucun emprunt en cours</p>
//               <p className="text-gray-400 text-sm mt-1">Vous n'avez aucun livre emprunté actuellement.</p>
//             </Card>
//           ) : (
//             <Card>
//               <Table columns={loanColumns} data={myLoans} loading={loadingLoans} emptyText="Aucun emprunt" />
//             </Card>
//           )}
//           <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
//             <p className="text-sm text-blue-700 font-medium">ℹ️ Informations</p>
//             <ul className="mt-2 space-y-1 text-sm text-blue-600">
//               <li>• Durée de prêt standard : <strong>14 jours</strong></li>
//               <li>• Renouvellement possible : <strong>1 fois</strong></li>
//               <li>• Amende en cas de retard : <strong>50 DA/jour</strong></li>
//             </ul>
//           </div>
//         </>
//       )}
//     </div>
//   );
// }




// ─────────────────────────────────────────────────────────────────────────────
// pages/student/StudentLibraryPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect, useCallback } from 'react';
import { BookOpen, Search, X, AlertCircle, CheckCircle, Clock, FileText } from 'lucide-react';
import { libraryAPI } from '../../services/services';
import { useAuth } from '../../components/context/AuthContext';

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORY_OPTS = [
  { value: '',           label: 'Toutes les catégories' },
  { value: 'manuel',     label: 'Manuel'                },
  { value: 'these',      label: 'Thèse'                 },
  { value: 'memoire',    label: 'Mémoire'               },
  { value: 'periodique', label: 'Périodique'            },
  { value: 'ebook',      label: 'E-Book'                },
  { value: 'reference',  label: 'Référence'             },
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

function Badge({ children, bg, color }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '3px 10px', borderRadius: 20,
      fontSize: 11, fontWeight: 600, background: bg, color,
    }}>{children}</span>
  );
}

const inputStyle = {
  width: '100%', padding: '8px 12px', border: '1px solid #D1D5DB',
  borderRadius: 8, fontSize: 13, outline: 'none', background: '#fff', boxSizing: 'border-box',
};

function Pagination({ page, total, limit, onChange }) {
  const pages = Math.ceil(total / limit);
  if (pages <= 1) return null;
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, padding: 16 }}>
      <button onClick={() => onChange(page - 1)} disabled={page === 1}
        style={{ padding: '5px 12px', borderRadius: 7, border: '1px solid #E5E7EB', background: '#fff', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1, fontSize: 13 }}>
        ← Préc.
      </button>
      <span style={{ fontSize: 13, color: '#6B7280' }}>Page {page} / {pages}</span>
      <button onClick={() => onChange(page + 1)} disabled={page === pages}
        style={{ padding: '5px 12px', borderRadius: 7, border: '1px solid #E5E7EB', background: '#fff', cursor: page === pages ? 'not-allowed' : 'pointer', opacity: page === pages ? 0.5 : 1, fontSize: 13 }}>
        Suiv. →
      </button>
    </div>
  );
}

// ─── Book Card (lecture seule) ────────────────────────────────────────────────
function BookCardReadOnly({ book }) {
  const isAvailable   = book.availableQuantity > 0;
  const categoryLabel = CATEGORY_OPTS.find(c => c.value === book.category)?.label || book.category;

  return (
    <div style={{
      background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB',
      overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,.05)', transition: 'box-shadow .2s',
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,.09)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,.05)'}
    >
      <div style={{ height: 3, background: isAvailable ? '#10B981' : '#EF4444' }} />
      <div style={{ padding: '16px 18px' }}>
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
            <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 5 }}>{book.author}</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <Badge bg="#EEF2FF" color="#4338CA">{categoryLabel}</Badge>
              {book.isDigital
                ? <Badge bg="#F3E8FF" color="#9333EA">Numérique</Badge>
                : <Badge bg="#F3F4F6" color="#6B7280">Physique</Badge>}
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: isAvailable ? '#059669' : '#DC2626' }}>
              {book.availableQuantity}
            </div>
            <div style={{ fontSize: 10, color: '#9CA3AF' }}>/ {book.totalQuantity}</div>
            <div style={{ fontSize: 10, fontWeight: 600, color: isAvailable ? '#059669' : '#DC2626', marginTop: 2 }}>
              {isAvailable ? 'Dispo.' : 'Indispo.'}
            </div>
          </div>
        </div>

        {(book.domain || book.location || book.isbn) && (
          <div style={{ fontSize: 11, color: '#9CA3AF', display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
            {book.domain   && <span>📖 {book.domain}</span>}
            {book.location && <span>📍 {book.location}</span>}
            {book.isbn     && <span>ISBN: {book.isbn}</span>}
          </div>
        )}

        {book.isDigital && book.digitalUrl && (
          <a href={book.digitalUrl} target="_blank" rel="noreferrer" style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            fontSize: 12, color: '#7C3AED', textDecoration: 'none',
            background: '#F3E8FF', padding: '4px 10px', borderRadius: 8,
          }}>
            📖 Accès en ligne
          </a>
        )}
      </div>
    </div>
  );
}

// ─── My Loan Card ─────────────────────────────────────────────────────────────
function MyLoanCard({ loan }) {
  const isOverdue = new Date(loan.dueDate) < new Date();
  const daysLeft  = Math.ceil((new Date(loan.dueDate) - new Date()) / (1000 * 60 * 60 * 24));

  return (
    <div style={{
      background: '#fff', borderRadius: 14,
      border: `1px solid ${isOverdue ? '#FECACA' : '#E5E7EB'}`,
      overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,.05)', transition: 'box-shadow .2s',
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,.09)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,.05)'}
    >
      <div style={{ height: 3, background: isOverdue ? '#EF4444' : '#10B981' }} />
      <div style={{ padding: '16px 18px' }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
          <div style={{
            width: 40, height: 50, background: '#EEF2FF', borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <BookOpen size={18} style={{ color: '#4F46E5' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#111', marginBottom: 2 }}>{loan.book?.title || '—'}</div>
            <div style={{ fontSize: 12, color: '#9CA3AF' }}>{loan.book?.author}</div>
          </div>
          <Badge
            bg={isOverdue ? '#FEE2E2' : '#D1FAE5'}
            color={isOverdue ? '#991B1B' : '#065F46'}>
            {isOverdue ? 'En retard' : 'Actif'}
          </Badge>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
          <div style={{ background: '#F9FAFB', borderRadius: 8, padding: '8px 12px' }}>
            <div style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 2 }}>Emprunté le</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{fmtDate(loan.loanDate)}</div>
          </div>
          <div style={{ background: isOverdue ? '#FEF2F2' : '#F9FAFB', borderRadius: 8, padding: '8px 12px' }}>
            <div style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 2 }}>À rendre le</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: isOverdue ? '#DC2626' : '#374151' }}>{fmtDate(loan.dueDate)}</div>
            <div style={{ fontSize: 10, color: isOverdue ? '#EF4444' : '#9CA3AF', marginTop: 2 }}>
              {isOverdue ? `Retard : ${Math.abs(daysLeft)} j` : `Dans ${daysLeft} j`}
            </div>
          </div>
        </div>

        {loan.fineAmount > 0 && (
          <div style={{ background: '#FEF2F2', borderRadius: 8, padding: '7px 12px', display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: '#991B1B' }}>Amende</span>
            <span style={{ fontWeight: 700, color: '#DC2626' }}>{loan.fineAmount} DA</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Student Page ─────────────────────────────────────────────────────────
export default function StudentLibraryPage() {
  const { user } = useAuth();
  const [toast, setToast]           = useState({ message: '', type: '' });
  const [tab, setTab]               = useState('catalog');
  const [books, setBooks]           = useState([]);
  const [total, setTotal]           = useState(0);
  const [page, setPage]             = useState(1);
  const LIMIT = 12;
  const [loading, setLoading]       = useState(false);
  const [search, setSearch]         = useState('');
  const [category, setCategory]     = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [myLoans, setMyLoans]       = useState([]);
  const [loadingLoans, setLoadingLoans] = useState(false);

  const showToast = (message, type = 'success') => setToast({ message, type });

  const loadBooks = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT, search, category };
      if (availableOnly) params.available = 'true';
      const res  = await libraryAPI.getBooks(params);
      const data = res?.data?.data ?? res?.data ?? [];
      setBooks(Array.isArray(data) ? data : []);
      setTotal(res?.data?.total ?? res?.total ?? 0);
    } catch { showToast('Erreur chargement catalogue', 'error'); }
    finally { setLoading(false); }
  }, [page, LIMIT, search, category, availableOnly]);

  const loadMyLoans = useCallback(async () => {
    setLoadingLoans(true);
    try {
      const res   = await libraryAPI.getActiveLoans();
      let loans   = res?.data?.data ?? res?.data ?? [];
      loans = loans.filter(l => l.student?._id === user?._id || l.student === user?._id);
      setMyLoans(loans);
    } catch { showToast('Erreur chargement emprunts', 'error'); }
    finally { setLoadingLoans(false); }
  }, [user?._id]);

  useEffect(() => { loadBooks(); }, [loadBooks]);
  useEffect(() => { if (tab === 'loans') loadMyLoans(); }, [tab, loadMyLoans]);

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: '' })} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111', margin: 0 }}>📚 Bibliothèque Universitaire</h1>
        <p style={{ fontSize: 13, color: '#9CA3AF', marginTop: 4 }}>Catalogue et mes emprunts</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderRadius: 12, overflow: 'hidden', border: '1px solid #E5E7EB', width: 'fit-content', marginBottom: 20, background: '#fff' }}>
        {[
          { id: 'catalog', label: 'Catalogue' },
          { id: 'loans',   label: `Mes emprunts${myLoans.length > 0 ? ` (${myLoans.length})` : ''}` },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '10px 22px', fontSize: 13, fontWeight: 500,
            background: tab === t.id ? '#4F46E5' : '#fff',
            color: tab === t.id ? '#fff' : '#6B7280',
            border: 'none', cursor: 'pointer', transition: 'all .2s',
          }}>{t.label}</button>
        ))}
      </div>

      {/* ── Catalogue ── */}
      {tab === 'catalog' && (
        <>
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
              <select value={availableOnly ? 'true' : ''} onChange={e => { setAvailableOnly(e.target.value === 'true'); setPage(1); }}
                style={{ ...inputStyle, width: 190, cursor: 'pointer' }}>
                <option value="">Tous</option>
                <option value="true">Disponibles uniquement</option>
              </select>
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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
                {books.map(book => <BookCardReadOnly key={book._id} book={book} />)}
              </div>
              <div style={{ marginTop: 16 }}>
                <Pagination page={page} total={total} limit={LIMIT} onChange={setPage} />
              </div>
            </>
          )}
        </>
      )}

      {/* ── Mes emprunts ── */}
      {tab === 'loans' && (
        <>
          {loadingLoans ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner size={36} /></div>
          ) : myLoans.length === 0 ? (
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: 48, textAlign: 'center' }}>
              <BookOpen size={48} style={{ color: '#D1D5DB', display: 'block', margin: '0 auto 12px' }} />
              <p style={{ color: '#6B7280', fontSize: 14, fontWeight: 500 }}>Aucun emprunt en cours</p>
              <p style={{ color: '#9CA3AF', fontSize: 12, marginTop: 4 }}>Vous n'avez aucun livre emprunté actuellement.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
              {myLoans.map(loan => <MyLoanCard key={loan._id} loan={loan} />)}
            </div>
          )}

          <div style={{ marginTop: 20, background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 12, padding: '14px 18px' }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#1E40AF', marginBottom: 8 }}>ℹ️ Informations</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {[
                ['Durée de prêt standard', '14 jours'],
                ['Renouvellement possible', '1 fois'],
                ['Amende en cas de retard', '50 DA / jour'],
              ].map(([l, v]) => (
                <div key={l} style={{ fontSize: 13, color: '#1D4ED8', display: 'flex', gap: 8 }}>
                  <span>•</span>
                  <span>{l} : <strong>{v}</strong></span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// pages/teacher/TeacherLibraryPage.jsx  (même style, catalogue uniquement)
// ─────────────────────────────────────────────────────────────────────────────
// Pour utiliser ce composant séparément, copier depuis le séparateur ci-dessous
// dans un fichier dédié TeacherLibraryPage.jsx et importer normalement.

export function TeacherLibraryPage() {
  const [toast, setToast]       = useState({ message: '', type: '' });
  const [books, setBooks]       = useState([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const LIMIT = 12;
  const [loading, setLoading]   = useState(false);
  const [search, setSearch]     = useState('');
  const [category, setCategory] = useState('');

  const showToast = (message, type = 'success') => setToast({ message, type });

  const loadBooks = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT, search, category };
      const res    = await libraryAPI.getBooks(params);
      const data   = res?.data?.data ?? res?.data ?? [];
      setBooks(Array.isArray(data) ? data : []);
      setTotal(res?.data?.total ?? res?.total ?? 0);
    } catch { showToast('Erreur chargement catalogue', 'error'); }
    finally { setLoading(false); }
  }, [page, LIMIT, search, category]);

  useEffect(() => { loadBooks(); }, [loadBooks]);

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: '' })} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111', margin: 0 }}>📚 Bibliothèque Universitaire</h1>
        <p style={{ fontSize: 13, color: '#9CA3AF', marginTop: 4 }}>Catalogue des ouvrages</p>
      </div>

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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
            {books.map(book => <BookCardReadOnly key={book._id} book={book} />)}
          </div>
          <div style={{ marginTop: 16 }}>
            <Pagination page={page} total={total} limit={LIMIT} onChange={setPage} />
          </div>
        </>
      )}
    </div>
  );
}