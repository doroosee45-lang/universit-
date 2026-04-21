import { Briefcase, Building2, Calendar, User } from 'lucide-react';
import { internshipAPI } from '../../services/services';
import { Card, Badge, Spinner } from '../../components/common';
import { useFetch } from '../../components/hooks/useFetch';
import { useAuth } from '../../components/context/AuthContext';
import { formatDate } from '../../components/utils/Helpers';

const STATUS_CONFIG = {
  candidature: { label: 'Candidature', color: 'bg-gray-100 text-gray-600' },
  accepted: { label: 'Accepté', color: 'bg-blue-100 text-blue-700' },
  ongoing: { label: 'En cours', color: 'bg-green-100 text-green-700' },
  report_submitted: { label: 'Rapport soumis', color: 'bg-indigo-100 text-indigo-700' },
  defended: { label: 'Soutenu', color: 'bg-purple-100 text-purple-700' },
  validated: { label: 'Validé', color: 'bg-emerald-100 text-emerald-700' },
  failed: { label: 'Échoué', color: 'bg-red-100 text-red-700' },
};

const STEPS = [
  { key: 'candidature', label: 'Candidature', icon: '📝' },
  { key: 'accepted', label: 'Accepté', icon: '✅' },
  { key: 'ongoing', label: 'En cours', icon: '🏢' },
  { key: 'report_submitted', label: 'Rapport soumis', icon: '📄' },
  { key: 'defended', label: 'Soutenance', icon: '🎤' },
  { key: 'validated', label: 'Validé', icon: '🎓' },
];

export default function StudentInternshipPage() {
  const { user } = useAuth();
  const { data, loading } = useFetch(() => internshipAPI.getAll({ student: user?._id }));
  const internships = data?.data || (Array.isArray(data) ? data : []);
  const currentInternship = internships[0];

  const statusIndex = STEPS.findIndex(s => s.key === currentInternship?.status);

  if (loading) return <div className="flex justify-center py-16"><Spinner size={36} /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mon Stage</h1>
        <p className="text-sm text-gray-500 mt-1">Suivi de stage et alternance</p>
      </div>

      {!currentInternship ? (
        <Card className="p-12 text-center">
          <Briefcase size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">Aucun stage enregistré</p>
          <p className="text-gray-400 text-sm mt-1">
            Contactez votre responsable de filière pour enregistrer votre stage.
          </p>
        </Card>
      ) : (
        <>
          {/* Main internship card */}
          <Card className="p-6">
            <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{currentInternship.title}</h2>
                <p className="text-gray-500 text-sm mt-1">{currentInternship.description}</p>
              </div>
              <Badge className={STATUS_CONFIG[currentInternship.status]?.color || 'bg-gray-100 text-gray-600'}>
                {STATUS_CONFIG[currentInternship.status]?.label || currentInternship.status}
              </Badge>
            </div>

            {/* Progress steps */}
            <div className="mb-6">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Progression</p>
              <div className="flex items-center gap-0">
                {STEPS.map((step, i) => {
                  const isCompleted = i <= statusIndex;
                  const isCurrent = i === statusIndex;
                  return (
                    <div key={step.key} className="flex items-center flex-1">
                      <div className={`flex flex-col items-center flex-shrink-0 ${i < STEPS.length - 1 ? 'flex-1' : ''}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all ${
                          isCompleted ? 'bg-indigo-600 shadow-lg shadow-indigo-200' : 'bg-gray-100'
                        } ${isCurrent ? 'ring-4 ring-indigo-200' : ''}`}>
                          {step.icon}
                        </div>
                        <p className={`text-xs mt-1 font-medium text-center ${isCompleted ? 'text-indigo-600' : 'text-gray-400'}`}>
                          {step.label}
                        </p>
                      </div>
                      {i < STEPS.length - 1 && (
                        <div className={`h-0.5 flex-1 -mt-5 ${i < statusIndex ? 'bg-indigo-600' : 'bg-gray-200'}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 size={16} className="text-indigo-500" />
                  <p className="text-sm font-semibold text-gray-700">Entreprise</p>
                </div>
                <p className="text-sm text-gray-800 font-medium">{currentInternship.company?.name || '—'}</p>
                <p className="text-xs text-gray-400">{currentInternship.company?.sector}</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar size={16} className="text-indigo-500" />
                  <p className="text-sm font-semibold text-gray-700">Période</p>
                </div>
                <p className="text-sm text-gray-800">
                  {formatDate(currentInternship.startDate)} — {formatDate(currentInternship.endDate)}
                </p>
                {currentInternship.startDate && currentInternship.endDate && (
                  <p className="text-xs text-gray-400 mt-1">
                    {Math.ceil((new Date(currentInternship.endDate) - new Date(currentInternship.startDate)) / (1000 * 60 * 60 * 24 * 7))} semaines
                  </p>
                )}
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <User size={16} className="text-indigo-500" />
                  <p className="text-sm font-semibold text-gray-700">Tuteur entreprise</p>
                </div>
                <p className="text-sm text-gray-800">{currentInternship.companyTutor?.name || '—'}</p>
                <p className="text-xs text-gray-400">{currentInternship.companyTutor?.position}</p>
                {currentInternship.companyTutor?.email && (
                  <a href={`mailto:${currentInternship.companyTutor.email}`}
                    className="text-xs text-indigo-600 hover:underline mt-1 block">
                    {currentInternship.companyTutor.email}
                  </a>
                )}
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <User size={16} className="text-indigo-500" />
                  <p className="text-sm font-semibold text-gray-700">Tuteur académique</p>
                </div>
                <p className="text-sm text-gray-800">
                  {currentInternship.academicTutor?.firstName} {currentInternship.academicTutor?.lastName || '—'}
                </p>
              </div>
            </div>
          </Card>

          {/* Evaluation */}
          {(currentInternship.companyScore || currentInternship.academicScore || currentInternship.finalScore) && (
            <Card className="p-5">
              <h3 className="font-bold text-gray-800 mb-4">Évaluations</h3>
              <div className="grid grid-cols-3 gap-4">
                {[
                  ['Note entreprise', currentInternship.companyScore],
                  ['Note académique', currentInternship.academicScore],
                  ['Note finale', currentInternship.finalScore],
                ].map(([label, score]) => (
                  <div key={label} className="text-center p-4 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-400">{label}</p>
                    <p className={`text-2xl font-bold mt-1 ${score != null ? (score >= 10 ? 'text-green-600' : 'text-red-600') : 'text-gray-300'}`}>
                      {score != null ? `${score}/20` : '—'}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Defense */}
          {currentInternship.defenseDate && (
            <Card className="p-5 border-l-4 border-purple-400">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  🎤
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Soutenance prévue</p>
                  <p className="text-sm text-gray-500">
                    {formatDate(currentInternship.defenseDate)}
                    {currentInternship.defenseRoom && ` — Salle ${currentInternship.defenseRoom?.name}`}
                  </p>
                </div>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
