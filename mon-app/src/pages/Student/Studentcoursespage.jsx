// pages/student/StudentCoursesPage.jsx
import { useState, useMemo } from 'react';
import { BookOpen, Users, Clock, Search, X, GraduationCap, ChevronRight, Filter, Layers } from 'lucide-react';
import { courseAPI } from '../../services/services';
import { useFetch } from '../../components/hooks/UseFetch';
import { useAuth } from '../../components/context/AuthContext';

// ─── UI PRIMITIVES (cohérents avec CoursesPage / TeacherCoursesPage) ─────────
const Badge = ({ children, className = '' }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${className}`}>
    {children}
  </span>
);

const Spinner = ({ size = 16 }) => (
  <svg
    width={size} height={size}
    viewBox="0 0 24 24" fill="none"
    className="animate-spin text-indigo-500"
    stroke="currentColor" strokeWidth="2"
  >
    <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
    <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
  </svg>
);

// ─── CONSTANTES ───────────────────────────────────────────────────────────────
const TYPE_COLORS = {
  CM: 'bg-blue-100 text-blue-700',
  TD: 'bg-green-100 text-green-700',
  TP: 'bg-purple-100 text-purple-700',
};

const TYPE_BG = {
  CM: 'from-blue-50 to-indigo-50 border-blue-100',
  TD: 'from-green-50 to-emerald-50 border-green-100',
  TP: 'from-purple-50 to-violet-50 border-purple-100',
};

const TYPE_ICON_BG = {
  CM: 'bg-blue-100',
  TD: 'bg-green-100',
  TP: 'bg-purple-100',
};

const TYPE_ICON_COLOR = {
  CM: 'text-blue-600',
  TD: 'text-green-600',
  TP: 'text-purple-600',
};

const SEM_COLORS = {
  S1: 'bg-amber-100 text-amber-700',
  S2: 'bg-orange-100 text-orange-700',
  S3: 'bg-rose-100 text-rose-700',
  S4: 'bg-pink-100 text-pink-700',
  S5: 'bg-sky-100 text-sky-700',
  S6: 'bg-teal-100 text-teal-700',
};

// ─── COURSE CARD ──────────────────────────────────────────────────────────────
function CourseCard({ course }) {
  const type = course.type || 'CM';
  return (
    <div className={`rounded-2xl border bg-gradient-to-br p-5 hover:shadow-lg transition-all duration-200 group ${TYPE_BG[type] || 'from-gray-50 to-gray-100 border-gray-200'}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${TYPE_ICON_BG[type]}`}>
          <BookOpen size={20} className={TYPE_ICON_COLOR[type]} />
        </div>
        <div className="flex items-center gap-1.5">
          <Badge className={SEM_COLORS[course.semester] || 'bg-gray-100 text-gray-600'}>
            {course.semester}
          </Badge>
          <Badge className={TYPE_COLORS[type] || 'bg-gray-100 text-gray-600'}>
            {type}
          </Badge>
        </div>
      </div>

      {/* Title & code */}
      <h3 className="font-bold text-gray-900 text-sm leading-tight mb-0.5 group-hover:text-indigo-700 transition-colors">
        {course.title}
      </h3>
      <p className="text-xs text-gray-400 font-mono mb-4">{course.code}</p>

      {/* Meta */}
      <div className="space-y-1.5 mb-4">
        {course.ue && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Layers size={11} className="shrink-0" />
            <span className="truncate">
              <span className="font-medium">{course.ue?.code || '—'}</span>
              {course.ue?.title ? ` · ${course.ue.title}` : ''}
            </span>
          </div>
        )}
        {course.teacher && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <GraduationCap size={11} className="shrink-0" />
            <span>{course.teacher?.firstName} {course.teacher?.lastName}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Clock size={11} className="shrink-0" />
          <span>{course.totalHours}h · {course.academicYear}</span>
        </div>
        {course.groups?.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Users size={11} className="shrink-0" />
            <span>Groupes : {course.groups.join(', ')}</span>
          </div>
        )}
      </div>

      {/* CTA links */}
      <div className="pt-3 border-t border-white/60 flex gap-2">
        <a
          href={`/student/attendance?course=${course._id}`}
          className="flex-1 flex items-center justify-center gap-1 text-xs font-semibold text-indigo-600 hover:text-white py-1.5 bg-white/80 hover:bg-indigo-600 rounded-lg transition-all border border-indigo-100 hover:border-indigo-600"
        >
          Présences <ChevronRight size={11} />
        </a>
        <a
          href={`/student/grades?course=${course._id}`}
          className="flex-1 flex items-center justify-center gap-1 text-xs font-semibold text-green-600 hover:text-white py-1.5 bg-white/80 hover:bg-green-600 rounded-lg transition-all border border-green-100 hover:border-green-600"
        >
          Notes <ChevronRight size={11} />
        </a>
      </div>
    </div>
  );
}

// ─── STAT CARD ────────────────────────────────────────────────────────────────
function StatCard({ label, value, color, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl border p-4 flex items-center gap-3 transition-all hover:shadow-md text-left w-full
        ${color} ${active ? 'ring-2 ring-offset-1 ring-indigo-400' : ''}`}
    >
      <div>
        <p className="text-xs font-semibold opacity-70">{label}</p>
        <p className="text-2xl font-extrabold">{value}</p>
      </div>
    </button>
  );
}

