// StudentsPage.jsx – Version corrigée
import { useState, useEffect, useCallback } from 'react';
import {
  Plus, Download, Upload, Edit, Trash2, Eye,
  ChevronLeft, ChevronRight, X, CheckCircle, AlertCircle
} from 'lucide-react';
import { studentAPI, programAPI } from '../../services/services';

// ============================================================
// 1. CONSTANTES & UTILITAIRES
// ============================================================
const LEVELS = ['L1', 'L2', 'L3', 'M1', 'M2'];

const getCurrentAcademicYear = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  return month >= 9 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
};

const formatDate = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('fr-FR');
};

const getStatusColor = (status) => {
  switch (status) {
    case 'active':    return 'bg-green-100 text-green-700';
    case 'inactive':  return 'bg-gray-100 text-gray-700';
    case 'suspended': return 'bg-red-100 text-red-700';
    case 'expelled':  return 'bg-orange-100 text-orange-700';
    case 'graduated': return 'bg-blue-100 text-blue-700';
    case 'on_leave':  return 'bg-yellow-100 text-yellow-700';
    default:          return 'bg-gray-100 text-gray-700';
  }
};

const getStatusLabel = (status) => {
  const labels = {
    active: 'Actif', inactive: 'Inactif', suspended: 'Suspendu',
    expelled: 'Exclu', graduated: 'Diplômé', on_leave: 'Congé'
  };
  return labels[status] || status || '—';
};

// ✅ Nettoyer le payload avant envoi — supprime les chaînes vides et champs inutiles
const cleanPayload = (data) => {
  const payload = { ...data };

  // Champs avec index unique sparse — NE PAS envoyer vide
  if (!payload.studentId) delete payload.studentId;
  if (!payload.ine)       delete payload.ine;

  // Champs optionnels — supprimer si vides
  if (!payload.phone)        delete payload.phone;
  if (!payload.dateOfBirth)  delete payload.dateOfBirth;
  if (!payload.placeOfBirth) delete payload.placeOfBirth;
  if (!payload.notes)        delete payload.notes;
  if (!payload.studentCardUrl) delete payload.studentCardUrl;

  // Guardian — supprimer si tout vide
  if (payload.guardian) {
    const g = payload.guardian;
    if (!g.name && !g.phone && !g.email && !g.relation) {
      delete payload.guardian;
    } else {
      // Nettoyer les sous-champs vides
      const cleanGuardian = {};
      if (g.name)     cleanGuardian.name = g.name;
      if (g.phone)    cleanGuardian.phone = g.phone;
      if (g.email)    cleanGuardian.email = g.email;
      if (g.relation) cleanGuardian.relation = g.relation;
      payload.guardian = cleanGuardian;
    }
  }

  return payload;
};

