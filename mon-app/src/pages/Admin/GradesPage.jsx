// pages/admin/GradesPage.jsx  — version corrigée & complète
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Plus, Download, Save, Search, X, ChevronLeft, ChevronRight,
  Loader2, AlertCircle, CheckCircle, BookOpen, Users, Award,
  Filter, FileText, TrendingUp
} from 'lucide-react';
import { gradeAPI, ueAPI, studentAPI } from '../../services/services';

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const extractList = (res, keys = []) => {
  if (!res) return [];
  for (const k of keys) if (Array.isArray(res[k])) return res[k];
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res))      return res;
  return [];
};
const extractTotal = (res, list) =>
  res?.total ?? res?.count ?? res?.data?.total ?? list.length;

const getCurrentAcademicYear = () => {
  const y = new Date().getFullYear();
  return `${y}-${y + 1}`;
};

const getMention = (avg) => {
  if (avg == null) return null;
  if (avg >= 16) return { label: 'Très Bien',  color: 'text-purple-700', bg: 'bg-purple-100' };
  if (avg >= 14) return { label: 'Bien',        color: 'text-blue-700',   bg: 'bg-blue-100'   };
  if (avg >= 12) return { label: 'Assez Bien',  color: 'text-teal-700',   bg: 'bg-teal-100'   };
  if (avg >= 10) return { label: 'Passable',    color: 'text-green-700',  bg: 'bg-green-100'  };
  return           { label: 'Non validé',  color: 'text-red-700',    bg: 'bg-red-100'    };
};

// ─── CONSTANTES ───────────────────────────────────────────────────────────────
const SEMESTERS = ['S1','S2','S3','S4','S5','S6','S7','S8'];
const SESSIONS  = [
  { value: 'session1',   label: 'Session 1'   },
  { value: 'session2',   label: 'Session 2'   },
  { value: 'rattrapage', label: 'Rattrapage'  },
];
const EVALUATION_TYPES = [
  { type: 'cc',      label: 'CC',      defaultWeight: 40 },
  { type: 'partiel', label: 'Partiel', defaultWeight: 20 },
  { type: 'final',   label: 'Final',   defaultWeight: 40 },
];

// ─── TOAST ────────────────────────────────────────────────────────────────────
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
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} style={{ animation: 'slideIn .25s ease' }}
          className={`pointer-events-auto flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium border
            ${t.type === 'error'
              ? 'bg-red-50 text-red-700 border-red-200'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
          {t.type === 'error' ? <AlertCircle size={15}/> : <CheckCircle size={15}/>}
          {t.message}
          <button onClick={() => remove(t.id)} className="ml-2 opacity-50 hover:opacity-100">
            <X size={13}/>
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── UI PRIMITIVES ────────────────────────────────────────────────────────────
const Spinner = ({ size = 16 }) => <Loader2 size={size} className="animate-spin"/>;

const Badge = ({ children, className = '' }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${className}`}>
    {children}
  </span>
);

function Button({ children, variant='primary', size='md', loading, disabled, className='', ...props }) {
  const base = 'inline-flex items-center gap-1.5 font-medium rounded-lg transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed';
  const v = {
    primary:   'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm',
    secondary: 'bg-white border border-gray-300 hover:bg-gray-50 text-gray-700',
    ghost:     'hover:bg-gray-100 text-gray-600',
    danger:    'bg-red-600 hover:bg-red-700 text-white shadow-sm',
    success:   'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm',
  };
  const s = { sm: 'px-2.5 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-5 py-2.5 text-base' };
  return (
    <button {...props} disabled={disabled || loading}
      className={`${base} ${v[variant]} ${s[size]} ${className}`}>
      {loading ? <Spinner size={14}/> : children}
    </button>
  );
}

