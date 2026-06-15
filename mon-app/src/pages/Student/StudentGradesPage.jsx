import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { gradeAPI } from '../../services/services';
import { useFetch } from '../../components/hooks/UseFetch';
import { useAuth } from '../../components/context/AuthContext';
import { getMention, SEMESTERS, getCurrentAcademicYear } from '../../components/utils/Helpers';

// ─── Primitives ───────────────────────────────────────────────────────────────
const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 ${className}`}>{children}</div>
);

const Badge = ({ children, className = '' }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>
    {children}
  </span>
);

const Spinner = () => (
  <Loader2 size={28} className="animate-spin text-indigo-500" />
);

export default function StudentGradesPage() {
  const { user } = useAuth();
  const [academicYear, setAcademicYear] = useState(getCurrentAcademicYear());
  const [semester, setSemester]         = useState('');

  const { data, loading } = useFetch(
    () => gradeAPI.getStudentTranscript(user?._id, { academicYear, semester }),
    [academicYear, semester]
  );

  const grades = data || [];

  // Moyenne générale pondérée
  const totalCoef  = grades.reduce((s, g) => s + (g.ue?.coefficient || 1), 0);
  const weightedAvg = totalCoef > 0
    ? grades.reduce((s, g) => s + (g.finalAverage || 0) * (g.ue?.coefficient || 1), 0) / totalCoef
    : 0;
  const totalECTS  = grades.reduce((s, g) => s + (g.ectsObtained || 0), 0);
  const avgMention = getMention(weightedAvg);

  const semOpts = [
    { value: '', label: 'Tous les semestres' },
    ...SEMESTERS.map(s => ({ value: s, label: s }))
  ];

  const downloadPDF = () => {
    const base = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const sem  = semester ? `&semester=${semester}` : '';
    window.open(`${base}/grades/student/${user?._id}/transcript/pdf?academicYear=${academicYear}${sem}`, '_blank');
  };

  const getCC      = (row) => row.assessments?.find(a => a.type === 'controle_continu')?.score;
  const getPartiel = (row) => row.assessments?.find(a => a.type === 'examen_partiel')?.score;
  const getFinal   = (row) => row.assessments?.find(a => a.type === 'examen_final')?.score;

  return (
    <div className="space-y-5">
      {/* En-tête */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes Notes</h1>
          <p className="text-sm text-gray-500 mt-0.5">Relevé de notes détaillé</p>
        </div>
        <button
          onClick={downloadPDF}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
        >
          <Download size={15} /> Télécharger relevé PDF
        </button>
      </div>

      {/* Filtres */}
      <Card className="p-4">
        <div className="flex gap-3 flex-wrap">
          <input
            type="text"
            value={academicYear}
            onChange={e => setAcademicYear(e.target.value)}
            placeholder="Année académique"
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm w-40 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <select
            value={semester}
            onChange={e => setSemester(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
          >
            {semOpts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </Card>

      {/* Résumé */}
      {grades.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-5 text-center">
            <p className="text-xs text-gray-500 mb-1">Moyenne générale</p>
            <p className={`text-3xl font-bold ${avgMention.color}`}>{weightedAvg.toFixed(2)}</p>
            <Badge className={`${avgMention.bg} ${avgMention.color} mt-2`}>{avgMention.label}</Badge>
          </Card>
          <Card className="p-5 text-center">
            <p className="text-xs text-gray-500 mb-1">ECTS obtenus</p>
            <p className="text-3xl font-bold text-emerald-600">{totalECTS}</p>
            <p className="text-xs text-gray-400 mt-2">crédits validés</p>
          </Card>
          <Card className="p-5 text-center">
            <p className="text-xs text-gray-500 mb-1">UE validées</p>
            <p className="text-3xl font-bold text-indigo-600">
              {grades.filter(g => g.isValidated).length}/{grades.length}
            </p>
            <p className="text-xs text-gray-400 mt-2">unités d'enseignement</p>
          </Card>
        </div>
      )}

      {/* Tableau des notes */}
      <Card>
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : grades.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">📋</div>
            <p className="text-gray-500 font-medium">Aucune note disponible</p>
            <p className="text-gray-400 text-sm mt-1">Vos notes apparaîtront ici une fois publiées</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['UE', 'Sem.', 'Coef.', 'Crédits', 'CC', 'Partiel', 'Final', 'Moyenne', 'Mention', 'ECTS', 'Validé'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {grades.map((row, i) => {
                  const m    = row.finalAverage != null ? getMention(row.finalAverage) : null;
                  const cc      = getCC(row);
                  const partiel = getPartiel(row);
                  const final_  = getFinal(row);
                  return (
                    <tr key={row._id || i} className="hover:bg-gray-50 transition-colors">
                      {/* UE */}
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">
                          {row.ue?.code || '—'}
                        </span>
                        <p className="text-sm font-medium text-gray-800 mt-1 max-w-[180px] truncate">
                          {row.ue?.title || '—'}
                        </p>
                      </td>
                      {/* Semestre */}
                      <td className="px-4 py-3">
                        <Badge className="bg-gray-100 text-gray-600">{row.semester || '—'}</Badge>
                      </td>
                      {/* Coefficient */}
                      <td className="px-4 py-3 font-bold text-gray-700 text-center">
                        {row.ue?.coefficient || 1}
                      </td>
                      {/* Crédits */}
                      <td className="px-4 py-3 font-bold text-emerald-600 text-center">
                        {row.ue?.credits || 0}
                      </td>
                      {/* CC */}
                      <td className="px-4 py-3 text-center">
                        <span className="bg-gray-100 px-2 py-1 rounded text-xs">{cc ?? '—'}</span>
                      </td>
                      {/* Partiel */}
                      <td className="px-4 py-3 text-center">
                        <span className="bg-gray-100 px-2 py-1 rounded text-xs">{partiel ?? '—'}</span>
                      </td>
                      {/* Final */}
                      <td className="px-4 py-3 text-center">
                        <span className="bg-gray-100 px-2 py-1 rounded text-xs">{final_ ?? '—'}</span>
                      </td>
                      {/* Moyenne */}
                      <td className="px-4 py-3 text-center">
                        {row.finalAverage != null ? (
                          <span className={`text-base font-bold ${m?.color}`}>
                            {row.finalAverage.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      {/* Mention */}
                      <td className="px-4 py-3">
                        {m ? (
                          <Badge className={`${m.bg} ${m.color}`}>{m.label}</Badge>
                        ) : '—'}
                      </td>
                      {/* ECTS */}
                      <td className="px-4 py-3 text-center">
                        <span className={`font-bold ${(row.ectsObtained || 0) > 0 ? 'text-emerald-600' : 'text-gray-400'}`}>
                          {row.ectsObtained || 0}/{row.ue?.credits || 0}
                        </span>
                      </td>
                      {/* Validé */}
                      <td className="px-4 py-3">
                        {row.isValidated
                          ? <Badge className="bg-green-100 text-green-700">✓ Validé</Badge>
                          : <Badge className="bg-red-100 text-red-700">✗ Non validé</Badge>
                        }
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
