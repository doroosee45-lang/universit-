import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, ClipboardList, Bell, Calendar, CheckCircle } from 'lucide-react';
import { dashboardAPI } from '../../services/services';
import { useAuth } from '../../components/context/AuthContext';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.getTeacherDashboard()
      .then(res => setData(res.data))
      .catch(err => console.error("Erreur chargement dashboard :", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Sécurisation : toujours un tableau
  const courses = Array.isArray(data?.myCourses) ? data.myCourses : [];
  const absences = Array.isArray(data?.recentAbsences) ? data.recentAbsences : [];
  const notifications = data?.unreadNotifications ?? 0;

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-gray-500 text-sm mt-1">
          Bienvenue, <span className="font-medium text-indigo-600">{user?.firstName} {user?.lastName}</span>
        </p>
      </div>

      {/* Cartes KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Mes cours</p>
              <p className="text-2xl font-bold text-gray-800">{data?.totalCourses ?? 0}</p>
              <p className="text-xs text-gray-400 mt-1">Cette année</p>
            </div>
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
              <BookOpen size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Notes à saisir</p>
              <p className="text-2xl font-bold text-gray-800">{data?.pendingGrades ?? 0}</p>
              <p className="text-xs text-gray-400 mt-1">En attente</p>
            </div>
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600">
              <ClipboardList size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Absences récentes</p>
              <p className="text-2xl font-bold text-gray-800">{absences.length}</p>
              <p className="text-xs text-gray-400 mt-1">7 derniers jours</p>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center text-red-600">
              <Users size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Notifications</p>
              <p className="text-2xl font-bold text-gray-800">{notifications}</p>
              <p className="text-xs text-gray-400 mt-1">Non lues</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
              <Bell size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Grille principale */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mes cours */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-sm font-bold text-gray-800 mb-4">Mes cours</h2>
          {courses.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">Aucun cours assigné</p>
          ) : (
            <div className="space-y-3">
              {courses.map(course => (
                <div key={course._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{course.title}</p>
                    <p className="text-xs text-gray-400">{course.ue?.code} • {course.type}</p>
                  </div>
                  <div className="flex gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium
                      ${course.type === 'CM' ? 'bg-blue-100 text-blue-700' :
                        course.type === 'TD' ? 'bg-green-100 text-green-700' :
                        'bg-purple-100 text-purple-700'}`}>
                      {course.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Absences récentes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-sm font-bold text-gray-800 mb-4">Absences récentes</h2>
          {absences.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
              <CheckCircle size={32} className="mb-2 opacity-40" />
              <p className="text-sm">Aucune absence récente</p>
            </div>
          ) : (
            <div className="space-y-3">
              {absences.map((absence, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-red-50 rounded-xl">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
                    <Users size={15} className="text-red-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">
                      {absence.student?.firstName} {absence.student?.lastName}
                    </p>
                    <p className="text-xs text-gray-400">{new Date(absence.date).toLocaleDateString()}</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 font-medium">Absent</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Actions rapides */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h2 className="text-sm font-bold text-gray-800 mb-4">Actions rapides</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => navigate('/teacher/attendance')}
            className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl transition-colors bg-green-50 hover:bg-green-100"
          >
            <span className="text-2xl">✅</span>
            <span className="text-xs font-medium text-gray-700 text-center">Prendre présences</span>
          </button>
          <button
            onClick={() => navigate('/teacher/grades')}
            className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl transition-colors bg-blue-50 hover:bg-blue-100"
          >
            <span className="text-2xl">📝</span>
            <span className="text-xs font-medium text-gray-700 text-center">Saisir des notes</span>
          </button>
          <button
            onClick={() => navigate('/teacher/assignments')}
            className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl transition-colors bg-indigo-50 hover:bg-indigo-100"
          >
            <span className="text-2xl">📋</span>
            <span className="text-xs font-medium text-gray-700 text-center">Créer un devoir</span>
          </button>
          <button
            onClick={() => navigate('/teacher/schedule')}
            className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl transition-colors bg-purple-50 hover:bg-purple-100"
          >
            <span className="text-2xl">📅</span>
            <span className="text-xs font-medium text-gray-700 text-center">Mon emploi du temps</span>
          </button>
        </div>
      </div>
    </div>
  );
}