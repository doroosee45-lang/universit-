// pages/admin/UEAdminPage.jsx
import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, X, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { ueAPI, programAPI, teacherAPI } from '../../services/services';

// ─── TOAST ───────────────────────────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([]);
  const toast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  }, []);
  const remove = useCallback(id => setToasts(p => p.filter(t => t.id !== id)), []);
  return { toast, toasts, remove };
}

function Toast({ toasts, remove }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map(t => (
        <div key={t.id} className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg text-sm font-medium
          ${t.type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
          {t.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
          {t.message}
          <button onClick={() => remove(t.id)} className="ml-2 opacity-70 hover:opacity-100"><X size={14} /></button>
        </div>
      ))}
    </div>
  );
}

// ─── UI PRIMITIVES ───────────────────────────────────────────────────────────
const Spinner = ({ size = 24 }) => <Loader2 size={size} className="animate-spin" />;

const Badge = ({ children, className = '' }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>{children}</span>
);

const Button = ({ children, onClick, variant = 'primary', size = 'md', loading, disabled, type = 'button', className = '' }) => {
  const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors disabled:opacity-50';
  const variants = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    ghost: 'hover:bg-gray-100 text-gray-600',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
  };
  const sizes = { sm: 'px-2 py-1 text-xs', md: 'px-3 py-1.5 text-sm', lg: 'px-4 py-2' };
  return (
    <button type={type} onClick={onClick} disabled={loading || disabled} className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}>
      {loading && <Spinner size={14} />}
      {children}
    </button>
  );
};

