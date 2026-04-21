

// TeacherAssignmentsPage.jsx - version complète et autonome// TeacherAssignmentsPage.jsx - version stable, sans boucle infinie
import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { api } from '../../services/client';
import { formatDate } from '../../components/utils/helpers';
import { useAuth } from '../../components/context/AuthContext';

// ---------- Services API ----------
const courseAPI = {
  getAll: (params) => api.get('/courses', params),
};
const ueAPI = {
  getAll: (params) => api.get('/ues', params),
};
const assignmentAPI = {
  getAll: (params) => api.get('/assignments', params),
  create: (data) => api.post('/assignments', data),
  update: (id, data) => api.put(`/assignments/${id}`, data),
  delete: (id) => api.delete(`/assignments/${id}`),
};

const TYPE_OPTS = [
  { value: 'devoir_maison', label: 'Devoir maison' },
  { value: 'tp', label: 'TP' },
  { value: 'projet', label: 'Projet' },
  { value: 'expose', label: 'Exposé' },
  { value: 'rapport', label: 'Rapport' },
  { value: 'autre', label: 'Autre' },
];

// ---------- Composants UI locaux ----------
const Toast = ({ message, type, onClose }) => {
  if (!message) return null;
  return (
    <div className={`fixed bottom-4 right-4 z-50 ${type === 'error' ? 'bg-red-500' : 'bg-green-500'} text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2`}>
      <span>{message}</span>
      <button onClick={onClose} className="hover:opacity-80"><X size={16} /></button>
    </div>
  );
};

const Spinner = ({ size = 24 }) => (
  <div className="flex justify-center items-center">
    <div className={`border-2 border-indigo-600 border-t-transparent rounded-full animate-spin`} style={{ width: size, height: size }} />
  </div>
);

const Badge = ({ children, className }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>{children}</span>
);

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;
  const sizeClass = size === 'lg' ? 'max-w-2xl' : size === 'xl' ? 'max-w-4xl' : 'max-w-md';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className={`bg-white rounded-xl shadow-xl ${sizeClass} w-full mx-4 max-h-[90vh] overflow-y-auto`} onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100"><X size={20} /></button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

const ConfirmDialog = ({ isOpen, onClose, onConfirm, loading, title, message }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">Annuler</button>
          <button onClick={onConfirm} disabled={loading} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">
            {loading ? <Spinner size={16} /> : 'Supprimer'}
          </button>
        </div>
      </div>
    </div>
  );
};

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
                  {col.render ? col.render(row[col.key], row) : row[col.key] ?? '—'}
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

