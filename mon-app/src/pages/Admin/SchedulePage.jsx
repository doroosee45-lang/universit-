
// pages/admin/SchedulePage.jsx – version finale (sans debug)
import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash, X, Loader2 } from 'lucide-react';
import { scheduleAPI, courseAPI, teacherAPI, programAPI } from '../../services/services';

// ─── Composants UI locaux ─────────────────────────────────────────────────
const Spinner = ({ size = 24 }) => <Loader2 size={size} className="animate-spin" />;

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${className}`}>{children}</div>
);

const Button = ({ children, onClick, variant = 'primary', size = 'md', loading, disabled, className = '' }) => {
  const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors disabled:opacity-50';
  const variants = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    ghost: 'hover:bg-gray-100 text-gray-600',
  };
  const sizes = { sm: 'px-2 py-1 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-5 py-2.5' };
  return (
    <button onClick={onClick} disabled={loading || disabled} className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}>
      {loading && <Spinner size={14} />}
      {children}
    </button>
  );
};

const Input = ({ label, value, onChange, type = 'text', required, placeholder }) => (
  <div className="mb-4">
    {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label} {required && '*'}</label>}
    <input
      type={type}
      value={value}
      onChange={onChange}
      required={required}
      placeholder={placeholder}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
    />
  </div>
);

const Select = ({ label, value, onChange, options, required, placeholder }) => (
  <div className="mb-4">
    {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label} {required && '*'}</label>}
    <select
      value={value}
      onChange={onChange}
      required={required}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
    >
      <option value="">{placeholder || 'Sélectionner...'}</option>
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100"><X size={20} /></button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const TIME_SLOTS = Array.from({ length: 13 }, (_, i) => `${7 + i}:00`);
const SEMESTERS = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6'];

const getCurrentAcademicYear = () => {
  const y = new Date().getFullYear();
  return `${y}-${y + 1}`;
};

// ─── Composant principal ─────────────────────────────────────────────────────
export default function AdminSchedulePage() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loadingReferences, setLoadingReferences] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    course: '', teacher: '', program: '', semester: 'S1', group: '', room: '',
    dayOfWeek: 0, startTime: '08:00', endTime: '10:00', academicYear: getCurrentAcademicYear(),
  });
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadSchedules = useCallback(async () => {
    setLoading(true);
    try {
      const res = await scheduleAPI.getAll();
      let data = res?.data?.data ?? res?.data ?? res ?? [];
      if (!Array.isArray(data)) data = [];
      setSchedules(data);
      console.log("Données extraites :", data);
    } catch (err) {
      console.error('Erreur chargement emplois du temps:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadReferences = async () => {
      try {
        const [coursesRes, teachersRes, programsRes] = await Promise.all([
          courseAPI.getAll({ limit: 500 }),
          teacherAPI.getAll({ limit: 200 }),
          programAPI.getAll({ limit: 200 }),
        ]);
        setCourses(coursesRes?.data?.data ?? coursesRes?.data ?? coursesRes ?? []);
        setTeachers(teachersRes?.data?.data ?? teachersRes?.data ?? teachersRes ?? []);
        setPrograms(programsRes?.data?.data ?? programsRes?.data ?? programsRes ?? []);
      } catch (err) {
        console.error('Erreur chargement références:', err);
      } finally {
        setLoadingReferences(false);
      }
    };
    loadReferences();
    loadSchedules();
  }, [loadSchedules]);

  const resetForm = () => {
    setForm({
      course: '', teacher: '', program: '', semester: 'S1', group: '', room: '',
      dayOfWeek: 0, startTime: '08:00', endTime: '10:00', academicYear: getCurrentAcademicYear(),
    });
    setEditing(null);
  };

  const openEdit = (s) => {
    setEditing(s);
    setForm({
      course: s.course?._id || s.course,
      teacher: s.teacher?._id || s.teacher,
      program: s.program?._id || s.program,
      semester: s.semester,
      group: s.group || '',
      room: s.room || '',
      dayOfWeek: s.dayOfWeek,
      startTime: s.startTime,
      endTime: s.endTime,
      academicYear: s.academicYear,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.course || !form.teacher || !form.program) {
      alert('Veuillez sélectionner un cours, un enseignant et une filière');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await scheduleAPI.update(editing._id, form);
      } else {
        await scheduleAPI.create(form);
      }
      await loadSchedules();
      setModalOpen(false);
      resetForm();
    } catch (err) {
      console.error(err);
      const message = err.response?.data?.message || err.message || 'Erreur inconnue';
      alert(`Erreur lors de la sauvegarde : ${message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setSaving(true);
    try {
      await scheduleAPI.delete(deleteId);
      await loadSchedules();
      setDeleteId(null);
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la suppression');
    } finally {
      setSaving(false);
    }
  };

  const byDay = {};
  DAYS.forEach((_, i) => (byDay[i] = []));
  schedules.forEach(s => {
    const dayIdx = s.dayOfWeek;
    if (byDay[dayIdx] !== undefined) byDay[dayIdx].push(s);
  });

  const courseOptions = courses.map(c => ({ value: c._id, label: `${c.code} - ${c.title}` }));
  const teacherOptions = teachers.map(t => ({ value: t._id, label: `${t.firstName} ${t.lastName}` }));
  const programOptions = programs.map(p => ({ value: p._id, label: p.name }));

  if (loading || loadingReferences) return <div className="flex justify-center items-center h-64"><Spinner size={40} /></div>;
  if (courses.length === 0 || teachers.length === 0 || programs.length === 0) {
    return <div className="bg-yellow-50 p-4 rounded">Données manquantes. Veuillez créer des cours, enseignants et filières d'abord.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Gestion des Emplois du Temps</h1>
          <p className="text-sm text-gray-500">{schedules.length} séance(s)</p>
        </div>
        <Button onClick={() => { resetForm(); setModalOpen(true); }}><Plus size={16} /> Nouvelle séance</Button>
      </div>

      {/* Grille des jours */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {DAYS.map((dayName, dayIdx) => (
          <Card key={dayIdx}>
            <div className="px-4 py-3 bg-gray-50 border-b"><h3 className="font-semibold">{dayName}</h3></div>
            <div className="p-4 space-y-2">
              {byDay[dayIdx].length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-2">Aucune séance</p>
              ) : (
                byDay[dayIdx].sort((a,b) => a.startTime.localeCompare(b.startTime)).map(s => (
                  <div key={s._id} className="p-3 rounded-xl bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{s.course?.title || s.course?.code || 'Cours inconnu'}</p>
                        <p className="text-xs text-gray-500">{s.startTime} - {s.endTime} • {s.room || 'Salle ?'}</p>
                        <p className="text-xs text-gray-500">
                          {s.teacher?.firstName} {s.teacher?.lastName || 'Enseignant ?'} • {s.semester}
                          {s.group && ` • Groupe ${s.group}`}
                        </p>
                        <p className="text-xs text-indigo-600">{s.program?.name || 'Filière ?'}</p>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(s)} className="p-1 hover:bg-gray-200 rounded"><Edit size={16} className="text-indigo-500" /></button>
                        <button onClick={() => setDeleteId(s._id)} className="p-1 hover:bg-red-100 rounded"><Trash size={16} className="text-red-500" /></button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Modal formulaire */}
      <Modal open={modalOpen} onClose={() => { setModalOpen(false); resetForm(); }} title={editing ? "Modifier" : "Nouvelle séance"}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Select label="Cours *" value={form.course} onChange={e => setForm({...form, course: e.target.value})} options={courseOptions} required />
          <Select label="Enseignant *" value={form.teacher} onChange={e => setForm({...form, teacher: e.target.value})} options={teacherOptions} required />
          <Select label="Filière *" value={form.program} onChange={e => setForm({...form, program: e.target.value})} options={programOptions} required />
          <Input label="Salle" value={form.room} onChange={e => setForm({...form, room: e.target.value})} placeholder="Ex: Amphi A" />
          <Select label="Semestre" value={form.semester} onChange={e => setForm({...form, semester: e.target.value})} options={SEMESTERS.map(s => ({ value: s, label: s }))} />
          <Input label="Groupe" value={form.group} onChange={e => setForm({...form, group: e.target.value})} placeholder="G1, G2" />
          <Select label="Jour *" value={form.dayOfWeek} onChange={e => setForm({...form, dayOfWeek: parseInt(e.target.value)})} options={DAYS.map((d,i) => ({ value: i, label: d }))} required />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Heure début" value={form.startTime} onChange={e => setForm({...form, startTime: e.target.value})} options={TIME_SLOTS.map(t => ({ value: t, label: t }))} />
            <Select label="Heure fin" value={form.endTime} onChange={e => setForm({...form, endTime: e.target.value})} options={TIME_SLOTS.map(t => ({ value: t, label: t }))} />
          </div>
          <Input label="Année académique" value={form.academicYear} onChange={e => setForm({...form, academicYear: e.target.value})} required />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => { setModalOpen(false); resetForm(); }} className="flex-1">Annuler</Button>
            <Button type="submit" loading={saving} className="flex-1">{editing ? "Mettre à jour" : "Créer"}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Confirmation">
        <p>Supprimer cette séance ?</p>
        <div className="flex gap-3 mt-4">
          <Button variant="secondary" onClick={() => setDeleteId(null)}>Annuler</Button>
          <Button variant="danger" onClick={handleDelete} loading={saving}>Supprimer</Button>
        </div>
      </Modal>
    </div>
  );
}