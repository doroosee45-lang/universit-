// import { useState } from 'react';
// import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
// import { attendanceAPI } from '../../services/services';
// import { Card, Table, Pagination, Badge, StatCard, Modal, Input, Button, useToast } from '../../components/common';
// import { usePagination } from '../../components/hooks/UseFetch';
// import { useAuth } from '../../components/context/AuthContext';
// import { formatDate, formatDateTime } from '../../components/utils/Helpers';

// const STATUS_STYLES = {
//   present: 'bg-green-100 text-green-700',
//   absent: 'bg-red-100 text-red-700',
//   justified: 'bg-blue-100 text-blue-700',
//   late: 'bg-yellow-100 text-yellow-700',
//   exempted: 'bg-gray-100 text-gray-600',
// };

// const STATUS_ICONS = {
//   present: <CheckCircle size={13} />,
//   absent: <XCircle size={13} />,
//   justified: <AlertTriangle size={13} />,
//   late: <Clock size={13} />,
// };

// function JustifyModal({ record, onSave, onCancel }) {
//   const [reason, setReason] = useState('');
//   const [loading, setLoading] = useState(false);
//   const { toast, ToastContainer } = useToast();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       await attendanceAPI.justify(record._id, { reason });
//       onSave();
//     } catch (err) { toast(err.message, 'error'); }
//     finally { setLoading(false); }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-4">
//       <ToastContainer />
//       <div className="p-3 bg-gray-50 rounded-xl text-sm">
//         <p className="text-gray-600">Cours : <strong>{record?.course?.title}</strong></p>
//         <p className="text-gray-600">Date : <strong>{formatDate(record?.date)}</strong></p>
//       </div>
//       <div className="space-y-1.5">
//         <label className="block text-sm font-medium text-gray-700">Motif de l'absence *</label>
//         <textarea value={reason} onChange={e => setReason(e.target.value)} required rows={4}
//           placeholder="Expliquez la raison de votre absence..."
//           className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
//       </div>
//       <p className="text-xs text-gray-400">Un justificatif peut être demandé par votre enseignant.</p>
//       <div className="flex gap-3 pt-2">
//         <Button variant="secondary" type="button" onClick={onCancel} className="flex-1">Annuler</Button>
//         <Button type="submit" loading={loading} className="flex-1">Envoyer la justification</Button>
//       </div>
//     </form>
//   );
// }

// export default function StudentAttendancePage() {
//   const { user } = useAuth();
//   const { toast, ToastContainer } = useToast();
//   const { data, total, page, limit, loading, setPage, refetch } = usePagination(
//     (params) => attendanceAPI.getStudentAttendance(user?._id, params)
//   );

//   const [justifyModal, setJustifyModal] = useState({ open: false, record: null });

//   // Stats from data
//   const records = data || [];
//   const stats = {
//     present: records.filter(r => r.status === 'present').length,
//     absent: records.filter(r => r.status === 'absent').length,
//     justified: records.filter(r => r.status === 'justified').length,
//     late: records.filter(r => r.status === 'late').length,
//   };
//   const total_records = records.length;
//   const attendanceRate = total_records > 0
//     ? Math.round(((stats.present + stats.late) / total_records) * 100)
//     : 0;

//   const columns = [
//     {
//       header: 'Cours', key: 'course',
//       render: (_, row) => (
//         <div>
//           <p className="font-medium text-gray-900 text-sm">{row.course?.title || '—'}</p>
//           <p className="text-xs text-gray-400">{row.course?.type}</p>
//         </div>
//       )
//     },
//     { header: 'Date', key: 'date', render: v => formatDate(v) },
//     {
//       header: 'Statut', key: 'status',
//       render: v => (
//         <Badge className={STATUS_STYLES[v] || 'bg-gray-100 text-gray-600'}>
//           <span className="flex items-center gap-1">{STATUS_ICONS[v]}{v}</span>
//         </Badge>
//       )
//     },
//     { header: 'Heure arrivée', key: 'checkInTime', render: v => v ? formatDateTime(v) : '—' },
//     {
//       header: 'Justifié', key: 'isJustified',
//       render: v => v
//         ? <Badge className="bg-blue-100 text-blue-700">✓ Justifié</Badge>
//         : <span className="text-gray-400 text-xs">—</span>
//     },
//     {
//       header: 'Actions', key: '_id',
//       render: (_, row) => {
//         if (row.status === 'absent' && !row.isJustified) {
//           return (
//             <Button size="sm" variant="secondary" onClick={() => setJustifyModal({ open: true, record: row })}>
//               Justifier
//             </Button>
//           );
//         }
//         return null;
//       }
//     },
//   ];

