

// TeacherSchedulePage.jsx - version indépendante
import { useState, useEffect } from 'react';
import { scheduleAPI } from '../../services/services';
import { useAuth } from '../../components/context/AuthContext';

// ---------- Composants UI locaux ----------
const Spinner = ({ size = 36 }) => (
  <div className="flex justify-center items-center">
    <div className={`border-2 border-indigo-600 border-t-transparent rounded-full animate-spin`} style={{ width: size, height: size }} />
  </div>
);

const Badge = ({ children, className }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>{children}</span>
);

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-100 ${className}`}>{children}</div>
);

// ---------- Helpers locaux ----------
// Jours de la semaine : 0 = dimanche, 1 = lundi, 2 = mardi, 3 = mercredi, 4 = jeudi, 5 = vendredi, 6 = samedi
const DAYS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

// Couleurs pour les cours (variantes claires)
const COLORS = [
  'bg-indigo-50 text-indigo-700',
  'bg-emerald-50 text-emerald-700',
  'bg-amber-50 text-amber-700',
  'bg-purple-50 text-purple-700',
  'bg-rose-50 text-rose-700',
  'bg-cyan-50 text-cyan-700',
];

// ---------- Composant principal ----------
export default function TeacherSchedulePage() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?._id) return;
    const loadSchedule = async () => {
      setLoading(true);
      try {
        const res = await scheduleAPI.getTeacherSchedule(user._id);
        // Extraction robuste des données
        const data = res?.data?.data ?? res?.data ?? res ?? [];
        setSchedules(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Erreur chargement emploi du temps:", err);
        setSchedules([]);
      } finally {
        setLoading(false);
      }
    };
    loadSchedule();
  }, [user?._id]);

  // Organisation des séances par jour (0 à 6)
  const byDay = {};
  for (let i = 0; i <= 6; i++) byDay[i] = [];
  schedules.forEach(s => {
    const day = s.dayOfWeek;
    if (byDay[day] !== undefined) byDay[day].push(s);
  });

  // Jours à afficher : lundi (1) à vendredi (5)
  // Vous pouvez ajouter le samedi (6) ou dimanche (0) selon vos besoins
  const WORK_DAYS = [0, 1, 2, 3, 4, 5, 6, ]; // Lundi, Mardi, Mercredi, Jeudi, Vendredi

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Mon Emploi du Temps</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {WORK_DAYS.map(day => (
          <Card key={day} className="overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">{DAYS[day]}</h3>
            </div>
            <div className="p-4 space-y-2">
              {byDay[day].length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-2">Aucun cours</p>
              ) : (
                byDay[day]
                  .sort((a, b) => a.startTime.localeCompare(b.startTime))
                  .map((s, idx) => (
                    <div
                      key={s._id}
                      className={`flex items-center gap-3 p-3 rounded-xl ${COLORS[idx % COLORS.length]}`}
                    >
                      <div className="text-center min-w-[60px]">
                        <p className="text-xs font-bold text-gray-700">{s.startTime}</p>
                        <p className="text-xs text-gray-400">{s.endTime}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {s.course?.title || s.course?.code || '—'}
                        </p>
                        <p className="text-xs text-gray-500">
                          Salle: {s.room?.name || '—'} {s.group ? `• ${s.group}` : ''}
                        </p>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}






























// // pages/teacher/TeacherSchedulePage.jsx
// import { useState, useEffect } from 'react';
// import { Calendar, MapPin, User, BookOpen } from 'lucide-react';
// import { scheduleAPI } from '../../services/services';
// import { useAuth } from '../../components/context/AuthContext';

// const Spinner = () => <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>;
// const Badge = ({ children, className }) => <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>{children}</span>;
// const Card = ({ children }) => <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">{children}</div>;

// const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
// const WORK_DAYS = [0,1,2,3,4,5,6];
// const COLORS = ['bg-indigo-50','bg-emerald-50','bg-amber-50','bg-purple-50','bg-rose-50','bg-cyan-50'];

// export default function TeacherSchedulePage() {
//   const { user } = useAuth();
//   const [schedules, setSchedules] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const load = async () => {
//       try {
//         const res = await scheduleAPI.getTeacherSchedule();
//         setSchedules(res.data?.data || []);
//       } catch (err) {
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     if (user) load();
//   }, [user]);

//   const byDay = {};
//   WORK_DAYS.forEach(d => byDay[d] = []);
//   schedules.forEach(s => byDay[s.day]?.push(s));

//   if (loading) return <Spinner />;

//   return (
//     <div className="space-y-6">
//       <h1 className="text-2xl font-bold text-gray-900">Mon Emploi du Temps (Enseignant)</h1>
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//         {WORK_DAYS.map(day => (
//           <Card key={day}>
//             <div className="px-4 py-3 bg-gray-50 border-b">
//               <h3 className="font-semibold text-gray-800">{DAYS[day]}</h3>
//             </div>
//             <div className="p-4 space-y-2">
//               {byDay[day].length === 0 ? (
//                 <p className="text-sm text-gray-400 text-center py-2">Aucun cours</p>
//               ) : (
//                 byDay[day].sort((a,b)=>a.start.localeCompare(b.start)).map((s, idx) => (
//                   <div key={s._id} className={`p-3 rounded-xl ${COLORS[idx % COLORS.length]} bg-opacity-50`}>
//                     <div className="flex justify-between items-start">
//                       <div>
//                         <p className="font-semibold">{s.course}</p>
//                         <p className="text-xs text-gray-500">{s.start} - {s.end}</p>
//                         <p className="text-xs text-gray-500 mt-1"><MapPin size={12} className="inline mr-1" />{s.room || '—'} • Groupe {s.group || 'Tous'}</p>
//                       </div>
//                       <Badge className="bg-gray-200 text-gray-700">{s.semester}</Badge>
//                     </div>
//                   </div>
//                 ))
//               )}
//             </div>
//           </Card>
//         ))}
//       </div>
//     </div>
//   );
// }