// import { useState } from 'react';
// import { Plus, Download } from 'lucide-react';
// import { gradeAPI, ueAPI, studentAPI } from '../../services/services';
// import {
//   Button, Card, Table, Pagination, Select, Badge, Modal, useToast, Spinner, Input
// } from '../../components/common';
// import { usePagination, useFetch } from '../../components/hooks/useFetch';
// import { getMention, SEMESTERS, getCurrentAcademicYear } from '../../components/utils/helpers';
// import { useAuth } from '../../components/context/AuthContext';

// function GradeEntryModal({ ue, students, academicYear, semester, onSave, onCancel }) {
//   const [grades, setGrades] = useState(
//     students.map(s => ({
//       student: s._id,
//       name: `${s.firstName} ${s.lastName}`,
//       assessments: [
//         { type: 'controle_continu', label: 'CC', score: '', weight: ue?.evaluationWeights?.cc || 40 },
//         { type: 'examen_partiel', label: 'Partiel', score: '', weight: ue?.evaluationWeights?.partiel || 20 },
//         { type: 'examen_final', label: 'Final', score: '', weight: ue?.evaluationWeights?.final || 40 },
//       ]
//     }))
//   );
//   const [loading, setLoading] = useState(false);
//   const { toast, ToastContainer } = useToast();

//   const updateScore = (si, ai, score) => {
//     setGrades(prev => prev.map((g, sIdx) => sIdx === si
//       ? { ...g, assessments: g.assessments.map((a, aIdx) => aIdx === ai ? { ...a, score } : a) }
//       : g
//     ));
//   };

//   const calcAvg = (assessments) =>
//     assessments.reduce((sum, a) => {
//       const s = parseFloat(a.score);
//       return !isNaN(s) ? sum + (s * a.weight / 100) : sum;
//     }, 0);

//   const handleSave = async () => {
//     setLoading(true);
//     try {
//       const data = grades.map(g => ({
//         student: g.student,
//         assessments: g.assessments.map(a => ({
//           type: a.type, label: a.label,
//           score: parseFloat(a.score) || 0,
//           maxScore: 20, weight: a.weight,
//         }))
//       }));
//       await gradeAPI.bulkUpsert({ ue: ue._id, academicYear, semester, grades: data });
//       onSave();
//     } catch (err) { toast(err.message, 'error'); }
//     finally { setLoading(false); }
//   };

//   return (
//     <div className="space-y-4">
//       <ToastContainer />
//       <div className="flex items-center gap-2 p-3 bg-indigo-50 rounded-xl">
//         <Badge className="bg-indigo-100 text-indigo-700">{ue?.code}</Badge>
//         <span className="text-sm font-medium text-gray-800">{ue?.title}</span>
//         <span className="text-xs text-gray-500">• {semester} • {academicYear}</span>
//       </div>
//       <div className="overflow-x-auto">
//         <table className="w-full text-sm">
//           <thead>
//             <tr className="bg-gray-50 border-b border-gray-100">
//               <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500">Étudiant</th>
//               <th className="px-3 py-2.5 text-center text-xs font-semibold text-gray-500">CC ({ue?.evaluationWeights?.cc}%)</th>
//               <th className="px-3 py-2.5 text-center text-xs font-semibold text-gray-500">Partiel ({ue?.evaluationWeights?.partiel}%)</th>
//               <th className="px-3 py-2.5 text-center text-xs font-semibold text-gray-500">Final ({ue?.evaluationWeights?.final}%)</th>
//               <th className="px-3 py-2.5 text-center text-xs font-semibold text-gray-500">Moyenne</th>
//             </tr>
//           </thead>
//           <tbody>
//             {grades.map((g, si) => {
//               const avg = calcAvg(g.assessments);
//               const m = getMention(avg);
//               return (
//                 <tr key={g.student} className="border-b border-gray-50">
//                   <td className="px-3 py-2 font-medium text-gray-800">{g.name}</td>
//                   {g.assessments.map((a, ai) => (
//                     <td key={ai} className="px-3 py-2">
//                       <input type="number" min="0" max="20" step="0.25" value={a.score}
//                         onChange={e => updateScore(si, ai, e.target.value)}
//                         className="w-16 mx-auto block text-center border border-gray-200 rounded-lg py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
//                     </td>
//                   ))}
//                   <td className="px-3 py-2 text-center">
//                     {g.assessments.some(a => a.score !== '') ? (
//                       <span className={`text-sm font-bold ${m.color}`}>{Math.round(avg * 100) / 100}/20</span>
//                     ) : <span className="text-gray-300">—</span>}
//                   </td>
//                 </tr>
//               );
//             })}
//           </tbody>
//         </table>
//       </div>
//       <div className="flex gap-3 pt-2">
//         <Button variant="secondary" onClick={onCancel} className="flex-1">Annuler</Button>
//         <Button onClick={handleSave} loading={loading} className="flex-1">Enregistrer les notes</Button>
//       </div>
//     </div>
//   );
// }

