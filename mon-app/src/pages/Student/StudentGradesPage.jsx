import { useState } from 'react';
import { Download } from 'lucide-react';
import { gradeAPI } from '../../services/services';
import { Button, Card, Table, Badge, Select, Input, Spinner } from '../../components/common';
import { useFetch } from '../../components/hooks/useFetch';
import { useAuth } from '../../components/context/AuthContext';
import { getMention, SEMESTERS, getCurrentAcademicYear } from '../../components/utils/helpers';

export default function StudentGradesPage() {
  const { user } = useAuth();
  const [academicYear, setAcademicYear] = useState(getCurrentAcademicYear());
  const [semester, setSemester] = useState('');

  const { data, loading } = useFetch(
    () => gradeAPI.getStudentTranscript(user?._id, { academicYear, semester }),
    [academicYear, semester]
  );

  const grades = data || [];

  // Calculer la moyenne générale pondérée
  const totalCoef = grades.reduce((s, g) => s + (g.ue?.coefficient || 1), 0);
  const weightedAvg = totalCoef > 0
    ? grades.reduce((s, g) => s + (g.finalAverage || 0) * (g.ue?.coefficient || 1), 0) / totalCoef
    : 0;
  const totalECTS = grades.reduce((s, g) => s + (g.ectsObtained || 0), 0);
  const avgMention = getMention(weightedAvg);

  const downloadPDF = () => {
    const url = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/grades/student/${user?._id}/transcript/pdf?academicYear=${academicYear}${semester ? `&semester=${semester}` : ''}`;
    window.open(url, '_blank');
  };

  const semOpts = [{ value: '', label: 'Tous les semestres' }, ...SEMESTERS.map(s => ({ value: s, label: s }))];

  const columns = [
    {
      header: 'UE', key: 'ue',
      render: (_, row) => (
        <div>
          <span className="font-mono text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">{row.ue?.code}</span>
          <p className="text-sm font-medium text-gray-800 mt-1">{row.ue?.title}</p>
        </div>
      )
    },
    { header: 'Semestre', key: 'semester', render: v => <Badge className="bg-gray-100 text-gray-600">{v}</Badge> },
    { header: 'Coef.', key: 'ue', render: (_, row) => <span className="font-bold">{row.ue?.coefficient || 1}</span> },
    { header: 'Crédits', key: 'ue', render: (_, row) => <span className="font-bold text-emerald-600">{row.ue?.credits || 0}</span> },
    {
      header: 'CC / Partiel / Final', key: 'assessments',
      render: (_, row) => {
        const cc = row.assessments?.find(a => a.type === 'controle_continu')?.score;
        const partiel = row.assessments?.find(a => a.type === 'examen_partiel')?.score;
        const final = row.assessments?.find(a => a.type === 'examen_final')?.score;
        return (
          <div className="flex gap-2 text-xs">
            <span className="bg-gray-100 px-2 py-1 rounded">{cc ?? '—'}</span>
            <span className="bg-gray-100 px-2 py-1 rounded">{partiel ?? '—'}</span>
            <span className="bg-gray-100 px-2 py-1 rounded">{final ?? '—'}</span>
          </div>
        );
      }
    },
    {
      header: 'Moyenne', key: 'finalAverage',
      render: v => {
        if (v == null) return <span className="text-gray-300">—</span>;
        const m = getMention(v);
        return <span className={`text-lg font-bold ${m.color}`}>{v.toFixed(2)}</span>;
      }
    },
    {
      header: 'Mention', key: 'mention',
      render: (_, row) => {
        if (row.finalAverage == null) return null;
        const m = getMention(row.finalAverage);
        return <Badge className={`${m.bg} ${m.color}`}>{m.label}</Badge>;
      }
    },
    {
      header: 'Validé', key: 'isValidated',
      render: v => v
        ? <Badge className="bg-green-100 text-green-700">✓ Validé</Badge>
        : <Badge className="bg-red-100 text-red-700">✗ Non validé</Badge>
    },
    {
      header: 'ECTS', key: 'ectsObtained',
      render: (v, row) => (
        <span className={`font-bold ${v > 0 ? 'text-emerald-600' : 'text-gray-400'}`}>
          {v || 0}/{row.ue?.credits || 0}
        </span>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes Notes</h1>
          <p className="text-sm text-gray-500 mt-1">Relevé de notes détaillé</p>
        </div>
        <Button variant="secondary" onClick={downloadPDF}>
          <Download size={15} /> Télécharger relevé PDF
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex gap-3 flex-wrap">
          <Input value={academicYear} onChange={e => setAcademicYear(e.target.value)} placeholder="Année académique" className="w-40" />
          <Select value={semester} onChange={e => setSemester(e.target.value)} options={semOpts} className="w-44" />
        </div>
      </Card>

      {/* Summary Card */}
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

      {/* Grades Table */}
      <Card>
        {loading ? (
          <div className="flex justify-center py-12"><Spinner size={28} /></div>
        ) : (
          <Table columns={columns} data={grades} loading={false} emptyText="Aucune note disponible" />
        )}
      </Card>
    </div>
  );
}
