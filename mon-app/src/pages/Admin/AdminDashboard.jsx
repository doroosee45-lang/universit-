import { useEffect, useState, useCallback } from 'react';
import {
  Users, GraduationCap, TrendingUp, DollarSign,
  Library, Calendar, BookOpen, Clock, AlertTriangle,
  RefreshCw, CheckCircle, FileText, UserCheck, Award,
  ChevronRight, Layers, BarChart2
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

// ─── Configuration API ────────────────────────────────────────────────────────
const API_BASE = import.meta.env?.VITE_API_URL || 'http://localhost:5000/api';

const apiFetch = async (endpoint, token) => {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

// ─── Couleurs cohérentes ──────────────────────────────────────────────────────
const PALETTE = {
  indigo:  '#6366f1',
  emerald: '#10b981',
  amber:   '#f59e0b',
  rose:    '#f43f5e',
  violet:  '#8b5cf6',
  cyan:    '#06b6d4',
  sky:     '#0ea5e9',
  lime:    '#84cc16',
};
const PIE_COLORS = Object.values(PALETTE);

// ─── Helpers format ───────────────────────────────────────────────────────────
const fmtNumber = (n) => (n ?? 0).toLocaleString('fr-FR');
const fmtDate   = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
};

const CURRENCIES = {
  USD: { code: 'USD', symbol: '$',  label: 'USD ($)',               locale: 'en-US' },
  CDF: { code: 'CDF', symbol: 'FC', label: 'CDF (Franc Congolais)', locale: 'fr-CD' },
};

const makeFmtCurrency = (currency = 'USD') => (amount) => {
  const n = Number(amount ?? 0);
  const sym = CURRENCIES[currency]?.symbol || currency;
  if (currency === 'CDF') {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)} M FC`;
    if (n >= 1_000)     return `${(n / 1_000).toFixed(0)} K FC`;
    return `${n.toLocaleString('fr-FR')} FC`;
  }
  try {
    return new Intl.NumberFormat(CURRENCIES[currency]?.locale || 'en-US', {
      style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `${sym} ${n.toLocaleString()}`;
  }
};

// ─── Sous-composants ──────────────────────────────────────────────────────────
const Spinner = ({ size = 24 }) => (
  <svg
    width={size} height={size}
    viewBox="0 0 24 24" fill="none"
    className="animate-spin"
    style={{ animationDuration: '0.7s' }}
  >
    <circle cx="12" cy="12" r="10" stroke="#e2e8f0" strokeWidth="3" />
    <path d="M12 2a10 10 0 0 1 10 10" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const Empty = ({ label = 'Aucune donnée disponible' }) => (
  <div className="flex flex-col items-center justify-center h-36 gap-2 text-gray-300">
    <AlertTriangle size={26} strokeWidth={1.5} />
    <span className="text-xs">{label}</span>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-3 text-xs min-w-[110px]">
      <p className="font-bold text-gray-700 mb-1.5">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="flex justify-between gap-3" style={{ color: p.color }}>
          <span>{p.name}</span>
          <span className="font-bold text-gray-800">{p.value?.toLocaleString('fr-FR')}</span>
        </p>
      ))}
    </div>
  );
};

// ─── KPI Card ─────────────────────────────────────────────────────────────────
const KpiCard = ({ title, value, subtitle, icon, accent = '#6366f1', trend }) => {
  const bg = `${accent}14`;
  return (
    <div
      className="relative bg-white rounded-2xl p-5 shadow-sm border border-gray-100 overflow-hidden flex flex-col gap-3"
      style={{ borderTop: `3px solid ${accent}` }}
    >
      {/* fond décoratif */}
      <div
        className="absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-20"
        style={{ background: accent }}
      />

      <div className="flex items-start justify-between relative">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: bg, color: accent }}
        >
          {icon}
        </div>
        {trend !== undefined && (
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              trend >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
            }`}
          >
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>

      <div className="relative">
        <p className="text-2xl font-extrabold text-gray-900 leading-none">{value}</p>
        <p className="text-xs font-medium text-gray-400 mt-1">{title}</p>
        {subtitle && <p className="text-[11px] text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
};