const Input = ({ label, value, onChange, type = "text", required = false, className = "" }) => (
  <div className="space-y-1.5">
    {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
    <input type={type} value={value} onChange={onChange} required={required} className={`w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${className}`} />
  </div>
);

const Select = ({ label, value, onChange, options, required = false }) => (
  <div className="space-y-1.5">
    {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
    <select value={value} onChange={onChange} required={required} className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500">
      {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
  </div>
);

const Card = ({ children, className = "" }) => <div className={`bg-white rounded-xl shadow-sm border border-gray-100 ${className}`}>{children}</div>;

const Button = ({ children, onClick, variant = "primary", size = "md", type = "button", loading = false, className = "" }) => {
  const base = "rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50";
  const sizes = { sm: "px-2 py-1 text-xs", md: "px-4 py-2 text-sm", lg: "px-5 py-2.5 text-base" };
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200",
    ghost: "bg-transparent hover:bg-gray-100 text-gray-600"
  };
  return (
    <button type={type} onClick={onClick} disabled={loading} className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}>
      {loading && <Spinner size={16} />}{children}
    </button>
  );
};

// ---------- Formulaire de devoir ----------
function AssignmentForm({ assignment, courses, ues, onSave, onCancel }) {
  const { user } = useAuth();
  const [form, setForm] = useState(assignment || {
    title: '', description: '', course: '', ue: '', dueDate: '',
    maxScore: 20, type: 'devoir_maison', isGroupWork: false, weight: 0,
    isPublished: false, academicYear: `${new Date().getFullYear()}-${new Date().getFullYear()+1}`,
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '' });

  const setField = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const courseOpts = [{ value: '', label: 'Sélectionner un cours' }, ...(courses || []).map(c => ({ value: c._id, label: `${c.code} - ${c.title}` }))];
  const ueOpts = [{ value: '', label: 'Sélectionner une UE' }, ...(ues || []).map(u => ({ value: u._id, label: `${u.code} - ${u.title}` }))];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = { ...form, teacher: user._id };
      if (assignment?._id) await assignmentAPI.update(assignment._id, data);
      else await assignmentAPI.create(data);
      onSave();
    } catch (err) {
      setToast({ message: err.message || "Erreur lors de l'enregistrement", type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {toast.message && <Toast {...toast} onClose={() => setToast({ message: '', type: '' })} />}
      <Input label="Titre du devoir" value={form.title} onChange={e => setField('title', e.target.value)} required />
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea value={form.description} onChange={e => setField('description', e.target.value)} rows={3}
          className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Select label="Cours" value={form.course} onChange={e => setField('course', e.target.value)} options={courseOpts} />
        <Select label="UE" value={form.ue} onChange={e => setField('ue', e.target.value)} options={ueOpts} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Select label="Type" value={form.type} onChange={e => setField('type', e.target.value)} options={TYPE_OPTS} />
        <Input label="Date limite" type="datetime-local" value={form.dueDate?.substring(0, 16)} onChange={e => setField('dueDate', e.target.value)} required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Note max" type="number" min="0" max="20" value={form.maxScore} onChange={e => setField('maxScore', +e.target.value)} />
        <Input label="Poids CC (%)" type="number" min="0" max="100" value={form.weight} onChange={e => setField('weight', +e.target.value)} />
      </div>
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.isGroupWork} onChange={e => setField('isGroupWork', e.target.checked)} className="rounded" />
          <span className="text-sm text-gray-700">Travail de groupe</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.isPublished} onChange={e => setField('isPublished', e.target.checked)} className="rounded" />
          <span className="text-sm text-gray-700">Publier</span>
        </label>
      </div>
      <div className="flex gap-3 pt-2">
        <Button variant="secondary" type="button" onClick={onCancel} className="flex-1">Annuler</Button>
        <Button type="submit" loading={loading} className="flex-1">{assignment ? 'Mettre à jour' : 'Créer'}</Button>
      </div>
    </form>
  );
}

