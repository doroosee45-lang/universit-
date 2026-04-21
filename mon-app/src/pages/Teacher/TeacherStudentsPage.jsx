// // TeacherStudentsPage.jsx
// import { studentAPI } from '../../services/services';
// import { Card, Table, Pagination, SearchInput, Badge, Avatar } from '../../components/common';
// import { usePagination } from '../../components/hooks/UseFetch';
// import { getStatusColor } from '../../components/utils/Helpers';

// export function TeacherStudentsPage() {
//   const { data, total, page, limit, loading, setPage, search } = usePagination(studentAPI.getAll);

//   const columns = [
//     { header: 'Étudiant', key: 'firstName', render: (_, row) => (
//       <div className="flex items-center gap-3">
//         <Avatar firstName={row.firstName} lastName={row.lastName} size="sm" />
//         <div>
//           <p className="font-medium text-gray-900 text-sm">{row.firstName} {row.lastName}</p>
//           <p className="text-xs text-gray-400">{row.studentId}</p>
//         </div>
//       </div>
//     )},
//     { header: 'Email', key: 'email', render: v => <span className="text-xs">{v}</span> },
//     { header: 'Filière', key: 'program', render: (_, row) => row.program?.name || '—' },
//     { header: 'Niveau', key: 'level', render: (v, row) => `${v} / ${row.currentSemester}` },
//     { header: 'Statut', key: 'status', render: v => <Badge className={getStatusColor(v)}>{v}</Badge> },
//   ];

//   return (
//     <div className="space-y-6">
//       <h1 className="text-2xl font-bold text-gray-900">Mes Étudiants</h1>
//       <Card className="p-4">
//         <SearchInput onChange={v => search({ search: v })} placeholder="Rechercher..." className="max-w-sm" />
//       </Card>
//       <Card>
//         <Table columns={columns} data={data} loading={loading} emptyText="Aucun étudiant" />
//         <Pagination page={page} total={total} limit={limit} onPageChange={setPage} />
//       </Card>
//     </div>
//   );
// }

// export default TeacherStudentsPage;





// TeacherStudentsPage.jsx - version indépendante et corrigée
// TeacherStudentsPage.jsx - version avec filtrage par professeur
import { useState, useEffect, useCallback } from 'react';
import { studentAPI } from '../../services/services';
import { useAuth } from '../../components/context/AuthContext';

// ---------- Composants UI locaux (inchangés) ----------
const Spinner = ({ size = 24 }) => (
  <div className="flex justify-center items-center">
    <div className={`border-2 border-indigo-600 border-t-transparent rounded-full animate-spin`} style={{ width: size, height: size }} />
  </div>
);

const Badge = ({ children, className }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>{children}</span>
);

const Avatar = ({ firstName, lastName, size = 'sm' }) => {
  const initials = `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase() || '?';
  const sizeClass = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';
  return (
    <div className={`${sizeClass} rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-medium`}>
      {initials}
    </div>
  );
};

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-100 ${className}`}>{children}</div>
);

const SearchInput = ({ onChange, placeholder, className = "" }) => (
  <input
    type="text"
    placeholder={placeholder}
    onChange={e => onChange(e.target.value)}
    className={`w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${className}`}
  />
);

const Table = ({ columns, data, loading, emptyText = "Aucune donnée" }) => {
  if (loading) return <div className="flex justify-center py-8"><Spinner size={24} /></div>;
  if (!data || data.length === 0) return <div className="text-center py-8 text-gray-400 text-sm">{emptyText}</div>;
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, rowIdx) => (
            <tr key={row._id || rowIdx} className="hover:bg-gray-50">
              {columns.map((col, colIdx) => (
                <td key={colIdx} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const Pagination = ({ page, total, limit, onPageChange }) => {
  const totalPages = Math.ceil(total / limit);
  if (totalPages <= 1) return null;
  return (
    <div className="flex justify-between items-center px-4 py-3 border-t border-gray-200">
      <button onClick={() => onPageChange(page - 1)} disabled={page === 1} className="px-3 py-1 text-sm bg-gray-100 rounded disabled:opacity-50 hover:bg-gray-200">Précédent</button>
      <span className="text-sm text-gray-600">Page {page} / {totalPages}</span>
      <button onClick={() => onPageChange(page + 1)} disabled={page === totalPages} className="px-3 py-1 text-sm bg-gray-100 rounded disabled:opacity-50 hover:bg-gray-200">Suivant</button>
    </div>
  );
};

const getStatusColor = (status) => {
  const colors = {
    actif: 'bg-green-100 text-green-700',
    inactif: 'bg-red-100 text-red-700',
    suspendu: 'bg-orange-100 text-orange-700',
    diplomé: 'bg-blue-100 text-blue-700',
  };
  return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-600';
};

// ---------- Composant principal ----------
export default function TeacherStudentsPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const loadStudents = useCallback(async () => {
    if (!user?._id) return;
    setLoading(true);
    try {
      const params = { page, limit, teacher: user._id }; // ← Filtre par professeur
      if (searchTerm) params.search = searchTerm;
      const res = await studentAPI.getAll(params);
      const data = res?.data?.data ?? res?.data ?? res ?? [];
      const totalCount = res?.data?.total ?? res?.total ?? 0;
      setStudents(Array.isArray(data) ? data : []);
      setTotal(totalCount);
    } catch (err) {
      console.error("Erreur chargement étudiants:", err);
      setStudents([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [user?._id, page, limit, searchTerm]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const handleSearch = (value) => {
    setSearchTerm(value);
    setPage(1);
  };

  const columns = [
    {
      header: 'Étudiant', key: 'firstName', render: (_, row) => (
        <div className="flex items-center gap-3">
          <Avatar firstName={row?.firstName} lastName={row?.lastName} size="sm" />
          <div>
            <p className="font-medium text-gray-900 text-sm">{row?.firstName || ''} {row?.lastName || ''}</p>
            <p className="text-xs text-gray-400">{row?.studentId || '—'}</p>
          </div>
        </div>
      )
    },
    { header: 'Email', key: 'email', render: v => <span className="text-xs">{v || '—'}</span> },
    { header: 'Filière', key: 'program', render: (_, row) => row?.program?.name || '—' },
    { header: 'Niveau', key: 'level', render: (v, row) => `${v || '—'} / ${row?.currentSemester || '—'}` },
    { header: 'Statut', key: 'status', render: v => <Badge className={getStatusColor(v)}>{v || '—'}</Badge> },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Mes Étudiants</h1>
      <Card className="p-4">
        <SearchInput onChange={handleSearch} placeholder="Rechercher par nom, email, ID..." className="max-w-sm" />
      </Card>
      <Card>
        <Table columns={columns} data={students} loading={loading} emptyText="Aucun étudiant trouvé" />
        <Pagination page={page} total={total} limit={limit} onPageChange={setPage} />
      </Card>
    </div>
  );
}