function Input({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>}
      <input
        className={`border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition ${error?'border-red-400':''} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function Select({ label, options = [], className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>}
      <select
        className={`border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white transition ${className}`}
        {...props}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

// ─── MODAL ────────────────────────────────────────────────────────────────────
function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);
  if (!isOpen) return null;
  const widths = { sm:'max-w-sm', md:'max-w-md', lg:'max-w-2xl', xl:'max-w-5xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}/>
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${widths[size]} max-h-[92vh] flex flex-col`}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition p-1 hover:bg-gray-100 rounded-lg">
            <X size={18}/>
          </button>
        </div>
        <div className="overflow-y-auto p-5 flex-1">{children}</div>
      </div>
    </div>
  );
}

// ─── AVATAR ───────────────────────────────────────────────────────────────────
function Avatar({ firstName, lastName, size = 'sm' }) {
  const initials = `${firstName?.[0]||''}${lastName?.[0]||''}`.toUpperCase();
  const s = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm' };
  return (
    <div className={`${s[size]} rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold flex-shrink-0`}>
      {initials || '?'}
    </div>
  );
}

// ─── GRADE ENTRY MODAL ────────────────────────────────────────────────────────
function GradeEntryModal({ ue, students, academicYear, semester, session, onSave, onCancel, toast }) {
  const [rows, setRows] = useState(() =>
    students.map(s => ({
      student:     s._id,
      name:        `${s.firstName} ${s.lastName}`,
      studentId:   s.studentId || s._id?.slice(-6),
      assessments: EVALUATION_TYPES.map(t => ({
        type:   t.type,
        label:  t.label,
        score:  '',
        weight: ue?.evaluationWeights?.[t.type] ?? t.defaultWeight,
      })),
    }))
  );
  const [saving, setSaving] = useState(false);

  const updateScore = (si, ai, val) => {
    setRows(prev => prev.map((r, ri) => ri !== si ? r : {
      ...r,
      assessments: r.assessments.map((a, idx) => idx !== ai ? a : { ...a, score: val }),
    }));
  };

  const calcAvg = (assessments) => {
    let total = 0, wSum = 0;
    assessments.forEach(a => {
      const sc = parseFloat(a.score);
      if (!isNaN(sc)) { total += sc * a.weight; wSum += a.weight; }
    });
    return wSum > 0 ? Math.round(total / wSum * 100) / 100 : null;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = rows.map(r => ({
        student:     r.student,
        assessments: r.assessments.map(a => ({
          type: a.type, label: a.label,
          score: parseFloat(a.score) || 0,
          maxScore: 20, weight: a.weight,
        })),
      }));
      await gradeAPI.bulkUpsert({ ue: ue._id, academicYear, semester, session, grades: data });
      toast('Notes enregistrées avec succès');
      onSave();
    } catch (err) {
      toast(err.message || 'Erreur lors de l\'enregistrement', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* En-tête UE */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
        <Badge className="bg-indigo-200 text-indigo-800">{ue?.code}</Badge>
        <span className="font-semibold text-gray-800 text-sm">{ue?.title}</span>
        <span className="text-xs text-gray-500">· {semester} · {session} · {academicYear}</span>
      </div>

      {/* Tableau de saisie */}
      <div className="overflow-auto max-h-[55vh] rounded-xl border border-gray-100">
        <table className="w-full text-sm border-collapse">
          <thead className="sticky top-0 bg-gray-50 z-10">
            <tr className="border-b border-gray-200">
              <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Étudiant</th>
              {EVALUATION_TYPES.map(t => (
                <th key={t.type} className="px-4 py-3 font-semibold text-gray-600 text-center whitespace-nowrap">
                  {t.label}
                  <span className="ml-1 text-xs font-normal text-gray-400">
                    ({ue?.evaluationWeights?.[t.type] ?? t.defaultWeight}%)
                  </span>
                </th>
              ))}
              <th className="px-4 py-3 font-semibold text-gray-600 text-center">Moyenne</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-gray-400">
                  Aucun étudiant trouvé pour cette UE
                </td>
              </tr>
            ) : rows.map((r, si) => {
              const avg = calcAvg(r.assessments);
              const mention = getMention(avg);
              return (
                <tr key={r.student} className="hover:bg-indigo-50/30 transition-colors">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <Avatar firstName={r.name.split(' ')[0]} lastName={r.name.split(' ')[1]}/>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{r.name}</p>
                        <p className="text-xs text-gray-400 font-mono">{r.studentId}</p>
                      </div>
                    </div>
                  </td>
                  {r.assessments.map((a, ai) => (
                    <td key={ai} className="px-4 py-2.5 text-center">
                      <input
                        type="number" min="0" max="20" step="0.25"
                        value={a.score}
                        onChange={e => updateScore(si, ai, e.target.value)}
                        placeholder="—"
                        className="w-20 text-center border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
                      />
                    </td>
                  ))}
                  <td className="px-4 py-2.5 text-center">
                    {avg != null ? (
                      <span className={`font-bold text-sm ${mention?.color}`}>{avg}/20</span>
                    ) : (
                      <span className="text-gray-300 text-sm">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-1 border-t border-gray-100">
        <Button variant="secondary" onClick={onCancel} className="flex-1">Annuler</Button>
        <Button variant="success" onClick={handleSave} loading={saving} className="flex-1">
          <Save size={15}/> Enregistrer les notes
        </Button>
      </div>
    </div>
  );
}

// ─── STEP SELECTOR (modal étape 1 : choisir UE + contexte) ────────────────────
function StepSelector({ ues, onNext, onCancel }) {
  const [sel, setSel]     = useState({ ue: '', semester: 'S1', session: 'session1', academicYear: getCurrentAcademicYear() });
  const ueOpts = [{ value: '', label: '— Sélectionner une UE —' }, ...ues.map(u => ({ value: u._id, label: `${u.code} – ${u.title}` }))];
  const semOpts = SEMESTERS.map(s => ({ value: s, label: s }));
  const sesOpts = SESSIONS;

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">Choisissez l'UE, le semestre et la session avant de saisir les notes.</p>
      <Select label="UE" value={sel.ue} onChange={e => setSel(p => ({ ...p, ue: e.target.value }))} options={ueOpts}/>
      <div className="grid grid-cols-2 gap-3">
        <Select label="Semestre" value={sel.semester} onChange={e => setSel(p => ({ ...p, semester: e.target.value }))} options={semOpts}/>
        <Select label="Session"  value={sel.session}  onChange={e => setSel(p => ({ ...p, session:  e.target.value }))} options={sesOpts}/>
      </div>
      <Input label="Année académique" value={sel.academicYear} onChange={e => setSel(p => ({ ...p, academicYear: e.target.value }))}/>
      <div className="flex gap-3 pt-2 border-t border-gray-100">
        <Button variant="secondary" onClick={onCancel} className="flex-1">Annuler</Button>
        <Button onClick={() => sel.ue && onNext(sel)} disabled={!sel.ue} className="flex-1">
          Suivant →
        </Button>
      </div>
    </div>
  );
}

// ─── PAGE PRINCIPALE ──────────────────────────────────────────────────────────
export default function GradesPage() {
  const { toast, toasts, remove } = useToast();

  // Données de référence
  const [ues,      setUes]      = useState([]);
  const [students, setStudents] = useState([]);
  const [loadingRefs, setLoadingRefs] = useState(true);

  // Tableau des notes
  const [grades,   setGrades]   = useState([]);
  const [total,    setTotal]    = useState(0);
  const [loading,  setLoading]  = useState(false);
  const [page,     setPage]     = useState(1);
  const limit = 15;

  // Filtres
  const [filters, setFilters] = useState({
    ue: '', semester: '', session: '', academicYear: getCurrentAcademicYear(), search: '',
  });
  const searchTimer = useRef(null);

  // Modal saisie
  const [modal, setModal] = useState({ open: false, step: 1, sel: null });
  const [loadingStudents, setLoadingStudents] = useState(false);

  // ── Chargement des références ──────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      setLoadingRefs(true);
      try {
        const [ueRes, stRes] = await Promise.all([
          ueAPI.getAll({ limit: 1000, page: 1 }),
          studentAPI.getAll({ limit: 1000, page: 1 }),
        ]);
        setUes(extractList(ueRes, ['ues']));

        // Normalise toutes les structures possibles de réponse API étudiants
        const rawStudents =
          stRes?.data?.data   ||   // { data: { data: [] } }
          stRes?.data         ||   // { data: [] }
          stRes?.students     ||   // { students: [] }
          stRes?.results      ||   // { results: [] }
          (Array.isArray(stRes) ? stRes : []);
        // DEBUG — à retirer après vérification
        console.log('[GradesPage] studentAPI raw response:', stRes);
        console.log('[GradesPage] students parsed:', rawStudents.length, 'étudiants');

        setStudents(rawStudents);
      } catch (err) {
        toast('Erreur lors du chargement des références', 'error');
      } finally {
        setLoadingRefs(false);
      }
    })();
  }, []);

  // ── Chargement des notes ───────────────────────────────────────────────────
  const fetchGrades = useCallback(async (p = page, f = filters) => {
    setLoading(true);
    try {
      const params = { page: p, limit };
      if (f.ue)           params.ue           = f.ue;
      if (f.semester)     params.semester     = f.semester;
      if (f.session)      params.session      = f.session;
      if (f.academicYear) params.academicYear = f.academicYear;
      if (f.search)       params.search       = f.search;
      const res  = await gradeAPI.getAll(params);
      const list = extractList(res, ['grades']);
      setGrades(list);
      setTotal(extractTotal(res, list));
    } catch (err) {
      toast(err.message || 'Erreur de chargement', 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchGrades(page, filters); }, [page, filters]);

  const handleFilter = (k, v) => {
    const f = { ...filters, [k]: v };
    setFilters(f);
    setPage(1);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => fetchGrades(1, f), k === 'search' ? 400 : 0);
  };

  // ── Ouvrir la saisie : étape 2 – charger les étudiants de l'UE ─────────────
  const handleOpenEntry = async (sel) => {
    setLoadingStudents(true);
    try {
      // Idéalement : studentAPI.getAll({ ue: sel.ue, limit: 200 })
      // Si pas de filtre UE côté API, on prend tous les students déjà chargés
      let studs = students;
      if (studs.length === 0) {
        const res = await studentAPI.getAll({ limit: 1000, page: 1 });
        studs =
          res?.data?.data  ||
          res?.data        ||
          res?.students    ||
          res?.results     ||
          (Array.isArray(res) ? res : []);
        setStudents(studs);
      }
      setModal({ open: true, step: 2, sel, students: studs });
    } catch (err) {
      toast('Impossible de charger les étudiants', 'error');
    } finally {
      setLoadingStudents(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  // ── Options filtre ─────────────────────────────────────────────────────────
  const ueOpts     = [{ value: '', label: 'Toutes les UE' }, ...ues.map(u => ({ value: u._id, label: `${u.code} – ${u.title}` }))];
  const semOpts    = [{ value: '', label: 'Tous semestres' }, ...SEMESTERS.map(s => ({ value: s, label: s }))];
  const sesOpts    = [{ value: '', label: 'Toutes sessions' }, ...SESSIONS];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { font-family: 'Plus Jakarta Sans', sans-serif; box-sizing: border-box; }
        @keyframes fadeIn  { from { opacity:0; transform:translateY(8px);   } to { opacity:1; transform:translateY(0);   } }
        @keyframes slideIn { from { opacity:0; transform:translateX(16px);  } to { opacity:1; transform:translateX(0);   } }
        .anim-fade  { animation: fadeIn  .3s ease; }
        .anim-slide { animation: slideIn .25s ease; }
      `}</style>

      <ToastContainer toasts={toasts} remove={remove}/>

      <div className="min-h-screen bg-gray-50 p-6 anim-fade">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* ── En-tête ───────────────────────────────────────────────────── */}
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                  <Award size={20} className="text-white"/>
                </div>
                <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Notes & Évaluations</h1>
              </div>
              <p className="text-sm text-gray-500 ml-[52px]">
                {loading ? 'Chargement...' : `${total} enregistrement${total > 1 ? 's' : ''}`}
                {loadingRefs && <span className="ml-2 text-indigo-500"><Spinner size={12}/></span>}
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button variant="secondary" size="sm">
                <Download size={14}/> Exporter
              </Button>
              <Button onClick={() => setModal({ open: true, step: 1 })}>
                <Plus size={15}/> Saisir des notes
              </Button>
            </div>
          </div>

          {/* ── Stats rapides ──────────────────────────────────────────────── */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'UE chargées',     value: ues.length,      color: 'bg-blue-50 text-blue-700 border-blue-200',   icon: BookOpen   },
              { label: 'Étudiants',       value: students.length, color: 'bg-violet-50 text-violet-700 border-violet-200', icon: Users },
              { label: 'Notes saisies',   value: total,           color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: FileText },
            ].map(({ label, value, color, icon: Icon }) => (
              <div key={label} className={`rounded-xl border p-4 flex items-center gap-3 ${color}`}>
                <Icon size={20}/>
                <div>
                  <p className="text-xs font-semibold opacity-70">{label}</p>
                  <p className="text-xl font-extrabold">{loadingRefs ? '…' : value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Filtres ────────────────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex gap-3 flex-wrap items-end">
              {/* Recherche */}
              <div className="relative flex-1 min-w-48">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                <input
                  value={filters.search}
                  onChange={e => handleFilter('search', e.target.value)}
                  placeholder="Rechercher un étudiant, une UE..."
                  className="w-full border border-gray-200 rounded-lg pl-9 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                {filters.search && (
                  <button onClick={() => handleFilter('search', '')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X size={12}/>
                  </button>
                )}
              </div>

              <div className="flex gap-2 flex-wrap">
                <select value={filters.ue} onChange={e => handleFilter('ue', e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white min-w-[180px]">
                  {ueOpts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <select value={filters.semester} onChange={e => handleFilter('semester', e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white">
                  {semOpts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <select value={filters.session} onChange={e => handleFilter('session', e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white">
                  {sesOpts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <input
                  value={filters.academicYear}
                  onChange={e => handleFilter('academicYear', e.target.value)}
                  placeholder="Année académique"
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 w-36"
                />
                {(filters.ue || filters.semester || filters.session || filters.search) && (
                  <button
                    onClick={() => { setFilters(f => ({ ...f, ue: '', semester: '', session: '', search: '' })); setPage(1); }}
                    className="flex items-center gap-1 px-3 py-2 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                  >
                    <X size={12}/> Réinitialiser
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ── Tableau des notes ──────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
                <Spinner size={32}/>
                <p className="text-sm">Chargement des notes...</p>
              </div>
            ) : grades.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
                <TrendingUp size={44} strokeWidth={1.2}/>
                <p className="text-sm font-medium">Aucune note enregistrée</p>
                <Button onClick={() => setModal({ open: true, step: 1 })} size="sm">
                  <Plus size={14}/> Saisir les premières notes
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/60">
                      {['Étudiant', 'UE', 'Semestre', 'Session', 'Année', 'Moy. finale', 'Mention', 'Validé', 'ECTS'].map(h => (
                        <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {grades.map((row, i) => {
                      const mention = getMention(row.finalAverage);
                      return (
                        <tr key={row._id || i} className="hover:bg-indigo-50/30 transition-colors">
                          {/* Étudiant */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <Avatar firstName={row.student?.firstName} lastName={row.student?.lastName}/>
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {row.student?.firstName} {row.student?.lastName}
                                </p>
                                <p className="text-xs text-gray-400 font-mono">{row.student?.studentId || '—'}</p>
                              </div>
                            </div>
                          </td>
                          {/* UE */}
                          <td className="px-5 py-3.5">
                            <Badge className="bg-indigo-100 text-indigo-700">{row.ue?.code || '—'}</Badge>
                            <p className="text-xs text-gray-400 mt-0.5 max-w-[140px] truncate">{row.ue?.title}</p>
                          </td>
                          {/* Semestre */}
                          <td className="px-5 py-3.5">
                            <Badge className="bg-gray-100 text-gray-700">{row.semester || '—'}</Badge>
                          </td>
                          {/* Session */}
                          <td className="px-5 py-3.5">
                            <Badge className={
                              row.session === 'session1'   ? 'bg-blue-100 text-blue-700'   :
                              row.session === 'session2'   ? 'bg-amber-100 text-amber-700' :
                              row.session === 'rattrapage' ? 'bg-rose-100 text-rose-700'   :
                              'bg-gray-100 text-gray-600'
                            }>
                              {row.session === 'session1' ? 'Session 1' : row.session === 'session2' ? 'Session 2' : row.session || '—'}
                            </Badge>
                          </td>
                          {/* Année */}
                          <td className="px-5 py-3.5 text-xs text-gray-500">{row.academicYear || '—'}</td>
                          {/* Moyenne */}
                          <td className="px-5 py-3.5">
                            {row.finalAverage != null
                              ? <span className={`font-bold ${mention?.color}`}>{row.finalAverage}/20</span>
                              : <span className="text-gray-300">—</span>}
                          </td>
                          {/* Mention */}
                          <td className="px-5 py-3.5">
                            {mention
                              ? <Badge className={`${mention.bg} ${mention.color}`}>{mention.label}</Badge>
                              : <span className="text-gray-300">—</span>}
                          </td>
                          {/* Validé */}
                          <td className="px-5 py-3.5">
                            <Badge className={row.isValidated ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}>
                              {row.isValidated ? '✓ Validé' : '✗ Non validé'}
                            </Badge>
                          </td>
                          {/* ECTS */}
                          <td className="px-5 py-3.5">
                            <span className={`font-semibold text-sm ${(row.ectsObtained || 0) > 0 ? 'text-emerald-600' : 'text-gray-400'}`}>
                              {row.ectsObtained || 0}/{row.ue?.credits || '—'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
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
                    className="p-1.5 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-40 transition">
                    <ChevronLeft size={15}/>
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
                    className="p-1.5 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-40 transition">
                    <ChevronRight size={15}/>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ── Modal saisie des notes ────────────────────────────────────────── */}
      <Modal
        isOpen={modal.open}
        onClose={() => setModal({ open: false, step: 1 })}
        title={modal.step === 1 ? 'Nouvelle saisie – choisir le contexte' : `Saisie des notes · ${modal.sel?.ue ? ues.find(u => u._id === modal.sel.ue)?.code : ''}`}
        size={modal.step === 2 ? 'xl' : 'md'}
      >
        {modal.step === 1 ? (
          <StepSelector
            ues={ues}
            onNext={(sel) => handleOpenEntry(sel)}
            onCancel={() => setModal({ open: false, step: 1 })}
          />
        ) : loadingStudents ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
            <Spinner size={32}/>
            <p className="text-sm">Chargement des étudiants...</p>
          </div>
        ) : (
          <GradeEntryModal
            ue={ues.find(u => u._id === modal.sel?.ue)}
            students={modal.students || []}
            academicYear={modal.sel?.academicYear}
            semester={modal.sel?.semester}
            session={modal.sel?.session}
            toast={toast}
            onSave={() => { setModal({ open: false, step: 1 }); fetchGrades(); }}
            onCancel={() => setModal({ open: false, step: 1 })}
          />
        )}
      </Modal>
    </>
  );
}