// ============================================================
// 2. SYSTÈME DE TOAST
// ============================================================
const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  const ToastContainer = () => (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map(t => (
        <div key={t.id} className={`px-4 py-2 rounded-lg shadow-lg text-white text-sm flex items-center gap-2 transition-all ${t.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
          {t.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
          {t.message}
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
  <div className="animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"
    style={{ width: size, height: size }} />
);

const Button = ({ children, onClick, variant = 'primary', size = 'md', type = 'button', loading, disabled, className = '' }) => {
  const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors disabled:opacity-50 cursor-pointer';
  const variants = {
    primary:   'bg-indigo-600 hover:bg-indigo-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    ghost:     'hover:bg-gray-100 text-gray-600',
    danger:    'bg-red-600 hover:bg-red-700 text-white',
  };
  const sizes = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2', icon: 'p-2' };
  return (
    <button type={type} onClick={onClick} disabled={loading || disabled}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}>
      {loading && <Spinner size={16} />}
      {children}
    </button>
  );
};

const Input = ({ label, value, onChange, type = 'text', required, placeholder, textarea, readOnly }) => {
  const Component = textarea ? 'textarea' : 'input';
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-gray-700">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>}
      <Component
        type={type}
        value={value ?? ''}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        readOnly={readOnly}
        rows={textarea ? 3 : undefined}
        className={`border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${readOnly ? 'bg-gray-50 text-gray-500' : ''}`}
      />
    </div>
  );
};

const Select = ({ label, value, onChange, options, required }) => (
  <div className="flex flex-col gap-1">
    {label && <label className="text-sm font-medium text-gray-700">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>}
    <select value={value ?? ''} onChange={onChange}
      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
      {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
  </div>
);

const Badge = ({ children, className }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>{children}</span>
);

const Avatar = ({ firstName, lastName, size = 'sm' }) => {
  const initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  const sizes = { sm: 'w-8 h-8 text-sm', md: 'w-10 h-10 text-base', xl: 'w-16 h-16 text-xl' };
  return (
    <div className={`${sizes[size]} rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold flex-shrink-0`}>
      {initials || '?'}
    </div>
  );
};

const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 ${className}`}>{children}</div>
);

const SearchInput = ({ value, onChange, placeholder }) => (
  <input type="text" value={value} onChange={e => onChange(e.target.value)}
    placeholder={placeholder}
    className="border border-gray-300 rounded-lg px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
);

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;
  const sizes = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className={`bg-white rounded-2xl shadow-xl w-full ${sizes[size]} max-h-[90vh] flex flex-col`}
        onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b flex-shrink-0">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>
        <div className="p-4 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
};

const ConfirmDialog = ({ isOpen, onClose, onConfirm, loading, title, message, confirmLabel = 'Confirmer', variant = 'danger' }) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
    <p className="text-gray-600 mb-5">{message}</p>
    <div className="flex justify-end gap-2">
      <Button variant="secondary" onClick={onClose}>Annuler</Button>
      <Button variant={variant} onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
    </div>
  </Modal>
);