//   return (
//     <div className="space-y-6">
//       <ToastContainer />
//       <div>
//         <h1 className="text-2xl font-bold text-gray-900">Mes Présences</h1>
//         <p className="text-sm text-gray-500 mt-1">Historique de présence</p>
//       </div>

//       {/* Stats */}
//       <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
//         <StatCard title="Présents" value={stats.present} icon={<CheckCircle size={22} />} color="green" />
//         <StatCard title="Absents" value={stats.absent} icon={<XCircle size={22} />} color="red" />
//         <StatCard title="Retards" value={stats.late} icon={<Clock size={22} />} color="amber" />
//         <StatCard title="Taux présence" value={`${attendanceRate}%`} icon={<CheckCircle size={22} />} color="indigo" />
//       </div>

//       {/* Progress bar */}
//       {total_records > 0 && (
//         <Card className="p-5">
//           <div className="flex justify-between items-center mb-2">
//             <span className="text-sm font-medium text-gray-700">Taux de présence global</span>
//             <span className={`text-sm font-bold ${attendanceRate >= 75 ? 'text-green-600' : attendanceRate >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
//               {attendanceRate}%
//             </span>
//           </div>
//           <div className="w-full bg-gray-200 rounded-full h-3">
//             <div
//               className={`h-3 rounded-full transition-all ${attendanceRate >= 75 ? 'bg-green-500' : attendanceRate >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
//               style={{ width: `${attendanceRate}%` }}
//             />
//           </div>
//           {attendanceRate < 75 && (
//             <p className="text-xs text-red-600 mt-2">
//               ⚠️ Votre taux de présence est inférieur à 75%. Cela peut affecter votre validation.
//             </p>
//           )}
//         </Card>
//       )}

//       {/* Table */}
//       <Card>
//         <Table columns={columns} data={data} loading={loading} emptyText="Aucune présence enregistrée" />
//         <Pagination page={page} total={total} limit={limit} onPageChange={setPage} />
//       </Card>

//       {/* Justify Modal */}
//       <Modal isOpen={justifyModal.open} onClose={() => setJustifyModal({ open: false, record: null })}
//         title="Justifier une absence" size="sm">
//         {justifyModal.record && (
//           <JustifyModal
//             record={justifyModal.record}
//             onSave={() => {
//               setJustifyModal({ open: false, record: null });
//               refetch();
//               toast('Justification envoyée');
//             }}
//             onCancel={() => setJustifyModal({ open: false, record: null })}
//           />
//         )}
//       </Modal>
//     </div>
//   );
// }







// pages/student/StudentAttendancePage.jsx
import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, Clock, AlertTriangle, X } from 'lucide-react';
import { attendanceAPI } from '../../services/services';
import { useAuth } from '../../components/context/AuthContext';

// ---------- Composants UI locaux (inchangés, identiques à ceux que vous avez) ----------
const Toast = ({ message, type, onClose }) => {
  if (!message) return null;
  const bgColor = type === 'error' ? 'bg-red-500' : 'bg-green-500';
  return (
    <div className={`fixed bottom-4 right-4 z-50 ${bgColor} text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2`}>
      <span>{message}</span>
      <button onClick={onClose} className="hover:opacity-80"><X size={16} /></button>
    </div>
  );
};

const Spinner = ({ size = 24 }) => (
  <div className="flex justify-center items-center">
    <div className={`border-2 border-indigo-600 border-t-transparent rounded-full animate-spin`} style={{ width: size, height: size }} />
  </div>
);

const Badge = ({ children, className }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>{children}</span>
);

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100"><X size={20} /></button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => {
  const colorMap = {
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    amber: 'bg-amber-50 text-amber-600',
    indigo: 'bg-indigo-50 text-indigo-600',
  };
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">{title}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorMap[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-100 ${className}`}>{children}</div>
);

