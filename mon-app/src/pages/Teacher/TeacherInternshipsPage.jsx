// pages/teacher/TeacherInternshipsPage.jsx
import { useState, useEffect, useCallback } from 'react';
import { Briefcase, Building2, Calendar, User, Eye, X } from 'lucide-react';
import { internshipAPI, userAPI } from '../../services/services';
import { useAuth } from '../../components/context/AuthContext';

// Helpers et composants UI (identique à Student, plus Table/Pagination)
const formatDate = (date) => date ? new Date(date).toLocaleDateString('fr-FR') : '—';
const Spinner = ({ size = 24 }) => <div className="flex justify-center"><div className={`border-2 border-indigo-600 border-t-transparent rounded-full animate-spin`} style={{ width: size, height: size }} /></div>;
const Badge = ({ children, className }) => <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>{children}</span>;
const Card = ({ children }) => <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">{children}</div>;
const Table = ({ columns, data, loading, emptyText }) => {
  if (loading) return <div className="py-12 text-center"><Spinner size={32} /></div>;
  if (!data?.length) return <div className="py-12 text-center text-gray-400">{emptyText}</div>;
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">{columns.map(col => <th key={col.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{col.header}</th>)}</thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, idx) => <tr key={idx} className="hover:bg-gray-50">{columns.map(col => <td key={col.key} className="px-6 py-4 text-sm text-gray-700">{col.render ? col.render(row[col.key], row) : row[col.key]}</td>)}</tr>)}
        </tbody>
      </table>
    </div>
  );
};
const Pagination = ({ page, total, limit, onPageChange }) => {
  const pages = Math.ceil(total / limit);
  if (pages <= 1) return null;
  return <div className="flex justify-center gap-2 p-4"><button disabled={page===1} onClick={()=>onPageChange(page-1)} className="px-3 py-1 border rounded">←</button><span>Page {page} / {pages}</span><button disabled={page===pages} onClick={()=>onPageChange(page+1)} className="px-3 py-1 border rounded">→</button></div>;
};
const Select = ({ value, onChange, options }) => <select value={value} onChange={onChange} className="border rounded-lg px-3 py-2 text-sm">{options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select>;

const STATUS_OPTS = [
  { value: '', label: 'Tous les statuts' },
  { value: 'candidature', label: 'Candidature' },
  { value: 'accepted', label: 'Accepté' },
  { value: 'ongoing', label: 'En cours' },
  { value: 'report_submitted', label: 'Rapport soumis' },
  { value: 'defended', label: 'Soutenu' },
  { value: 'validated', label: 'Validé' },
  { value: 'failed', label: 'Échoué' },
];
const STATUS_LABELS = { candidature:'Candidature', accepted:'Accepté', ongoing:'En cours', report_submitted:'Rapport soumis', defended:'Soutenu', validated:'Validé', failed:'Échoué' };
const getStatusColor = (s) => ({ candidature:'#FEF3C7', accepted:'#DBEAFE', ongoing:'#D1FAE5', report_submitted:'#F3E8FF', defended:'#E0E7FF', validated:'#D1FAE5', failed:'#FEE2E2' }[s] || '#F3F4F6');

export default function TeacherInternshipsPage() {
  const { user } = useAuth();
  const [toast, setToast] = useState({ message: '', type: '' });
  const [internships, setInternships] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  const loadInternships = useCallback(async () => {
    if (!user?._id) return;
    setLoading(true);
    try {
      // Appel API qui retourne les stages des étudiants de l'enseignant (via département ou cours)
      const params = { page, limit, teacher: user._id };
      if (statusFilter) params.status = statusFilter;
      const res = await internshipAPI.getTeacherInternships(params);
      const data = res?.data?.data ?? res?.data ?? [];
      setInternships(Array.isArray(data) ? data : []);
      setTotal(res?.data?.total ?? res?.total ?? 0);
    } catch (err) {
      setToast({ message: 'Erreur chargement stages', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [user?._id, page, limit, statusFilter]);

  useEffect(() => { loadInternships(); }, [loadInternships]);

  const columns = [
    { header: 'Étudiant', key: 'student', render: (_, row) => `${row.student?.firstName} ${row.student?.lastName} (${row.student?.studentId})` },
    { header: 'Stage', key: 'title' },
    { header: 'Entreprise', key: 'company', render: (_, row) => row.company?.name },
    { header: 'Début', key: 'startDate', render: v => formatDate(v) },
    { header: 'Fin', key: 'endDate', render: v => formatDate(v) },
    { header: 'Statut', key: 'status', render: v => <Badge className={`bg-${getStatusColor(v)}`}>{STATUS_LABELS[v]}</Badge> },
    { header: 'Actions', key: '_id', render: (_, row) => <button onClick={() => window.open(`/teacher/internships/${row._id}`, '_blank')}><Eye size={16} /></button> },
  ];

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <div><h1 className="text-2xl font-bold">Suivi des Stages (Enseignant)</h1><p className="text-gray-500">Étudiants sous votre encadrement</p></div>
      <Card><div className="p-4"><Select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} options={STATUS_OPTS} /></div></Card>
      <Card><Table columns={columns} data={internships} loading={loading} emptyText="Aucun stage trouvé" /><Pagination page={page} total={total} limit={limit} onPageChange={setPage} /></Card>
    </div>
  );
}