// ─── PAGE PRINCIPALE ──────────────────────────────────────────────────────────
export default function StudentCoursesPage() {
  const { user } = useAuth();

  // Récupère tous les cours dont le programme correspond à celui de l'étudiant
  // (ou adaptez selon votre logique métier : filtrer par groups, program, etc.)
  const { data, loading } = useFetch(() =>
    courseAPI.getAll({
      program: user?.program?._id || user?.program,
      limit: 200,
    })
  );

  const allCourses = useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.courses)) return data.courses;
    return [];
  }, [data]);

  const [search, setSearch]   = useState('');
  const [typeFilter, setType] = useState('');
  const [semFilter,  setSem]  = useState('');

  const filtered = useMemo(() => {
    return allCourses.filter(c => {
      const q = search.toLowerCase();
      const matchSearch = !q
        || c.title?.toLowerCase().includes(q)
        || c.code?.toLowerCase().includes(q)
        || c.teacher?.firstName?.toLowerCase().includes(q)
        || c.teacher?.lastName?.toLowerCase().includes(q)
        || c.ue?.title?.toLowerCase().includes(q);
      const matchType = !typeFilter || c.type === typeFilter;
      const matchSem  = !semFilter  || c.semester === semFilter;
      return matchSearch && matchType && matchSem;
    });
  }, [allCourses, search, typeFilter, semFilter]);

  const countByType = type => allCourses.filter(c => c.type === type).length;
  const semesters   = [...new Set(allCourses.map(c => c.semester))].sort();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { font-family: 'Plus Jakarta Sans', sans-serif; box-sizing: border-box; }
        @keyframes fade-in { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .animate-fade-in { animation: fade-in 0.3s ease; }
        @keyframes card-in { from { opacity:0; transform:translateY(12px) scale(.97); } to { opacity:1; transform:translateY(0) scale(1); } }
        .animate-card-in { animation: card-in 0.35s ease both; }
      `}</style>

      <div className="min-h-screen bg-gray-50 p-6 animate-fade-in">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* ── En-tête ───────────────────────────────────────────────────── */}
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                <BookOpen size={20} className="text-white" />
              </div>
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Mes Cours</h1>
            </div>
            <p className="text-sm text-gray-500 ml-[52px]">
              {loading ? 'Chargement...' : `${allCourses.length} cours dans votre programme`}
            </p>
          </div>

          {/* ── Stats rapides ─────────────────────────────────────────────── */}
          {!loading && (
            <div className="grid grid-cols-3 gap-4">
              <StatCard
                label="Cours Magistraux"
                value={countByType('CM')}
                color="bg-blue-50 text-blue-700 border-blue-200"
                active={typeFilter === 'CM'}
                onClick={() => setType(t => t === 'CM' ? '' : 'CM')}
              />
              <StatCard
                label="Travaux Dirigés"
                value={countByType('TD')}
                color="bg-green-50 text-green-700 border-green-200"
                active={typeFilter === 'TD'}
                onClick={() => setType(t => t === 'TD' ? '' : 'TD')}
              />
              <StatCard
                label="Travaux Pratiques"
                value={countByType('TP')}
                color="bg-purple-50 text-purple-700 border-purple-200"
                active={typeFilter === 'TP'}
                onClick={() => setType(t => t === 'TP' ? '' : 'TP')}
              />
            </div>
          )}

          {/* ── Filtres ───────────────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex gap-3 flex-wrap">

              {/* Recherche */}
              <div className="relative flex-1 min-w-48">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Rechercher par titre, code, enseignant..."
                  className="w-full border border-gray-200 rounded-lg pl-9 pr-9 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Filtre type */}
              <div className="relative">
                <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <select
                  value={typeFilter}
                  onChange={e => setType(e.target.value)}
                  className="border border-gray-200 rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                >
                  <option value="">Tous les types</option>
                  <option value="CM">CM – Cours Magistral</option>
                  <option value="TD">TD – Travaux Dirigés</option>
                  <option value="TP">TP – Travaux Pratiques</option>
                </select>
              </div>

              {/* Filtre semestre */}
              {semesters.length > 0 && (
                <select
                  value={semFilter}
                  onChange={e => setSem(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                >
                  <option value="">Tous les semestres</option>
                  {semesters.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              )}

              {/* Reset */}
              {(search || typeFilter || semFilter) && (
                <button
                  onClick={() => { setSearch(''); setType(''); setSem(''); }}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  <X size={13} /> Réinitialiser
                </button>
              )}
            </div>
          </div>

          {/* ── Contenu ───────────────────────────────────────────────────── */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-3">
              <Spinner size={36} />
              <p className="text-sm">Chargement des cours...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
              <BookOpen size={44} strokeWidth={1.2} />
              <p className="text-sm font-medium">Aucun cours trouvé</p>
              {(search || typeFilter || semFilter) && (
                <button
                  onClick={() => { setSearch(''); setType(''); setSem(''); }}
                  className="text-xs text-indigo-500 hover:underline"
                >
                  Effacer les filtres
                </button>
              )}
            </div>
          ) : (
            <>
              <p className="text-xs text-gray-400 font-medium">
                {filtered.length} cours affichés
                {(search || typeFilter || semFilter) && ` · filtrés sur ${allCourses.length}`}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filtered.map((course, i) => (
                  <div
                    key={course._id}
                    className="animate-card-in"
                    style={{ animationDelay: `${Math.min(i * 40, 400)}ms` }}
                  >
                    <CourseCard course={course} />
                  </div>
                ))}
              </div>
            </>
          )}

        </div>
      </div>
    </>
  );
}