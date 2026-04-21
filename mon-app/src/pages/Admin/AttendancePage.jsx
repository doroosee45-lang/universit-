// pages/admin/AttendancePage.jsx
import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, Clock, AlertTriangle, QrCode, Download } from 'lucide-react';
import { attendanceAPI, courseAPI, studentAPI } from '../../services/services';

// ─── Constants ────────────────────────────────────────────────────────────────
const STATUS_OPTS = [
  { value: '', label: 'Tous les statuts' },
  { value: 'present', label: 'Présent' },
  { value: 'absent', label: 'Absent' },
  { value: 'justified', label: 'Justifié' },
  { value: 'late', label: 'Retard' },
];

const STATUS_STYLES = {
  present: { background: '#D1FAE5', color: '#065F46' },
  absent: { background: '#FEE2E2', color: '#991B1B' },
  justified: { background: '#DBEAFE', color: '#1E40AF' },
  late: { background: '#FEF3C7', color: '#92400E' },
  exempted: { background: '#F3F4F6', color: '#6B7280' },
};

const formatDate = (date) => {
  if (!date) return '—';
  const d = new Date(date);
  return d.toLocaleDateString('fr-FR');
};

const formatDateTime = (date) => {
  if (!date) return '—';
  const d = new Date(date);
  return d.toLocaleString('fr-FR');
};

// ─── Toast Component ──────────────────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([]);
  const show = useCallback((msg, type = 'success') => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  }, []);
  
  const ToastContainer = () => (
    <div style={styles.toastContainer}>
      {toasts.map(t => (
        <div key={t.id} style={{
          ...styles.toast,
          background: t.type === 'error' ? '#FEF2F2' : '#F0FDF4',
          border: `1px solid ${t.type === 'error' ? '#FECACA' : '#BBF7D0'}`,
          color: t.type === 'error' ? '#991B1B' : '#166534',
        }}>
          {t.msg}
        </div>
      ))}
    </div>
  );
  
  return { toast: show, ToastContainer };
}

// ─── Spinner Component ────────────────────────────────────────────────────────
function Spinner({ size = 24 }) {
  return (
    <div style={{
      width: size,
      height: size,
      border: '2px solid #E5E7EB',
      borderTopColor: '#4F46E5',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    }} />
  );
}

// ─── Badge Component ──────────────────────────────────────────────────────────
function Badge({ children, style }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: '4px 8px',
      borderRadius: 20,
      fontSize: 11,
      fontWeight: 500,
      ...style,
    }}>
      {children}
    </span>
  );
}

// ─── Button Component ─────────────────────────────────────────────────────────
function Button({ children, onClick, variant = 'primary', size = 'md', loading, disabled }) {
  const variants = {
    primary: { background: '#4F46E5', color: '#fff', border: 'none' },
    secondary: { background: '#F9FAFB', color: '#374151', border: '1px solid #E5E7EB' },
    danger: { background: '#FEF2F2', color: '#991B1B', border: '1px solid #FECACA' },
  };
  
  const sizes = {
    sm: { padding: '6px 12px', fontSize: 12 },
    md: { padding: '8px 16px', fontSize: 13 },
    lg: { padding: '10px 20px', fontSize: 14 },
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        ...variants[variant],
        ...sizes[size],
        borderRadius: 8,
        fontWeight: 500,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled || loading ? 0.6 : 1,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        transition: 'all 0.2s',
      }}
    >
      {loading && <Spinner size={16} />}
      {children}
    </button>
  );
}

// ─── Card Component ───────────────────────────────────────────────────────────
function Card({ children, style }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 12,
      border: '1px solid #E5E7EB',
      overflow: 'hidden',
      ...style,
    }}>
      {children}
    </div>
  );
}

// ─── Input Component ──────────────────────────────────────────────────────────
function Input({ value, onChange, placeholder, type = 'text' }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{
        padding: '8px 12px',
        border: '1px solid #E5E7EB',
        borderRadius: 8,
        fontSize: 13,
        outline: 'none',
        transition: 'all 0.2s',
      }}
      onFocus={(e) => e.target.style.borderColor = '#6366F1'}
      onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
    />
  );
}

