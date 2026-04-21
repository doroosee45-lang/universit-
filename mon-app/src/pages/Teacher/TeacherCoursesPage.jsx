import { BookOpen, Users, Clock } from 'lucide-react';
import { courseAPI } from '../../services/services';
import { Card, Badge, Spinner } from '../../components/common';
import { useFetch } from '../../components/hooks/useFetch';
import { useAuth } from '../../components/context/AuthContext';

export default function TeacherCoursesPage() {
  const { user } = useAuth();
  const { data, loading } = useFetch(() => courseAPI.getAll({ teacher: user?._id, limit: 100 }));
  const courses = data?.data || data || [];

  if (loading) return <div className="flex justify-center py-16"><Spinner size={36} /></div>;

  const TYPE_COLORS = { CM: 'bg-blue-100 text-blue-700', TD: 'bg-green-100 text-green-700', TP: 'bg-purple-100 text-purple-700' };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mes Cours</h1>
        <p className="text-sm text-gray-500 mt-1">{courses.length} cours assignés</p>
      </div>

      {courses.length === 0 ? (
        <Card className="p-12 text-center">
          <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">Aucun cours assigné pour le moment.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map(course => (
            <Card key={course._id} className="p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <BookOpen size={22} className="text-indigo-600" />
                </div>
                <Badge className={TYPE_COLORS[course.type] || 'bg-gray-100 text-gray-600'}>{course.type}</Badge>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{course.title}</h3>
              <p className="text-sm text-gray-500 font-mono mb-3">{course.code}</p>
              <div className="space-y-2 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <BookOpen size={12} /> <span>UE: {course.ue?.code || '—'} {course.ue?.title ? `- ${course.ue.title}` : ''}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={12} /> <span>{course.totalHours}h • {course.semester}</span>
                </div>
                {course.groups?.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Users size={12} /> <span>Groupes: {course.groups.join(', ')}</span>
                  </div>
                )}
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 flex gap-2">
                <a href={`/teacher/attendance?course=${course._id}`}
                  className="flex-1 text-center text-xs font-medium text-indigo-600 hover:text-indigo-700 py-1.5 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors">
                  Présences
                </a>
                <a href={`/teacher/grades?course=${course._id}`}
                  className="flex-1 text-center text-xs font-medium text-green-600 hover:text-green-700 py-1.5 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                  Notes
                </a>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}