// ---------- Composant principal (corrigé : plus de boucle infinie) ----------
export default function TeacherAssignmentsPage() {
  const { user } = useAuth();
  const [toast, setToast] = useState({ message: '', type: '' });

  // États pour les données de référence (courses, ues) – chargés une seule fois
  const [courses, setCourses] = useState([]);
  const [ues, setUes] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // États pour les devoirs avec pagination
  const [assignments, setAssignments] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [loadingAssignments, setLoadingAssignments] = useState(false);

  // États modaux
  const [modal, setModal] = useState({ open: false, item: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, item: null });
  const [deleting, setDeleting] = useState(false);

  // Chargement unique des courses et UE (pas de boucle)
  useEffect(() => {
    const loadCoursesAndUes = async () => {
      if (!user?._id) return;
      try {
        const [coursesRes, uesRes] = await Promise.all([
          courseAPI.getAll({ teacher: user._id, limit: 100 }),
          ueAPI.getAll({ limit: 200 })
        ]);
        const coursesData = coursesRes?.data?.data ?? coursesRes?.data ?? coursesRes ?? [];
        const uesData = uesRes?.data?.data ?? uesRes?.data ?? uesRes ?? [];
        setCourses(Array.isArray(coursesData) ? coursesData : []);
        setUes(Array.isArray(uesData) ? uesData : []);
      } catch (err) {
        console.error("Erreur chargement courses/ues:", err);
        setToast({ message: "Erreur chargement des données", type: 'error' });
      } finally {
        setLoadingInitial(false);
      }
    };
    loadCoursesAndUes();
  }, [user?._id]); // dépendance stable

  // Chargement des devoirs (dépend de la page)
  const loadAssignments = useCallback(async () => {
    if (!user?._id) return;
    setLoadingAssignments(true);
    try {
      const res = await assignmentAPI.getAll({ teacher: user._id, page, limit });
      const data = res?.data?.data ?? res?.data ?? [];
      const totalCount = res?.data?.total ?? res?.total ?? 0;
      setAssignments(Array.isArray(data) ? data : []);
      setTotal(totalCount);
    } catch (err) {
      console.error("Erreur chargement devoirs:", err);
      setAssignments([]);
      setTotal(0);
    } finally {
      setLoadingAssignments(false);
    }
  }, [user?._id, page, limit]);

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]); // ne change que quand page ou user._id change

  const refetch = () => loadAssignments();

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await assignmentAPI.delete(deleteDialog.item._id);
      setDeleteDialog({ open: false, item: null });
      refetch();
      setToast({ message: 'Devoir supprimé', type: 'success' });
    } catch (err) {
      setToast({ message: err.message || 'Erreur lors de la suppression', type: 'error' });
    } finally {
      setDeleting(false);
    }
  };

  const TYPE_LABELS = {
    devoir_maison: 'Devoir', tp: 'TP', projet: 'Projet', expose: 'Exposé', rapport: 'Rapport', autre: 'Autre'
  };

  const columns = [
    {
      header: 'Titre', key: 'title', render: (v, row) => (
        <div><p className="font-medium text-gray-900 text-sm">{v}</p><p className="text-xs text-gray-400">{row.course?.title}</p></div>
      )
    },
    { header: 'Type', key: 'type', render: v => <Badge className="bg-indigo-100 text-indigo-700">{TYPE_LABELS[v] || v}</Badge> },
    {
      header: 'Date limite', key: 'dueDate', render: v => {
        const isOverdue = new Date(v) < new Date();
        return <span className={isOverdue ? 'text-red-600 font-semibold' : ''}>{formatDate(v)}</span>;
      }
    },
    { header: 'Note max', key: 'maxScore', render: v => `/${v}` },
    {
      header: 'Publié', key: 'isPublished', render: v => v
        ? <Badge className="bg-green-100 text-green-700">Publié</Badge>
        : <Badge className="bg-gray-100 text-gray-500">Brouillon</Badge>
    },
    {
      header: 'Actions', key: '_id', render: (_, row) => (
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={() => setModal({ open: true, item: row })}><Edit size={13} className="text-indigo-500" /></Button>
          <Button size="sm" variant="ghost" onClick={() => setDeleteDialog({ open: true, item: row })}><Trash2 size={13} className="text-red-500" /></Button>
        </div>
      )
    },
  ];

  if (loadingInitial) {
    return <div className="flex justify-center items-center h-64"><Spinner size={40} /></div>;
  }

  return (
    <div className="space-y-6">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: '' })} />
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Devoirs & Travaux</h1>
          <p className="text-sm text-gray-500 mt-1">{total} devoir{total > 1 ? 's' : ''}</p>
        </div>
        <Button onClick={() => setModal({ open: true, item: null })}><Plus size={16} /> Nouveau devoir</Button>
      </div>

      <Card>
        <Table columns={columns} data={assignments} loading={loadingAssignments} emptyText="Aucun devoir créé" />
        <Pagination page={page} total={total} limit={limit} onPageChange={setPage} />
      </Card>

      <Modal isOpen={modal.open} onClose={() => setModal({ open: false, item: null })} title={modal.item ? 'Modifier le devoir' : 'Nouveau devoir'} size="lg">
        <AssignmentForm
          assignment={modal.item}
          courses={courses}
          ues={ues}
          onSave={() => {
            setModal({ open: false, item: null });
            refetch();
            setToast({ message: 'Devoir sauvegardé', type: 'success' });
          }}
          onCancel={() => setModal({ open: false, item: null })}
        />
      </Modal>

      <ConfirmDialog
        isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, item: null })}
        onConfirm={handleDelete}
        loading={deleting}
        title="Supprimer le devoir"
        message={`Supprimer "${deleteDialog.item?.title}" ?`}
      />
    </div>
  );
}