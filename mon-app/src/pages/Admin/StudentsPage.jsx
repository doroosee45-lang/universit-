import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Plus, Edit2, Trash2, Eye, X, Search, GraduationCap, Users,
  Mail, Phone, Calendar, Hash, Camera, ChevronLeft, ChevronRight,
  RefreshCw, FileText, UserCheck, Award, AlertCircle, CheckCircle,
  MapPin, Globe, User, BookOpen, Loader2, LayoutList, LayoutGrid,
  HeartHandshake,
} from 'lucide-react';
import { studentAPI, programAPI } from '../../services/services';

const PHOTO_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');

const LEVELS    = ['L1','L2','L3','M1','M2','D1','D2','D3','BTS1','BTS2','BUT1','BUT2','BUT3'];
const SEMESTERS = ['S1','S2','S3','S4','S5','S6','S7','S8','S9','S10'];

const STATUS_CFG = {
  active:    { label: 'Actif',    cls: 'bg-emerald-100 text-emerald-700 ring-emerald-200' },
  suspended: { label: 'Suspendu', cls: 'bg-amber-100   text-amber-700   ring-amber-200' },
  graduated: { label: 'Diplômé',  cls: 'bg-indigo-100  text-indigo-700  ring-indigo-200' },
  expelled:  { label: 'Exclu',    cls: 'bg-red-100     text-red-700     ring-red-200' },
  on_leave:  { label: 'Congé',    cls: 'bg-slate-100   text-slate-600   ring-slate-200' },
};

const PALETTE = [
  ['#6366f1','#4338ca'], ['#ec4899','#be185d'], ['#f59e0b','#b45309'],
  ['#10b981','#047857'], ['#3b82f6','#1d4ed8'], ['#8b5cf6','#6d28d9'],
  ['#ef4444','#b91c1c'], ['#06b6d4','#0e7490'],
];

