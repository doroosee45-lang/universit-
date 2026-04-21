














// pages/admin/CoursesPage.jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Edit, Trash2, Search, X, ChevronLeft, ChevronRight, Loader2, BookOpen, GraduationCap, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { courseAPI, teacherAPI, programAPI, ueAPI } from '../../services/services';

// ─── HELPER : normalise n'importe quelle réponse de l'API ────────────────────
const extractList = (res, extraKeys = []) => {
  if (!res) return [];
  for (const k of extraKeys) if (Array.isArray(res[k])) return res[k];
  if (Array.isArray(res.data))  return res.data;
  if (Array.isArray(res))       return res;
  return [];
};
const extractTotal = (res, list) => res?.total ?? res?.count ?? list.length;

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
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2">
      {toasts.map(t => (
        <div key={t.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium animate-slide-in
          ${t.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
          {t.type === 'error' ? <AlertCircle size={15} /> : <CheckCircle size={15} />}
          {t.message}
          <button onClick={() => remove(t.id)} className="ml-2 opacity-50 hover:opacity-100"><X size={13} /></button>
        </div>
      ))}
    </div>
  );
}

// ─── UI PRIMITIVES ───────────────────────────────────────────────────────────
const Badge = ({ children, className = '' }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${className}`}>{children}</span>
);

const Spinner = ({ size = 16 }) => <Loader2 size={size} className="animate-spin" />;

function Button({ children, variant = 'primary', size = 'md', loading, disabled, className = '', ...props }) {
  const base = 'inline-flex items-center gap-1.5 font-medium rounded-lg transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary:   'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm',
    secondary: 'bg-white border border-gray-300 hover:bg-gray-50 text-gray-700',
    ghost:     'hover:bg-gray-100 text-gray-600',
    danger:    'bg-red-600 hover:bg-red-700 text-white shadow-sm',
  };
  const sizes = { sm: 'px-2 py-1 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-5 py-2.5 text-base' };
  return (
    <button {...props} disabled={disabled || loading} className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}>
      {loading ? <Spinner size={14} /> : children}
    </button>
  );
}

function Input({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{label}</label>}
      <input
        className={`border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition ${error ? 'border-red-400' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function Select({ label, options = [], className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{label}</label>}
      <select
        className={`border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white transition ${className}`}
        {...props}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

// ─── MODAL ───────────────────────────────────────────────────────────────────
function Modal({ isOpen, onClose, title, children, size = 'md' }) {
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
}

// ─── CONFIRM DIALOG ──────────────────────────────────────────────────────────
function ConfirmDialog({ isOpen, onClose, onConfirm, loading, title, message }) {
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
}

// ─── COURSE FORM (avec UE et Programme) ──────────────────────────────────────
function CourseForm({ course, programs, teachers, ues, onSave, onCancel, toast }) {
  const [form, setForm] = useState(course ? {
    title:        course.title || '',
    code:         course.code || '',
    type:         course.type || 'CM',
    ue:           course.ue?._id || course.ue || '',
    program:      course.program?._id || course.program || '',
    teacher:      course.teacher?._id || course.teacher || '',
    semester:     course.semester || 'S1',
    academicYear: course.academicYear || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
    totalHours:   course.totalHours || 21,
    groups:       course.groups || [],
  } : {
    title: '', code: '', type: 'CM', ue: '', program: '', teacher: '',
    semester: 'S1',
    academicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
    totalHours: 21, groups: [],
  });

  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Filtrer les UE en fonction du programme sélectionné
  const filteredUes = ues.filter(u => u.program?._id === form.program || u.program === form.program);
  const ueOpts = [
    { value: '', label: '-- Sélectionner une UE --' },
    ...filteredUes.map(u => ({ value: u._id, label: `${u.code} - ${u.title}` }))
  ];
  const programOpts = [{ value: '', label: '-- Sélectionner une filière --' }, ...(programs || []).map(p => ({ value: p._id, label: p.name }))];
  const teacherOpts = [{ value: '', label: '-- Sélectionner un enseignant --' }, ...(teachers || []).map(t => ({ value: t._id, label: `${t.firstName} ${t.lastName}` }))];
  const semOpts     = ['S1','S2','S3','S4','S5','S6','S7','S8'].map(s => ({ value: s, label: s }));
  const typeOpts    = ['CM','TD','TP'].map(t => ({ value: t, label: t }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.ue || !form.program) {
      toast('Veuillez sélectionner une UE et une filière', 'error');
      return;
    }
    setLoading(true);
    try {
      if (course?._id) await courseAPI.update(course._id, form);
      else             await courseAPI.create(form);
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
        <Input label="Titre du cours" value={form.title} onChange={e => set('title', e.target.value)} required />
        <Input label="Code" value={form.code} onChange={e => set('code', e.target.value.toUpperCase())} required placeholder="INF101-CM" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Select label="Type"     value={form.type}     onChange={e => set('type', e.target.value)} options={typeOpts} />
        <Select label="Semestre" value={form.semester} onChange={e => set('semester', e.target.value)} options={semOpts} />
      </div>
      <Select label="Filière" value={form.program} onChange={e => { set('program', e.target.value); set('ue', ''); }} options={programOpts} required />
      <Select label="UE rattachée" value={form.ue} onChange={e => set('ue', e.target.value)} options={ueOpts} required />
      <Select label="Enseignant"   value={form.teacher} onChange={e => set('teacher', e.target.value)} options={teacherOpts} />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Volume horaire (h)" type="number" value={form.totalHours}   onChange={e => set('totalHours',   +e.target.value)} />
        <Input label="Année académique"                 value={form.academicYear} onChange={e => set('academicYear',  e.target.value)} />
      </div>
      <Input
        label="Groupes (ex: G1, G2)"
        value={(form.groups || []).join(', ')}
        onChange={e => set('groups', e.target.value.split(',').map(g => g.trim()).filter(Boolean))}
        placeholder="G1, G2, G3"
      />
      <div className="flex gap-3 pt-2">
        <Button variant="secondary" type="button" onClick={onCancel} className="flex-1">Annuler</Button>
        <Button type="submit" loading={loading} className="flex-1">{course ? 'Mettre à jour' : 'Créer'}</Button>
      </div>
    </form>
  );
}

// ─── CONSTANTES ──────────────────────────────────────────────────────────────
const TYPE_OPTS = [
  { value: '',   label: 'Tous les types' },
  { value: 'CM', label: 'CM - Cours Magistral' },
  { value: 'TD', label: 'TD - Travaux Dirigés' },
  { value: 'TP', label: 'TP - Travaux Pratiques' },
];

const TYPE_COLORS = {
  CM: 'bg-blue-100 text-blue-700',
  TD: 'bg-green-100 text-green-700',
  TP: 'bg-purple-100 text-purple-700',
};

// ─── PAGE PRINCIPALE ─────────────────────────────────────────────────────────
export default function CoursesPage() {
  const { toast, toasts, remove } = useToast();

  const [courses,   setCourses]   = useState([]);
  const [total,     setTotal]     = useState(0);
  const [loading,   setLoading]   = useState(false);
  const [programs,  setPrograms]  = useState([]);
  const [teachers,  setTeachers]  = useState([]);
  const [ues,       setUes]       = useState([]);

  const [page,    setPage]    = useState(1);
  const limit = 10;
  const [filters, setFilters] = useState({ search: '', type: '' });
  const searchTimer = useRef(null);

  const [modal,        setModal]        = useState({ open: false, course: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, course: null });
  const [deleting,     setDeleting]     = useState(false);

  // ── Chargement cours ─────────────────────────────────────────────────────
  const fetchCourses = useCallback(async (p = page, f = filters) => {
    setLoading(true);
    try {
      const res  = await courseAPI.getAll({ page: p, limit, ...f });
      const list = extractList(res, ['courses']);
      setCourses(list);
      setTotal(extractTotal(res, list));
    } catch (err) {
      toast(err.message || 'Erreur de chargement', 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // ── Chargement des listes de référence ───────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const [p, t, u] = await Promise.all([
          programAPI.getAll({ limit: 200 }),
          teacherAPI.getAll({ limit: 200 }),
          ueAPI.getAll({ limit: 500 }),
        ]);
        setPrograms(extractList(p, ['programs']));
        setTeachers(extractList(t, ['teachers']));
        setUes(extractList(u, ['ues']));
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  useEffect(() => { fetchCourses(page, filters); }, [page, filters, fetchCourses]);

  const handleFilterChange = (k, v) => {
    const f = { ...filters, [k]: v };
    setFilters(f);
    setPage(1);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => fetchCourses(1, f), k === 'search' ? 400 : 0);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await courseAPI.delete(deleteDialog.course._id);
      setDeleteDialog({ open: false, course: null });
      toast('Cours supprimé avec succès');
      fetchCourses();
    } catch (err) {
      toast(err.message || 'Erreur lors de la suppression', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { font-family: 'Plus Jakarta Sans', sans-serif; box-sizing: border-box; }
        @keyframes slide-in { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }
        .animate-slide-in { animation: slide-in 0.25s ease; }
        @keyframes fade-in  { from { opacity:0; transform:translateY(8px);  } to { opacity:1; transform:translateY(0);  } }
        .animate-fade-in  { animation: fade-in  0.3s  ease; }
      `}</style>

      <Toast toasts={toasts} remove={remove} />

      <div className="min-h-screen bg-gray-50 p-6 animate-fade-in">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* En-tête */}
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                  <BookOpen size={20} className="text-white" />
                </div>
                <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Gestion des Cours</h1>
              </div>
              <p className="text-sm text-gray-500 ml-[52px]">
                {loading ? 'Chargement...' : `${total} cours au total`}
              </p>
            </div>
            <Button onClick={() => setModal({ open: true, course: null })}>
              <Plus size={16} /> Nouveau cours
            </Button>
          </div>

          {/* Cartes stats cliquables */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Cours Magistraux',  type: 'CM', color: 'bg-blue-50   text-blue-700   border-blue-200',   icon: GraduationCap },
              { label: 'Travaux Dirigés',   type: 'TD', color: 'bg-green-50  text-green-700  border-green-200',  icon: BookOpen },
              { label: 'Travaux Pratiques', type: 'TP', color: 'bg-purple-50 text-purple-700 border-purple-200', icon: Clock },
            ].map(({ label, type, color, icon: Icon }) => (
              <div key={type}
                onClick={() => handleFilterChange('type', filters.type === type ? '' : type)}
                className={`rounded-xl border p-4 flex items-center gap-3 cursor-pointer transition-all hover:shadow-md ${color}
                  ${filters.type === type ? 'ring-2 ring-offset-1 ring-indigo-400' : ''}`}>
                <Icon size={20} />
                <div>
                  <p className="text-xs font-semibold opacity-70">{label}</p>
                  <p className="text-lg font-bold">{courses.filter(c => c.type === type).length}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Filtres */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex gap-3 flex-wrap">
              <div className="relative flex-1 min-w-48">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={filters.search}
                  onChange={e => handleFilterChange('search', e.target.value)}
                  placeholder="Rechercher par titre, code..."
                  className="w-full border border-gray-200 rounded-lg pl-9 pr-9 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                {filters.search && (
                  <button onClick={() => handleFilterChange('search', '')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X size={13} />
                  </button>
                )}
              </div>
              <select
                value={filters.type}
                onChange={e => handleFilterChange('type', e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white w-52"
              >
                {TYPE_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {/* Tableau */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
                <Spinner size={32} />
                <p className="text-sm">Chargement des cours...</p>
              </div>
            ) : courses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
                <BookOpen size={40} strokeWidth={1.2} />
                <p className="text-sm font-medium">Aucun cours trouvé</p>
                <Button onClick={() => setModal({ open: true, course: null })} size="sm">
                  <Plus size={14} /> Créer le premier cours
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/60">
                      {['Cours', 'Type', 'UE', 'Filière', 'Enseignant', 'Semestre', 'Volume', 'Actions'].map(h => (
                        <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {courses.map(row => (
                      <tr key={row._id} className="hover:bg-indigo-50/30 transition-colors group">
                        <td className="px-5 py-3.5">
                          <p className="font-semibold text-gray-900 text-sm">{row.title}</p>
                          <p className="text-xs text-gray-400 font-mono mt-0.5">{row.code}</p>
                        </td>
                        <td className="px-5 py-3.5">
                          <Badge className={TYPE_COLORS[row.type] || 'bg-gray-100 text-gray-700'}>{row.type}</Badge>
                        </td>
                        <td className="px-5 py-3.5">
                          {row.ue ? `${row.ue?.code || '—'} ${row.ue?.title ? `- ${row.ue.title}` : ''}` : <span className="text-gray-300">—</span>}
                        </td>
                        <td className="px-5 py-3.5">
                          {row.program ? <span className="font-medium">{row.program?.name || '—'}</span> : <span className="text-gray-300">—</span>}
                        </td>
                        <td className="px-5 py-3.5">
                          {row.teacher ? `${row.teacher?.firstName || ''} ${row.teacher?.lastName || ''}` : <span className="text-gray-300">Non assigné</span>}
                        </td>
                        <td className="px-5 py-3.5">
                          <Badge className="bg-gray-100 text-gray-600">{row.semester}</Badge>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="font-bold text-indigo-600 text-sm">{row.totalHours}h</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setModal({ open: true, course: row })}
                              className="p-1.5 rounded-lg hover:bg-indigo-100 transition-colors" title="Modifier">
                              <Edit size={14} className="text-indigo-500" />
                            </button>
                            <button onClick={() => setDeleteDialog({ open: true, course: row })}
                              className="p-1.5 rounded-lg hover:bg-red-100 transition-colors" title="Supprimer">
                              <Trash2 size={14} className="text-red-500" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50/50">
                <p className="text-xs text-gray-500">
                  Page <span className="font-semibold">{page}</span> sur <span className="font-semibold">{totalPages}</span> · {total} résultats
                </p>
                <div className="flex gap-1">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    className="p-1.5 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition">
                    <ChevronLeft size={15} />
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                    return (
                      <button key={p} onClick={() => setPage(p)}
                        className={`w-8 h-8 rounded-lg text-xs font-semibold transition
                          ${p === page ? 'bg-indigo-600 text-white' : 'border border-gray-200 hover:bg-white text-gray-600'}`}>
                        {p}
                      </button>
                    );
                  })}
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    className="p-1.5 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition">
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal création / édition */}
      <Modal isOpen={modal.open} onClose={() => setModal({ open: false, course: null })}
        title={modal.course ? 'Modifier le cours' : 'Nouveau cours'} size="lg">
        <CourseForm
          course={modal.course}
          programs={programs}
          teachers={teachers}
          ues={ues}
          toast={toast}
          onSave={() => { setModal({ open: false, course: null }); toast('Cours sauvegardé avec succès'); fetchCourses(); }}
          onCancel={() => setModal({ open: false, course: null })}
        />
      </Modal>

      {/* Modal confirmation suppression */}
      <ConfirmDialog
        isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, course: null })}
        onConfirm={handleDelete}
        loading={deleting}
        title="Supprimer le cours"
        message={`Voulez-vous vraiment supprimer "${deleteDialog.course?.title}" ? Cette action est irréversible.`}
      />
    </>
  );
}