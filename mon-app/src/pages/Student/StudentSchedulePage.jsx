import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { scheduleAPI } from '../../services/services';
import { Card, Badge, Spinner } from '../../components/common';
import { useFetch } from '../../components/hooks/UseFetch';
import { useAuth } from '../../components/context/AuthContext';
import { DAYS } from '../../components/utils/Helpers';

const COURSE_COLORS = [
  { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', badge: 'bg-indigo-100 text-indigo-700' },
  { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-700' },
  { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-700' },
  { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', badge: 'bg-purple-100 text-purple-700' },
  { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', badge: 'bg-rose-100 text-rose-700' },
  { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-700', badge: 'bg-cyan-100 text-cyan-700' },
];

export default function StudentSchedulePage() {
  const { user } = useAuth();
  const [selectedDay, setSelectedDay] = useState(() => {
    const d = new Date().getDay();
    return d === 5 ? 6 : d; // Si vendredi, afficher samedi (univ alg)
  });

  // Récupérer l'emploi du temps lié à la filière de l'étudiant
  const { data, loading } = useFetch(() =>
    scheduleAPI.getAll({ limit: 500 })
  );

  const schedules = data?.data || data || [];

  // Grouper par jour
  const byDay = {};
  for (let i = 0; i <= 6; i++) byDay[i] = [];
  schedules.forEach(s => {
    if (byDay[s.dayOfWeek] !== undefined) byDay[s.dayOfWeek].push(s);
  });

  const WORK_DAYS = [0, 1, 2, 3, 4, 6]; // Dim-Jeu + Sam

  const todaySchedules = (byDay[selectedDay] || [])
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  if (loading) return <div className="flex justify-center py-16"><Spinner size={36} /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mon Emploi du Temps</h1>
        <p className="text-sm text-gray-500 mt-1">Planning hebdomadaire des cours</p>
      </div>

      {/* Day selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {WORK_DAYS.map(day => {
          const count = byDay[day]?.length || 0;
          const isToday = new Date().getDay() === day;
          return (
            <button key={day} onClick={() => setSelectedDay(day)}
              className={`flex-shrink-0 flex flex-col items-center px-4 py-3 rounded-2xl transition-all ${
                selectedDay === day
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-indigo-300'
              }`}>
              <span className="text-xs font-medium opacity-70">{['D', 'L', 'M', 'M', 'J', 'V', 'S'][day]}</span>
              <span className="text-sm font-bold mt-0.5">{DAYS[day].substring(0, 3)}</span>
              {count > 0 && (
                <span className={`mt-1 text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                  selectedDay === day ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-700'
                }`}>{count}</span>
              )}
              {isToday && selectedDay !== day && (
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-1" />
              )}
            </button>
          );
        })}
      </div>

      {/* Schedule for selected day */}
      {todaySchedules.length === 0 ? (
        <Card className="p-12 text-center">
          <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">Aucun cours ce jour</p>
          <p className="text-gray-400 text-sm mt-1">Profitez de votre journée libre !</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {todaySchedules.map((s, i) => {
            const colors = COURSE_COLORS[i % COURSE_COLORS.length];
            const TYPE_LABELS = { CM: 'Cours Magistral', TD: 'Travaux Dirigés', TP: 'Travaux Pratiques' };
            return (
              <Card key={s._id} className={`p-5 border-l-4 ${colors.border}`}>
                <div className={`flex items-start gap-4`}>
                  {/* Time */}
                  <div className="text-center min-w-[72px]">
                    <p className={`text-lg font-bold ${colors.text}`}>{s.startTime}</p>
                    <div className={`w-0.5 h-4 mx-auto my-1 ${colors.bg} border ${colors.border}`} />
                    <p className="text-sm text-gray-400">{s.endTime}</p>
                  </div>

                  {/* Divider */}
                  <div className={`w-0.5 self-stretch rounded-full ${colors.bg} border ${colors.border}`} />

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3 className="font-bold text-gray-900">{s.course?.title || s.course?.code || '—'}</h3>
                      <Badge className={colors.badge}>{s.course?.type || '—'}</Badge>
                      {s.group && <Badge className="bg-gray-100 text-gray-600">Groupe {s.group}</Badge>}
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500">
                      <span>📍 Salle: <strong className="text-gray-700">{s.room?.name || '—'}</strong></span>
                      <span>👤 Prof: <strong className="text-gray-700">{s.teacher?.firstName} {s.teacher?.lastName}</strong></span>
                      {s.course?.type && <span>📚 Type: <strong className="text-gray-700">{TYPE_LABELS[s.course.type] || s.course.type}</strong></span>}
                      <span>📅 <strong className="text-gray-700">{s.semester}</strong></span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Weekly overview */}
      <Card className="p-5">
        <h2 className="text-sm font-bold text-gray-800 mb-4">Vue hebdomadaire</h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {WORK_DAYS.map(day => (
            <div key={day} onClick={() => setSelectedDay(day)}
              className={`p-3 rounded-xl cursor-pointer transition-all text-center ${
                selectedDay === day ? 'bg-indigo-600 text-white' : 'bg-gray-50 hover:bg-gray-100'
              }`}>
              <p className={`text-xs font-medium ${selectedDay === day ? 'text-indigo-200' : 'text-gray-500'}`}>
                {DAYS[day].substring(0, 3)}
              </p>
              <p className={`text-xl font-bold mt-1 ${selectedDay === day ? 'text-white' : 'text-gray-800'}`}>
                {byDay[day]?.length || 0}
              </p>
              <p className={`text-xs ${selectedDay === day ? 'text-indigo-200' : 'text-gray-400'}`}>cours</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}






















// // pages/student/StudentSchedulePage.jsx
// import { useState, useEffect } from 'react';
// import { Calendar, Clock, MapPin, User, BookOpen } from 'lucide-react';
// import { scheduleAPI } from '../../services/services';
// import { useAuth } from '../../components/context/AuthContext';

// // Composants UI locaux (simplifiés)
// const Spinner = () => <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>;
// const Badge = ({ children, className }) => <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>{children}</span>;
// const Card = ({ children }) => <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">{children}</div>;

// const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
// const WORK_DAYS = [0,1,2,3,4,5,6];
// const COLORS = [
//   'bg-indigo-50 border-indigo-200 text-indigo-700',
//   'bg-emerald-50 border-emerald-200 text-emerald-700',
//   'bg-amber-50 border-amber-200 text-amber-700',
//   'bg-purple-50 border-purple-200 text-purple-700',
//   'bg-rose-50 border-rose-200 text-rose-700',
//   'bg-cyan-50 border-cyan-200 text-cyan-700',
// ];

// export default function StudentSchedulePage() {
//   const { user } = useAuth();
//   const [schedules, setSchedules] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedDay, setSelectedDay] = useState(new Date().getDay() - 1); // ajuster selon décalage

//   useEffect(() => {
//     const load = async () => {
//       try {
//         const res = await scheduleAPI.getStudentSchedule();
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

//   const todaySchedules = (byDay[selectedDay] || []).sort((a,b) => a.start.localeCompare(b.start));

//   if (loading) return <Spinner />;

//   return (
//     <div className="space-y-6">
//       <h1 className="text-2xl font-bold text-gray-900">Mon Emploi du Temps</h1>
      
//       {/* Sélecteur de jours */}
//       <div className="flex gap-2 overflow-x-auto pb-2">
//         {WORK_DAYS.map(day => {
//           const count = byDay[day]?.length || 0;
//           const isToday = new Date().getDay() - 1 === day;
//           return (
//             <button key={day} onClick={() => setSelectedDay(day)}
//               className={`flex-shrink-0 flex flex-col items-center px-4 py-3 rounded-2xl transition-all ${
//                 selectedDay === day ? 'bg-indigo-600 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:border-indigo-300'
//               }`}>
//               <span className="text-xs font-medium opacity-70">{['L','M','M','J','V','S','D'][day]}</span>
//               <span className="text-sm font-bold mt-0.5">{DAYS[day].substring(0,3)}</span>
//               {count > 0 && <span className="mt-1 text-xs px-1.5 py-0.5 rounded-full bg-white/20 text-white">{count}</span>}
//               {isToday && selectedDay !== day && <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-1" />}
//             </button>
//           );
//         })}
//       </div>

//       {/* Séances du jour */}
//       {todaySchedules.length === 0 ? (
//         <Card className="p-12 text-center">
//           <Calendar className="mx-auto text-gray-300 mb-4" size={48} />
//           <p className="text-gray-500">Aucun cours ce jour</p>
//         </Card>
//       ) : (
//         <div className="space-y-4">
//           {todaySchedules.map((s, i) => {
//             const colorClass = COLORS[i % COLORS.length];
//             return (
//               <Card key={s._id} className={`p-5 border-l-4 ${colorClass}`}>
//                 <div className="flex items-start gap-4">
//                   <div className="text-center min-w-[72px]">
//                     <p className="text-lg font-bold">{s.start}</p>
//                     <div className="w-0.5 h-4 mx-auto my-1 bg-gray-200" />
//                     <p className="text-sm text-gray-400">{s.end}</p>
//                   </div>
//                   <div className="flex-1">
//                     <div className="flex items-center gap-2 mb-2 flex-wrap">
//                       <h3 className="font-bold text-gray-900">{s.course}</h3>
//                       <Badge className="bg-gray-100 text-gray-600">{s.semester}</Badge>
//                       {s.group && <Badge className="bg-gray-100 text-gray-600">Groupe {s.group}</Badge>}
//                     </div>
//                     <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500">
//                       <span><MapPin size={12} className="inline mr-1" /> {s.room || '—'}</span>
//                       <span><User size={12} className="inline mr-1" /> {s.teacher}</span>
//                       <span><BookOpen size={12} className="inline mr-1" /> {s.program || 'Tronc commun'}</span>
//                     </div>
//                   </div>
//                 </div>
//               </Card>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// }