// export default function TeacherGradesPage() {
//   const { user } = useAuth();
//   const { toast, ToastContainer } = useToast();
//   const { data: ues } = useFetch(() => ueAPI.getAll({ limit: 200 }));
//   const { data, total, page, limit, loading, setPage, search, refetch } = usePagination(
//     (params) => gradeAPI.getAll(params)
//   );
//   const [filters, setFilters] = useState({ ue: '', semester: '', academicYear: getCurrentAcademicYear() });
//   const [entryModal, setEntryModal] = useState({ open: false, ue: null });
//   const [students, setStudents] = useState([]);
//   const [loadingStudents, setLoadingStudents] = useState(false);

//   const ueList = ues?.data || ues || [];

//   const openEntry = async (ue) => {
//     setLoadingStudents(true);
//     setEntryModal({ open: true, ue });
//     try {
//       const res = await studentAPI.getAll({ limit: 200 });
//       setStudents(res.data?.data || res.data || []);
//     } catch {}
//     finally { setLoadingStudents(false); }
//   };

//   const handleFilter = (k, v) => { const f = { ...filters, [k]: v }; setFilters(f); search(f); };

//   const columns = [
//     { header: 'Étudiant', key: 'student', render: (_, row) => (
//       <div><p className="font-medium text-gray-900 text-sm">{row.student?.firstName} {row.student?.lastName}</p>
//       <p className="text-xs text-gray-400">{row.student?.studentId}</p></div>
//     )},
//     { header: 'UE', key: 'ue', render: (_, row) => (
//       <div><Badge className="bg-indigo-100 text-indigo-700">{row.ue?.code}</Badge>
//       <p className="text-xs text-gray-500 mt-0.5">{row.ue?.title}</p></div>
//     )},
//     { header: 'Semestre', key: 'semester', render: v => <Badge className="bg-gray-100 text-gray-600">{v}</Badge> },
//     { header: 'Moyenne', key: 'finalAverage', render: v => {
//       if (v == null) return <span className="text-gray-300">—</span>;
//       const m = getMention(v);
//       return <span className={`font-bold text-sm ${m.color}`}>{v}/20</span>;
//     }},
//     { header: 'Mention', key: 'mention', render: (_, row) => {
//       if (row.finalAverage == null) return null;
//       const m = getMention(row.finalAverage);
//       return <Badge className={`${m.bg} ${m.color}`}>{m.label}</Badge>;
//     }},
//     { header: 'Validé', key: 'isValidated', render: v =>
//       v ? <Badge className="bg-green-100 text-green-700">✓</Badge> : <Badge className="bg-red-100 text-red-700">✗</Badge>
//     },
//   ];

//   return (
//     <div className="space-y-6">
//       <ToastContainer />
//       <div className="flex items-center justify-between flex-wrap gap-4">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">Saisie des Notes</h1>
//           <p className="text-sm text-gray-500 mt-1">{total} enregistrement{total > 1 ? 's' : ''}</p>
//         </div>
//         <Button onClick={() => setEntryModal({ open: true, ue: null })}>
//           <Plus size={16} /> Saisir des notes
//         </Button>
//       </div>

//       <Card className="p-4">
//         <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
//           <Select value={filters.ue} onChange={e => handleFilter('ue', e.target.value)}
//             options={[{ value: '', label: 'Toutes les UE' }, ...ueList.map(u => ({ value: u._id, label: `${u.code} - ${u.title}` }))]} />
//           <Select value={filters.semester} onChange={e => handleFilter('semester', e.target.value)}
//             options={[{ value: '', label: 'Tous les semestres' }, ...SEMESTERS.map(s => ({ value: s, label: s }))]} />
//           <Input value={filters.academicYear} onChange={e => handleFilter('academicYear', e.target.value)} placeholder="Année académique" />
//         </div>
//       </Card>

//       <Card>
//         <Table columns={columns} data={data} loading={loading} emptyText="Aucune note trouvée" />
//         <Pagination page={page} total={total} limit={limit} onPageChange={setPage} />
//       </Card>