// ─── Card wrapper ─────────────────────────────────────────────────────────────
const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm ${className}`}>
    {children}
  </div>
);

const SectionTitle = ({ icon, title, badge }) => (
  <div className="flex items-center gap-2 mb-4">
    <span className="text-indigo-500">{icon}</span>
    <h2 className="text-sm font-bold text-gray-800">{title}</h2>
    {badge !== undefined && badge > 0 && (
      <span className="ml-auto text-[11px] font-bold bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">
        {badge}
      </span>
    )}
  </div>
);

// ─── Badge session ────────────────────────────────────────────────────────────
const SessionBadge = ({ session }) => {
  const s = (session || '').toString().toLowerCase();
  const isS1 = s.includes('1') || s === 's1' || s === 'session1';
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
      isS1 ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'
    }`}>
      {session || '—'}
    </span>
  );
};

// ─── Statut délibération ──────────────────────────────────────────────────────
const DelibeStats = ({ stats }) => {
  if (!stats) return null;
  const items = [
    { label: 'Total',       value: stats.total,       color: PALETTE.indigo,  icon: <Layers size={13} /> },
    { label: 'Délibérés',   value: stats.deliberated, color: PALETTE.emerald, icon: <CheckCircle size={13} /> },
    { label: 'Certifiés',   value: stats.certified,   color: PALETTE.cyan,    icon: <Award size={13} /> },
    { label: 'En attente',  value: stats.pending,     color: PALETTE.amber,   icon: <Clock size={13} /> },
  ];
  return (
    <div className="grid grid-cols-2 gap-2">
      {items.map((it) => (
        <div key={it.label} className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
          <span style={{ color: it.color }}>{it.icon}</span>
          <div>
            <p className="text-xs font-bold text-gray-800">{fmtNumber(it.value)}</p>
            <p className="text-[10px] text-gray-400">{it.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ═════════════════════════════════════════════════════════════════════════════
export default function AdminDashboard() {
  // Récupère le token depuis le localStorage (adapter selon votre AuthContext)
  const token = localStorage.getItem('token') || localStorage.getItem('authToken');

  const [adminData,  setAdminData]  = useState(null);
  const [statsData,  setStatsData]  = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [currency, setCurrency]     = useState(() => localStorage.getItem('fee_currency') || 'USD');

  const fmtCurrency = makeFmtCurrency(currency);
  const changeCurrency = (c) => { setCurrency(c); localStorage.setItem('fee_currency', c); };

  const load = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    else        setRefreshing(true);
    setError(null);
    try {
      // Appels parallèles : /dashboard/admin  +  /dashboard/stats
      const [adminRes, statsRes] = await Promise.all([
        apiFetch('/dashboard/admin', token),
        apiFetch('/dashboard/stats', token),
      ]);
      if (adminRes.success) setAdminData(adminRes.data);
      if (statsRes.success) setStatsData(statsRes.data);
    } catch (err) {
      console.error('[AdminDashboard]', err);
      setError('Impossible de charger les données. Vérifiez votre connexion et réessayez.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  // ── États ───────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-72 gap-4 text-gray-400">
        <Spinner size={40} />
        <p className="text-sm font-medium">Chargement du tableau de bord…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-72 p-6">
        <div className="bg-rose-50 border border-rose-200 rounded-2xl px-8 py-6 text-rose-600 text-sm flex flex-col items-center gap-3 max-w-sm text-center">
          <AlertTriangle size={32} strokeWidth={1.5} />
          <p className="font-semibold">{error}</p>
          <button
            onClick={() => load()}
            className="mt-1 px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // ── Extraction données admin ────────────────────────────────────────────────
  const ad = adminData ?? {};
  const st = statsData ?? {};

  // Champs directs du controller getAdminDashboard
  const totalStudents     = ad.students          ?? 0;
  const totalTeachers     = ad.teachers          ?? 0;
  const totalStaff        = ad.staff             ?? 0;
  const totalCourses      = ad.courses           ?? 0;
  const pendingGrades     = ad.pendingGrades      ?? 0;
  const unpaidFees        = ad.unpaidFees         ?? 0;
  const recentEnrollments = ad.recentEnrollments  ?? [];
  const deliberation      = ad.deliberation       ?? null;

  // Champs du getOverallStats
  const avgAttendance     = st.attendance?.rate   ?? 0;
  const avgGrade          = st.grades?.average    ?? 0;
  const totalPrograms     = st.programs           ?? 0;
  const totalEnrollments  = st.enrollments        ?? 0;

  // ── Données graphiques synthétiques (générées à partir des KPIs réels) ─────
  // Le backend actuel ne fournit pas de séries temporelles mensuelles ;
  // on affiche les données brutes sous forme de barres comparatives.
  const kpiBarData = [
    { label: 'Étudiants',     valeur: totalStudents  },
    { label: 'Enseignants',   valeur: totalTeachers  },
    { label: 'Staff',         valeur: totalStaff     },
    { label: 'Cours',         valeur: totalCourses   },
    { label: 'Programmes',    valeur: totalPrograms  },
    { label: 'Inscriptions',  valeur: totalEnrollments },
  ];

  // Répartition utilisateurs pour le donut
  const userPieData = [
    { name: 'Étudiants',   value: totalStudents },
    { name: 'Enseignants', value: totalTeachers },
    { name: 'Staff',       value: totalStaff    },
  ].filter(d => d.value > 0);

  // Délibération donut
  const deliPieData = deliberation
    ? [
        { name: 'Délibérés',  value: deliberation.deliberated ?? 0 },
        { name: 'Certifiés',  value: deliberation.certified   ?? 0 },
        { name: 'En attente', value: deliberation.pending     ?? 0 },
      ].filter(d => d.value > 0)
    : [];

  const userName = ad.user?.firstName || ad.user?.name || 'Administrateur';

  return (
    <div className="space-y-6 p-1">

      {/* ── En-tête ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Tableau de bord</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Vue d'ensemble de l'établissement —{' '}
            <span className="font-semibold text-indigo-600">Données en temps réel</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Sélecteur devise — synchronisé avec FeesPage */}
          <div style={{ display: 'flex', border: '1px solid #E5E7EB', borderRadius: 8, overflow: 'hidden' }}>
            {Object.entries(CURRENCIES).map(([code, cfg]) => (
              <button key={code} onClick={() => changeCurrency(code)} style={{
                padding: '5px 13px', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700,
                background: currency === code ? '#6366f1' : '#fff',
                color: currency === code ? '#fff' : '#9CA3AF',
                transition: 'all .15s',
              }}>
                {cfg.symbol}
              </button>
            ))}
          </div>
          <button
            onClick={() => load(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-2 rounded-xl hover:bg-indigo-100 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
            Actualiser
          </button>
        </div>
      </div>

      {/* ── KPIs principaux ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Étudiants inscrits"
          value={fmtNumber(totalStudents)}
          subtitle={`${fmtNumber(totalEnrollments)} inscriptions`}
          icon={<GraduationCap size={20} />}
          accent={PALETTE.indigo}
        />
        <KpiCard
          title="Corps enseignant"
          value={fmtNumber(totalTeachers)}
          subtitle={`${fmtNumber(totalStaff)} staff administratif`}
          icon={<Users size={20} />}
          accent={PALETTE.sky}
        />
        <KpiCard
          title="Frais impayés"
          value={fmtNumber(unpaidFees)}
          subtitle="Dossiers en attente de paiement"
          icon={<DollarSign size={20} />}
          accent={PALETTE.rose}
        />
        <KpiCard
          title="Notes en attente"
          value={fmtNumber(pendingGrades)}
          subtitle="Non validées par les enseignants"
          icon={<FileText size={20} />}
          accent={PALETTE.amber}
        />
      </div>

      {/* ── KPIs secondaires ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Cours dispensés"
          value={fmtNumber(totalCourses)}
          subtitle={`${fmtNumber(totalPrograms)} programmes actifs`}
          icon={<BookOpen size={20} />}
          accent={PALETTE.violet}
        />
        <KpiCard
          title="Taux de présence"
          value={`${avgAttendance}%`}
          subtitle="Moyenne globale"
          icon={<UserCheck size={20} />}
          accent={PALETTE.emerald}
        />
        <KpiCard
          title="Moyenne générale"
          value={avgGrade > 0 ? `${avgGrade}/20` : '—'}
          subtitle="Toutes UE confondues"
          icon={<TrendingUp size={20} />}
          accent={PALETTE.cyan}
        />
        <KpiCard
          title="Délibérations"
          value={fmtNumber(deliberation?.total)}
          subtitle={`${fmtNumber(deliberation?.certified)} certifiées`}
          icon={<Award size={20} />}
          accent={PALETTE.lime}
        />
      </div>

      {/* ── Graphiques ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Comparatif effectifs */}
        <Card className="p-5 lg:col-span-2">
          <SectionTitle icon={<BarChart2 size={16} />} title="Comparatif des effectifs" />
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={kpiBarData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={false} tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={false} tickLine={false} width={40}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="valeur" name="Total" radius={[6, 6, 0, 0]}>
                {kpiBarData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Répartition utilisateurs */}
        <Card className="p-5">
          <SectionTitle icon={<Users size={16} />} title="Répartition utilisateurs" />
          {userPieData.length === 0 ? (
            <Empty label="Aucune donnée utilisateur" />
          ) : (
            <>
              <ResponsiveContainer width="100%" height={170}>
                <PieChart>
                  <Pie
                    data={userPieData}
                    cx="50%" cy="50%"
                    innerRadius={50} outerRadius={72}
                    dataKey="value" nameKey="name"
                    paddingAngle={3}
                  >
                    {userPieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,.1)', fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="space-y-2 mt-2">
                {userPieData.map((p, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: PIE_COLORS[i] }} />
                      <span className="text-gray-600">{p.name}</span>
                    </div>
                    <span className="font-bold text-gray-800">{fmtNumber(p.value)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>
      </div>

      {/* ── Délibérations & Inscriptions récentes ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Statistiques délibération */}
        <Card className="p-5">
          <SectionTitle icon={<Award size={16} />} title="Délibérations — Année en cours" />
          {!deliberation ? (
            <Empty label="Aucune délibération enregistrée" />
          ) : (
            <>
              <DelibeStats stats={deliberation} />

              {/* Mini donut délibération */}
              {deliPieData.length > 0 && (
                <div className="mt-4">
                  <ResponsiveContainer width="100%" height={120}>
                    <PieChart>
                      <Pie
                        data={deliPieData}
                        cx="50%" cy="50%"
                        innerRadius={36} outerRadius={52}
                        dataKey="value" nameKey="name"
                        paddingAngle={2}
                      >
                        {deliPieData.map((_, i) => (
                          <Cell key={i} fill={[PALETTE.emerald, PALETTE.cyan, PALETTE.amber][i] || PALETTE.indigo} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ borderRadius: 12, border: 'none', fontSize: 12 }}
                      />
                      <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </>
          )}
        </Card>

        {/* Inscriptions récentes */}
        <Card className="p-5">
          <SectionTitle
            icon={<Clock size={16} />}
            title="Inscriptions récentes"
            badge={recentEnrollments.length}
          />
          {recentEnrollments.length === 0 ? (
            <Empty label="Aucune inscription récente" />
          ) : (
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {recentEnrollments.map((enr, idx) => {
                const student = enr.student;
                const ue      = enr.ue;
                const program = enr.program;
                const name    = student
                  ? `${student.firstName || ''} ${student.lastName || ''}`.trim() || student.email
                  : '—';
                const ueName  = ue?.title  || ue?.code  || '—';
                const progName= program?.name || program?.code || '—';
                const date    = enr.createdAt || enr.date;

                return (
                  <div
                    key={enr._id || idx}
                    className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-indigo-50 transition-colors rounded-xl"
                  >
                    {/* Avatar initiales */}
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0"
                      style={{ background: PIE_COLORS[idx % PIE_COLORS.length] }}
                    >
                      {name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{name}</p>
                      <p className="text-[11px] text-gray-400 truncate">{ueName} • {progName}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[11px] text-gray-400">{fmtDate(date)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* ── Métriques financières ────────────────────────────────────────────── */}
      <Card className="p-5">
        <SectionTitle icon={<DollarSign size={16} />} title={`Aperçu financier — ${CURRENCIES[currency]?.label || currency}`} />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-rose-50 rounded-xl p-4">
            <p className="text-xs text-rose-500 font-semibold mb-1">Frais impayés</p>
            <p className="text-2xl font-extrabold text-rose-700">{fmtNumber(unpaidFees)}</p>
            <p className="text-[11px] text-rose-400 mt-1">dossiers en souffrance</p>
          </div>
          <div className="bg-amber-50 rounded-xl p-4">
            <p className="text-xs text-amber-500 font-semibold mb-1">Notes non validées</p>
            <p className="text-2xl font-extrabold text-amber-700">{fmtNumber(pendingGrades)}</p>
            <p className="text-[11px] text-amber-400 mt-1">en attente de validation</p>
          </div>
          <div className="bg-indigo-50 rounded-xl p-4">
            <p className="text-xs text-indigo-500 font-semibold mb-1">Total utilisateurs</p>
            <p className="text-2xl font-extrabold text-indigo-700">
              {fmtNumber(totalStudents + totalTeachers + totalStaff)}
            </p>
            <p className="text-[11px] text-indigo-400 mt-1">dans le système</p>
          </div>
        </div>
      </Card>

    </div>
  );
}