// ─── Select Component ─────────────────────────────────────────────────────────
function Select({ value, onChange, options, placeholder, style }) {
  return (
    <select
      value={value}
      onChange={onChange}
      style={{
        padding: '8px 12px',
        border: '1px solid #E5E7EB',
        borderRadius: 8,
        fontSize: 13,
        background: '#fff',
        outline: 'none',
        cursor: 'pointer',
        ...style,
      }}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}

// ─── Modal Component ──────────────────────────────────────────────────────────
function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    const handler = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);
  
  if (!isOpen) return null;
  
  const sizes = {
    sm: { maxWidth: 400 },
    md: { maxWidth: 600 },
    lg: { maxWidth: 800 },
    xl: { maxWidth: 1000 },
  };
  
  return (
    <div onClick={onClose} style={styles.modalOverlay}>
      <div onClick={e => e.stopPropagation()} style={{ ...styles.modalContent, ...sizes[size] }}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>{title}</h2>
          <button onClick={onClose} style={styles.modalClose}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── StatCard Component ───────────────────────────────────────────────────────
function StatCard({ title, value, icon, color }) {
  const colors = {
    green: { background: '#D1FAE5', color: '#065F46' },
    red: { background: '#FEE2E2', color: '#991B1B' },
    amber: { background: '#FEF3C7', color: '#92400E' },
    blue: { background: '#DBEAFE', color: '#1E40AF' },
  };
  
  return (
    <div style={{
      background: '#fff',
      borderRadius: 12,
      padding: '16px',
      border: '1px solid #E5E7EB',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
    }}>
      <div style={{
        width: 48,
        height: 48,
        borderRadius: 12,
        background: colors[color]?.background || '#F3F4F6',
        color: colors[color]?.color || '#6B7280',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {icon}
      </div>
      <div>
        <p style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 500 }}>{title}</p>
        <p style={{ fontSize: 24, fontWeight: 700, color: '#111' }}>{value}</p>
      </div>
    </div>
  );
}

// ─── Table Component ──────────────────────────────────────────────────────────
function Table({ columns, data, loading, emptyText = 'Aucune donnée' }) {
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '48px' }}>
        <Spinner size={32} />
      </div>
    );
  }
  
  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '48px', color: '#9CA3AF' }}>
        {emptyText}
      </div>
    );
  }
  
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #F3F4F6' }}>
            {columns.map(col => (
              <th key={col.key} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6B7280' }}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx} style={{ borderBottom: '1px solid #F9FAFB' }}>
              {columns.map(col => (
                <td key={col.key} style={{ padding: '12px 16px', fontSize: 13 }}>
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Pagination Component ─────────────────────────────────────────────────────
function Pagination({ page, total, limit, onPageChange }) {
  const totalPages = Math.ceil(total / limit);
  
  if (totalPages <= 1) return null;
  
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: '16px' }}>
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        style={{
          padding: '6px 12px',
          borderRadius: 6,
          border: '1px solid #E5E7EB',
          background: '#fff',
          cursor: page === 1 ? 'not-allowed' : 'pointer',
          opacity: page === 1 ? 0.5 : 1,
        }}
      >
        ←
      </button>
      <span style={{ padding: '6px 12px', color: '#6B7280' }}>
        Page {page} sur {totalPages}
      </span>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        style={{
          padding: '6px 12px',
          borderRadius: 6,
          border: '1px solid #E5E7EB',
          background: '#fff',
          cursor: page === totalPages ? 'not-allowed' : 'pointer',
          opacity: page === totalPages ? 0.5 : 1,
        }}
      >
        →
      </button>
    </div>
  );
}

// ─── Take Attendance Modal Component ──────────────────────────────────────────
function TakeAttendanceModal({ course, onSave, onCancel }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [attendances, setAttendances] = useState({});
  const [saving, setSaving] = useState(false);
  const { toast, ToastContainer } = useToast();

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const res = await studentAPI.getAll({ limit: 200 });
      const studentList = res.data?.data || res.data || [];
      setStudents(studentList);
    } catch (error) {
      toast('Erreur lors du chargement des étudiants', 'error');
    } finally {
      setLoading(false);
    }
  };

  const setStatus = (studentId, status) => {
    setAttendances(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const records = students.map(s => ({
        student: s._id,
        status: attendances[s._id] || 'absent',
      }));
      await attendanceAPI.take({ course: course._id, date, attendances: records });
      toast('Présences enregistrées avec succès');
      onSave();
    } catch (err) {
      toast(err.message || 'Erreur lors de l\'enregistrement', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <ToastContainer />
      
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 12, background: '#EEF2FF', borderRadius: 12, marginBottom: 20 }}>
        <div>
          <p style={{ fontWeight: 600, color: '#111' }}>{course?.title}</p>
          <p style={{ fontSize: 11, color: '#6B7280' }}>{course?.code}</p>
        </div>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          style={{
            marginLeft: 'auto',
            padding: '6px 12px',
            border: '1px solid #E5E7EB',
            borderRadius: 8,
            fontSize: 13,
          }}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 48 }}>
          <Spinner size={32} />
        </div>
      ) : (
        <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {students.map(s => {
            const currentStatus = attendances[s._id];
            return (
              <div key={s._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, background: '#F9FAFB', borderRadius: 10, marginBottom: 8 }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 500, color: '#111' }}>{s.firstName} {s.lastName}</p>
                  <p style={{ fontSize: 11, color: '#9CA3AF' }}>{s.studentId}</p>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {['present', 'absent', 'late', 'justified'].map(status => {
                    const isActive = currentStatus === status;
                    const style = STATUS_STYLES[status];
                    return (
                      <button
                        key={status}
                        onClick={() => setStatus(s._id, status)}
                        style={{
                          padding: '4px 8px',
                          fontSize: 11,
                          borderRadius: 6,
                          fontWeight: 500,
                          background: isActive ? style.background : '#E5E7EB',
                          color: isActive ? style.color : '#6B7280',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                      >
                        {status === 'present' ? 'P' : status === 'absent' ? 'A' : status === 'late' ? 'R' : 'J'}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, marginTop: 20, paddingTop: 16, borderTop: '1px solid #E5E7EB' }}>
        <Button variant="secondary" onClick={onCancel} style={{ flex: 1, justifyContent: 'center' }}>Annuler</Button>
        <Button onClick={handleSave} loading={saving} style={{ flex: 1, justifyContent: 'center' }}>
          <CheckCircle size={16} /> Enregistrer les présences
        </Button>
      </div>
    </div>
  );
}

// ─── Main Attendance Page ─────────────────────────────────────────────────────
export default function AttendancePage() {
  const { toast, ToastContainer } = useToast();
  
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [attendances, setAttendances] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(20);
  const [filters, setFilters] = useState({ status: '', date: '' });
  const [attendanceModal, setAttendanceModal] = useState({ open: false, course: null });
  const [qrModal, setQrModal] = useState({ open: false, qr: null });

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      loadAttendances();
      loadStats();
    }
  }, [selectedCourse, page, filters]);

  const loadCourses = async () => {
    try {
      const res = await courseAPI.getAll({ limit: 200 });
      setCourses(res.data?.data || res.data || []);
    } catch (error) {
      console.error('Erreur chargement cours:', error);
    }
  };

  const loadAttendances = async () => {
    setLoading(true);
    try {
      const params = { page, limit, ...filters };
      Object.keys(params).forEach(key => !params[key] && delete params[key]);
      const res = await attendanceAPI.getCourseAttendance(selectedCourse, params);
      setAttendances(res.data?.data || res.data || []);
      setTotal(res.data?.total || res.total || 0);
    } catch (error) {
      toast('Erreur lors du chargement des présences', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const res = await attendanceAPI.getCourseStats(selectedCourse);
      const statsData = res.data?.data || res.data || [];
      setStats(statsData);
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    }
  };

  const generateQR = async (courseId) => {
    try {
      const res = await attendanceAPI.generateQR(courseId);
      setQrModal({ open: true, qr: res.data?.qrCode });
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const handleFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const courseOptions = [
    { value: '', label: 'Sélectionner un cours' },
    ...courses.map(c => ({ value: c._id, label: `${c.code} - ${c.title}` }))
  ];

  const totalPresent = stats?.reduce((s, i) => s + (i.present || 0), 0) || 0;
  const totalAbsent = stats?.reduce((s, i) => s + (i.absent || 0), 0) || 0;
  const totalLate = stats?.reduce((s, i) => s + (i.late || 0), 0) || 0;

  const columns = [
    {
      header: 'Étudiant',
      key: 'student',
      render: (_, row) => (
        <div>
          <div style={{ fontWeight: 500, color: '#111' }}>
            {row.student?.firstName} {row.student?.lastName}
          </div>
          <div style={{ fontSize: 11, color: '#9CA3AF' }}>{row.student?.studentId}</div>
        </div>
      )
    },
    { header: 'Date', key: 'date', render: (v) => formatDate(v) },
    {
      header: 'Statut',
      key: 'status',
      render: (v) => {
        const style = STATUS_STYLES[v] || STATUS_STYLES.absent;
        return (
          <Badge style={{ background: style.background, color: style.color }}>
            {v === 'present' && <CheckCircle size={12} />}
            {v === 'absent' && <XCircle size={12} />}
            {v === 'justified' && <AlertTriangle size={12} />}
            {v === 'late' && <Clock size={12} />}
            {v}
          </Badge>
        );
      }
    },
    { header: 'Heure arrivée', key: 'checkInTime', render: (v) => v ? formatDateTime(v) : '—' },
    { header: 'Justifié', key: 'isJustified', render: (v) => v ? '✓ Justifié' : '—' },
    { header: 'Via QR', key: 'scannedViaQR', render: (v) => v ? 'QR Code' : '—' },
  ];

  return (
    <div style={styles.container}>
      <ToastContainer />
      
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>📋 Gestion des Présences</h1>
          <p style={styles.subtitle}>Supervision des émargements</p>
        </div>
        {selectedCourse && (
          <div style={styles.headerActions}>
            <Button variant="secondary" size="sm" onClick={() => generateQR(selectedCourse)}>
              <QrCode size={15} /> QR Code
            </Button>
            <Button onClick={() => {
              const course = courses.find(c => c._id === selectedCourse);
              setAttendanceModal({ open: true, course });
            }}>
              <CheckCircle size={16} /> Prendre présences
            </Button>
          </div>
        )}
      </div>

      {/* Course selector */}
      <Card style={{ padding: 16, marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Select
            value={selectedCourse}
            onChange={e => { setSelectedCourse(e.target.value); }}
            options={courseOptions}
            style={{ width: 280 }}
          />
          <Select
            value={filters.status}
            onChange={e => handleFilter('status', e.target.value)}
            options={STATUS_OPTS}
            style={{ width: 160 }}
          />
          <input
            type="date"
            value={filters.date}
            onChange={e => handleFilter('date', e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #E5E7EB',
              borderRadius: 8,
              fontSize: 13,
            }}
          />
        </div>
      </Card>

      {/* Stats */}
      {selectedCourse && (
        <div style={styles.statsGrid}>
          <StatCard title="Présents" value={totalPresent} icon={<CheckCircle size={22} />} color="green" />
          <StatCard title="Absents" value={totalAbsent} icon={<XCircle size={22} />} color="red" />
          <StatCard title="Retards" value={totalLate} icon={<Clock size={22} />} color="amber" />
        </div>
      )}

      {/* Table */}
      <Card>
        {!selectedCourse ? (
          <div style={styles.emptyState}>
            <CheckCircle size={48} style={{ opacity: 0.3, marginBottom: 12 }} />
            <p style={{ fontSize: 14, color: '#9CA3AF' }}>Sélectionnez un cours pour voir les présences</p>
          </div>
        ) : (
          <>
            <Table columns={columns} data={attendances} loading={loading} emptyText="Aucune présence enregistrée" />
            <Pagination page={page} total={total} limit={limit} onPageChange={setPage} />
          </>
        )}
      </Card>

      {/* Take Attendance Modal */}
      <Modal
        isOpen={attendanceModal.open}
        onClose={() => setAttendanceModal({ open: false, course: null })}
        title="Prise de présence"
        size="lg"
      >
        {attendanceModal.course && (
          <TakeAttendanceModal
            course={attendanceModal.course}
            onSave={() => {
              setAttendanceModal({ open: false, course: null });
              loadAttendances();
              loadStats();
            }}
            onCancel={() => setAttendanceModal({ open: false, course: null })}
          />
        )}
      </Modal>

      {/* QR Modal */}
      <Modal
        isOpen={qrModal.open}
        onClose={() => setQrModal({ open: false, qr: null })}
        title="QR Code de présence"
        size="sm"
      >
        <div style={{ textAlign: 'center' }}>
          {qrModal.qr && (
            <img src={qrModal.qr} alt="QR Code" style={{ margin: '0 auto', width: 180, height: 180, marginBottom: 16 }} />
          )}
          <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 16 }}>
            Ce QR Code expire dans <strong>15 minutes</strong>
          </p>
          <p style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 20 }}>
            Les étudiants peuvent scanner ce code pour enregistrer leur présence
          </p>
          <Button onClick={() => setQrModal({ open: false, qr: null })}>Fermer</Button>
        </div>
      </Modal>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = {
  container: {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    padding: '24px',
    maxWidth: 1400,
    margin: '0 auto',
    minHeight: '100vh',
    background: '#F9FAFB',
  },
  
  toastContainer: {
    position: 'fixed',
    bottom: 24,
    right: 24,
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  
  toast: {
    padding: '12px 20px',
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 500,
    boxShadow: '0 4px 12px rgba(0,0,0,.15)',
    animation: 'fadeUp 0.2s ease',
  },
  
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  
  title: {
    fontSize: 24,
    fontWeight: 700,
    color: '#111',
    margin: 0,
  },
  
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  
  headerActions: {
    display: 'flex',
    gap: 12,
  },
  
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 16,
    marginBottom: 20,
  },
  
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '64px 20px',
    color: '#9CA3AF',
  },
  
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.4)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: 16,
  },
  
  modalContent: {
    background: '#fff',
    borderRadius: 16,
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
  },
  
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '1px solid #E5E7EB',
  },
  
  modalTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: '#111',
    margin: 0,
  },
  
  modalClose: {
    width: 32,
    height: 32,
    borderRadius: 8,
    border: 'none',
    background: '#F3F4F6',
    cursor: 'pointer',
    fontSize: 18,
    color: '#6B7280',
    transition: 'all 0.2s',
  },
};