const Table = ({ columns, data, loading, emptyText }) => {
  if (loading) return <div className="p-12 flex justify-center"><Spinner size={32} /></div>;
  if (!data?.length) return (
    <div className="p-12 text-center">
      <div className="text-gray-300 text-5xl mb-3">👤</div>
      <p className="text-gray-400 text-sm">{emptyText}</p>
    </div>
  );
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-100">
        <thead className="bg-gray-50">
          <tr>
            {columns.map(col => (
              <th key={col.key} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {data.map((row, idx) => (
            <tr key={row._id || idx} className="hover:bg-gray-50 transition-colors">
              {columns.map(col => (
                <td key={col.key} className="px-4 py-3 text-sm">
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
    <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50 rounded-b-2xl">
      <Button variant="secondary" size="sm" onClick={() => onPageChange(page - 1)} disabled={page === 1}>
        <ChevronLeft size={15} /> Précédent
      </Button>
      <span className="text-sm text-gray-500">Page <strong>{page}</strong> sur <strong>{totalPages}</strong></span>
      <Button variant="secondary" size="sm" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}>
        Suivant <ChevronRight size={15} />
      </Button>
    </div>
  );
};

// ============================================================
// 4. HOOK PAGINATION
// ============================================================
const usePagination = (apiMethod) => {
  const [data, setData]       = useState([]);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const [limit]               = useState(10);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiMethod({ page, limit, ...filters });
      setData(res.data || []);
      setTotal(res.pagination?.total || res.total || 0);
    } catch (err) {
      console.error('Erreur chargement étudiants:', err);
    } finally {
      setLoading(false);
    }
  }, [apiMethod, page, limit, filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const search = useCallback((newFilters) => {
    setFilters(newFilters);
    setPage(1);
  }, []);

  return { data, total, page, limit, loading, setPage, search, refetch: fetchData };
};

// ============================================================
// 5. FORMULAIRE ÉTUDIANT — CORRIGÉ
// ============================================================
const INITIAL_FORM = {
  firstName: '', lastName: '', email: '', phone: '',
  program: '', level: 'L1', currentSemester: 'S1',
  academicYear: getCurrentAcademicYear(),
  dateOfBirth: '', placeOfBirth: '',
  nationality: 'Algérienne',
  // ✅ PAS de studentId ni ine dans l'état initial (auto-générés / sparse)
  guardian: { name: '', phone: '', email: '', relation: '' },
  notes: ''
};

function StudentForm({ student, programs, onSave, onCancel }) {
  const isEdit = !!student?._id;

  const [form, setForm] = useState(() => {
    if (!student) return INITIAL_FORM;
    // En mode édition : pré-remplir en évitant les undefined
    return {
      ...INITIAL_FORM,
      ...student,
      program: student.program?._id || student.program || '',
      dateOfBirth: student.dateOfBirth?.substring(0, 10) || '',
      guardian: student.guardian || INITIAL_FORM.guardian,
    };
  });

  const [loading, setLoading]   = useState(false);
  const { toast, ToastContainer } = useToast();

  const set    = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setG   = (k, v) => setForm(f => ({ ...f, guardian: { ...f.guardian, [k]: v } }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.program) { toast('Veuillez sélectionner une filière', 'error'); return; }

    setLoading(true);
    try {
      // ✅ Nettoyage complet avant envoi
      const payload = cleanPayload(form);

      if (isEdit) {
        await studentAPI.update(student._id, payload);
      } else {
        // Mot de passe par défaut si non renseigné
        if (!payload.password) payload.password = 'Etudiant@123';
        await studentAPI.create(payload);
      }
      onSave();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Une erreur est survenue';
      toast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const programOptions = [
    { value: '', label: '— Sélectionner une filière —' },
    ...(programs || []).map(p => ({ value: p._id, label: `${p.name} (${p.code})` }))
  ];
  const semOptions   = ['S1','S2','S3','S4','S5','S6','S7','S8'].map(s => ({ value: s, label: s }));
  const levelOptions = LEVELS.map(l => ({ value: l, label: l }));
  const relOptions   = [
    { value: '', label: '— Sélectionner —' },
    ...['Père','Mère','Tuteur','Autre'].map(r => ({ value: r, label: r }))
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <ToastContainer />

      {/* Identité */}
      <div>
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Identité</h4>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Prénom" value={form.firstName} onChange={e => set('firstName', e.target.value)} required />
          <Input label="Nom" value={form.lastName} onChange={e => set('lastName', e.target.value)} required />
        </div>
      </div>

      {/* Contact */}
      <div>
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Contact</h4>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Email" type="email" value={form.email} onChange={e => set('email', e.target.value)} required />
          <Input label="Téléphone" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="Optionnel" />
        </div>
      </div>

      {/* Scolarité */}
      <div>
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Scolarité</h4>
        <div className="grid grid-cols-2 gap-3">
          <Select label="Filière" value={form.program} onChange={e => set('program', e.target.value)} options={programOptions} required />
          <Select label="Niveau" value={form.level} onChange={e => set('level', e.target.value)} options={levelOptions} required />
          <Select label="Semestre actuel" value={form.currentSemester} onChange={e => set('currentSemester', e.target.value)} options={semOptions} required />
          <Input label="Année académique" value={form.academicYear} onChange={e => set('academicYear', e.target.value)} required />
        </div>
        {isEdit && (
          <div className="mt-3">
            <Input label="Matricule étudiant" value={student.studentId || 'Auto-généré'} readOnly />
          </div>
        )}
      </div>

      {/* Informations personnelles */}
      <div>
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Informations personnelles</h4>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Date de naissance" type="date" value={form.dateOfBirth} onChange={e => set('dateOfBirth', e.target.value)} />
          <Input label="Lieu de naissance" value={form.placeOfBirth} onChange={e => set('placeOfBirth', e.target.value)} placeholder="Optionnel" />
          <Input label="Nationalité" value={form.nationality} onChange={e => set('nationality', e.target.value)} />
          {/* ✅ INE : champ optionnel — envoyé uniquement si renseigné */}
          <Input label="INE (optionnel)" value={form.ine || ''} onChange={e => set('ine', e.target.value)} placeholder="Laisser vide si inconnu" />
        </div>
      </div>

      {/* Mot de passe — création uniquement */}
      {!isEdit && (
        <div>
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Accès</h4>
          <Input label="Mot de passe" type="password"
            value={form.password || ''}
            onChange={e => set('password', e.target.value)}
            placeholder="Laisser vide → 'Etudiant@123'" />
        </div>
      )}

      {/* Tuteur */}
      <div>
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Tuteur / Parent (optionnel)</h4>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Nom" value={form.guardian.name} onChange={e => setG('name', e.target.value)} />
          <Input label="Téléphone" value={form.guardian.phone} onChange={e => setG('phone', e.target.value)} />
          <Input label="Email" value={form.guardian.email} onChange={e => setG('email', e.target.value)} />
          <Select label="Relation" value={form.guardian.relation} onChange={e => setG('relation', e.target.value)} options={relOptions} />
        </div>
      </div>

      {/* Notes */}
      <Input label="Notes administratives" value={form.notes} onChange={e => set('notes', e.target.value)} textarea placeholder="Observations, remarques..." />

      {/* Actions */}
      <div className="flex gap-3 pt-2 border-t">
        <Button variant="secondary" type="button" onClick={onCancel} className="flex-1">Annuler</Button>
        <Button type="submit" loading={loading} className="flex-1">
          {isEdit ? '✏️ Mettre à jour' : '➕ Créer l\'étudiant'}
        </Button>
      </div>
    </form>
  );
}

// ============================================================
// 6. MODAL DÉTAILS ÉTUDIANT
// ============================================================
function StudentDetails({ student }) {
  const infos = [
    ['Email',            student.email],
    ['Téléphone',        student.phone || '—'],
    ['INE',              student.ine   || '—'],
    ['Filière',          student.program?.name || '—'],
    ['Niveau / Semestre',`${student.level} / ${student.currentSemester}`],
    ['Année académique', student.academicYear],
    ['Date de naissance',formatDate(student.dateOfBirth)],
    ['Lieu de naissance',student.placeOfBirth || '—'],
    ['Nationalité',      student.nationality  || '—'],
    ['Date d\'inscription', formatDate(student.enrollmentDate)],
  ];

  return (
    <div className="space-y-5">
      {/* En-tête */}
      <div className="flex items-center gap-4 p-4 bg-indigo-50 rounded-xl">
        <Avatar firstName={student.firstName} lastName={student.lastName} size="xl" />
        <div>
          <h3 className="font-bold text-gray-900 text-lg">{student.firstName} {student.lastName}</h3>
          <p className="text-sm text-indigo-600 font-mono">{student.studentId || '—'}</p>
          <Badge className={`mt-1 ${getStatusColor(student.status)}`}>{getStatusLabel(student.status)}</Badge>
        </div>
      </div>

      {/* Infos */}
      <div className="grid grid-cols-2 gap-2">
        {infos.map(([label, value]) => (
          <div key={label} className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-400 mb-0.5">{label}</p>
            <p className="font-medium text-gray-800 text-sm break-all">{value}</p>
          </div>
        ))}
      </div>

      {/* Tuteur */}
      {student.guardian?.name && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Tuteur / Parent</h4>
          <div className="grid grid-cols-2 gap-2">
            {[['Nom', student.guardian.name], ['Téléphone', student.guardian.phone || '—'],
              ['Email', student.guardian.email || '—'], ['Relation', student.guardian.relation || '—']
            ].map(([label, value]) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                <p className="font-medium text-gray-800 text-sm">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {student.notes && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-1">Notes administratives</h4>
          <p className="text-sm text-gray-600 bg-yellow-50 border border-yellow-100 p-3 rounded-xl">{student.notes}</p>
        </div>
      )}
    </div>
  );
}

// ============================================================
// 7. PAGE PRINCIPALE
// ============================================================
export default function StudentsPage() {
  const { toast, ToastContainer } = useToast();
  const [programs, setPrograms]   = useState([]);

  const { data, total, page, limit, loading, setPage, search, refetch } =
    usePagination(studentAPI.getAll);

  const [modal,        setModal]        = useState({ open: false, student: null });
  const [viewModal,    setViewModal]    = useState({ open: false, student: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, student: null });
  const [deleting,     setDeleting]     = useState(false);
  const [importing,    setImporting]    = useState(false);
  const [exporting,    setExporting]    = useState(false);

  const [filters, setFilters] = useState({
    search: '', program: '', level: '', status: '', academicYear: ''
  });

  // Charger les programmes
  useEffect(() => {
    programAPI.getAll({ limit: 100 })
      .then(res => setPrograms(res.data || res || []))
      .catch(err => console.error('Erreur programmes:', err));
  }, []);

  const handleSearch = (patch) => {
    const f = { ...filters, ...patch };
    setFilters(f);
    search(f);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await studentAPI.delete(deleteDialog.student._id);
      toast('Étudiant désactivé avec succès');
      setDeleteDialog({ open: false, student: null });
      refetch();
    } catch (err) {
      toast(err.response?.data?.message || err.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await studentAPI.exportExcel();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `etudiants_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast('Export Excel réussi');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImporting(true);
    try {
      await studentAPI.importExcel(file);
      toast('Import réussi');
      refetch();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  // Options filtres
  const programOptions = [
    { value: '', label: 'Toutes les filières' },
    ...programs.map(p => ({ value: p._id, label: p.name }))
  ];
  const yearOptions = (() => {
    const cur = getCurrentAcademicYear();
    const y   = parseInt(cur);
    return [
      { value: '', label: 'Toutes années' },
      { value: `${y - 1}-${y}`,   label: `${y - 1}-${y}` },
      { value: cur,                label: cur },
      { value: `${y + 1}-${y + 2}`, label: `${y + 1}-${y + 2}` },
    ];
  })();
  const STATUS_OPTIONS = [
    { value: '', label: 'Tous les statuts' },
    { value: 'active',    label: 'Actif' },
    { value: 'suspended', label: 'Suspendu' },
    { value: 'expelled',  label: 'Exclu' },
    { value: 'graduated', label: 'Diplômé' },
    { value: 'on_leave',  label: 'Congé' },
  ];
  const LEVEL_OPTIONS = [
    { value: '', label: 'Tous les niveaux' },
    ...LEVELS.map(l => ({ value: l, label: l }))
  ];

  // Colonnes tableau
  const columns = [
    {
      header: 'Étudiant', key: 'firstName',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <Avatar firstName={row.firstName} lastName={row.lastName} />
          <div>
            <p className="font-semibold text-gray-900">{row.firstName} {row.lastName}</p>
            <p className="text-xs text-gray-400 font-mono">{row.studentId || row._id?.substring(0, 8)}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Contact', key: 'email',
      render: (_, row) => (
        <div>
          <p className="text-sm text-gray-700">{row.email}</p>
          {row.phone && <p className="text-xs text-gray-400">{row.phone}</p>}
        </div>
      )
    },
    {
      header: 'Filière',  key: 'program',
      render: (_, row) => <span className="text-sm">{row.program?.name || '—'}</span>
    },
    {
      header: 'Niveau',   key: 'level',
      render: (v, row) => (
        <div>
          <span className="font-semibold text-gray-800">{v}</span>
          <span className="text-gray-400 mx-1">/</span>
          <span className="text-gray-600">{row.currentSemester}</span>
        </div>
      )
    },
    {
      header: 'Statut',   key: 'status',
      render: v => <Badge className={getStatusColor(v)}>{getStatusLabel(v)}</Badge>
    },
    {
      header: 'Inscription', key: 'enrollmentDate',
      render: v => <span className="text-xs text-gray-500">{formatDate(v)}</span>
    },
    {
      header: 'Actions',  key: '_id',
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost" title="Voir le détail"
            onClick={() => setViewModal({ open: true, student: row })}>
            <Eye size={15} className="text-gray-500" />
          </Button>
          <Button size="icon" variant="ghost" title="Modifier"
            onClick={() => setModal({ open: true, student: row })}>
            <Edit size={15} className="text-indigo-500" />
          </Button>
          <Button size="icon" variant="ghost" title="Désactiver"
            onClick={() => setDeleteDialog({ open: true, student: row })}>
            <Trash2 size={15} className="text-red-400" />
          </Button>
        </div>
      )
    },
  ];

  return (
    <div className="space-y-5 p-1">
      <ToastContainer />

      {/* En-tête */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Étudiants</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {loading ? '...' : `${total} étudiant${total > 1 ? 's' : ''} enregistré${total > 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="secondary" size="sm" onClick={handleExport} loading={exporting}>
            <Download size={14} /> Exporter
          </Button>
          <label className="cursor-pointer">
            <span className={`inline-flex items-center gap-2 font-medium rounded-lg transition-colors px-3 py-1.5 text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 ${importing ? 'opacity-50' : ''}`}>
              {importing ? <Spinner size={14} /> : <Upload size={14} />} Importer
            </span>
            <input type="file" accept=".xlsx,.xls" onChange={handleImport} className="hidden" disabled={importing} />
          </label>
          <Button onClick={() => setModal({ open: true, student: null })}>
            <Plus size={15} /> Nouvel étudiant
          </Button>
        </div>
      </div>

      {/* Filtres */}
      <Card className="p-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
          <SearchInput value={filters.search} onChange={v => handleSearch({ search: v })} placeholder="🔍 Rechercher..." />
          <Select value={filters.program}      onChange={e => handleSearch({ program: e.target.value })}      options={programOptions} />
          <Select value={filters.level}        onChange={e => handleSearch({ level: e.target.value })}        options={LEVEL_OPTIONS} />
          <Select value={filters.status}       onChange={e => handleSearch({ status: e.target.value })}       options={STATUS_OPTIONS} />
          <Select value={filters.academicYear} onChange={e => handleSearch({ academicYear: e.target.value })} options={yearOptions} />
        </div>
      </Card>

      {/* Tableau */}
      <Card>
        <Table columns={columns} data={data} loading={loading} emptyText="Aucun étudiant trouvé" />
        <Pagination page={page} total={total} limit={limit} onPageChange={setPage} />
      </Card>

      {/* Modal Création / Modification */}
      <Modal
        isOpen={modal.open}
        onClose={() => setModal({ open: false, student: null })}
        title={modal.student ? '✏️ Modifier l\'étudiant' : '➕ Nouvel étudiant'}
        size="lg"
      >
        <StudentForm
          student={modal.student}
          programs={programs}
          onSave={() => {
            setModal({ open: false, student: null });
            refetch();
            toast(modal.student ? 'Étudiant mis à jour' : 'Étudiant créé avec succès');
          }}
          onCancel={() => setModal({ open: false, student: null })}
        />
      </Modal>

      {/* Modal Détails */}
      <Modal
        isOpen={viewModal.open}
        onClose={() => setViewModal({ open: false, student: null })}
        title="👤 Détails de l'étudiant"
        size="lg"
      >
        {viewModal.student && <StudentDetails student={viewModal.student} />}
      </Modal>

      {/* Confirmation désactivation */}
      <ConfirmDialog
        isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, student: null })}
        onConfirm={handleDelete}
        loading={deleting}
        variant="danger"
        confirmLabel="Désactiver"
        title="Désactiver l'étudiant"
        message={`Êtes-vous sûr de vouloir désactiver ${deleteDialog.student?.firstName} ${deleteDialog.student?.lastName} ?`}
      />
    </div>
  );
}