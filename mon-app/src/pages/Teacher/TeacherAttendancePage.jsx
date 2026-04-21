// // TeacherAttendancePage.jsx
// import { useState } from 'react';
// import { CheckCircle, QrCode } from 'lucide-react';
// import { attendanceAPI, courseAPI } from '../../services/services';
// import { Button, Card, Table, Select, Badge, Modal, useToast, Spinner } from '../../components/common';
// import { useFetch } from '../../components/hooks/UseFetch';
// import { useAuth } from '../../components/context/AuthContext';
// import { formatDate } from '../../components/utils/Helpers';

// const STATUS_STYLES = {
//   present: 'bg-green-100 text-green-700',
//   absent: 'bg-red-100 text-red-700',
//   justified: 'bg-blue-100 text-blue-700',
//   late: 'bg-yellow-100 text-yellow-700',
// };

// export function TeacherAttendancePage() {
//   const { user } = useAuth();
//   const { toast, ToastContainer } = useToast();
//   const { data: courses } = useFetch(() => courseAPI.getAll({ teacher: user?._id, limit: 100 }));
//   const [selectedCourse, setSelectedCourse] = useState('');
//   const [attendances, setAttendances] = useState([]);
//   const [loadingAtt, setLoadingAtt] = useState(false);
//   const [qrCode, setQrCode] = useState(null);
//   const [qrModal, setQrModal] = useState(false);

//   const courseList = courses?.data || courses || [];
//   const courseOpts = [{ value: '', label: 'Sélectionner un cours' }, ...courseList.map(c => ({ value: c._id, label: `${c.code} - ${c.title}` }))];

//   const loadAttendance = async (courseId) => {
//     if (!courseId) return;
//     setLoadingAtt(true);
//     try {
//       const res = await attendanceAPI.getCourseAttendance(courseId);
//       setAttendances(res.data || []);
//     } catch {}
//     finally { setLoadingAtt(false); }
//   };

//   const generateQR = async () => {
//     try {
//       const res = await attendanceAPI.generateQR(selectedCourse);
//       setQrCode(res.data?.qrCode);
//       setQrModal(true);
//     } catch (err) { toast(err.message, 'error'); }
//   };

//   const columns = [
//     { header: 'Étudiant', key: 'student', render: (_, row) => `${row.student?.firstName || ''} ${row.student?.lastName || ''}` },
//     { header: 'Date', key: 'date', render: v => formatDate(v) },
//     { header: 'Statut', key: 'status', render: v => <Badge className={STATUS_STYLES[v] || 'bg-gray-100 text-gray-600'}>{v}</Badge> },
//     { header: 'Via QR', key: 'scannedViaQR', render: v => v ? <Badge className="bg-purple-100 text-purple-700">QR</Badge> : '—' },
//   ];

//   return (
//     <div className="space-y-6">
//       <ToastContainer />
//       <div className="flex items-center justify-between flex-wrap gap-4">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">Gestion des Présences</h1>
//           <p className="text-sm text-gray-500 mt-1">Émargement numérique</p>
//         </div>
//         {selectedCourse && (
//           <Button variant="secondary" onClick={generateQR}><QrCode size={15} /> Générer QR Code</Button>
//         )}
//       </div>

//       <Card className="p-4">
//         <Select value={selectedCourse} onChange={e => { setSelectedCourse(e.target.value); loadAttendance(e.target.value); }}
//           options={courseOpts} className="w-80" />
//       </Card>

//       <Card>
//         {!selectedCourse ? (
//           <div className="flex flex-col items-center justify-center py-16 text-gray-400">
//             <CheckCircle size={48} className="mb-3 opacity-30" />
//             <p className="text-sm">Sélectionnez un cours pour voir les présences</p>
//           </div>
//         ) : loadingAtt ? <div className="flex justify-center py-8"><Spinner size={24} /></div> : (
//           <Table columns={columns} data={attendances} loading={false} emptyText="Aucune présence enregistrée" />
//         )}
//       </Card>

//       <Modal isOpen={qrModal} onClose={() => setQrModal(false)} title="QR Code de présence" size="sm">
//         <div className="text-center space-y-4">
//           {qrCode && <img src={qrCode} alt="QR" className="mx-auto w-48 h-48" />}
//           <p className="text-sm text-gray-500">Expire dans <strong>15 minutes</strong></p>
//           <Button onClick={() => setQrModal(false)}>Fermer</Button>
//         </div>
//       </Modal>
//     </div>
//   );
// }

// export default TeacherAttendancePage;




// TeacherAttendancePage.jsx
import { useState } from 'react';
import { CheckCircle, QrCode, X } from 'lucide-react';
import { attendanceAPI, courseAPI } from '../../services/services';
import { useAuth } from '../../components/context/AuthContext';

// Composant Toast minimal
const Toast = ({ message, type, onClose }) => {
  if (!message) return null;
  const bgColor = type === 'error' ? 'bg-red-500' : 'bg-green-500';
  return (
    <div className={`fixed bottom-4 right-4 z-50 ${bgColor} text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-right`}>
      <span>{message}</span>
      <button onClick={onClose} className="hover:opacity-80"><X size={16} /></button>
    </div>
  );
};

// Spinner
const Spinner = ({ size = 24 }) => (
  <div className="flex justify-center items-center">
    <div className={`w-${size/4} h-${size/4} border-2 border-indigo-600 border-t-transparent rounded-full animate-spin`} style={{ width: size, height: size }} />
  </div>
);