function avatarGrad(name = '') {
  return PALETTE[(name.charCodeAt(0) || 0) % PALETTE.length];
}

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function currentAcYear() {
  const y = new Date().getFullYear();
  return new Date().getMonth() >= 8 ? `${y}-${y + 1}` : `${y - 1}-${y}`;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Avatar({ student, size = 36, showCamera = false, onClick }) {
  const name  = (student?.firstName || '') + (student?.lastName || '');
  const [c1, c2] = avatarGrad(name);
  const ini   = `${student?.firstName?.[0] || ''}${student?.lastName?.[0] || ''}`.toUpperCase() || '?';
  const url   = student?.profilePhoto ? `${PHOTO_BASE}${student.profilePhoto}` : null;
  const fs    = size > 56 ? 22 : size > 36 ? 14 : 11;

  return (
    <div
      className={`relative rounded-full overflow-hidden flex-shrink-0 ${onClick ? 'cursor-pointer group' : ''}`}
      style={{ width: size, height: size }}
      onClick={onClick}
    >
      {url ? (
        <img src={url} alt={ini} className="w-full h-full object-cover" />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center font-semibold text-white select-none"
          style={{ background: `linear-gradient(135deg, ${c1}, ${c2})`, fontSize: fs }}
        >
          {ini}
        </div>
      )}
      {showCamera && (
        <div className="absolute inset-0 bg-black/45 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Camera className="text-white" style={{ width: size * 0.35, height: size * 0.35 }} />
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const c = STATUS_CFG[status] || STATUS_CFG.active;
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ring-1 ring-inset ${c.cls}`}>
      {c.label}
    </span>
  );
}

function StatCard({ icon: Icon, label, value, iconCls }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-card p-4 flex items-center gap-4">
      <div className={`p-2.5 rounded-lg ${iconCls}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800">{value ?? 0}</p>
        <p className="text-xs text-slate-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value, span2 = false }) {
  if (!value) return null;
  return (
    <div className={span2 ? 'col-span-2' : ''}>
      <p className="text-xs text-slate-400 mb-0.5">{label}</p>
      <div className="flex items-center gap-1.5">
        {Icon && <Icon className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />}
        <p className="text-sm font-medium text-slate-700">{value}</p>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', placeholder, disabled }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      <input
        type={type} value={value ?? ''}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`input-field w-full ${disabled ? 'opacity-60 cursor-not-allowed bg-slate-50' : ''}`}
      />
    </div>
  );
}

// ── Constants ─────────────────────────────────────────────────────────────────

const EMPTY = {
  firstName: '', lastName: '', email: '', phone: '',
  address: { street: '', city: '', wilaya: '', postalCode: '' },
  program: '', level: 'L1', currentSemester: 'S1', academicYear: '',
  status: 'active', dateOfBirth: '', placeOfBirth: '', nationality: 'Algérienne',
  guardian: { name: '', phone: '', email: '', relation: '' },
  notes: '',
};

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [total, setTotal]       = useState(0);
  const [page,  setPage]        = useState(1);
  const [loading, setLoading]   = useState(false);
  const [error,   setError]     = useState(null);
  const [toast,   setToast]     = useState(null);

  const [search,         setSearch]         = useState('');
  const [filterStatus,   setFilterStatus]   = useState('');
  const [filterProgram,  setFilterProgram]  = useState('');
  const [filterLevel,    setFilterLevel]    = useState('');
  const [viewMode,       setViewMode]       = useState('table');
  const [programs,       setPrograms]       = useState([]);

  // modal: { mode: 'view'|'form', student: null|{...} }
  const [modal,    setModal]    = useState(null);
  const [viewTab,  setViewTab]  = useState('profil');
  const [formTab,  setFormTab]  = useState('identite');
  const [form,     setForm]     = useState({ ...EMPTY, academicYear: currentAcYear() });
  const [saving,   setSaving]   = useState(false);

  const [photoFile,       setPhotoFile]       = useState(null);
  const [photoPreview,    setPhotoPreview]    = useState(null);
  const [photoUploading,  setPhotoUploading]  = useState(false);
  const photoInputRef = useRef(null);

  const PAGE_SIZE  = 10;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  // Derived stats from current page (approximate visual only)
  const counts = students.reduce((acc, s) => {
    acc[s.status] = (acc[s.status] || 0) + 1;
    return acc;
  }, {});

  // ── Toast ──────────────────────────────────────────────────────────────────
  function showToast(msg, type = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  // ── Data loading ───────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: PAGE_SIZE };
      if (search)        params.search  = search;
      if (filterStatus)  params.status  = filterStatus;
      if (filterProgram) params.program = filterProgram;
      if (filterLevel)   params.level   = filterLevel;
      const res = await studentAPI.getAll(params);
      setStudents(res.data       || []);
      setTotal(res.pagination?.total || res.total || 0);
    } catch (e) {
      setError(e.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [page, search, filterStatus, filterProgram, filterLevel]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    programAPI.getAll({ limit: 100 })
      .then(r => setPrograms(r.data || []))
      .catch(() => {});
  }, []);

  // ── Modal helpers ──────────────────────────────────────────────────────────
  function openCreate() {
    setForm({ ...EMPTY, academicYear: currentAcYear() });
    setPhotoFile(null);
    setPhotoPreview(null);
    setFormTab('identite');
    setModal({ mode: 'form', student: null });
  }

  function openEdit(s) {
    setForm({
      firstName: s.firstName  || '',
      lastName:  s.lastName   || '',
      email:     s.email      || '',
      phone:     s.phone      || '',
      address:   { ...EMPTY.address,   ...(s.address  || {}) },
      program:   s.program?._id || s.program || '',
      level:     s.level           || 'L1',
      currentSemester: s.currentSemester || 'S1',
      academicYear:    s.academicYear    || currentAcYear(),
      status:    s.status     || 'active',
      dateOfBirth:  s.dateOfBirth  ? s.dateOfBirth.slice(0, 10) : '',
      placeOfBirth: s.placeOfBirth || '',
      nationality:  s.nationality  || 'Algérienne',
      guardian:  { ...EMPTY.guardian, ...(s.guardian || {}) },
      notes:     s.notes || '',
    });
    setPhotoFile(null);
    setPhotoPreview(s.profilePhoto ? `${PHOTO_BASE}${s.profilePhoto}` : null);
    setFormTab('identite');
    setModal({ mode: 'form', student: s });
  }

  function openView(s) {
    setViewTab('profil');
    setModal({ mode: 'view', student: s });
  }

  function closeModal() {
    setModal(null);
    setPhotoFile(null);
    setPhotoPreview(null);
  }

  function setField(path, value) {
    const parts = path.split('.');
    if (parts.length === 1) {
      setForm(prev => ({ ...prev, [path]: value }));
    } else {
      setForm(prev => ({ ...prev, [parts[0]]: { ...prev[parts[0]], [parts[1]]: value } }));
    }
  }

  function onPhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast('La photo ne doit pas dépasser 2 Mo.', 'error');
      return;
    }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  // ── Save ───────────────────────────────────────────────────────────────────
  async function handleSave() {
    if (!form.firstName || !form.lastName) {
      showToast('Prénom et nom requis.', 'error');
      setFormTab('identite');
      return;
    }
    if (!form.email) {
      showToast('Email requis.', 'error');
      setFormTab('identite');
      return;
    }
    if (!form.program || !form.level || !form.academicYear) {
      showToast('Filière, niveau et année académique requis.', 'error');
      setFormTab('scolarite');
      return;
    }

    setSaving(true);
    try {
      let student;
      if (modal.student) {
        const res = await studentAPI.update(modal.student._id, form);
        student = res.data;
        showToast('Étudiant mis à jour avec succès.');
      } else {
        const res = await studentAPI.create(form);
        student = res.data;
        showToast('Étudiant créé. Email d\'activation envoyé.');
      }

      if (photoFile && student?._id) {
        setPhotoUploading(true);
        const fd = new FormData();
        fd.append('photo', photoFile);
        try {
          await studentAPI.uploadPhoto(student._id, fd);
        } catch {
          showToast('Données sauvegardées mais échec de l\'upload photo.', 'error');
        } finally {
          setPhotoUploading(false);
        }
      }

      closeModal();
      load();
    } catch (e) {
      showToast(e.message || 'Erreur lors de la sauvegarde.', 'error');
    } finally {
      setSaving(false);
    }
  }

  // ── Delete ─────────────────────────────────────────────────────────────────
  async function handleDelete(s, e) {
    e.stopPropagation();
    if (!confirm(`Désactiver l'étudiant ${s.firstName} ${s.lastName} ?`)) return;
    try {
      await studentAPI.delete(s._id);
      showToast('Étudiant désactivé.');
      load();
    } catch (err) {
      showToast(err.message || 'Erreur.', 'error');
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-6 min-h-screen bg-slate-50">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-[300] flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-white text-sm font-medium animate-slide-up
          ${toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}>
          {toast.type === 'error'
            ? <AlertCircle className="w-4 h-4 flex-shrink-0" />
            : <CheckCircle className="w-4 h-4 flex-shrink-0" />}
          {toast.msg}
        </div>
      )}

      {/* ── Page header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Étudiants</h1>
          <p className="text-sm text-slate-500 mt-0.5">{total} étudiant{total !== 1 ? 's' : ''} enregistré{total !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={openCreate} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nouvel étudiant
          </button>
        </div>
      </div>

      {/* ── Stat cards ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users}       label="Total"    value={total}                   iconCls="bg-indigo-50 text-indigo-600" />
        <StatCard icon={UserCheck}   label="Actifs"   value={counts.active || 0}      iconCls="bg-emerald-50 text-emerald-600" />
        <StatCard icon={Award}       label="Diplômés" value={counts.graduated || 0}   iconCls="bg-violet-50 text-violet-600" />
        <StatCard icon={AlertCircle} label="Autres"   value={(counts.suspended || 0) + (counts.expelled || 0) + (counts.on_leave || 0)}
          iconCls="bg-amber-50 text-amber-600" />
      </div>

      {/* ── Filters ──────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-card p-4">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text" value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Nom, email, matricule…"
              className="input-field pl-9 w-full"
            />
          </div>

          <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }} className="input-field">
            <option value="">Tous statuts</option>
            {Object.entries(STATUS_CFG).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>

          <select value={filterProgram} onChange={e => { setFilterProgram(e.target.value); setPage(1); }} className="input-field">
            <option value="">Toutes filières</option>
            {programs.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>

          <select value={filterLevel} onChange={e => { setFilterLevel(e.target.value); setPage(1); }} className="input-field">
            <option value="">Tous niveaux</option>
            {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
          </select>

          {/* View toggle */}
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 ml-auto">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'table' ? 'bg-white shadow-sm text-slate-700' : 'text-slate-400 hover:text-slate-600'}`}
              title="Vue tableau"
            >
              <LayoutList className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-slate-700' : 'text-slate-400 hover:text-slate-600'}`}
              title="Vue grille"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Error ────────────────────────────────────────────────────────────── */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center text-red-600">
          <AlertCircle className="w-8 h-8 mx-auto mb-2" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {/* ── Table view ───────────────────────────────────────────────────────── */}
      {!error && viewMode === 'table' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {['Étudiant','Matricule','Contact','Filière & Niveau','Année acad.','Statut','Inscrit le','Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-slate-400">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      Chargement…
                    </td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-slate-400">
                      <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-25" />
                      <p className="font-medium">Aucun étudiant trouvé</p>
                      <p className="text-xs mt-1">Modifiez les filtres ou ajoutez un étudiant</p>
                    </td>
                  </tr>
                ) : students.map(s => (
                  <tr
                    key={s._id}
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => openView(s)}
                  >
                    {/* Étudiant */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar student={s} size={38} />
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 truncate">{s.firstName} {s.lastName}</p>
                          <p className="text-xs text-slate-400 truncate">{s.email}</p>
                        </div>
                      </div>
                    </td>
                    {/* Matricule */}
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded whitespace-nowrap">
                        {s.studentId || '—'}
                      </span>
                    </td>
                    {/* Contact */}
                    <td className="px-4 py-3">
                      {s.phone
                        ? <p className="text-slate-700 text-xs">{s.phone}</p>
                        : <span className="text-slate-300 text-xs">—</span>
                      }
                    </td>
                    {/* Filière & Niveau */}
                    <td className="px-4 py-3">
                      <p className="text-slate-700 font-medium text-xs leading-snug">{s.program?.name || '—'}</p>
                      <span className="mt-1 inline-block text-xs font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                        {s.level}
                      </span>
                    </td>
                    {/* Année acad. */}
                    <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">
                      {s.academicYear || '—'}
                    </td>
                    {/* Statut */}
                    <td className="px-4 py-3">
                      <StatusBadge status={s.status} />
                    </td>
                    {/* Inscrit le */}
                    <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                      {fmtDate(s.enrollmentDate || s.createdAt)}
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openView(s)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Voir le profil"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEdit(s)}
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={e => handleDelete(s, e)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Désactiver"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Grid view ────────────────────────────────────────────────────────── */}
      {!error && viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
                  <div className="w-16 h-16 rounded-full bg-slate-200 mx-auto mb-3" />
                  <div className="h-4 bg-slate-200 rounded mb-2 w-3/4 mx-auto" />
                  <div className="h-3 bg-slate-100 rounded w-1/2 mx-auto" />
                </div>
              ))
            : students.map(s => (
                <div
                  key={s._id}
                  className="bg-white rounded-xl border border-slate-200 shadow-card p-5 flex flex-col items-center gap-3 hover:shadow-card-md transition-shadow cursor-pointer"
                  onClick={() => openView(s)}
                >
                  <Avatar student={s} size={64} />
                  <div className="text-center">
                    <p className="font-semibold text-slate-800">{s.firstName} {s.lastName}</p>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{s.studentId || '—'}</p>
                  </div>
                  <StatusBadge status={s.status} />
                  <div className="text-xs text-slate-500 text-center leading-relaxed">
                    <p className="font-medium text-slate-700">{s.program?.name || '—'}</p>
                    <p className="text-indigo-600 font-semibold mt-0.5">{s.level} · {s.academicYear}</p>
                  </div>
                  <div
                    className="flex gap-2 pt-2 border-t border-slate-100 w-full"
                    onClick={e => e.stopPropagation()}
                  >
                    <button
                      onClick={() => openEdit(s)}
                      className="flex-1 py-1.5 text-xs font-medium text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => openView(s)}
                      className="flex-1 py-1.5 text-xs font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      Profil
                    </button>
                  </div>
                </div>
              ))
          }
        </div>
      )}

      {/* ── Pagination ───────────────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 shadow-card px-5 py-3">
          <p className="text-sm text-slate-500">
            {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} sur {total}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 text-slate-500 hover:text-slate-700 disabled:opacity-30 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                    p === page ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {p}
                </button>
              );
            })}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 text-slate-500 hover:text-slate-700 disabled:opacity-30 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          MODAL : Vue détail
      ═══════════════════════════════════════════════════════════════════════ */}
      {modal?.mode === 'view' && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-start justify-center p-4 pt-10 overflow-y-auto"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl animate-scale-in mb-8"
            onClick={e => e.stopPropagation()}
          >
            {/* Banner */}
            <div className="relative bg-gradient-to-br from-indigo-600 to-violet-600 rounded-t-2xl p-6">
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-4">
                <div className="ring-4 ring-white/30 rounded-full">
                  <Avatar student={modal.student} size={72} />
                </div>
                <div className="text-white">
                  <h2 className="text-xl font-bold">{modal.student.firstName} {modal.student.lastName}</h2>
                  <p className="text-indigo-200 font-mono text-sm mt-0.5">{modal.student.studentId || 'Matricule non défini'}</p>
                  <div className="mt-2.5">
                    <StatusBadge status={modal.student.status} />
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-100 px-6">
              <div className="flex gap-1">
                {[['profil','Profil'], ['dossier','Dossier académique'], ['famille','Famille']].map(([k, l]) => (
                  <button
                    key={k}
                    onClick={() => setViewTab(k)}
                    className={`px-4 py-3.5 text-sm font-medium border-b-2 transition-colors ${
                      viewTab === k
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6">
              {viewTab === 'profil' && (
                <div className="grid grid-cols-2 gap-5">
                  <InfoRow icon={Mail}     label="Email"         value={modal.student.email} />
                  <InfoRow icon={Phone}    label="Téléphone"     value={modal.student.phone} />
                  <InfoRow icon={Calendar} label="Date naissance" value={fmtDate(modal.student.dateOfBirth)} />
                  <InfoRow icon={MapPin}   label="Lieu naissance" value={modal.student.placeOfBirth} />
                  <InfoRow icon={Globe}    label="Nationalité"   value={modal.student.nationality} />
                  <InfoRow icon={MapPin}   label="Ville"         value={modal.student.address?.city} />
                  <InfoRow icon={MapPin}   label="Wilaya"        value={modal.student.address?.wilaya} />
                  <InfoRow icon={MapPin}   label="Adresse"       value={modal.student.address?.street} span2 />
                </div>
              )}

              {viewTab === 'dossier' && (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-5">
                    <InfoRow icon={BookOpen}      label="Filière / Programme" value={modal.student.program?.name} />
                    <InfoRow icon={FileText}      label="Code filière"        value={modal.student.program?.code} />
                    <InfoRow icon={GraduationCap} label="Niveau"              value={modal.student.level} />
                    <InfoRow icon={Hash}          label="Semestre"            value={modal.student.currentSemester} />
                    <InfoRow icon={Calendar}      label="Année académique"    value={modal.student.academicYear} />
                    <InfoRow icon={Calendar}      label="Date d'inscription"  value={fmtDate(modal.student.enrollmentDate || modal.student.createdAt)} />
                  </div>
                  {modal.student.notes && (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                      <p className="text-xs font-medium text-slate-500 mb-1.5">Notes / Observations</p>
                      <p className="text-sm text-slate-700 leading-relaxed">{modal.student.notes}</p>
                    </div>
                  )}
                </div>
              )}

              {viewTab === 'famille' && (
                <div className="grid grid-cols-2 gap-5">
                  <InfoRow icon={User}           label="Tuteur / Parent"  value={modal.student.guardian?.name} />
                  <InfoRow icon={HeartHandshake} label="Relation"         value={modal.student.guardian?.relation} />
                  <InfoRow icon={Phone}          label="Tél. tuteur"      value={modal.student.guardian?.phone} />
                  <InfoRow icon={Mail}           label="Email tuteur"     value={modal.student.guardian?.email} />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 px-6 pb-6 border-t border-slate-100 pt-4">
              <button onClick={closeModal} className="btn-secondary">Fermer</button>
              <button
                onClick={() => { closeModal(); setTimeout(() => openEdit(modal.student), 50); }}
                className="btn-primary flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" />Modifier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          MODAL : Formulaire création / édition
      ═══════════════════════════════════════════════════════════════════════ */}
      {modal?.mode === 'form' && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-start justify-center p-4 pt-8 overflow-y-auto"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl animate-scale-in mb-8"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-800">
                {modal.student ? `Modifier — ${modal.student.firstName} ${modal.student.lastName}` : 'Nouvel étudiant'}
              </h2>
              <button onClick={closeModal} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab bar */}
            <div className="flex gap-1 px-6 border-b border-slate-100">
              {[['identite','Identité'], ['scolarite','Scolarité'], ['famille','Famille']].map(([k, l]) => (
                <button
                  key={k}
                  onClick={() => setFormTab(k)}
                  className={`px-4 py-3.5 text-sm font-medium border-b-2 transition-colors ${
                    formTab === k
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">

              {/* ── TAB: Identité ────────────────────────────────────────────── */}
              {formTab === 'identite' && (
                <>
                  {/* Photo upload */}
                  <div className="flex flex-col items-center gap-2 pb-4 border-b border-slate-100">
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={onPhotoChange}
                    />
                    <div
                      className="relative cursor-pointer group"
                      onClick={() => photoInputRef.current?.click()}
                      title="Cliquer pour changer la photo"
                    >
                      {photoPreview ? (
                        <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-indigo-100 ring-offset-2">
                          <img src={photoPreview} alt="Aperçu" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center ring-4 ring-slate-200 ring-offset-2">
                          <User className="w-10 h-10 text-slate-300" />
                        </div>
                      )}
                      <div className="absolute inset-0 rounded-full bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="w-6 h-6 text-white" />
                        <span className="text-white text-[10px] font-medium mt-1">Changer</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400">
                      {photoFile ? (
                        <span className="text-indigo-600 font-medium">{photoFile.name}</span>
                      ) : 'Cliquer pour ajouter une photo (JPG/PNG, max 2 Mo)'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Prénom *"        value={form.firstName}        onChange={v => setField('firstName', v)}        placeholder="Bilal" />
                    <Field label="Nom *"           value={form.lastName}         onChange={v => setField('lastName', v)}         placeholder="Ouartsi" />
                    <Field label="Email *"         value={form.email}            onChange={v => setField('email', v)}            placeholder="etud@example.com" type="email" disabled={!!modal.student} />
                    <Field label="Téléphone"       value={form.phone}            onChange={v => setField('phone', v)}            placeholder="+213 5XX XX XX XX" />
                    <Field label="Date naissance"  value={form.dateOfBirth}      onChange={v => setField('dateOfBirth', v)}      type="date" />
                    <Field label="Lieu naissance"  value={form.placeOfBirth}     onChange={v => setField('placeOfBirth', v)}     placeholder="Alger" />
                    <Field label="Nationalité"     value={form.nationality}      onChange={v => setField('nationality', v)}      placeholder="Algérienne" />
                    <Field label="Ville"           value={form.address.city}     onChange={v => setField('address.city', v)}    placeholder="Alger" />
                    <Field label="Wilaya"          value={form.address.wilaya}   onChange={v => setField('address.wilaya', v)}  placeholder="Wilaya" />
                    <Field label="Code postal"     value={form.address.postalCode} onChange={v => setField('address.postalCode', v)} placeholder="16000" />
                    <div className="col-span-2">
                      <Field label="Adresse complète" value={form.address.street} onChange={v => setField('address.street', v)} placeholder="N° et nom de rue, quartier…" />
                    </div>
                  </div>
                </>
              )}

              {/* ── TAB: Scolarité ───────────────────────────────────────────── */}
              {formTab === 'scolarite' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Filière / Programme *</label>
                    <select
                      value={form.program}
                      onChange={e => setField('program', e.target.value)}
                      className="input-field w-full"
                    >
                      <option value="">— Sélectionner une filière —</option>
                      {programs.map(p => (
                        <option key={p._id} value={p._id}>
                          {p.name}{p.code ? ` (${p.code})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Niveau *</label>
                    <select value={form.level} onChange={e => setField('level', e.target.value)} className="input-field w-full">
                      {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Semestre actuel *</label>
                    <select value={form.currentSemester} onChange={e => setField('currentSemester', e.target.value)} className="input-field w-full">
                      {SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <Field label="Année académique *" value={form.academicYear} onChange={v => setField('academicYear', v)} placeholder="2024-2025" />

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Statut</label>
                    <select value={form.status} onChange={e => setField('status', e.target.value)} className="input-field w-full">
                      {Object.entries(STATUS_CFG).map(([k, v]) => (
                        <option key={k} value={k}>{v.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes / Observations</label>
                    <textarea
                      value={form.notes}
                      onChange={e => setField('notes', e.target.value)}
                      rows={3}
                      placeholder="Observations sur le dossier académique, motifs de suspension, etc."
                      className="input-field w-full resize-none"
                    />
                  </div>
                </div>
              )}

              {/* ── TAB: Famille ─────────────────────────────────────────────── */}
              {formTab === 'famille' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 flex items-center gap-2 pb-2 border-b border-slate-100">
                    <HeartHandshake className="w-4 h-4 text-indigo-500" />
                    <p className="text-sm font-semibold text-slate-700">Tuteur / Parent responsable</p>
                  </div>

                  <Field label="Nom complet du tuteur" value={form.guardian.name} onChange={v => setField('guardian.name', v)} placeholder="Prénom Nom" />

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Relation avec l'étudiant</label>
                    <select
                      value={form.guardian.relation}
                      onChange={e => setField('guardian.relation', e.target.value)}
                      className="input-field w-full"
                    >
                      <option value="">— Sélectionner —</option>
                      {['Père','Mère','Frère','Sœur','Oncle','Tante','Tuteur légal','Autre'].map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>

                  <Field label="Téléphone" value={form.guardian.phone} onChange={v => setField('guardian.phone', v)} placeholder="+213 5XX XX XX XX" />
                  <Field label="Email" value={form.guardian.email} onChange={v => setField('guardian.email', v)} placeholder="parent@example.com" type="email" />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 pb-6 pt-4 border-t border-slate-100">
              <div>
                {formTab !== 'identite' && (
                  <button
                    onClick={() => setFormTab(formTab === 'famille' ? 'scolarite' : 'identite')}
                    className="btn-secondary"
                  >
                    ← Précédent
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button onClick={closeModal} className="btn-secondary">Annuler</button>
                {formTab !== 'famille' ? (
                  <button
                    onClick={() => setFormTab(formTab === 'identite' ? 'scolarite' : 'famille')}
                    className="btn-primary"
                  >
                    Suivant →
                  </button>
                ) : (
                  <button
                    onClick={handleSave}
                    disabled={saving || photoUploading}
                    className="btn-primary flex items-center gap-2 min-w-[130px] justify-center"
                  >
                    {saving || photoUploading
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <CheckCircle className="w-4 h-4" />}
                    {saving ? 'Enregistrement…' : photoUploading ? 'Upload photo…' : 'Enregistrer'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
