import { useState, useEffect, useCallback } from 'react';
import {
  Plus, Edit, Trash2, X, Loader2, AlertCircle, CheckCircle,
  BookOpen, ChevronDown, ChevronRight, GraduationCap, List
} from 'lucide-react';
import { programAPI, ueAPI, teacherAPI } from '../../services/services';

// ─── CONSTANTES ───────────────────────────────────────────────────────────────
const LEVELS = ['L1', 'L2', 'L3', 'M1', 'M2', 'D1', 'D2', 'D3', 'BTS1', 'BTS2'];
const SEMESTERS = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9', 'S10'];
const PROGRAM_TYPES = ['Licence', 'Master', 'Doctorat', 'BUT', 'BTS', 'Ingénieur', 'Autre'];

const getCurrentAcademicYear = () => {
  const y = new Date().getFullYear();
  return `${y}-${y + 1}`;
};

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

function ToastContainer({ toasts, remove }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map(t => (
        <div key={t.id} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-lg text-sm font-medium
          ${t.type === 'error' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}>
          {t.type === 'error' ? <AlertCircle size={15} /> : <CheckCircle size={15} />}
          <span>{t.message}</span>
          <button onClick={() => remove(t.id)} className="ml-1 opacity-70 hover:opacity-100">
            <X size={13} />
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── UI PRIMITIVES ────────────────────────────────────────────────────────────
const Spinner = ({ size = 24 }) => (
  <Loader2 size={size} className="animate-spin text-indigo-500" />
);

const Badge = ({ children, className = '' }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>
    {children}
  </span>
);

const Button = ({ children, onClick, variant = 'primary', size = 'md', loading, disabled, type = 'button', className = '' }) => {
  const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary:   'bg-indigo-600 hover:bg-indigo-700 text-white',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-800',
    ghost:     'hover:bg-gray-100 text-gray-600',
    danger:    'bg-red-600 hover:bg-red-700 text-white',
  };
  const sizes = { sm: 'px-2.5 py-1.5 text-xs', md: 'px-4 py-2 text-sm', icon: 'p-2' };
  return (
    <button
      type={type} onClick={onClick}
      disabled={loading || disabled}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {loading && <Spinner size={14} />}
      {children}
    </button>
  );
};

const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 ${className}`}>{children}</div>
);

const InputField = ({ label, value, onChange, type = 'text', required, placeholder, min, max, step }) => (
  <div className="flex flex-col gap-1">
    {label && (
      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
        {label}{required && ' *'}
      </label>
    )}
    <input
      type={type} value={value} onChange={onChange}
      required={required} placeholder={placeholder}
      min={min} max={max} step={step}
      className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
    />
  </div>
);

const SelectField = ({ label, value, onChange, options, required, placeholder }) => (
  <div className="flex flex-col gap-1">
    {label && (
      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
        {label}{required && ' *'}
      </label>
    )}
    <select
      value={value} onChange={onChange} required={required}
      className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
    >
      {placeholder && <option value="">{placeholder}</option>}
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
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto p-6">{children}</div>
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
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
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

// ─── FORMULAIRE FILIÈRE ───────────────────────────────────────────────────────
function ProgramForm({ program, onSave, onCancel, toast }) {
  const [form, setForm] = useState(() => program || {
    name: '', code: '', type: 'Licence', department: '',
    description: '', maxCapacity: 30, duration: 6,
    academicYear: getCurrentAcademicYear(),
  });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (program?._id) await programAPI.update(program._id, form);
      else await programAPI.create(form);
      onSave();
    } catch (err) {
      toast(err.message || 'Erreur lors de la sauvegarde', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField label="Nom de la filière" value={form.name} onChange={e => set('name', e.target.value)} required />
        <InputField label="Code" value={form.code} onChange={e => set('code', e.target.value.toUpperCase())} required placeholder="EX: INFO-L" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SelectField
          label="Type" value={form.type} onChange={e => set('type', e.target.value)}
          options={PROGRAM_TYPES.map(t => ({ value: t, label: t }))}
        />
        <InputField label="Département" value={form.department} onChange={e => set('department', e.target.value)} required />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField label="Capacité max" type="number" value={form.maxCapacity} onChange={e => set('maxCapacity', +e.target.value)} min="1" />
        <InputField label="Durée (semestres)" type="number" value={form.duration} onChange={e => set('duration', +e.target.value)} min="1" />
      </div>
      <InputField label="Année académique" value={form.academicYear} onChange={e => set('academicYear', e.target.value)} placeholder="2024-2025" />
      <div className="flex gap-3 pt-2">
        <Button variant="secondary" type="button" onClick={onCancel} className="flex-1">Annuler</Button>
        <Button type="submit" loading={loading} className="flex-1">{program ? 'Mettre à jour' : 'Créer'}</Button>
      </div>
    </form>
  );
}

// ─── FORMULAIRE UE ────────────────────────────────────────────────────────────
function UEForm({ ue, programs, teachers, onSave, onCancel, toast }) {
  const [form, setForm] = useState(() => ue || {
    code: '', title: '', credits: 6, coefficient: 1, semester: 'S1',
    program: '', responsibleTeacher: '', description: '',
    volumeHours: { cm: 21, td: 15, tp: 0 },
    evaluationWeights: { cc: 40, partiel: 20, final: 40 }
  });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setHours = (k, v) => setForm(f => ({ ...f, volumeHours: { ...f.volumeHours, [k]: v } }));
  const setWeight = (k, v) => setForm(f => ({ ...f, evaluationWeights: { ...f.evaluationWeights, [k]: v } }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.code || !form.title || !form.program) {
      toast('Code, titre et filière sont obligatoires', 'error');
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField label="Code UE" value={form.code} onChange={e => set('code', e.target.value.toUpperCase())} required placeholder="INF101" />
        <InputField label="Intitulé" value={form.title} onChange={e => set('title', e.target.value)} required />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField label="Crédits ECTS" type="number" value={form.credits} onChange={e => set('credits', +e.target.value)} min="1" />
        <InputField label="Coefficient" type="number" step="0.5" value={form.coefficient} onChange={e => set('coefficient', +e.target.value)} min="0.5" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SelectField
          label="Semestre" value={form.semester} onChange={e => set('semester', e.target.value)}
          options={SEMESTERS.map(s => ({ value: s, label: s }))}
        />
        <SelectField
          label="Filière" value={form.program} onChange={e => set('program', e.target.value)}
          options={programs.map(p => ({ value: p._id, label: p.name }))}
          required placeholder="Choisir une filière"
        />
      </div>
      <SelectField
        label="Enseignant responsable" value={form.responsibleTeacher}
        onChange={e => set('responsibleTeacher', e.target.value)}
        options={teachers.map(t => ({ value: t._id, label: `${t.firstName} ${t.lastName}` }))}
        placeholder="Choisir un enseignant (optionnel)"
      />
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Volume horaire</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <InputField label="CM (h)" type="number" value={form.volumeHours?.cm ?? 0} onChange={e => setHours('cm', +e.target.value)} min="0" />
          <InputField label="TD (h)" type="number" value={form.volumeHours?.td ?? 0} onChange={e => setHours('td', +e.target.value)} min="0" />
          <InputField label="TP (h)" type="number" value={form.volumeHours?.tp ?? 0} onChange={e => setHours('tp', +e.target.value)} min="0" />
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Répartition évaluations (%)</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <InputField label="CC %" type="number" value={form.evaluationWeights?.cc ?? 40} onChange={e => setWeight('cc', +e.target.value)} min="0" max="100" />
          <InputField label="Partiel %" type="number" value={form.evaluationWeights?.partiel ?? 20} onChange={e => setWeight('partiel', +e.target.value)} min="0" max="100" />
          <InputField label="Final %" type="number" value={form.evaluationWeights?.final ?? 40} onChange={e => setWeight('final', +e.target.value)} min="0" max="100" />
        </div>
      </div>
      <InputField label="Description" value={form.description} onChange={e => set('description', e.target.value)} placeholder="Objectifs et contenu de l'UE" />
      <div className="flex gap-3 pt-2">
        <Button variant="secondary" type="button" onClick={onCancel} className="flex-1">Annuler</Button>
        <Button type="submit" loading={loading} className="flex-1">{ue ? 'Mettre à jour' : 'Créer'}</Button>
      </div>
    </form>
  );
}

// ─── ONGLET FILIÈRES (vue arborescente avec UEs imbriquées) ───────────────────
function FilieresTab({ programs, loading, onReload, toast, onNewUE, openProgramModal, onProgramModalClose }) {
  const [expanded, setExpanded] = useState({});
  const [uesByProgram, setUesByProgram] = useState({});
  const [loadingUEs, setLoadingUEs] = useState({});
  const [editProgram, setEditProgram] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, item: null, type: null });
  const [deleting, setDeleting] = useState(false);

  // Le modal filière peut être ouvert depuis le parent (bouton header) ou localement (bouton Edit)
  const progModalOpen = openProgramModal || editProgram !== null;
  const handleProgModalClose = () => { setEditProgram(null); onProgramModalClose(); };

  const toggleExpand = async (programId) => {
    const next = !expanded[programId];
    setExpanded(e => ({ ...e, [programId]: next }));
    if (next && !uesByProgram[programId]) {
      setLoadingUEs(l => ({ ...l, [programId]: true }));
      try {
        const res = await programAPI.getUEs(programId);
        setUesByProgram(u => ({ ...u, [programId]: res.data || res || [] }));
      } catch {
        toast('Erreur chargement des UEs', 'error');
      } finally {
        setLoadingUEs(l => ({ ...l, [programId]: false }));
      }
    }
  };

  const reloadUEs = async (programId) => {
    if (!expanded[programId]) return;
    const res = await programAPI.getUEs(programId);
    setUesByProgram(u => ({ ...u, [programId]: res.data || res || [] }));
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      if (deleteDialog.type === 'program') {
        await programAPI.delete(deleteDialog.item._id);
        onReload();
      } else {
        await ueAPI.delete(deleteDialog.item._id);
        const pid = deleteDialog.item.program?._id || deleteDialog.item.program;
        if (pid) {
          setUesByProgram(u => ({ ...u, [pid]: null }));
          reloadUEs(pid);
        }
      }
      toast('Supprimé avec succès');
      setDeleteDialog({ open: false, item: null, type: null });
    } catch (err) {
      toast(err.message || 'Erreur lors de la suppression', 'error');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <div className="flex justify-center py-16"><Spinner size={36} /></div>;

  if (programs.length === 0) return (
    <div className="text-center py-16">
      <div className="text-5xl mb-4">📚</div>
      <h3 className="text-lg font-semibold text-gray-700">Aucune filière</h3>
      <p className="text-gray-400 text-sm mt-1">Créez votre première filière pour commencer</p>
      <Button className="mt-4" onClick={() => setProgModal({ open: true, program: null })}>
        <Plus size={15} /> Créer une filière
      </Button>
    </div>
  );

  return (
    <>
      <div className="space-y-3">
        {programs.map(program => (
          <Card key={program._id} className="overflow-hidden">
            {/* En-tête programme */}
            <div
              className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => toggleExpand(program._id)}
            >
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center shrink-0">
                <BookOpen size={18} className="text-indigo-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-gray-900">{program.name}</span>
                  <Badge className="bg-gray-100 text-gray-600">{program.code}</Badge>
                  <Badge className="bg-indigo-100 text-indigo-700">{program.type}</Badge>
                  <Badge className="bg-green-100 text-green-700">{program.department}</Badge>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  Capacité : {program.maxCapacity} étudiants • {program.duration} semestres • {program.academicYear}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button size="icon" variant="ghost" onClick={e => { e.stopPropagation(); setEditProgram(program); }}>
                  <Edit size={14} className="text-indigo-500" />
                </Button>
                <Button size="icon" variant="ghost" onClick={e => { e.stopPropagation(); setDeleteDialog({ open: true, item: program, type: 'program' }); }}>
                  <Trash2 size={14} className="text-red-500" />
                </Button>
                {expanded[program._id]
                  ? <ChevronDown size={16} className="text-gray-400" />
                  : <ChevronRight size={16} className="text-gray-400" />
                }
              </div>
            </div>

            {/* Liste des UEs */}
            {expanded[program._id] && (
              <div className="border-t border-gray-100 bg-gray-50/60">
                <div className="flex items-center justify-between px-4 py-2">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Unités d'Enseignement</span>
                  <Button size="sm" variant="ghost" onClick={() => onNewUE(program._id)}>
                    <Plus size={12} /> Ajouter UE
                  </Button>
                </div>
                {loadingUEs[program._id] ? (
                  <div className="flex justify-center py-4"><Spinner size={20} /></div>
                ) : !uesByProgram[program._id] || uesByProgram[program._id].length === 0 ? (
                  <p className="text-center text-sm text-gray-400 py-5">Aucune UE pour cette filière</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100 bg-white/60">
                          <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">Code</th>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">Intitulé</th>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">Sem.</th>
                          <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500">Coef.</th>
                          <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500">ECTS</th>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">CM/TD/TP</th>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">CC/Partiel/Final</th>
                          <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {uesByProgram[program._id].map(ue => (
                          <tr key={ue._id} className="border-b border-gray-50 hover:bg-white transition-colors">
                            <td className="px-4 py-2.5">
                              <Badge className="bg-indigo-100 text-indigo-700 font-mono">{ue.code}</Badge>
                            </td>
                            <td className="px-4 py-2.5 font-medium text-gray-800">{ue.title}</td>
                            <td className="px-4 py-2.5">
                              <Badge className="bg-gray-100 text-gray-600">{ue.semester}</Badge>
                            </td>
                            <td className="px-4 py-2.5 text-center font-bold text-gray-700">{ue.coefficient}</td>
                            <td className="px-4 py-2.5 text-center font-bold text-emerald-600">{ue.credits}</td>
                            <td className="px-4 py-2.5 text-xs text-gray-500">
                              {ue.volumeHours?.cm ?? '—'}/{ue.volumeHours?.td ?? '—'}/{ue.volumeHours?.tp ?? '—'}h
                            </td>
                            <td className="px-4 py-2.5 text-xs text-gray-500">
                              {ue.evaluationWeights?.cc ?? '—'}/{ue.evaluationWeights?.partiel ?? '—'}/{ue.evaluationWeights?.final ?? '—'}%
                            </td>
                            <td className="px-4 py-2.5">
                              <div className="flex items-center gap-1 justify-center">
                                <Button size="icon" variant="ghost" onClick={() => onNewUE(program._id, ue)}>
                                  <Edit size={13} className="text-indigo-500" />
                                </Button>
                                <Button size="icon" variant="ghost" onClick={() => setDeleteDialog({ open: true, item: ue, type: 'ue' })}>
                                  <Trash2 size={13} className="text-red-500" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Modal Filière (créer depuis header ou modifier depuis liste) */}
      <Modal
        isOpen={progModalOpen}
        onClose={handleProgModalClose}
        title={editProgram ? 'Modifier la filière' : 'Nouvelle filière'}
        size="lg"
      >
        <ProgramForm
          program={editProgram}
          toast={toast}
          onSave={() => {
            handleProgModalClose();
            onReload();
            toast('Filière sauvegardée');
          }}
          onCancel={handleProgModalClose}
        />
      </Modal>

      {/* Confirmation suppression */}
      <ConfirmDialog
        isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, item: null, type: null })}
        onConfirm={handleDelete}
        loading={deleting}
        title={`Supprimer ${deleteDialog.type === 'program' ? 'la filière' : "l'UE"}`}
        message={`Confirmer la suppression de "${deleteDialog.item?.name || deleteDialog.item?.title}" ?`}
      />
    </>
  );
}

// ─── ONGLET UEs (vue tableau global avec filtres) ─────────────────────────────
function UEsTab({ programs, teachers, toast }) {
  const [ues, setUes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 15;
  const [filters, setFilters] = useState({ semester: '', program: '' });
  const [modal, setModal] = useState({ open: false, ue: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, ue: null });
  const [deleting, setDeleting] = useState(false);

  const loadUEs = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT };
      if (filters.semester) params.semester = filters.semester;
      if (filters.program) params.program = filters.program;
      const res = await ueAPI.getAll(params);
      setUes(res.data?.data || res.data || []);
      setTotal(res.data?.total || res.total || 0);
    } catch {
      toast('Erreur lors du chargement des UEs', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => { loadUEs(); }, [loadUEs]);

  const handleFilter = (key, value) => {
    setFilters(f => ({ ...f, [key]: value }));
    setPage(1);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await ueAPI.delete(deleteDialog.ue._id);
      setDeleteDialog({ open: false, ue: null });
      loadUEs();
      toast('UE supprimée');
    } catch (err) {
      toast(err.message || 'Erreur suppression', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const totalPages = Math.ceil(total / LIMIT);
  const semesterOpts = SEMESTERS.map(s => ({ value: s, label: s }));
  const programOpts = programs.map(p => ({ value: p._id, label: p.name }));

  return (
    <>
      {/* Filtres */}
      <Card className="p-4 mb-4">
        <div className="flex gap-3 flex-wrap items-end">
          <div className="w-36">
            <SelectField
              label="Semestre" value={filters.semester}
              onChange={e => handleFilter('semester', e.target.value)}
              options={semesterOpts} placeholder="Tous"
            />
          </div>
          <div className="w-56">
            <SelectField
              label="Filière" value={filters.program}
              onChange={e => handleFilter('program', e.target.value)}
              options={programOpts} placeholder="Toutes"
            />
          </div>
          {(filters.semester || filters.program) && (
            <Button variant="secondary" size="sm" onClick={() => { setFilters({ semester: '', program: '' }); setPage(1); }}>
              <X size={13} /> Réinitialiser
            </Button>
          )}
        </div>
      </Card>

      {/* Tableau */}
      <Card>
        {loading ? (
          <div className="flex justify-center py-16"><Spinner size={36} /></div>
        ) : ues.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">📋</div>
            <p className="text-gray-500 font-medium">Aucune UE trouvée</p>
            <p className="text-gray-400 text-sm mt-1">Modifiez vos filtres ou créez une nouvelle UE</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {['Code / Titre', 'Filière', 'Semestre', 'Crédits', 'Coef.', 'Responsable', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {ues.map(ue => (
                  <tr key={ue._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-800">{ue.code}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{ue.title}</div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className="bg-indigo-100 text-indigo-700">{ue.program?.name || '—'}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className="bg-gray-100 text-gray-700">{ue.semester}</Badge>
                    </td>
                    <td className="px-4 py-3 font-medium text-emerald-600">{ue.credits} ECTS</td>
                    <td className="px-4 py-3 font-medium text-gray-700">{ue.coefficient}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {ue.responsibleTeacher
                        ? `${ue.responsibleTeacher.firstName} ${ue.responsibleTeacher.lastName}`
                        : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => setModal({ open: true, ue })}>
                          <Edit size={13} className="text-indigo-500" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setDeleteDialog({ open: true, ue })}>
                          <Trash2 size={13} className="text-red-500" />
                        </Button>
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
          <div className="flex items-center justify-center gap-3 px-4 py-3 border-t">
            <button
              onClick={() => setPage(p => p - 1)} disabled={page === 1}
              className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50"
            >←</button>
            <span className="text-sm text-gray-600">Page {page} / {totalPages}</span>
            <button
              onClick={() => setPage(p => p + 1)} disabled={page === totalPages}
              className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50"
            >→</button>
          </div>
        )}
      </Card>

      {/* Modal UE */}
      <Modal
        isOpen={modal.open}
        onClose={() => setModal({ open: false, ue: null })}
        title={modal.ue ? "Modifier l'UE" : 'Nouvelle UE'}
        size="lg"
      >
        <UEForm
          ue={modal.ue}
          programs={programs}
          teachers={teachers}
          toast={toast}
          onSave={() => { setModal({ open: false, ue: null }); loadUEs(); }}
          onCancel={() => setModal({ open: false, ue: null })}
        />
      </Modal>

      {/* Confirmation */}
      <ConfirmDialog
        isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, ue: null })}
        onConfirm={handleDelete}
        loading={deleting}
        title="Supprimer l'UE"
        message={`Supprimer l'UE "${deleteDialog.ue?.code} — ${deleteDialog.ue?.title}" ?`}
      />
    </>
  );
}