const Button = ({ children, onClick, variant = "primary", size = "md", loading, disabled, type = "button" }) => {
  const base = "rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50";
  const sizes = { sm: "px-2 py-1 text-xs", md: "px-4 py-2 text-sm", lg: "px-5 py-2.5 text-base" };
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200"
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled || loading} className={`${base} ${sizes[size]} ${variants[variant]}`}>
      {loading && <Spinner size={16} />}
      {children}
    </button>
  );
};

const Table = ({ columns, data, loading, emptyText = "Aucune donnée" }) => {
  if (loading) return <div className="flex justify-center py-8"><Spinner size={24} /></div>;
  if (!data || data.length === 0) return <div className="text-center py-8 text-gray-400 text-sm">{emptyText}</div>;
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, rowIdx) => (
            <tr key={row._id || rowIdx} className="hover:bg-gray-50">
              {columns.map((col, colIdx) => (
                <td key={colIdx} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {col.render ? col.render(row[col.key], row) : row[col.key] ?? '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const Pagination = ({ page, total, limit, onPageChange }) => {
  const totalPages = Math.ceil(total / limit);
  if (totalPages <= 1) return null;
  return (
    <div className="flex justify-between items-center px-4 py-3 border-t border-gray-200">
      <button onClick={() => onPageChange(page - 1)} disabled={page === 1} className="px-3 py-1 text-sm bg-gray-100 rounded disabled:opacity-50">Précédent</button>
      <span className="text-sm text-gray-600">Page {page} / {totalPages}</span>
      <button onClick={() => onPageChange(page + 1)} disabled={page === totalPages} className="px-3 py-1 text-sm bg-gray-100 rounded disabled:opacity-50">Suivant</button>
    </div>
  );
};

// ---------- Composant de justification (inchangé) ----------
function JustifyModal({ record, onSave, onCancel }) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await attendanceAPI.justify(record._id, { reason });
      onSave();
    } catch (err) {
      setToast({ message: err.message || 'Erreur', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {toast.message && <Toast {...toast} onClose={() => setToast({ message: '', type: '' })} />}
      <div className="p-3 bg-gray-50 rounded-xl text-sm">
        <p className="text-gray-600">Cours : <strong>{record?.course?.title}</strong></p>
        <p className="text-gray-600">Date : <strong>{new Date(record?.date).toLocaleDateString()}</strong></p>
      </div>
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700">Motif de l'absence *</label>
        <textarea value={reason} onChange={e => setReason(e.target.value)} required rows={4}
          placeholder="Expliquez la raison de votre absence..."
          className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
      </div>
      <p className="text-xs text-gray-400">Un justificatif peut être demandé par votre enseignant.</p>
      <div className="flex gap-3 pt-2">
        <Button variant="secondary" type="button" onClick={onCancel} className="flex-1">Annuler</Button>
        <Button type="submit" loading={loading} className="flex-1">Envoyer la justification</Button>
      </div>
    </form>
  );
}

// ---------- Composant principal (avec pagination manuelle) ----------
export default function StudentAttendancePage() {
  const { user } = useAuth();
  const [toast, setToast] = useState({ message: '', type: '' });
  const [attendances, setAttendances] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [justifyModal, setJustifyModal] = useState({ open: false, record: null });

  // Charger les présences avec pagination manuelle
  const loadAttendances = useCallback(async () => {
    if (!user?._id) return;
    setLoading(true);
    try {
      const res = await attendanceAPI.getStudentAttendance(user._id, { page, limit });
      const data = res?.data?.data ?? res?.data ?? [];
      const totalCount = res?.data?.total ?? res?.total ?? 0;
      setAttendances(Array.isArray(data) ? data : []);
      setTotal(totalCount);
    } catch (err) {
      console.error(err);
      setToast({ message: "Erreur chargement présences", type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [user?._id, page, limit]);

  useEffect(() => {
    loadAttendances();
  }, [loadAttendances]);

  const refresh = () => loadAttendances();

  const records = attendances;
  const stats = {
    present: records.filter(r => r.status === 'present').length,
    absent: records.filter(r => r.status === 'absent').length,
    justified: records.filter(r => r.status === 'justified').length,
    late: records.filter(r => r.status === 'late').length,
  };
  const total_records = records.length;
  const attendanceRate = total_records > 0
    ? Math.round(((stats.present + stats.late) / total_records) * 100)
    : 0;

  const STATUS_STYLES = {
    present: 'bg-green-100 text-green-700',
    absent: 'bg-red-100 text-red-700',
    justified: 'bg-blue-100 text-blue-700',
    late: 'bg-yellow-100 text-yellow-700',
  };

  const STATUS_ICONS = {
    present: <CheckCircle size={13} />,
    absent: <XCircle size={13} />,
    justified: <AlertTriangle size={13} />,
    late: <Clock size={13} />,
  };

  const columns = [
    {
      header: 'Cours', key: 'course', render: (_, row) => (
        <div><p className="font-medium text-gray-900 text-sm">{row.course?.title || '—'}</p><p className="text-xs text-gray-400">{row.course?.type}</p></div>
      )
    },
    { header: 'Date', key: 'date', render: v => new Date(v).toLocaleDateString() },
    {
      header: 'Statut', key: 'status', render: v => (
        <Badge className={STATUS_STYLES[v] || 'bg-gray-100 text-gray-600'}>
          <span className="flex items-center gap-1">{STATUS_ICONS[v]}{v}</span>
        </Badge>
      )
    },
    { header: 'Heure arrivée', key: 'checkInTime', render: v => v ? new Date(v).toLocaleString() : '—' },
    {
      header: 'Justifié', key: 'isJustified', render: v => v
        ? <Badge className="bg-blue-100 text-blue-700">✓ Justifié</Badge>
        : <span className="text-gray-400 text-xs">—</span>
    },
    {
      header: 'Actions', key: '_id', render: (_, row) => {
        if (row.status === 'absent' && !row.isJustified) {
          return <Button size="sm" variant="secondary" onClick={() => setJustifyModal({ open: true, record: row })}>Justifier</Button>;
        }
        return null;
      }
    },
  ];

  const closeToast = () => setToast({ message: '', type: '' });

  return (
    <div className="space-y-6">
      <Toast message={toast.message} type={toast.type} onClose={closeToast} />
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mes Présences</h1>
        <p className="text-sm text-gray-500 mt-1">Historique de présence</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard title="Présents" value={stats.present} icon={<CheckCircle size={22} />} color="green" />
        <StatCard title="Absents" value={stats.absent} icon={<XCircle size={22} />} color="red" />
        <StatCard title="Retards" value={stats.late} icon={<Clock size={22} />} color="amber" />
        <StatCard title="Taux présence" value={`${attendanceRate}%`} icon={<CheckCircle size={22} />} color="indigo" />
      </div>

      {/* Progress bar */}
      {total_records > 0 && (
        <Card className="p-5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Taux de présence global</span>
            <span className={`text-sm font-bold ${attendanceRate >= 75 ? 'text-green-600' : attendanceRate >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
              {attendanceRate}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div className={`h-3 rounded-full transition-all ${attendanceRate >= 75 ? 'bg-green-500' : attendanceRate >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${attendanceRate}%` }} />
          </div>
          {attendanceRate < 75 && (
            <p className="text-xs text-red-600 mt-2">⚠️ Votre taux de présence est inférieur à 75%. Cela peut affecter votre validation.</p>
          )}
        </Card>
      )}

      {/* Table */}
      <Card>
        <Table columns={columns} data={attendances} loading={loading} emptyText="Aucune présence enregistrée" />
        <Pagination page={page} total={total} limit={limit} onPageChange={setPage} />
      </Card>

      {/* Justify Modal */}
      <Modal isOpen={justifyModal.open} onClose={() => setJustifyModal({ open: false, record: null })} title="Justifier une absence">
        {justifyModal.record && (
          <JustifyModal
            record={justifyModal.record}
            onSave={() => {
              setJustifyModal({ open: false, record: null });
              refresh();
              setToast({ message: 'Justification envoyée', type: 'success' });
            }}
            onCancel={() => setJustifyModal({ open: false, record: null })}
          />
        )}
      </Modal>
    </div>
  );
}