// ProgramsPage.jsx – Version totalement autonome
import { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Edit, Trash2, ChevronDown, ChevronRight, BookOpen } from 'lucide-react';
import { programAPI, ueAPI } from '../../services/services';

// ============================================================
// 1. CONSTANTES & UTILITAIRES
// ============================================================
const LEVELS = ['L1', 'L2', 'L3', 'M1', 'M2'];
const SEMESTERS = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8'];
const PROGRAM_TYPES = ['Licence', 'Master', 'Doctorat', 'BUT', 'BTS', 'Ingénieur', 'Autre'];

const getCurrentAcademicYear = () => {
  const year = new Date().getFullYear();
  return `${year}-${year + 1}`;
};

// ============================================================
// 2. SYSTÈME DE TOAST — FIX: toast stabilisé avec useRef
// ============================================================
const useToast = () => {
  const [toasts, setToasts] = useState([]);

  // ✅ FIX BOUCLE INFINIE : on stabilise "toast" avec useRef
  // Sans ça, toast était recréée à chaque render → loadPrograms changeait → useEffect boucle
  const toast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);

  const ToastContainer = () => (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map(t => (
        <div key={t.id} className={`px-4 py-2 rounded-lg shadow-lg text-white text-sm flex items-center gap-2 ${t.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
          {t.type === 'error' ? '❌' : '✅'} {t.message}
        </div>
      ))}
    </div>
  );

  return { toast, ToastContainer };
};

// ============================================================
// 3. COMPOSANTS UI
// ============================================================
const Spinner = ({ size = 24 }) => (
  <div className="animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" style={{ width: size, height: size }} />
);

const Button = ({ children, onClick, variant = 'primary', size = 'md', type = 'button', loading, disabled, className = '' }) => {
  const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors disabled:opacity-50';
  const variants = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    ghost: 'hover:bg-gray-100 text-gray-600',
  };
  const sizes = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2', icon: 'p-2' };
  return (
    <button type={type} onClick={onClick} disabled={loading || disabled} className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}>
      {loading && <Spinner size={16} />}
      {children}
    </button>
  );
};

const Input = ({ label, value, onChange, type = 'text', required, placeholder, textarea }) => {
  const Component = textarea ? 'textarea' : 'input';
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <Component
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        rows={textarea ? 2 : undefined}
        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
      />
    </div>
  );
};

const Select = ({ label, value, onChange, options, required }) => (
  <div className="flex flex-col gap-1">
    {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
    <select value={value} onChange={onChange} required={required} className="border border-gray-300 rounded-lg px-3 py-2 outline-none">
      {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
  </div>
);

const Badge = ({ children, className }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>{children}</span>
);

const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 ${className}`}>{children}</div>
);

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;
  const sizes = { md: 'max-w-md', lg: 'max-w-2xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className={`bg-white rounded-2xl shadow-xl w-full ${sizes[size]} max-h-[90vh] overflow-auto`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-lg">✕</button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

const ConfirmDialog = ({ isOpen, onClose, onConfirm, loading, title, message }) => {
  if (!isOpen) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="md">
      <p className="mb-4 text-gray-700">{message}</p>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>Annuler</Button>
        <Button onClick={onConfirm} loading={loading} variant="primary">Confirmer</Button>
      </div>
    </Modal>
  );
};

const EmptyState = ({ icon, title, description, action }) => (
  <div className="text-center py-12">
    <div className="text-4xl mb-3">{icon}</div>
    <h3 className="text-lg font-medium text-gray-900">{title}</h3>
    <p className="text-gray-500 text-sm mt-1">{description}</p>
    {action && <div className="mt-4">{action}</div>}
  </div>
);

// ============================================================
// 4. FORMULAIRES
// ============================================================
function ProgramForm({ program, onSave, onCancel }) {
  const [form, setForm] = useState(() => program || {
    name: '', code: '', type: 'Licence', department: '',
    description: '', maxCapacity: 30, duration: 6,
    academicYear: getCurrentAcademicYear(),
  });
  const [loading, setLoading] = useState(false);
  const { toast, ToastContainer } = useToast();
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (program?._id) await programAPI.update(program._id, form);
      else await programAPI.create(form);
      onSave();
    } catch (err) {
      toast(err.message || 'Une erreur est survenue', 'error');
    } finally {
      setLoading(false);
    }
  };

  const typeOptions = PROGRAM_TYPES.map(t => ({ value: t, label: t }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ToastContainer />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Nom de la filière" value={form.name} onChange={e => set('name', e.target.value)} required />
        <Input label="Code" value={form.code} onChange={e => set('code', e.target.value.toUpperCase())} required placeholder="EX: INFO-L" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Select label="Type" value={form.type} onChange={e => set('type', e.target.value)} options={typeOptions} />
        <Input label="Département" value={form.department} onChange={e => set('department', e.target.value)} required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Capacité max" type="number" value={form.maxCapacity} onChange={e => set('maxCapacity', +e.target.value)} />
        <Input label="Durée (semestres)" type="number" value={form.duration} onChange={e => set('duration', +e.target.value)} />
      </div>
      <Input label="Année académique" value={form.academicYear} onChange={e => set('academicYear', e.target.value)} />
      <div className="flex gap-3 pt-2">
        <Button variant="secondary" type="button" onClick={onCancel} className="flex-1">Annuler</Button>
        <Button type="submit" loading={loading} className="flex-1">{program ? 'Mettre à jour' : 'Créer'}</Button>
      </div>
    </form>
  );
}

function UEForm({ ue, programs, onSave, onCancel }) {
  const [form, setForm] = useState(() => ue || {
    code: '', title: '', coefficient: 1, credits: 3,
    semester: 'S1', program: '', description: '',
    volumeHours: { cm: 21, td: 15, tp: 0 },
    evaluationWeights: { cc: 40, partiel: 20, final: 40 }
  });
  const [loading, setLoading] = useState(false);
  const { toast, ToastContainer } = useToast();
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setNested = (parent, k, v) => setForm(f => ({ ...f, [parent]: { ...f[parent], [k]: v } }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    // ✅ FIX : validation que la filière est sélectionnée
    if (!form.program) {
      toast('Veuillez sélectionner une filière', 'error');
      return;
    }
    setLoading(true);
    try {
      if (ue?._id) await ueAPI.update(ue._id, form);
      else await ueAPI.create(form);
      onSave();
    } catch (err) {
      toast(err.message || 'Une erreur est survenue', 'error');
    } finally {
      setLoading(false);
    }
  };

  const programOptions = [
    { value: '', label: 'Sélectionner une filière' },
    ...(programs || []).map(p => ({ value: p._id, label: p.name }))
  ];
  const semOptions = SEMESTERS.map(s => ({ value: s, label: s }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ToastContainer />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Code UE" value={form.code} onChange={e => set('code', e.target.value.toUpperCase())} required placeholder="INF101" />
        <Input label="Intitulé" value={form.title} onChange={e => set('title', e.target.value)} required />
      </div>
      <Select label="Filière" value={form.program} onChange={e => set('program', e.target.value)} options={programOptions} />
      <div className="grid grid-cols-3 gap-4">
        <Select label="Semestre" value={form.semester} onChange={e => set('semester', e.target.value)} options={semOptions} />
        <Input label="Coefficient" type="number" min="1" max="10" value={form.coefficient} onChange={e => set('coefficient', +e.target.value)} />
        <Input label="Crédits ECTS" type="number" min="1" max="12" value={form.credits} onChange={e => set('credits', +e.target.value)} />
      </div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Volume horaire</p>
      <div className="grid grid-cols-3 gap-3">
        <Input label="CM (h)" type="number" value={form.volumeHours.cm} onChange={e => setNested('volumeHours', 'cm', +e.target.value)} />
        <Input label="TD (h)" type="number" value={form.volumeHours.td} onChange={e => setNested('volumeHours', 'td', +e.target.value)} />
        <Input label="TP (h)" type="number" value={form.volumeHours.tp} onChange={e => setNested('volumeHours', 'tp', +e.target.value)} />
      </div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Répartition évaluations (%)</p>
      <div className="grid grid-cols-3 gap-3">
        <Input label="CC %" type="number" value={form.evaluationWeights.cc} onChange={e => setNested('evaluationWeights', 'cc', +e.target.value)} />
        <Input label="Partiel %" type="number" value={form.evaluationWeights.partiel} onChange={e => setNested('evaluationWeights', 'partiel', +e.target.value)} />
        <Input label="Final %" type="number" value={form.evaluationWeights.final} onChange={e => setNested('evaluationWeights', 'final', +e.target.value)} />
      </div>
      <div className="flex gap-3 pt-2">
        <Button variant="secondary" type="button" onClick={onCancel} className="flex-1">Annuler</Button>
        <Button type="submit" loading={loading} className="flex-1">{ue ? 'Mettre à jour' : 'Créer'}</Button>
      </div>
    </form>
  );
}

// ============================================================
// 5. PAGE PRINCIPALE
// ============================================================
export default function ProgramsPage() {
  const { toast, ToastContainer } = useToast();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [uesByProgram, setUesByProgram] = useState({});
  const [loadingUEs, setLoadingUEs] = useState({});

  const [progModal, setProgModal] = useState({ open: false, program: null });
  const [ueModal, setUeModal] = useState({ open: false, ue: null, programId: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, item: null, type: null });
  const [deleting, setDeleting] = useState(false);

  // ✅ FIX BOUCLE INFINIE : tableau de dépendances vide []
  // toast est maintenant stable (useCallback dans useToast), mais on met []
  // pour garantir que loadPrograms ne change JAMAIS de référence
  const loadPrograms = useCallback(async () => {
    setLoading(true);
    try {
      const res = await programAPI.getAll({ limit: 100 });
      setPrograms(res.data || res || []);
    } catch (err) {
      toast(err.message || 'Erreur lors du chargement', 'error');
    } finally {
      setLoading(false);
    }
  }, []); // ✅ [] au lieu de [toast]

  useEffect(() => {
    loadPrograms();
  }, [loadPrograms]);

  const toggleExpand = async (programId) => {
    const next = !expanded[programId];
    setExpanded(e => ({ ...e, [programId]: next }));
    if (next && !uesByProgram[programId]) {
      setLoadingUEs(l => ({ ...l, [programId]: true }));
      try {
        const res = await programAPI.getUEs(programId);
        setUesByProgram(u => ({ ...u, [programId]: res.data || res || [] }));
      } catch (err) {
        toast(err.message || 'Erreur lors du chargement des UEs', 'error');
      } finally {
        setLoadingUEs(l => ({ ...l, [programId]: false }));
      }
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      if (deleteDialog.type === 'program') {
        await programAPI.delete(deleteDialog.item._id);
        await loadPrograms();
      } else {
        await ueAPI.delete(deleteDialog.item._id);
        const programId = deleteDialog.item.program?._id || deleteDialog.item.program;
        if (programId) {
          // ✅ FIX : on recharge les UEs si la filière est ouverte
          if (expanded[programId]) {
            const res = await programAPI.getUEs(programId);
            setUesByProgram(u => ({ ...u, [programId]: res.data || res || [] }));
          } else {
            setUesByProgram(u => ({ ...u, [programId]: null }));
          }
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

  return (
    <div className="space-y-6">
      <ToastContainer />

      {/* En-tête */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Filières & Unités d'Enseignement</h1>
          <p className="text-sm text-gray-500 mt-1">
            {programs.length} filière{programs.length > 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setUeModal({ open: true, ue: null, programId: null })}>
            <Plus size={15} /> Nouvelle UE
          </Button>
          <Button onClick={() => setProgModal({ open: true, program: null })}>
            <Plus size={16} /> Nouvelle filière
          </Button>
        </div>
      </div>

      {/* Contenu */}
      {loading ? (
        <div className="flex justify-center py-16"><Spinner size={36} /></div>
      ) : programs.length === 0 ? (
        <EmptyState
          icon="📚"
          title="Aucune filière"
          description="Créez votre première filière pour commencer"
          action={
            <Button onClick={() => setProgModal({ open: true, program: null })}>
              <Plus size={15} /> Créer une filière
            </Button>
          }
        />
      ) : (
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
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-gray-900">{program.name}</h3>
                    <Badge className="bg-gray-100 text-gray-600">{program.code}</Badge>
                    <Badge className="bg-indigo-100 text-indigo-700">{program.type}</Badge>
                    <Badge className="bg-green-100 text-green-700">{program.department}</Badge>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Capacité: {program.maxCapacity} • {program.duration} semestres • {program.academicYear}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="icon" variant="ghost" onClick={e => { e.stopPropagation(); setProgModal({ open: true, program }); }}>
                    <Edit size={15} className="text-indigo-500" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={e => { e.stopPropagation(); setDeleteDialog({ open: true, item: program, type: 'program' }); }}>
                    <Trash2 size={15} className="text-red-500" />
                  </Button>
                  {expanded[program._id]
                    ? <ChevronDown size={18} className="text-gray-400" />
                    : <ChevronRight size={18} className="text-gray-400" />
                  }
                </div>
              </div>

              {/* UEs */}
              {expanded[program._id] && (
                <div className="border-t border-gray-100 bg-gray-50/50">
                  <div className="flex items-center justify-between px-4 py-2.5">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Unités d'Enseignement</p>
                    <Button size="sm" variant="ghost" onClick={() => setUeModal({ open: true, ue: null, programId: program._id })}>
                      <Plus size={13} /> Ajouter UE
                    </Button>
                  </div>
                  {loadingUEs[program._id] ? (
                    <div className="flex justify-center py-4"><Spinner size={20} /></div>
                  ) : !uesByProgram[program._id] || uesByProgram[program._id].length === 0 ? (
                    <p className="text-center text-sm text-gray-400 py-4">Aucune UE pour cette filière</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-100">
                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">Code</th>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">Intitulé</th>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">Semestre</th>
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
                                {ue.volumeHours?.cm}/{ue.volumeHours?.td}/{ue.volumeHours?.tp}h
                              </td>
                              <td className="px-4 py-2.5 text-xs text-gray-500">
                                {ue.evaluationWeights?.cc}/{ue.evaluationWeights?.partiel}/{ue.evaluationWeights?.final}%
                              </td>
                              <td className="px-4 py-2.5">
                                <div className="flex items-center gap-1 justify-center">
                                  <Button size="icon" variant="ghost" onClick={() => setUeModal({ open: true, ue, programId: program._id })}>
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
      )}

      {/* Modal Filière */}
      <Modal
        isOpen={progModal.open}
        onClose={() => setProgModal({ open: false, program: null })}
        title={progModal.program ? 'Modifier la filière' : 'Nouvelle filière'}
        size="lg"
      >
        <ProgramForm
          program={progModal.program}
          onSave={() => {
            setProgModal({ open: false, program: null });
            loadPrograms();
            toast('Filière sauvegardée');
          }}
          onCancel={() => setProgModal({ open: false, program: null })}
        />
      </Modal>

      {/* Modal UE */}
      <Modal
        isOpen={ueModal.open}
        onClose={() => setUeModal({ open: false, ue: null, programId: null })}
        title={ueModal.ue ? "Modifier l'UE" : 'Nouvelle UE'}
        size="lg"
      >
        <UEForm
          ue={ueModal.ue}
          programs={programs}
          onSave={() => {
            const pid = ueModal.programId;
            setUeModal({ open: false, ue: null, programId: null });
            if (pid) {
              // ✅ FIX : on recharge les UEs si la filière est ouverte
              if (expanded[pid]) {
                programAPI.getUEs(pid).then(res =>
                  setUesByProgram(u => ({ ...u, [pid]: res.data || res || [] }))
                );
              } else {
                setUesByProgram(u => ({ ...u, [pid]: null }));
              }
            }
            toast('UE sauvegardée');
          }}
          onCancel={() => setUeModal({ open: false, ue: null, programId: null })}
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
    </div>
  );
}