const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-100 ${className}`}>{children}</div>
);

const Input = ({ label, value, onChange, type = 'text', required, placeholder }) => (
  <div className="flex flex-col gap-1">
    {label && <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{label} {required && '*'}</label>}
    <input type={type} value={value} onChange={onChange} required={required} placeholder={placeholder}
      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
  </div>
);

const Select = ({ label, value, onChange, options, required, placeholder }) => (
  <div className="flex flex-col gap-1">
    {label && <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{label} {required && '*'}</label>}
    <select value={value} onChange={onChange} required={required}
      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white">
      <option value="">{placeholder || 'Sélectionner...'}</option>
      {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
  </div>
);

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;
  const widths = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${widths[size]} max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition"><X size={18} /></button>
        </div>
        <div className="overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
};

const ConfirmDialog = ({ isOpen, onClose, onConfirm, loading, title, message }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <Trash2 size={18} className="text-red-600" />
          </div>
          <h3 className="font-bold text-gray-900">{title}</h3>
        </div>
        <p className="text-sm text-gray-500 mb-5">{message}</p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose} className="flex-1">Annuler</Button>
          <Button variant="danger" loading={loading} onClick={onConfirm} className="flex-1">Supprimer</Button>
        </div>
      </div>
    </div>
  );
};

const Table = ({ columns, data, loading, emptyText = 'Aucune donnée' }) => {
  if (loading) return <div className="flex justify-center py-12"><Spinner size={32} /></div>;
  if (!data || data.length === 0) return <div className="text-center py-12 text-gray-400">{emptyText}</div>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b">
          <tr>{columns.map(col => <th key={col.key} className="px-4 py-3 text-left font-semibold text-gray-600">{col.header}</th>)}</tr>
        </thead>
        <tbody className="divide-y">
          {data.map((row, idx) => (
            <tr key={idx} className="hover:bg-gray-50">
              {columns.map(col => <td key={col.key} className="px-4 py-3">{col.render ? col.render(row[col.key], row) : row[col.key]}</td>)}
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
    <div className="flex justify-center gap-2 px-4 py-3 border-t">
      <button onClick={() => onPageChange(page - 1)} disabled={page === 1} className="px-3 py-1 border rounded disabled:opacity-50">←</button>
      <span className="text-sm text-gray-600">Page {page} / {totalPages}</span>
      <button onClick={() => onPageChange(page + 1)} disabled={page === totalPages} className="px-3 py-1 border rounded disabled:opacity-50">→</button>
    </div>
  );
};

// ─── CONSTANTES ──────────────────────────────────────────────────────────────
const SEMESTER_OPTS_FULL = ['S1','S2','S3','S4','S5','S6'].map(s => ({ value: s, label: s }));

// ─── UE FORM ─────────────────────────────────────────────────────────────────
function UEForm({ ue, programs, teachers, onSave, onCancel, toast }) {
  const [form, setForm] = useState(ue || {
    code: '', title: '', credits: 6, coefficient: 1, semester: 'S1',
    program: '', responsibleTeacher: '', description: '',
    evaluationWeights: { cc: 40, partiel: 20, final: 40 }
  });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setWeight = (k, v) => setForm(f => ({ ...f, evaluationWeights: { ...f.evaluationWeights, [k]: v } }));

  const programOpts = programs.map(p => ({ value: p._id, label: p.name }));
  const teacherOpts = teachers.map(t => ({ value: t._id, label: `${t.firstName} ${t.lastName}` }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.code || !form.title || !form.program) {
      toast('Code, titre et programme sont obligatoires', 'error');
      return;
    }
    setLoading(true);
    try {
      if (ue?._id) await ueAPI.update(ue._id, form);
      else await ueAPI.create(form);
      toast(ue ? 'UE mise à jour' : 'UE créée avec succès');
      onSave();
    } catch (err) {
      toast(err.message || 'Erreur lors de la sauvegarde', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input label="Code" value={form.code} onChange={e => set('code', e.target.value.toUpperCase())} required placeholder="INF101" />
        <Input label="Titre" value={form.title} onChange={e => set('title', e.target.value)} required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Crédits ECTS" type="number" value={form.credits} onChange={e => set('credits', +e.target.value)} />
        <Input label="Coefficient" type="number" step="0.5" value={form.coefficient} onChange={e => set('coefficient', +e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Select label="Semestre" value={form.semester} onChange={e => set('semester', e.target.value)} options={SEMESTER_OPTS_FULL} />
        <Select label="Programme (Filière)" value={form.program} onChange={e => set('program', e.target.value)} options={programOpts} required placeholder="Choisir une filière" />
      </div>
      <Select label="Enseignant responsable" value={form.responsibleTeacher} onChange={e => set('responsibleTeacher', e.target.value)} options={teacherOpts} placeholder="Choisir un enseignant" />
      <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-600 uppercase">Coefficients d'évaluation (%)</label>
        <div className="grid grid-cols-3 gap-3">
          <Input label="CC" type="number" value={form.evaluationWeights.cc} onChange={e => setWeight('cc', +e.target.value)} />
          <Input label="Partiel" type="number" value={form.evaluationWeights.partiel} onChange={e => setWeight('partiel', +e.target.value)} />
          <Input label="Final" type="number" value={form.evaluationWeights.final} onChange={e => setWeight('final', +e.target.value)} />
        </div>
      </div>
      <Input label="Description" value={form.description} onChange={e => set('description', e.target.value)} placeholder="Objectifs et contenu" />
      <div className="flex gap-3 pt-2">
        <Button variant="secondary" type="button" onClick={onCancel} className="flex-1">Annuler</Button>
        <Button type="submit" loading={loading} className="flex-1">{ue ? 'Mettre à jour' : 'Créer'}</Button>
      </div>
    </form>
  );
}

// ─── PAGE PRINCIPALE ─────────────────────────────────────────────────────────
export default function UEAdminPage() {
  const { toast, toasts, remove } = useToast();
  const [ues, setUes] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10);
  const [filters, setFilters] = useState({ semester: '', program: '' });
  const [modal, setModal] = useState({ open: false, ue: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, ue: null });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadPrograms();
    loadTeachers();
  }, []);

  useEffect(() => {
    loadUEs();
  }, [page, filters]);

  const loadPrograms = async () => {
    try {
      const res = await programAPI.getAll({ limit: 200 });
      setPrograms(res.data?.data || res.data || []);
    } catch (error) {
      console.error('Erreur chargement programmes:', error);
    }
  };

  const loadTeachers = async () => {
    try {
      const res = await teacherAPI.getAll({ limit: 200 });
      setTeachers(res.data?.data || res.data || []);
    } catch (error) {
      console.error('Erreur chargement enseignants:', error);
      setTeachers([]);
    }
  };

  const loadUEs = async () => {
    setLoading(true);
    try {
      const params = { page, limit, ...filters };
      Object.keys(params).forEach(key => !params[key] && delete params[key]);
      const res = await ueAPI.getAll(params);
      setUes(res.data?.data || res.data || []);
      setTotal(res.data?.total || res.total || 0);
    } catch (error) {
      console.error('Erreur chargement UE:', error);
      toast('Erreur lors du chargement des UE', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await ueAPI.delete(deleteDialog.ue._id);
      setDeleteDialog({ open: false, ue: null });
      loadUEs();
      toast('UE supprimée avec succès');
    } catch (err) {
      toast(err.message || 'Erreur lors de la suppression', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    { header: 'Code / Titre', key: 'code', render: (v, row) => <div><div className="font-semibold">{v}</div><div className="text-xs text-gray-500">{row.title}</div></div> },
    { header: 'Crédits', key: 'credits', render: v => `${v} ECTS` },
    { header: 'Coef.', key: 'coefficient' },
    { header: 'Semestre', key: 'semester' },
    { header: 'Programme', key: 'program', render: (_, row) => row.program?.name || '—' },
    { header: 'Responsable', key: 'responsibleTeacher', render: (_, row) => row.responsibleTeacher ? `${row.responsibleTeacher.firstName} ${row.responsibleTeacher.lastName}` : '—' },
    { header: 'Actions', key: '_id', render: (_, row) => (
      <div className="flex gap-1">
        <Button size="sm" variant="ghost" onClick={() => setModal({ open: true, ue: row })}><Edit size={14} className="text-indigo-500" /></Button>
        <Button size="sm" variant="ghost" onClick={() => setDeleteDialog({ open: true, ue: row })}><Trash2 size={14} className="text-red-500" /></Button>
      </div>
    ) },
  ];

  const semesterFilterOpts = [
    { value: '', label: 'Tous les semestres' },
    ...SEMESTER_OPTS_FULL
  ];
  const programFilterOpts = [
    { value: '', label: 'Tous les programmes' },
    ...programs.map(p => ({ value: p._id, label: p.name }))
  ];

  return (
    <>
      <Toast toasts={toasts} remove={remove} />
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* En-tête */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Unités d'Enseignement (UE)</h1>
              <p className="text-sm text-gray-500 mt-1">{total} UE{total > 1 ? 's' : ''}</p>
            </div>
            <Button onClick={() => setModal({ open: true, ue: null })}><Plus size={16} /> Nouvelle UE</Button>
          </div>

          {/* Filtres */}
          <Card className="p-4">
            <div className="flex gap-3 flex-wrap">
              <Select value={filters.semester} onChange={e => handleFilter('semester', e.target.value)} options={semesterFilterOpts} className="w-40" />
              <Select value={filters.program} onChange={e => handleFilter('program', e.target.value)} options={programFilterOpts} className="w-64" />
            </div>
          </Card>

          {/* Tableau */}
          <Card>
            <Table columns={columns} data={ues} loading={loading} emptyText="Aucune UE trouvée" />
            <Pagination page={page} total={total} limit={limit} onPageChange={setPage} />
          </Card>

          {/* Modal */}
          <Modal isOpen={modal.open} onClose={() => setModal({ open: false, ue: null })} title={modal.ue ? 'Modifier l\'UE' : 'Créer une UE'} size="lg">
            <UEForm
              ue={modal.ue}
              programs={programs}
              teachers={teachers}
              toast={toast}
              onSave={() => { setModal({ open: false, ue: null }); loadUEs(); toast('UE sauvegardée'); }}
              onCancel={() => setModal({ open: false, ue: null })}
            />
          </Modal>

          {/* Confirmation suppression */}
          <ConfirmDialog
            isOpen={deleteDialog.open}
            onClose={() => setDeleteDialog({ open: false, ue: null })}
            onConfirm={handleDelete}
            loading={deleting}
            title="Supprimer l'UE"
            message={`Supprimer l'UE "${deleteDialog.ue?.code} - ${deleteDialog.ue?.title}" ?`}
          />
        </div>
      </div>
    </>
  );
}