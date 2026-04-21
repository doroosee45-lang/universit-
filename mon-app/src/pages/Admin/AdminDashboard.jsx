import { useEffect, useState } from 'react';
import { Users, GraduationCap, TrendingUp, AlertCircle, DollarSign, Library, Calendar, CheckCircle } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { dashboardAPI, reportAPI } from '../../services/services';
import { StatCard, Card, Badge, Spinner } from '../../components/common';
import { formatDate, formatCurrency, getMention } from '../../components/utils/Helpers';
import { useAuth } from '../../components/context/AuthContext';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await dashboardAPI.getAdminDashboard();
      setData(res.data);
    } catch (err) {
      console.error("Erreur chargement dashboard :", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner size={36} /></div>;

  const kpis = data?.kpis || {};
  const byProgram = data?.studentsByProgram || [];
  const upcomingExams = data?.upcomingExams || [];
  const monthlyStats = data?.monthlyStats || []; // Données réelles d'évolution

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-gray-500 text-sm mt-1">Bienvenue, <span className="font-medium text-indigo-600">{user?.firstName}</span> — Vue d'ensemble de l'établissement</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Étudiants actifs" value={kpis.activeStudents?.toLocaleString() || 0} subtitle={`Total: ${kpis.totalStudents || 0}`} icon={<GraduationCap size={22} />} color="indigo" trend={5.2} />
        <StatCard title="Enseignants" value={kpis.totalTeachers || 0} subtitle="Corps professoral" icon={<Users size={22} />} color="blue" />
        <StatCard title="Taux de réussite" value={`${kpis.successRate || 0}%`} subtitle="Session en cours" icon={<TrendingUp size={22} />} color="green" trend={2.1} />
        <StatCard title="Revenus collectés" value={formatCurrency(kpis.totalRevenue)} subtitle={`${kpis.pendingFees || 0} impayés`} icon={<DollarSign size={22} />} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <StatCard title="Prêts en retard" value={kpis.overdueLoans || 0} subtitle="Bibliothèque" icon={<Library size={22} />} color="red" />
        <StatCard title="Examens planifiés" value={upcomingExams.length} subtitle="À venir" icon={<Calendar size={22} />} color="purple" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area chart - uniquement si données réelles disponibles */}
        <Card className="p-5 lg:col-span-2">
          <h2 className="text-sm font-bold text-gray-800 mb-4">Évolution des effectifs & revenus</h2>
          {monthlyStats.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
              Aucune donnée d'évolution disponible
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={monthlyStats}>
                <defs>
                  <linearGradient id="gradEt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="mois" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontSize: 12 }} />
                <Area type="monotone" dataKey="etudiants" stroke="#6366f1" strokeWidth={2} fill="url(#gradEt)" name="Étudiants" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Pie chart - students by program (données réelles) */}
        <Card className="p-5">
          <h2 className="text-sm font-bold text-gray-800 mb-4">Répartition par filière</h2>
          {byProgram.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">Aucune donnée</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={byProgram} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="count" nameKey="programName">
                  {byProgram.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="space-y-1.5 mt-2">
            {byProgram.slice(0, 4).map((p, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="text-gray-600 truncate max-w-[120px]">{p.programName || 'N/A'}</span>
                </div>
                <span className="font-semibold text-gray-800">{p.count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Bottom row (examens et événements réels) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <h2 className="text-sm font-bold text-gray-800 mb-4">Prochains examens</h2>
          {upcomingExams.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">Aucun examen planifié</p>
          ) : (
            <div className="space-y-3">
              {upcomingExams.map((exam) => (
                <div key={exam._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{exam.title}</p>
                    <p className="text-xs text-gray-400">{exam.ue?.title} • {exam.room?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-indigo-600">{formatDate(exam.startDate)}</p>
                    <Badge className={exam.session === 'session1' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}>
                      {exam.session}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="text-sm font-bold text-gray-800 mb-4">Événements à venir</h2>
          {(data?.recentEvents || []).length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">Aucun événement</p>
          ) : (
            <div className="space-y-3">
              {(data?.recentEvents || []).map((event) => (
                <div key={event._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center shrink-0">
                    <Calendar size={18} className="text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{event.title}</p>
                    <p className="text-xs text-gray-400">{formatDate(event.startDate)} • {event.location}</p>
                  </div>
                  <Badge className="bg-purple-100 text-purple-600 capitalize">{event.type}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}