// Badge
const Badge = ({ children, className }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>{children}</span>
);

// Modal
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl max-w-sm w-full mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100"><X size={20} /></button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

// Table simple
const Table = ({ columns, data, emptyText = "Aucune donnée" }) => {
  if (!data || data.length === 0) {
    return <div className="text-center py-8 text-gray-400 text-sm">{emptyText}</div>;
  }
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
            <tr key={rowIdx} className="hover:bg-gray-50">
              {columns.map((col, colIdx) => (
                <td key={colIdx} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {col.render ? col.render(row[col.key], row) : row[col.key] || '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Select
const Select = ({ value, onChange, options, className = "" }) => (
  <select value={value} onChange={onChange} className={`border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${className}`}>
    {options.map(opt => (
      <option key={opt.value} value={opt.value}>{opt.label}</option>
    ))}
  </select>
);

// Card
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-100 ${className}`}>{children}</div>
);

// Button
const Button = ({ children, onClick, variant = "primary", className = "" }) => {
  const base = "px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2";
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200"
  };
  return <button className={`${base} ${variants[variant]} ${className}`} onClick={onClick}>{children}</button>;
};

const STATUS_STYLES = {
  present: 'bg-green-100 text-green-700',
  absent: 'bg-red-100 text-red-700',
  justified: 'bg-blue-100 text-blue-700',
  late: 'bg-yellow-100 text-yellow-700',
};

export default function TeacherAttendancePage() {
  const { user } = useAuth();
  const [toast, setToast] = useState({ message: '', type: '' });
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [attendances, setAttendances] = useState([]);
  const [loadingAtt, setLoadingAtt] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  const [qrModal, setQrModal] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(true);

  // Charger les cours du professeur
  useState(() => {
    const loadCourses = async () => {
      try {
        const res = await courseAPI.getAll({ teacher: user?._id, limit: 100 });
        setCourses(res.data?.data || res.data || []);
      } catch (err) {
        setToast({ message: err.message || "Erreur chargement cours", type: 'error' });
      } finally {
        setLoadingCourses(false);
      }
    };
    if (user?._id) loadCourses();
  }, [user]);

  const courseList = Array.isArray(courses) ? courses : [];
  const courseOpts = [
    { value: '', label: 'Sélectionner un cours' },
    ...courseList.map(c => ({ value: c._id, label: `${c.code} - ${c.title}` }))
  ];

  const loadAttendance = async (courseId) => {
    if (!courseId) return;
    setLoadingAtt(true);
    try {
      const res = await attendanceAPI.getCourseAttendance(courseId);
      setAttendances(res.data || []);
    } catch (err) {
      setToast({ message: "Erreur chargement présences", type: 'error' });
    } finally {
      setLoadingAtt(false);
    }
  };

  const generateQR = async () => {
    try {
      const res = await attendanceAPI.generateQR(selectedCourse);
      setQrCode(res.data?.qrCode);
      setQrModal(true);
    } catch (err) {
      setToast({ message: err.message || "Erreur génération QR", type: 'error' });
    }
  };

  const columns = [
    { header: 'Étudiant', key: 'student', render: (_, row) => `${row.student?.firstName || ''} ${row.student?.lastName || ''}` },
    { header: 'Date', key: 'date', render: v => new Date(v).toLocaleDateString() },
    { header: 'Statut', key: 'status', render: v => <Badge className={STATUS_STYLES[v] || 'bg-gray-100 text-gray-600'}>{v}</Badge> },
    { header: 'Via QR', key: 'scannedViaQR', render: v => v ? <Badge className="bg-purple-100 text-purple-700">QR</Badge> : '—' },
  ];

  const closeToast = () => setToast({ message: '', type: '' });

  if (loadingCourses) return <div className="flex justify-center h-64"><Spinner size={32} /></div>;

  return (
    <div className="space-y-6">
      <Toast message={toast.message} type={toast.type} onClose={closeToast} />
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Présences</h1>
          <p className="text-sm text-gray-500 mt-1">Émargement numérique</p>
        </div>
        {selectedCourse && (
          <Button variant="secondary" onClick={generateQR}><QrCode size={15} /> Générer QR Code</Button>
        )}
      </div>

      <Card className="p-4">
        <Select
          value={selectedCourse}
          onChange={e => {
            const val = e.target.value;
            setSelectedCourse(val);
            if (val) loadAttendance(val);
          }}
          options={courseOpts}
          className="w-80"
        />
      </Card>

      <Card>
        {!selectedCourse ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <CheckCircle size={48} className="mb-3 opacity-30" />
            <p className="text-sm">Sélectionnez un cours pour voir les présences</p>
          </div>
        ) : loadingAtt ? (
          <div className="flex justify-center py-8"><Spinner size={24} /></div>
        ) : (
          <Table columns={columns} data={attendances} emptyText="Aucune présence enregistrée" />
        )}
      </Card>

      <Modal isOpen={qrModal} onClose={() => setQrModal(false)} title="QR Code de présence">
        <div className="text-center space-y-4">
          {qrCode && <img src={qrCode} alt="QR Code" className="mx-auto w-48 h-48" />}
          <p className="text-sm text-gray-500">Expire dans <strong>15 minutes</strong></p>
          <Button onClick={() => setQrModal(false)}>Fermer</Button>
        </div>
      </Modal>
    </div>
  );
}