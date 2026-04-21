import { useEffect, useState } from 'react';
import { BookOpen, Calendar, DollarSign, Bell, ClipboardList, Clock } from 'lucide-react';
import { dashboardAPI } from '../../services/services';
import { StatCard, Card, Badge, Spinner } from '../../components/common';
import { formatDate, formatCurrency, getMention } from '../../components/utils/helpers';
import { useAuth } from '../../components/context/AuthContext';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.getStudentDashboard()
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner size={36} /></div>;

  const fee = data?.fee;
  const upcomingExams = data?.upcomingExams || [];
  const assignments = data?.pendingAssignments || [];
  const avg = data?.generalAverage || 0;
  const avgMention = getMention(avg);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mon Tableau de bord</h1>
        <p className="text-gray-500 text-sm mt-1">Bienvenue, <span className="font-medium text-indigo-600">{user?.firstName} {user?.lastName}</span></p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Moyenne générale</p>
              <p className={`text-3xl font-bold mt-1 ${avgMention.color}`}>{avg > 0 ? avg.toFixed(2) : '—'}</p>
              {avg > 0 && <Badge className={`${avgMention.bg} ${avgMention.color} mt-1`}>{avgMention.label}</Badge>}
            </div>
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
              <ClipboardList size={22} className="text-indigo-600" />
            </div>
          </div>
        </Card>
        <StatCard title="Notifications" value={data?.unreadNotifications || 0} subtitle="Non lues" icon={<Bell size={22} />} color="purple" />
        <StatCard title="Frais à payer" value={formatCurrency(fee?.remainingAmount)} subtitle={fee?.status || '—'} icon={<DollarSign size={22} />} color="amber" />
        <StatCard title="Examens à venir" value={upcomingExams.length} subtitle="Planifiés" icon={<Calendar size={22} />} color="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Exams */}
        <Card className="p-5">
          <h2 className="text-sm font-bold text-gray-800 mb-4">Prochains examens</h2>
          {upcomingExams.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">Aucun examen planifié</p>
          ) : (
            <div className="space-y-3">
              {upcomingExams.map(exam => (
                <div key={exam._id} className="flex items-center justify-between p-3 bg-indigo-50 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{exam.title}</p>
                    <p className="text-xs text-gray-400">{exam.ue?.title}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-indigo-600">{formatDate(exam.startDate)}</p>
                    <Badge className="bg-indigo-100 text-indigo-700">{exam.type}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Pending Assignments */}
        <Card className="p-5">
          <h2 className="text-sm font-bold text-gray-800 mb-4">Devoirs à rendre</h2>
          {assignments.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">Aucun devoir en attente</p>
          ) : (
            <div className="space-y-3">
              {assignments.map(a => {
                const isLate = new Date(a.dueDate) < new Date();
                return (
                  <div key={a._id} className={`flex items-center justify-between p-3 rounded-xl ${isLate ? 'bg-red-50' : 'bg-gray-50'}`}>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{a.title}</p>
                      <p className="text-xs text-gray-400">{a.course?.title}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs font-semibold ${isLate ? 'text-red-600' : 'text-gray-600'}`}>{formatDate(a.dueDate)}</p>
                      {isLate && <Badge className="bg-red-100 text-red-700">En retard</Badge>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Fee Status */}
      {fee && (
        <Card className="p-5">
          <h2 className="text-sm font-bold text-gray-800 mb-4">État des frais de scolarité</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              ['Total', formatCurrency(fee.totalAmount), 'text-gray-800'],
              ['Payé', formatCurrency(fee.paidAmount), 'text-green-600'],
              ['Restant', formatCurrency(fee.remainingAmount), 'text-red-600'],
            ].map(([label, value, color]) => (
              <div key={label} className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-400 mb-1">{label}</p>
                <p className={`text-lg font-bold ${color}`}>{value}</p>
              </div>
            ))}
          </div>
          {fee.remainingAmount > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Progression du paiement</span>
                <span>{Math.round((fee.paidAmount / fee.totalAmount) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-indigo-600 h-2 rounded-full transition-all"
                  style={{ width: `${Math.round((fee.paidAmount / fee.totalAmount) * 100)}%` }} />
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