// ─── PAGE PRINCIPALE ──────────────────────────────────────────────────────────
// defaultTab : 'programs' | 'ues'  (passé depuis App.jsx via props si besoin)
export default function ProgramsPage({ defaultTab = 'programs' }) {
  const { toast, toasts, remove } = useToast();
  const [tab, setTab] = useState(defaultTab);
  const [programs, setPrograms] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loadingPrograms, setLoadingPrograms] = useState(true);

  const [ueModal, setUeModal] = useState({ open: false, ue: null, programId: null });
  const [newProgramOpen, setNewProgramOpen] = useState(false);

  const loadPrograms = useCallback(async () => {
    setLoadingPrograms(true);
    try {
      const res = await programAPI.getAll({ limit: 200 });
      setPrograms(res.data?.data || res.data || []);
    } catch {
      toast('Erreur chargement des filières', 'error');
    } finally {
      setLoadingPrograms(false);
    }
  }, []);

  const loadTeachers = useCallback(async () => {
    try {
      const res = await teacherAPI.getAll({ limit: 200 });
      setTeachers(res.data?.data || res.data || []);
    } catch {
      setTeachers([]);
    }
  }, []);

  useEffect(() => {
    loadPrograms();
    loadTeachers();
  }, [loadPrograms, loadTeachers]);

  const handleNewUE = (programId, ue = null) => {
    setUeModal({ open: true, ue, programId });
  };

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} remove={remove} />

      {/* En-tête */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Filières & UE</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {programs.length} filière{programs.length > 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          {tab === 'programs' && (
            <>
              <Button variant="secondary" onClick={() => setUeModal({ open: true, ue: null, programId: null })}>
                <Plus size={14} /> Nouvelle UE
              </Button>
              <Button onClick={() => setNewProgramOpen(true)}>
                <Plus size={14} /> Nouvelle filière
              </Button>
            </>
          )}
          {tab === 'ues' && (
            <Button onClick={() => setUeModal({ open: true, ue: null, programId: null })}>
              <Plus size={14} /> Nouvelle UE
            </Button>
          )}
        </div>
      </div>

      {/* Onglets */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        <button
          onClick={() => setTab('programs')}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === 'programs'
              ? 'bg-white shadow text-indigo-700'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <GraduationCap size={15} /> Filières
        </button>
        <button
          onClick={() => setTab('ues')}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === 'ues'
              ? 'bg-white shadow text-indigo-700'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <List size={15} /> Unités d'Enseignement
        </button>
      </div>

      {/* Contenu selon l'onglet */}
      {tab === 'programs' && (
        <FilieresTab
          programs={programs}
          loading={loadingPrograms}
          onReload={loadPrograms}
          toast={toast}
          onNewUE={handleNewUE}
          openProgramModal={newProgramOpen}
          onProgramModalClose={() => setNewProgramOpen(false)}
        />
      )}

      {tab === 'ues' && (
        <UEsTab
          programs={programs}
          teachers={teachers}
          toast={toast}
        />
      )}

      {/* Modal UE partagé (utilisé depuis l'en-tête ou depuis l'onglet Filières) */}
      <Modal
        isOpen={ueModal.open}
        onClose={() => setUeModal({ open: false, ue: null, programId: null })}
        title={ueModal.ue ? "Modifier l'UE" : 'Nouvelle UE'}
        size="lg"
      >
        <UEForm
          ue={ueModal.ue}
          programs={programs}
          teachers={teachers}
          toast={toast}
          onSave={() => {
            setUeModal({ open: false, ue: null, programId: null });
            toast('UE sauvegardée');
          }}
          onCancel={() => setUeModal({ open: false, ue: null, programId: null })}
        />
      </Modal>
    </div>
  );
}