//       <Modal isOpen={entryModal.open} onClose={() => setEntryModal({ open: false, ue: null })} title="Saisie des notes" size="xl">
//         <div className="space-y-4">
//           {!entryModal.ue ? (
//             <div className="space-y-4">
//               <p className="text-sm text-gray-600">Sélectionnez une UE</p>
//               <Select value="" onChange={e => {
//                 const ue = ueList.find(u => u._id === e.target.value);
//                 if (ue) openEntry(ue);
//               }} options={[{ value: '', label: 'Choisir une UE...' }, ...ueList.map(u => ({ value: u._id, label: `${u.code} - ${u.title}` }))]} />
//             </div>
//           ) : loadingStudents ? <div className="flex justify-center py-8"><Spinner size={28} /></div> : (
//             <GradeEntryModal ue={entryModal.ue} students={students}
//               academicYear={filters.academicYear} semester={filters.semester || 'S1'}
//               onSave={() => { setEntryModal({ open: false, ue: null }); refetch(); toast('Notes enregistrées'); }}
//               onCancel={() => setEntryModal({ open: false, ue: null })} />
//           )}
//         </div>
//       </Modal>
//     </div>
//   );
// }


// TeacherGradesPage.jsx (version corrigée)
// TeacherGradesPage.jsx - version entièrement réécrite et fonctionnelle
import { useState, useEffect, useCallback } from 'react';
import { Plus, X } from 'lucide-react';
import { gradeAPI, ueAPI, studentAPI } from '../../services/services';
import { getMention, SEMESTERS, getCurrentAcademicYear } from '../../components/utils/helpers';
import { useAuth } from '../../components/context/AuthContext';

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
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className={`bg-white rounded-xl shadow-xl ${size === 'xl' ? 'max-w-5xl' : 'max-w-md'} w-full mx-4 max-h-[90vh] overflow-y-auto`} onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100"><X size={20} /></button>
        </div>
        <div className="p-4">{children}</div>
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
          <tr>{columns.map((col, i) => <th key={i} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{col.header}</th>)}</tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, idx) => (
            <tr key={row._id || idx} className="hover:bg-gray-50">
              {columns.map((col, j) => (
                <td key={j} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
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
    <div className="flex justify-between items-center px-4 py-3 border-t">
      <button onClick={() => onPageChange(page - 1)} disabled={page === 1} className="px-3 py-1 text-sm bg-gray-100 rounded disabled:opacity-50">Précédent</button>
      <span className="text-sm">Page {page} / {totalPages}</span>
      <button onClick={() => onPageChange(page + 1)} disabled={page === totalPages} className="px-3 py-1 text-sm bg-gray-100 rounded disabled:opacity-50">Suivant</button>
    </div>
  );
};

const Select = ({ value, onChange, options, className = "" }) => (
  <select value={value} onChange={onChange} className={`border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 ${className}`}>
    {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
  </select>
);

const Input = ({ value, onChange, placeholder, type = "text", className = "" }) => (
  <input type={type} value={value} onChange={onChange} placeholder={placeholder} className={`border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 ${className}`} />
);

const Card = ({ children, className = "" }) => <div className={`bg-white rounded-xl shadow-sm border ${className}`}>{children}</div>;

const Button = ({ children, onClick, variant = "primary", loading = false, className = "" }) => (
  <button onClick={onClick} disabled={loading} className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50 ${variant === 'primary' ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-100 hover:bg-gray-200'} ${className}`}>
    {loading && <Spinner size={16} />}{children}
  </button>
);

// ---------- Composant de saisie des notes ----------
function GradeEntryModal({ ue, students, academicYear, semester, onSave, onCancel }) {
  const [grades, setGrades] = useState(() =>
    (students || []).map(s => ({
      studentId: s._id,
      name: `${s.firstName || ''} ${s.lastName || ''}`,
      cc: '', partiel: '', final: ''
    }))
  );
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '' });

  const weights = {
    cc: ue?.evaluationWeights?.cc ?? 40,
    partiel: ue?.evaluationWeights?.partiel ?? 20,
    final: ue?.evaluationWeights?.final ?? 40,
  };

  const updateGrade = (idx, field, value) => {
    if (value !== '') {
      const num = parseFloat(value);
      if (isNaN(num) || num < 0 || num > 20) return;
      value = Math.round(num * 100) / 100;
    }
    setGrades(prev => prev.map((g, i) => i === idx ? { ...g, [field]: value } : g));
  };

  const calcAvg = (cc, partiel, final) => {
    const totalWeight = weights.cc + weights.partiel + weights.final;
    if (totalWeight === 0) return 0;
    return ((parseFloat(cc)||0)*weights.cc + (parseFloat(partiel)||0)*weights.partiel + (parseFloat(final)||0)*weights.final) / totalWeight;
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = grades.map(g => ({
        student: g.studentId,
        assessments: [
          { type: 'controle_continu', label: 'CC', score: parseFloat(g.cc) || 0, maxScore: 20, weight: weights.cc },
          { type: 'examen_partiel', label: 'Partiel', score: parseFloat(g.partiel) || 0, maxScore: 20, weight: weights.partiel },
          { type: 'examen_final', label: 'Final', score: parseFloat(g.final) || 0, maxScore: 20, weight: weights.final }
        ]
      }));
      await gradeAPI.bulkUpsert({ ue: ue._id, academicYear, semester, grades: payload });
      onSave();
    } catch (err) {
      setToast({ message: err.message || "Erreur d'enregistrement", type: 'error' });
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      {toast.message && <Toast {...toast} onClose={() => setToast({ message: '', type: '' })} />}
      <div className="flex gap-2 p-3 bg-indigo-50 rounded-xl">
        <Badge className="bg-indigo-100 text-indigo-700">{ue?.code}</Badge>
        <span className="text-sm font-medium">{ue?.title}</span>
        <span className="text-xs text-gray-500">• {semester} • {academicYear}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr><th className="p-2 text-left">Étudiant</th><th className="p-2 text-center">CC ({weights.cc}%)</th><th className="p-2 text-center">Partiel ({weights.partiel}%)</th><th className="p-2 text-center">Final ({weights.final}%)</th><th className="p-2 text-center">Moyenne</th><th className="p-2 text-center">Mention</th></tr>
          </thead>
          <tbody>
            {grades.map((g, idx) => {
              const avg = calcAvg(g.cc, g.partiel, g.final);
              const mention = getMention(avg);
              return (
                <tr key={g.studentId} className="border-b">
                  <td className="p-2 font-medium">{g.name}</td>
                  <td className="p-2 text-center"><Input type="number" value={g.cc} onChange={e => updateGrade(idx, 'cc', e.target.value)} className="w-20 text-center" step="0.25" min="0" max="20" /></td>
                  <td className="p-2 text-center"><Input type="number" value={g.partiel} onChange={e => updateGrade(idx, 'partiel', e.target.value)} className="w-20 text-center" step="0.25" min="0" max="20" /></td>
                  <td className="p-2 text-center"><Input type="number" value={g.final} onChange={e => updateGrade(idx, 'final', e.target.value)} className="w-20 text-center" step="0.25" min="0" max="20" /></td>
                  <td className="p-2 text-center font-semibold">{g.cc || g.partiel || g.final ? <span className={mention.color}>{Math.round(avg*100)/100}</span> : '—'}</td>
                  <td className="p-2 text-center">{avg > 0 && <Badge className={`${mention.bg} ${mention.color}`}>{mention.label}</Badge>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex gap-3 pt-2">
        <Button variant="secondary" onClick={onCancel} className="flex-1">Annuler</Button>
        <Button onClick={handleSave} loading={loading} className="flex-1">Enregistrer</Button>
      </div>
    </div>
  );
}

// ---------- Composant principal ----------
export default function TeacherGradesPage() {
  const { user } = useAuth();
  const [toast, setToast] = useState({ message: '', type: '' });
  // États pour les UE
  const [ues, setUes] = useState([]);
  const [loadingUes, setLoadingUes] = useState(true);
  // Filtres et pagination
  const [filters, setFilters] = useState({ ue: '', semester: '', academicYear: getCurrentAcademicYear() });
  const [grades, setGrades] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loadingGrades, setLoadingGrades] = useState(false);
  // Modal
  const [entryModal, setEntryModal] = useState({ open: false, ue: null });
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Chargement des UE du professeur
  useEffect(() => {
    const loadUes = async () => {
      setLoadingUes(true);
      try {
        const res = await ueAPI.getAll({ limit: 200 });
        // La réponse peut être { data: [...] } ou directement [...]
        let ueArray = res?.data?.data ?? res?.data ?? res;
        if (!Array.isArray(ueArray)) ueArray = [];
        setUes(ueArray);
        console.log("UEs chargées :", ueArray);
      } catch (err) {
        console.error("Erreur chargement UE :", err);
        setToast({ message: "Impossible de charger les UE", type: 'error' });
      } finally {
        setLoadingUes(false);
      }
    };
    loadUes();
  }, []);

  // Chargement des notes selon les filtres + page
  const loadGrades = useCallback(async () => {
    setLoadingGrades(true);
    try {
      const params = { ...filters, page, limit: 10 };
      const res = await gradeAPI.getAll(params);
      const data = res?.data?.data ?? res?.data ?? [];
      const totalCount = res?.data?.total ?? res?.total ?? 0;
      setGrades(Array.isArray(data) ? data : []);
      setTotal(totalCount);
    } catch (err) {
      console.error("Erreur chargement notes :", err);
      setGrades([]);
      setTotal(0);
    } finally {
      setLoadingGrades(false);
    }
  }, [filters, page]);

  useEffect(() => {
    loadGrades();
  }, [loadGrades]);

  const handleFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const openEntry = async (ue) => {
    setLoadingStudents(true);
    setEntryModal({ open: true, ue });
    try {
      const res = await studentAPI.getAll({ limit: 200 });
      let studentsList = res?.data?.data ?? res?.data ?? res;
      if (!Array.isArray(studentsList)) studentsList = [];
      setStudents(studentsList);
    } catch (err) {
      setToast({ message: "Erreur chargement étudiants", type: 'error' });
    } finally {
      setLoadingStudents(false);
    }
  };

  const columns = [
    { header: 'Étudiant', key: 'student', render: (_, row) => <div><p className="font-medium">{row.student?.firstName} {row.student?.lastName}</p><p className="text-xs text-gray-400">{row.student?.studentId}</p></div> },
    { header: 'UE', key: 'ue', render: (_, row) => <div><Badge className="bg-indigo-100 text-indigo-700">{row.ue?.code}</Badge><p className="text-xs">{row.ue?.title}</p></div> },
    { header: 'Semestre', key: 'semester', render: v => <Badge className="bg-gray-100">{v}</Badge> },
    { header: 'Moyenne', key: 'finalAverage', render: v => v == null ? '—' : <span className={`font-bold ${getMention(v).color}`}>{v}/20</span> },
    { header: 'Mention', key: 'mention', render: (_, row) => row.finalAverage != null && <Badge className={getMention(row.finalAverage).bg}>{getMention(row.finalAverage).label}</Badge> },
    { header: 'Validé', key: 'isValidated', render: v => v ? <Badge className="bg-green-100 text-green-700">✓</Badge> : <Badge className="bg-red-100 text-red-700">✗</Badge> }
  ];

  return (
    <div className="space-y-6">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: '' })} />
      <div className="flex justify-between items-center">
        <div><h1 className="text-2xl font-bold">Saisie des Notes</h1><p className="text-sm text-gray-500">{total} enregistrement{total > 1 ? 's' : ''}</p></div>
        <Button onClick={() => setEntryModal({ open: true, ue: null })}><Plus size={16} /> Saisir des notes</Button>
      </div>

      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Select value={filters.ue} onChange={e => handleFilter('ue', e.target.value)} options={[{ value: '', label: 'Toutes les UE' }, ...ues.map(u => ({ value: u._id, label: `${u.code} - ${u.title}` }))]} />
          <Select value={filters.semester} onChange={e => handleFilter('semester', e.target.value)} options={[{ value: '', label: 'Tous les semestres' }, ...SEMESTERS.map(s => ({ value: s, label: s }))]} />
          <Input value={filters.academicYear} onChange={e => handleFilter('academicYear', e.target.value)} placeholder="Année académique" />
        </div>
      </Card>

      <Card>
        <Table columns={columns} data={grades} loading={loadingGrades} emptyText="Aucune note trouvée" />
        <Pagination page={page} total={total} limit={10} onPageChange={setPage} />
      </Card>

      <Modal isOpen={entryModal.open} onClose={() => setEntryModal({ open: false, ue: null })} title="Saisie des notes" size="xl">
        <div className="space-y-4">
          {loadingUes ? <div className="text-center py-8"><Spinner size={28} /></div>
          : ues.length === 0 ? <div className="text-center py-8 text-gray-500">Aucune UE assignée à ce professeur.</div>
          : !entryModal.ue ? (
            <div className="space-y-4">
              <p>Sélectionnez une UE :</p>
              <Select value="" onChange={e => { const selected = ues.find(u => u._id === e.target.value); if (selected) openEntry(selected); }} options={[{ value: '', label: 'Choisir...' }, ...ues.map(u => ({ value: u._id, label: `${u.code} - ${u.title}` }))]} />
            </div>
          ) : loadingStudents ? <div className="text-center py-8"><Spinner size={28} /></div>
          : <GradeEntryModal ue={entryModal.ue} students={students} academicYear={filters.academicYear} semester={filters.semester || 'S1'} onSave={() => { setEntryModal({ open: false, ue: null }); loadGrades(); setToast({ message: 'Notes enregistrées', type: 'success' }); }} onCancel={() => setEntryModal({ open: false, ue: null })} />}
        </div>
      </Modal>
    </div>
  );
}