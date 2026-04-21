// pages/teacher/TeacherLibraryPage.jsx
import { useState, useEffect, useCallback } from 'react';
import { BookOpen, Search, X } from 'lucide-react';
import { libraryAPI } from '../../services/services';
import { useAuth } from '../../components/context/AuthContext';
import { formatDate } from '../../components/utils/helpers';

// (mêmes composants UI locaux que dans StudentLibraryPage)

const CATEGORY_OPTS = [
  { value: '', label: 'Toutes les catégories' },
  { value: 'manuel', label: 'Manuel' },
  { value: 'these', label: 'Thèse' },
  { value: 'memoire', label: 'Mémoire' },
  { value: 'periodique', label: 'Périodique' },
  { value: 'ebook', label: 'E-Book' },
  { value: 'reference', label: 'Référence' },
];

export default function TeacherLibraryPage() {
  const { user } = useAuth();
  const [toast, setToast] = useState({ message: '', type: '' });
  const [books, setBooks] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  const loadBooks = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit, search, category };
      const res = await libraryAPI.getBooks(params);
      setBooks(Array.isArray(res?.data?.data) ? res.data.data : (res?.data || []));
      setTotal(res?.data?.total || res?.total || 0);
    } catch (err) {
      setToast({ message: 'Erreur chargement catalogue', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, category]);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  const columns = [
    {
      header: 'Livre', key: 'title',
      render: (v, row) => (
        <div className="flex items-start gap-3">
          <div className="w-10 h-12 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0"><BookOpen size={18} className="text-indigo-600" /></div>
          <div><p className="font-medium text-gray-900 text-sm">{v}</p><p className="text-xs text-gray-400">{row.author}</p>{row.isbn && <p className="text-xs text-gray-300 font-mono">ISBN: {row.isbn}</p>}</div>
        </div>
      )
    },
    { header: 'Catégorie', key: 'category', render: v => <Badge className="bg-indigo-100 text-indigo-700 capitalize">{v}</Badge> },
    { header: 'Domaine', key: 'domain', render: v => v || '—' },
    {
      header: 'Disponibilité', key: 'availableQuantity',
      render: (v, row) => <div><span className={`font-bold text-lg ${v === 0 ? 'text-red-500' : 'text-green-600'}`}>{v}</span><span className="text-gray-400 text-sm"> / {row.totalQuantity}</span><p className="text-xs text-gray-400">{v === 0 ? 'Indisponible' : 'Disponible'}</p></div>
    },
    { header: 'Localisation', key: 'location', render: v => v || '—' },
    {
      header: 'Type', key: 'isDigital',
      render: (v, row) => v ? <a href={row.digitalUrl} target="_blank" rel="noreferrer" className="text-indigo-600 text-sm hover:underline">📖 Accès en ligne</a> : <span className="text-gray-400 text-sm">Physique</span>
    },
  ];

  return (
    <div className="space-y-6">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: '' })} />
      <div><h1 className="text-2xl font-bold text-gray-900">Bibliothèque Universitaire (Enseignant)</h1><p className="text-sm text-gray-500 mt-1">Catalogue des ouvrages</p></div>

      <Card className="p-4">
        <div className="flex gap-3 flex-wrap">
          <SearchInput value={search} onChange={setSearch} placeholder="Titre, auteur, ISBN..." />
          <Select value={category} onChange={e => setCategory(e.target.value)} options={CATEGORY_OPTS} className="w-48" />
        </div>
      </Card>

      <Card>
        <Table columns={columns} data={books} loading={loading} emptyText="Aucun livre trouvé" />
        <Pagination page={page} total={total} limit={limit} onPageChange={setPage} />
      </Card>
    </div>
  );
}