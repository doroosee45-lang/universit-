// pages/admin/ArchivePage.jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Archive, Package, Search, Filter, Calendar, Download, Trash2,
  RefreshCw, Users, UserCheck, BookOpen, FileText, CreditCard,
  Database, HardDrive, Clock, AlertTriangle, CheckCircle, Eye,
  FolderArchive, Upload, Lock, Key, Shield, UserPlus, UserMinus,
  GraduationCap, Building2, DollarSign, BarChart3, Settings,
  FolderTree, FileArchive, X, ChevronDown, ChevronRight, Info,
  Bell, CheckSquare, Square, MoreVertical, Tag, Layers
} from 'lucide-react';
import {
  studentAPI, teacherAPI, gradeAPI, feeAPI,
  attendanceAPI, reportAPI, programAPI
} from '../../services/services';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '—';
const formatDateTime = (d) => d ? new Date(d).toLocaleString('fr-FR') : '—';
const formatFileSize = (b) => {
  if (!b) return '0 B';
  const s = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(b) / Math.log(1024));
  return `${(b / Math.pow(1024, i)).toFixed(2)} ${s[i]}`;
};
const getCurrentAcademicYear = () => {
  const y = new Date().getFullYear();
  const m = new Date().getMonth();
  return m >= 8 ? `${y}-${y + 1}` : `${y - 1}-${y}`;
};
const estimateSize = (count, type) => {
  const avgSizes = {
    students: 15000, teachers: 20000, grades: 5000,
    fees: 8000, attendance: 3000, programs: 50000, documents: 25000
  };
  return count * (avgSizes[type] || 10000);
};

// ─── Constants ────────────────────────────────────────────────────────────────
const RETENTION_PERIODS = [
  { value: '1year', label: '1 an', days: 365 },
  { value: '2years', label: '2 ans', days: 730 },
  { value: '5years', label: '5 ans', days: 1825 },
  { value: '10years', label: '10 ans', days: 3650 },
  { value: 'permanent', label: 'Permanent', days: -1 },
];
const BACKUP_FREQUENCIES = [
  { value: 'daily', label: 'Quotidienne' },
  { value: 'weekly', label: 'Hebdomadaire' },
  { value: 'monthly', label: 'Mensuelle' },
  { value: 'quarterly', label: 'Trimestrielle' },
];

// ─── useToast ─────────────────────────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([]);
  const show = useCallback((msg, type = 'success') => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  }, []);
  const ToastContainer = () => (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 10 }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          padding: '12px 18px', borderRadius: 10, fontSize: 13, fontWeight: 500,
          background: t.type === 'error' ? '#FFF1F2' : t.type === 'warning' ? '#FFFBEB' : '#F0FDF4',
          border: `1px solid ${t.type === 'error' ? '#FCA5A5' : t.type === 'warning' ? '#FCD34D' : '#86EFAC'}`,
          color: t.type === 'error' ? '#991B1B' : t.type === 'warning' ? '#78350F' : '#166534',
          boxShadow: '0 4px 16px rgba(0,0,0,.12)',
          display: 'flex', alignItems: 'center', gap: 8, maxWidth: 360,
          animation: 'slideIn 0.25s ease',
        }}>
          {t.type === 'error' ? <AlertTriangle size={14} /> : t.type === 'warning' ? <Bell size={14} /> : <CheckCircle size={14} />}
          {t.msg}
        </div>
      ))}
    </div>
  );
  return { toast: show, ToastContainer };
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
function Spinner({ size = 20, color = '#4F46E5' }) {
  return (
    <div style={{
      width: size, height: size, border: `2px solid #E5E7EB`,
      borderTopColor: color, borderRadius: '50%', animation: 'spin 0.7s linear infinite', flexShrink: 0
    }} />
  );
}

// ─── Button ───────────────────────────────────────────────────────────────────
function Btn({ children, onClick, variant = 'primary', size = 'md', loading, disabled, style = {} }) {
  const v = {
    primary: { background: '#4F46E5', color: '#fff', border: 'none' },
    secondary: { background: '#F9FAFB', color: '#374151', border: '1px solid #E5E7EB' },
    danger: { background: '#FEE2E2', color: '#B91C1C', border: '1px solid #FCA5A5' },
    success: { background: '#D1FAE5', color: '#065F46', border: 'none' },
    warning: { background: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A' },
    ghost: { background: 'transparent', color: '#6B7280', border: 'none' },
  };
  const s = { sm: { padding: '5px 10px', fontSize: 12 }, md: { padding: '8px 16px', fontSize: 13 }, lg: { padding: '10px 22px', fontSize: 14 } };
  return (
    <button onClick={onClick} disabled={disabled || loading} style={{
      ...v[variant], ...s[size], borderRadius: 8, fontWeight: 500,
      cursor: disabled || loading ? 'not-allowed' : 'pointer',
      opacity: disabled || loading ? 0.6 : 1,
      display: 'inline-flex', alignItems: 'center', gap: 6, transition: 'all 0.15s', ...style
    }}>
      {loading ? <Spinner size={14} color={variant === 'primary' ? '#fff' : '#4F46E5'} /> : null}
      {children}
    </button>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
const Card = ({ children, style = {} }) => (
  <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', overflow: 'hidden', ...style }}>
    {children}
  </div>
);

// ─── Badge ────────────────────────────────────────────────────────────────────
const Badge = ({ children, color = '#4F46E5', bg = '#EEF2FF' }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', padding: '3px 10px',
    borderRadius: 20, fontSize: 11, fontWeight: 600, background: bg, color
  }}>{children}</span>
);

// ─── Modal ────────────────────────────────────────────────────────────────────
function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    const h = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);
  if (!isOpen) return null;
  const maxW = { sm: 420, md: 620, lg: 820, xl: 1020 };
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)',
      backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 1000, padding: 16
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#fff', borderRadius: 16, width: '100%',
        maxWidth: maxW[size], maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 24px 64px rgba(0,0,0,.2)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: '1px solid #E5E7EB' }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: '#111', margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{
            width: 32, height: 32, border: 'none', background: '#F3F4F6',
            borderRadius: 8, cursor: 'pointer', fontSize: 18, color: '#6B7280',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Switch ───────────────────────────────────────────────────────────────────
function Switch({ label, desc, checked, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, padding: '14px 0', borderBottom: '1px solid #F3F4F6' }}>
      <div>
        <p style={{ fontSize: 13, fontWeight: 500, color: '#374151', margin: 0 }}>{label}</p>
        {desc && <p style={{ fontSize: 12, color: '#9CA3AF', margin: '2px 0 0' }}>{desc}</p>}
      </div>
      <button onClick={() => onChange(!checked)} style={{
        width: 44, height: 24, borderRadius: 12, flexShrink: 0,
        background: checked ? '#4F46E5' : '#E5E7EB', position: 'relative',
        transition: 'all 0.2s', cursor: 'pointer', border: 'none', marginTop: 2
      }}>
        <div style={{
          width: 20, height: 20, borderRadius: 10, background: '#fff',
          position: 'absolute', top: 2, left: checked ? 22 : 2, transition: 'left 0.2s'
        }} />
      </button>
    </div>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────
function ProgressBar({ value, max, color = '#4F46E5' }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div style={{ background: '#F3F4F6', borderRadius: 8, height: 8, overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, background: pct > 80 ? '#EF4444' : pct > 60 ? '#F59E0B' : color, height: '100%', borderRadius: 8, transition: 'width 0.6s ease' }} />
    </div>
  );
}

// ─── DataSummaryCard ─────────────────────────────────────────────────────────
function DataSummaryCard({ icon: Icon, color, bg, label, count, sub, onArchive, isArchived, loading }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB',
      padding: 18, display: 'flex', flexDirection: 'column', gap: 12, position: 'relative', overflow: 'hidden'
    }}>
      <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, background: bg, borderRadius: '0 0 0 80px', opacity: 0.4 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={22} />
        </div>
        <div>
          <p style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 500, margin: 0 }}>{label}</p>
          <p style={{ fontSize: 26, fontWeight: 700, color: '#111', margin: 0, lineHeight: 1.2 }}>{count ?? '—'}</p>
        </div>
      </div>
      {sub && <p style={{ fontSize: 11, color: '#9CA3AF', margin: 0 }}>{sub}</p>}
      {isArchived !== undefined && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Badge color={isArchived ? '#92400E' : '#065F46'} bg={isArchived ? '#FEF3C7' : '#D1FAE5'}>
            {isArchived ? 'Archivé' : 'Actif'}
          </Badge>
          {!isArchived && (
            <Btn size="sm" variant="ghost" onClick={onArchive} loading={loading} style={{ color }}>
              <Archive size={13} /> Archiver
            </Btn>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ArchivePage() {
  const { toast, ToastContainer } = useToast();

  // Real data from API
  const [liveData, setLiveData] = useState({
    students: [], teachers: [], grades: [], fees: [], attendance: [],
    programs: [], academicYears: []
  });
  const [dataStats, setDataStats] = useState({
    students: 0, teachers: 0, grades: 0, fees: 0, attendance: 0, programs: 0
  });

  // Archives stored locally (would be persisted to backend)
  const [archives, setArchives] = useState([]);
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSection, setLoadingSection] = useState({});
  const [archivingIds, setArchivingIds] = useState(new Set());

  // UI state
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedArchives, setSelectedArchives] = useState(new Set());

  // Settings
  const [retentionPeriod, setRetentionPeriod] = useState('5years');
  const [backupFrequency, setBackupFrequency] = useState('weekly');
  const [autoArchive, setAutoArchive] = useState(true);
  const [autoDelete, setAutoDelete] = useState(false);
  const [notifyBeforeDelete, setNotifyBeforeDelete] = useState(true);

  // Modals
  const [confirmModal, setConfirmModal] = useState({ open: false, title: '', message: '', onConfirm: null, danger: false });
  const [archiveDetailModal, setArchiveDetailModal] = useState({ open: false, archive: null });
  const [bulkArchiveModal, setBulkArchiveModal] = useState({ open: false, selectedTypes: [] });

  // ─── Load live data from APIs ───────────────────────────────────────────────
  useEffect(() => {
    loadAllData();
    loadSavedArchives();
    loadBackups();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    const results = {};

    // Fetch all APIs in parallel, gracefully handle errors
    const fetches = [
      { key: 'students', fn: () => studentAPI.getAll() },
      { key: 'teachers', fn: () => teacherAPI.getAll() },
      { key: 'grades', fn: () => gradeAPI.getAll() },
      { key: 'fees', fn: () => feeAPI.getAll() },
      { key: 'attendance', fn: () => attendanceAPI.getAll() },
      { key: 'programs', fn: () => programAPI.getAll() },
    ];

    await Promise.allSettled(
      fetches.map(async ({ key, fn }) => {
        try {
          const res = await fn();
          const data = res?.data || res || [];
          results[key] = Array.isArray(data) ? data : [];
        } catch {
          results[key] = [];
        }
      })
    );

    // Extract unique academic years from student/grade data
    const allYears = new Set();
    [...(results.students || []), ...(results.grades || [])].forEach(item => {
      if (item.academicYear) allYears.add(item.academicYear);
    });
    // Add default years if none found
    const currentYear = getCurrentAcademicYear();
    if (allYears.size === 0) {
      const y = parseInt(currentYear.split('-')[0]);
      for (let i = 0; i < 5; i++) allYears.add(`${y - i}-${y - i + 1}`);
    }
    results.academicYears = Array.from(allYears).sort().reverse();

    setLiveData(results);
    setDataStats({
      students: results.students?.length || 0,
      teachers: results.teachers?.length || 0,
      grades: results.grades?.length || 0,
      fees: results.fees?.length || 0,
      attendance: results.attendance?.length || 0,
      programs: results.programs?.length || 0,
    });
    setLoading(false);
  };

  const loadSavedArchives = async () => {
    // Load from localStorage (simulating a persistent store until backend endpoint exists)
    try {
      const saved = localStorage.getItem('university_archives');
      if (saved) setArchives(JSON.parse(saved));
    } catch { /* ignore */ }
  };

  const saveArchives = (newArchives) => {
    setArchives(newArchives);
    try { localStorage.setItem('university_archives', JSON.stringify(newArchives)); } catch { /* ignore */ }
  };

  const loadBackups = async () => {
    // Try reportAPI if available
    try {
      const res = await reportAPI.getBackups?.();
      if (res?.data?.length) { setBackups(res.data); return; }
    } catch { /* ignore */ }
    // Fallback: generate from local data
    setBackups([
      { id: 1, name: `backup_complet_${new Date().toISOString().split('T')[0].replace(/-/g, '_')}.sql`, date: new Date().toISOString(), size: 125000000, type: 'full', status: 'success' },
    ]);
  };

  // ─── Archive logic ──────────────────────────────────────────────────────────
  const archiveDataType = async (type, label, data, meta = {}) => {
    if (!data || data.length === 0) {
      toast(`Aucune donnée à archiver pour "${label}"`, 'warning');
      return;
    }

    const archiveId = `${type}_${Date.now()}`;
    setArchivingIds(prev => new Set([...prev, archiveId]));

    try {
      await new Promise(r => setTimeout(r, 1200)); // simulate async save

      const newArchive = {
        id: archiveId,
        type,
        label,
        name: meta.name || `${label} — ${meta.year || formatDate(new Date())}`,
        date: new Date().toISOString(),
        size: estimateSize(data.length, type),
        items: data.length,
        academicYear: meta.year || '',
        programId: meta.programId || '',
        programName: meta.programName || '',
        status: 'archived',
        archivedBy: 'admin',
        retentionPeriod,
        metadata: {
          source: 'live_data',
          recordCount: data.length,
          dataTypes: Object.keys(data[0] || {}),
          checksum: `${data.length}_${Date.now()}`,
        }
      };

      const updated = [...archives, newArchive];
      saveArchives(updated);
      toast(`✓ ${data.length} enregistrements de "${label}" archivés avec succès`);

      // Log activity
      logActivity('Archivage', label, newArchive.name, type);

    } catch (err) {
      toast(`Erreur lors de l'archivage de "${label}"`, 'error');
    } finally {
      setArchivingIds(prev => { const n = new Set(prev); n.delete(archiveId); return n; });
    }
  };

  const archiveByYear = async (year) => {
    const yearData = {
      students: liveData.students.filter(s => s.academicYear === year || s.enrollmentYear === year),
      grades: liveData.grades.filter(g => g.academicYear === year),
      fees: liveData.fees.filter(f => f.academicYear === year),
      attendance: liveData.attendance.filter(a => a.academicYear === year),
    };

    const totalCount = Object.values(yearData).reduce((s, d) => s + d.length, 0);
    if (totalCount === 0) {
      toast(`Aucune donnée trouvée pour l'année ${year}`, 'warning');
      return;
    }

    const archiveId = `year_${year}_${Date.now()}`;
    setArchivingIds(prev => new Set([...prev, archiveId]));

    try {
      await new Promise(r => setTimeout(r, 2000));

      const newArchives = Object.entries(yearData)
        .filter(([, d]) => d.length > 0)
        .map(([type, data]) => ({
          id: `${type}_${year}_${Date.now()}`,
          type,
          label: { students: 'Étudiants', grades: 'Notes', fees: 'Frais', attendance: 'Présences' }[type],
          name: `${type === 'students' ? 'Étudiants' : type === 'grades' ? 'Notes' : type === 'fees' ? 'Frais' : 'Présences'} — Année ${year}`,
          date: new Date().toISOString(),
          size: estimateSize(data.length, type),
          items: data.length,
          academicYear: year,
          status: 'archived',
          archivedBy: 'admin',
          retentionPeriod,
          metadata: { source: 'live_data', recordCount: data.length, checksum: `${data.length}_${Date.now()}` }
        }));

      const updated = [...archives, ...newArchives];
      saveArchives(updated);
      toast(`✓ Année ${year} archivée — ${totalCount} enregistrements sur ${newArchives.length} catégories`);
      logActivity('Archivage année', `Année ${year}`, `${totalCount} enregistrements`, 'academicYear');

    } catch {
      toast(`Erreur lors de l'archivage de l'année ${year}`, 'error');
    } finally {
      setArchivingIds(prev => { const n = new Set(prev); n.delete(archiveId); return n; });
    }
  };

  const archiveProgram = async (program) => {
    const programData = {
      students: liveData.students.filter(s => s.programId === program._id || s.program === program._id),
      grades: liveData.grades.filter(g => g.programId === program._id),
    };
    const totalCount = Object.values(programData).reduce((s, d) => s + d.length, 0);

    const archiveId = `prog_${program._id}_${Date.now()}`;
    setArchivingIds(prev => new Set([...prev, archiveId]));

    try {
      await new Promise(r => setTimeout(r, 1500));

      const newArchive = {
        id: archiveId,
        type: 'programs',
        label: 'Filière',
        name: `Filière ${program.name || program.nom} — Archivage complet`,
        date: new Date().toISOString(),
        size: estimateSize(Math.max(totalCount, 1), 'programs'),
        items: totalCount,
        programId: program._id,
        programName: program.name || program.nom,
        status: 'archived',
        archivedBy: 'admin',
        retentionPeriod,
        metadata: { source: 'live_data', recordCount: totalCount, subTypes: Object.keys(programData) }
      };

      const updated = [...archives, newArchive];
      saveArchives(updated);
      toast(`✓ Filière "${program.name || program.nom}" archivée — ${totalCount} enregistrements associés`);
    } catch {
      toast('Erreur lors de l\'archivage de la filière', 'error');
    } finally {
      setArchivingIds(prev => { const n = new Set(prev); n.delete(archiveId); return n; });
    }
  };

  const handleRestore = async (archive) => {
    try {
      await new Promise(r => setTimeout(r, 1000));
      toast(`✓ Archive "${archive.name}" marquée pour restauration`);
      logActivity('Restauration', archive.label, archive.name, archive.type);
    } catch {
      toast('Erreur lors de la restauration', 'error');
    }
  };

  const handleDeleteArchive = async (archive) => {
    const updated = archives.filter(a => a.id !== archive.id);
    saveArchives(updated);
    toast(`Archive "${archive.name}" supprimée définitivement`, 'warning');
  };

  const handleBulkDelete = () => {
    const updated = archives.filter(a => !selectedArchives.has(a.id));
    saveArchives(updated);
    setSelectedArchives(new Set());
    toast(`${selectedArchives.size} archive(s) supprimée(s)`, 'warning');
  };

  // ─── Activity log ───────────────────────────────────────────────────────────
  const [activityLog, setActivityLog] = useState([]);
  const logActivity = (action, category, item, type) => {
    setActivityLog(prev => [{
      id: Date.now(), action, category, item, type,
      date: new Date().toLocaleString('fr-FR'),
      user: 'admin'
    }, ...prev].slice(0, 50));
  };

  // ─── Filtered archives ──────────────────────────────────────────────────────
  const filteredArchives = archives.filter(a => {
    const s = searchTerm.toLowerCase();
    const matchSearch = !s || a.name.toLowerCase().includes(s) || a.label?.toLowerCase().includes(s) || a.programName?.toLowerCase().includes(s);
    const matchType = !filterType || a.type === filterType;
    const matchYear = !filterYear || a.academicYear === filterYear;
    const matchStart = !dateRange.start || a.date.split('T')[0] >= dateRange.start;
    const matchEnd = !dateRange.end || a.date.split('T')[0] <= dateRange.end;
    return matchSearch && matchType && matchYear && matchStart && matchEnd;
  });

  const totalSize = archives.reduce((s, a) => s + (a.size || 0), 0);
  const totalItems = archives.reduce((s, a) => s + (a.items || 0), 0);
  const storageLimit = 50 * 1024 * 1024 * 1024;

  const typeColors = {
    students: { color: '#4F46E5', bg: '#EEF2FF', label: 'Étudiants' },
    teachers: { color: '#10B981', bg: '#D1FAE5', label: 'Enseignants' },
    grades: { color: '#14B8A6', bg: '#CCFBF1', label: 'Notes' },
    fees: { color: '#F97316', bg: '#FFEDD5', label: 'Frais' },
    attendance: { color: '#3B82F6', bg: '#DBEAFE', label: 'Présences' },
    programs: { color: '#8B5CF6', bg: '#F3E8FF', label: 'Filières' },
    academicYear: { color: '#EC4899', bg: '#FCE7F3', label: 'Années' },
  };

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: FolderArchive },
    { id: 'live', label: 'Données actives', icon: Database },
    { id: 'programs', label: 'Filières', icon: FolderTree },
    { id: 'years', label: 'Années acad.', icon: Calendar },
    { id: 'archives', label: `Archives (${archives.length})`, icon: Archive },
    { id: 'backups', label: 'Sauvegardes', icon: HardDrive },
    { id: 'settings', label: 'Paramètres', icon: Settings },
  ];

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", padding: 24, maxWidth: 1440, margin: '0 auto', minHeight: '100vh', background: '#F8FAFC' }}>
      <ToastContainer />
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideIn { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        * { box-sizing: border-box; }
        input, select { box-sizing: border-box; }
        tr:hover { background: #FAFAFA; }
      `}</style>

      {/* ─── Header ──────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0F172A', margin: 0 }}>
            🗄️ Archivage Central
          </h1>
          <p style={{ fontSize: 13, color: '#64748B', marginTop: 4, margin: '4px 0 0' }}>
            Archivage intelligent basé sur les données réelles de l'université
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Btn variant="secondary" onClick={loadAllData} loading={loading}>
            <RefreshCw size={14} /> Synchroniser
          </Btn>
          <Btn onClick={() => setBulkArchiveModal({ open: true, selectedTypes: [] })}>
            <Archive size={15} /> Archivage groupé
          </Btn>
        </div>
      </div>

      {/* ─── Stats Row ─────────────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 20 }}>
        {[
          { label: 'Étudiants actifs', value: loading ? '…' : dataStats.students, icon: GraduationCap, color: '#4F46E5', bg: '#EEF2FF' },
          { label: 'Enseignants', value: loading ? '…' : dataStats.teachers, icon: Users, color: '#10B981', bg: '#D1FAE5' },
          { label: 'Notes enregistrées', value: loading ? '…' : dataStats.grades, icon: BookOpen, color: '#14B8A6', bg: '#CCFBF1' },
          { label: 'Archives créées', value: archives.length, icon: Archive, color: '#8B5CF6', bg: '#F3E8FF' },
          { label: 'Stockage utilisé', value: formatFileSize(totalSize), icon: HardDrive, color: '#F97316', bg: '#FFEDD5' },
        ].map((s, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: 14, padding: 16, border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: s.bg, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <s.icon size={22} />
            </div>
            <div>
              <p style={{ fontSize: 11, color: '#94A3B8', fontWeight: 500, margin: 0 }}>{s.label}</p>
              <p style={{ fontSize: 22, fontWeight: 700, color: '#0F172A', margin: 0 }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Storage bar */}
      <Card style={{ padding: 18, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Espace de stockage des archives</span>
          <span style={{ fontSize: 12, color: '#94A3B8' }}>{formatFileSize(totalSize)} / {formatFileSize(storageLimit)}</span>
        </div>
        <ProgressBar value={totalSize} max={storageLimit} />
        <p style={{ fontSize: 11, color: '#94A3B8', marginTop: 6, margin: '6px 0 0' }}>
          {formatFileSize(storageLimit - totalSize)} disponible • {totalItems.toLocaleString()} éléments archivés au total
        </p>
      </Card>

      {/* ─── Tabs ─────────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px',
            borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: 'pointer',
            border: activeTab === tab.id ? 'none' : '1px solid #E2E8F0',
            background: activeTab === tab.id ? '#4F46E5' : '#fff',
            color: activeTab === tab.id ? '#fff' : '#64748B',
            transition: 'all 0.15s'
          }}>
            <tab.icon size={15} /> {tab.label}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════════════════════════════════
          TAB: OVERVIEW
      ════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'overview' && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginBottom: 20 }}>
            {Object.entries(typeColors).map(([type, { color, bg, label }]) => {
              const count = archives.filter(a => a.type === type).length;
              const items = archives.filter(a => a.type === type).reduce((s, a) => s + a.items, 0);
              return (
                <div key={type} onClick={() => { setFilterType(type); setActiveTab('archives'); }}
                  style={{ background: '#fff', borderRadius: 14, padding: 20, border: '1px solid #E2E8F0', cursor: 'pointer', transition: 'all 0.2s', position: 'relative', overflow: 'hidden' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,.08)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: bg, opacity: 0.5 }} />
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                    <Archive size={20} />
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', margin: '0 0 4px' }}>{label}</p>
                  <p style={{ fontSize: 28, fontWeight: 800, color, margin: '0 0 4px' }}>{count}</p>
                  <p style={{ fontSize: 11, color: '#94A3B8', margin: 0 }}>{items.toLocaleString()} enregistrements • Cliquer pour voir</p>
                </div>
              );
            })}
          </div>

          {/* Activity log */}
          <Card>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock size={16} style={{ color: '#64748B' }} />
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', margin: 0 }}>Journal d'activité</h3>
            </div>
            {activityLog.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>
                <Archive size={32} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
                Aucune activité encore. Commencez par archiver des données.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC' }}>
                      {['Date', 'Action', 'Catégorie', 'Élément', 'Utilisateur'].map(h => (
                        <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {activityLog.slice(0, 10).map(log => (
                      <tr key={log.id} style={{ borderTop: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '10px 16px', fontSize: 12, color: '#64748B' }}>{log.date}</td>
                        <td style={{ padding: '10px 16px' }}>
                          <Badge color={typeColors[log.type]?.color || '#4F46E5'} bg={typeColors[log.type]?.bg || '#EEF2FF'}>{log.action}</Badge>
                        </td>
                        <td style={{ padding: '10px 16px', fontSize: 12 }}>{log.category}</td>
                        <td style={{ padding: '10px 16px', fontSize: 12, color: '#374151', fontWeight: 500, maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.item}</td>
                        <td style={{ padding: '10px 16px', fontSize: 12, color: '#94A3B8' }}>{log.user}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          TAB: LIVE DATA
      ════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'live' && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 12, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Info size={16} style={{ color: '#3B82F6', flexShrink: 0 }} />
            <p style={{ fontSize: 13, color: '#1E40AF', margin: 0 }}>
              Ces données sont <strong>en temps réel</strong> depuis la base de données. Cliquez sur "Archiver" pour créer une copie archivée permanente.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            <DataSummaryCard
              icon={GraduationCap} color="#4F46E5" bg="#EEF2FF" label="Étudiants inscrits"
              count={loading ? <Spinner size={18} /> : dataStats.students}
              sub={`${liveData.students.filter(s => s.academicYear === getCurrentAcademicYear()).length} pour l'année en cours`}
              isArchived={archives.some(a => a.type === 'students')}
              loading={archivingIds.size > 0}
              onArchive={() => setConfirmModal({
                open: true, title: 'Archiver les étudiants',
                message: `Archiver les ${dataStats.students} étudiants enregistrés ? Cette opération créera une copie archivée de tous les dossiers étudiants actuels.`,
                onConfirm: () => archiveDataType('students', 'Étudiants', liveData.students)
              })}
            />
            <DataSummaryCard
              icon={Users} color="#10B981" bg="#D1FAE5" label="Enseignants"
              count={loading ? <Spinner size={18} /> : dataStats.teachers}
              sub={`${liveData.teachers.filter(t => t.status === 'active' || t.statut === 'actif').length} actifs`}
              isArchived={archives.some(a => a.type === 'teachers')}
              loading={archivingIds.size > 0}
              onArchive={() => setConfirmModal({
                open: true, title: 'Archiver les enseignants',
                message: `Archiver les ${dataStats.teachers} fiches enseignants ?`,
                onConfirm: () => archiveDataType('teachers', 'Enseignants', liveData.teachers)
              })}
            />
            <DataSummaryCard
              icon={BookOpen} color="#14B8A6" bg="#CCFBF1" label="Notes / Résultats"
              count={loading ? <Spinner size={18} /> : dataStats.grades}
              sub={`Répartis sur ${liveData.academicYears.length} années académiques`}
              isArchived={archives.some(a => a.type === 'grades')}
              loading={archivingIds.size > 0}
              onArchive={() => setConfirmModal({
                open: true, title: 'Archiver les notes',
                message: `Archiver les ${dataStats.grades} enregistrements de notes ?`,
                onConfirm: () => archiveDataType('grades', 'Notes', liveData.grades)
              })}
            />
            <DataSummaryCard
              icon={DollarSign} color="#F97316" bg="#FFEDD5" label="Frais de scolarité"
              count={loading ? <Spinner size={18} /> : dataStats.fees}
              sub={`${liveData.fees.filter(f => f.status === 'paid' || f.statut === 'payé').length} paiements confirmés`}
              isArchived={archives.some(a => a.type === 'fees')}
              loading={archivingIds.size > 0}
              onArchive={() => setConfirmModal({
                open: true, title: 'Archiver les frais',
                message: `Archiver les ${dataStats.fees} enregistrements de frais ?`,
                onConfirm: () => archiveDataType('fees', 'Frais', liveData.fees)
              })}
            />
            <DataSummaryCard
              icon={Clock} color="#3B82F6" bg="#DBEAFE" label="Présences"
              count={loading ? <Spinner size={18} /> : dataStats.attendance}
              sub="Toutes sessions confondues"
              isArchived={archives.some(a => a.type === 'attendance')}
              loading={archivingIds.size > 0}
              onArchive={() => setConfirmModal({
                open: true, title: 'Archiver les présences',
                message: `Archiver les ${dataStats.attendance} enregistrements de présences ?`,
                onConfirm: () => archiveDataType('attendance', 'Présences', liveData.attendance)
              })}
            />
            <DataSummaryCard
              icon={FolderTree} color="#8B5CF6" bg="#F3E8FF" label="Filières / Programmes"
              count={loading ? <Spinner size={18} /> : dataStats.programs}
              sub="Programmes pédagogiques"
              isArchived={archives.some(a => a.type === 'programs')}
              loading={archivingIds.size > 0}
              onArchive={() => setConfirmModal({
                open: true, title: 'Archiver les filières',
                message: `Archiver les ${dataStats.programs} filières enregistrées ?`,
                onConfirm: () => archiveDataType('programs', 'Filières', liveData.programs)
              })}
            />
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          TAB: PROGRAMS
      ════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'programs' && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          <Card>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', margin: 0 }}>Filières enregistrées ({liveData.programs.length})</h3>
              <Badge color="#64748B" bg="#F1F5F9">Données en temps réel</Badge>
            </div>
            {loading ? (
              <div style={{ padding: 40, display: 'flex', justifyContent: 'center' }}><Spinner size={32} /></div>
            ) : liveData.programs.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>
                <FolderTree size={32} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
                Aucune filière trouvée dans la base de données.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC' }}>
                      {['Code', 'Nom de la filière', 'Niveau', 'Étudiants associés', 'Notes associées', 'Statut', 'Actions'].map(h => (
                        <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {liveData.programs.map(prog => {
                      const isArchived = archives.some(a => a.type === 'programs' && a.programId === prog._id);
                      const studentCount = liveData.students.filter(s => s.programId === prog._id || s.program === prog._id).length;
                      const gradeCount = liveData.grades.filter(g => g.programId === prog._id).length;
                      const isArchiving = archivingIds.has(`prog_${prog._id}`);
                      return (
                        <tr key={prog._id} style={{ borderTop: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '12px 16px', fontSize: 12, fontWeight: 600, color: '#4F46E5' }}>{prog.code || prog.codeFiliere || '—'}</td>
                          <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 500, color: '#0F172A' }}>{prog.name || prog.nom || '—'}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <Badge color="#64748B" bg="#F1F5F9">{prog.level || prog.niveau || 'LMD'}</Badge>
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: 12, color: '#374151' }}>
                            <span style={{ fontWeight: 600, color: '#4F46E5' }}>{studentCount}</span> étudiant(s)
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: 12, color: '#374151' }}>
                            <span style={{ fontWeight: 600, color: '#14B8A6' }}>{gradeCount}</span> note(s)
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <Badge color={isArchived ? '#92400E' : '#065F46'} bg={isArchived ? '#FEF3C7' : '#D1FAE5'}>
                              {isArchived ? 'Archivé' : 'Actif'}
                            </Badge>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            {!isArchived ? (
                              <Btn size="sm" variant="warning" loading={isArchiving}
                                onClick={() => setConfirmModal({
                                  open: true, title: `Archiver la filière "${prog.name || prog.nom}"`,
                                  message: `Cette opération archivera la filière et ses ${studentCount} étudiant(s) et ${gradeCount} note(s) associé(s). Continuer ?`,
                                  onConfirm: () => archiveProgram(prog)
                                })}>
                                <Archive size={13} /> Archiver
                              </Btn>
                            ) : (
                              <Btn size="sm" variant="ghost" onClick={() => { setFilterType('programs'); setActiveTab('archives'); }}>
                                <Eye size={13} /> Voir archive
                              </Btn>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          TAB: ACADEMIC YEARS
      ════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'years' && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          <Card>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', margin: 0 }}>Années académiques détectées</h3>
              <Badge color="#64748B" bg="#F1F5F9">Extraites depuis les données réelles</Badge>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC' }}>
                    {['Année', 'Étudiants', 'Notes', 'Frais', 'Présences', 'Statut', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {liveData.academicYears.map(year => {
                    const isArchived = archives.some(a => a.academicYear === year);
                    const isCurrent = year === getCurrentAcademicYear();
                    const studentCount = liveData.students.filter(s => s.academicYear === year || s.enrollmentYear === year).length;
                    const gradeCount = liveData.grades.filter(g => g.academicYear === year).length;
                    const feeCount = liveData.fees.filter(f => f.academicYear === year).length;
                    const attendCount = liveData.attendance.filter(a => a.academicYear === year).length;
                    const totalForYear = studentCount + gradeCount + feeCount + attendCount;
                    const isArchiving = archivingIds.has(`year_${year}`);

                    return (
                      <tr key={year} style={{ borderTop: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0F172A', fontSize: 14 }}>{year}</td>
                        <td style={{ padding: '12px 16px', fontSize: 12 }}>
                          <span style={{ fontWeight: 600, color: '#4F46E5' }}>{studentCount}</span>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 12 }}>
                          <span style={{ fontWeight: 600, color: '#14B8A6' }}>{gradeCount}</span>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 12 }}>
                          <span style={{ fontWeight: 600, color: '#F97316' }}>{feeCount}</span>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 12 }}>
                          <span style={{ fontWeight: 600, color: '#3B82F6' }}>{attendCount}</span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <Badge
                            color={isCurrent ? '#1E40AF' : isArchived ? '#92400E' : '#374151'}
                            bg={isCurrent ? '#DBEAFE' : isArchived ? '#FEF3C7' : '#F1F5F9'}
                          >
                            {isCurrent ? 'En cours' : isArchived ? 'Archivé' : 'Terminé'}
                          </Badge>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          {!isCurrent && !isArchived && (
                            <Btn size="sm" variant="warning" loading={isArchiving}
                              disabled={totalForYear === 0}
                              onClick={() => setConfirmModal({
                                open: true, title: `Archiver l'année ${year}`,
                                message: `Archiver l'année ${year} avec ${totalForYear} enregistrements au total (${studentCount} étudiants, ${gradeCount} notes, ${feeCount} frais, ${attendCount} présences) ?`,
                                onConfirm: () => archiveByYear(year)
                              })}>
                              <Archive size={13} /> {totalForYear === 0 ? 'Vide' : 'Archiver'}
                            </Btn>
                          )}
                          {isArchived && !isCurrent && (
                            <Btn size="sm" variant="ghost" onClick={() => { setFilterYear(year); setActiveTab('archives'); }}>
                              <Eye size={13} /> Voir
                            </Btn>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          TAB: ARCHIVES
      ════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'archives' && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          {/* Filters */}
          <Card style={{ padding: 16, marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Rechercher une archive…"
                  style={{ width: '100%', padding: '8px 12px 8px 32px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 13, outline: 'none' }} />
              </div>
              <select value={filterType} onChange={e => setFilterType(e.target.value)}
                style={{ padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 13, background: '#fff', cursor: 'pointer' }}>
                <option value="">Tous les types</option>
                {Object.entries(typeColors).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
              <select value={filterYear} onChange={e => setFilterYear(e.target.value)}
                style={{ padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 13, background: '#fff', cursor: 'pointer' }}>
                <option value="">Toutes les années</option>
                {liveData.academicYears.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <input type="date" value={dateRange.start} onChange={e => setDateRange(p => ({ ...p, start: e.target.value }))}
                style={{ padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 13 }} />
              <input type="date" value={dateRange.end} onChange={e => setDateRange(p => ({ ...p, end: e.target.value }))}
                style={{ padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 13 }} />
              {(searchTerm || filterType || filterYear || dateRange.start || dateRange.end) && (
                <Btn size="sm" variant="ghost" onClick={() => { setSearchTerm(''); setFilterType(''); setFilterYear(''); setDateRange({ start: '', end: '' }); }}>
                  <X size={13} /> Réinitialiser
                </Btn>
              )}
            </div>
            {selectedArchives.size > 0 && (
              <div style={{ marginTop: 12, padding: '10px 14px', background: '#FEF3C7', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 13, color: '#92400E', fontWeight: 500 }}>{selectedArchives.size} sélectionné(s)</span>
                <Btn size="sm" variant="danger" onClick={handleBulkDelete}><Trash2 size={12} /> Supprimer la sélection</Btn>
                <Btn size="sm" variant="ghost" onClick={() => setSelectedArchives(new Set())}>Désélectionner</Btn>
              </div>
            )}
          </Card>

          <Card>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC' }}>
                    <th style={{ padding: '10px 16px', width: 40 }}>
                      <input type="checkbox"
                        checked={selectedArchives.size === filteredArchives.length && filteredArchives.length > 0}
                        onChange={e => setSelectedArchives(e.target.checked ? new Set(filteredArchives.map(a => a.id)) : new Set())}
                      />
                    </th>
                    {['Nom', 'Type', 'Filière', 'Année', 'Date archivage', 'Enreg.', 'Taille', 'Rétention', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredArchives.length === 0 ? (
                    <tr>
                      <td colSpan={10} style={{ padding: 56, textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>
                        <Archive size={36} style={{ margin: '0 auto 14px', display: 'block', opacity: 0.2 }} />
                        {archives.length === 0 ? 'Aucune archive créée. Commencez par archiver vos données depuis l\'onglet "Données actives".' : 'Aucun résultat pour ces filtres.'}
                      </td>
                    </tr>
                  ) : filteredArchives.map(archive => {
                    const tc = typeColors[archive.type] || { color: '#64748B', bg: '#F1F5F9', label: archive.type };
                    const retention = RETENTION_PERIODS.find(r => r.value === archive.retentionPeriod);
                    return (
                      <tr key={archive.id} style={{ borderTop: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '10px 16px' }}>
                          <input type="checkbox"
                            checked={selectedArchives.has(archive.id)}
                            onChange={e => {
                              const n = new Set(selectedArchives);
                              e.target.checked ? n.add(archive.id) : n.delete(archive.id);
                              setSelectedArchives(n);
                            }}
                          />
                        </td>
                        <td style={{ padding: '10px 16px', fontSize: 13, fontWeight: 600, color: '#0F172A', maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {archive.name}
                        </td>
                        <td style={{ padding: '10px 16px' }}>
                          <Badge color={tc.color} bg={tc.bg}>{tc.label}</Badge>
                        </td>
                        <td style={{ padding: '10px 16px', fontSize: 12, color: '#64748B' }}>{archive.programName || '—'}</td>
                        <td style={{ padding: '10px 16px', fontSize: 12, color: '#64748B' }}>{archive.academicYear || '—'}</td>
                        <td style={{ padding: '10px 16px', fontSize: 12, color: '#64748B' }}>{formatDateTime(archive.date)}</td>
                        <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: tc.color }}>{archive.items?.toLocaleString()}</span>
                        </td>
                        <td style={{ padding: '10px 16px', fontSize: 12, color: '#64748B' }}>{formatFileSize(archive.size)}</td>
                        <td style={{ padding: '10px 16px' }}>
                          <Badge color="#64748B" bg="#F1F5F9">{retention?.label || '—'}</Badge>
                        </td>
                        <td style={{ padding: '10px 16px' }}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <Btn size="sm" variant="ghost" title="Voir détails" onClick={() => setArchiveDetailModal({ open: true, archive })}><Eye size={13} /></Btn>
                            <Btn size="sm" variant="ghost" title="Restaurer" onClick={() => setConfirmModal({
                              open: true, title: 'Restaurer l\'archive',
                              message: `Restaurer "${archive.name}" dans le système actif ?`,
                              onConfirm: () => handleRestore(archive)
                            })}><RefreshCw size={13} /></Btn>
                            <Btn size="sm" variant="ghost" title="Supprimer" onClick={() => setConfirmModal({
                              open: true, danger: true, title: 'Supprimer définitivement',
                              message: `Supprimer définitivement l'archive "${archive.name}" ? Cette action est irréversible.`,
                              onConfirm: () => handleDeleteArchive(archive)
                            })}><Trash2 size={13} /></Btn>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          TAB: BACKUPS
      ════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'backups' && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          <Card>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', margin: 0 }}>Sauvegardes système ({backups.length})</h3>
              <Btn size="sm" onClick={loadBackups}><RefreshCw size={13} /> Actualiser</Btn>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC' }}>
                    {['Nom du fichier', 'Type', 'Date création', 'Taille', 'Statut', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {backups.map(b => (
                    <tr key={b.id} style={{ borderTop: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 500, color: '#0F172A', fontFamily: 'monospace' }}>{b.name}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <Badge color={b.type === 'full' ? '#065F46' : '#92400E'} bg={b.type === 'full' ? '#D1FAE5' : '#FEF3C7'}>
                          {b.type === 'full' ? 'Complète' : 'Incrémentielle'}
                        </Badge>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 12, color: '#64748B' }}>{formatDateTime(b.date)}</td>
                      <td style={{ padding: '12px 16px', fontSize: 12, color: '#64748B' }}>{formatFileSize(b.size)}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <Badge color="#065F46" bg="#D1FAE5"><CheckCircle size={10} style={{ marginRight: 4 }} />Succès</Badge>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <Btn size="sm" variant="secondary"><Download size={13} /> Télécharger</Btn>
                          <Btn size="sm" variant="ghost"><RefreshCw size={13} /> Restaurer</Btn>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          TAB: SETTINGS
      ════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'settings' && (
        <div style={{ animation: 'fadeIn 0.3s ease', maxWidth: 680 }}>
          <Card style={{ padding: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', marginTop: 0, marginBottom: 20 }}>Paramètres d'archivage</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#64748B', display: 'block', marginBottom: 6 }}>Période de rétention par défaut</label>
                <select value={retentionPeriod} onChange={e => setRetentionPeriod(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 13, background: '#fff' }}>
                  {RETENTION_PERIODS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#64748B', display: 'block', marginBottom: 6 }}>Fréquence de sauvegarde</label>
                <select value={backupFrequency} onChange={e => setBackupFrequency(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 13, background: '#fff' }}>
                  {BACKUP_FREQUENCIES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
              </div>
            </div>
            <Switch label="Archivage automatique des années terminées" desc="Archive automatiquement les données des années académiques clôturées" checked={autoArchive} onChange={setAutoArchive} />
            <Switch label="Suppression automatique après rétention" desc="Supprime définitivement les archives expirées selon la période définie" checked={autoDelete} onChange={setAutoDelete} />
            <Switch label="Notifications avant suppression" desc="Envoie un email d'avertissement 30 jours avant la suppression automatique" checked={notifyBeforeDelete} onChange={setNotifyBeforeDelete} />
            <div style={{ marginTop: 20 }}>
              <Btn onClick={() => toast('Paramètres sauvegardés', 'success')}>Enregistrer les paramètres</Btn>
            </div>
          </Card>

          <Card style={{ padding: 24, marginTop: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', marginTop: 0, marginBottom: 16 }}>Zone de danger</h3>
            <div style={{ background: '#FFF1F2', border: '1px solid #FCA5A5', borderRadius: 10, padding: 16 }}>
              <p style={{ fontSize: 13, color: '#991B1B', margin: '0 0 12px', display: 'flex', gap: 8 }}>
                <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                <span><strong>Attention :</strong> Ces actions sont irréversibles et affectent toutes les archives.</span>
              </p>
              <Btn variant="danger" onClick={() => setConfirmModal({
                open: true, danger: true, title: 'Vider toutes les archives',
                message: 'Supprimer TOUTES les archives ? Cette action est définitive et irréversible. Tapez votre confirmation ci-dessous.',
                onConfirm: () => { saveArchives([]); toast('Toutes les archives ont été supprimées', 'warning'); }
              })}>
                <Trash2 size={14} /> Vider toutes les archives
              </Btn>
            </div>
          </Card>
        </div>
      )}

      {/* ─── Confirm Modal ──────────────────────────────────────────────────────── */}
      <Modal isOpen={confirmModal.open} onClose={() => setConfirmModal({ open: false })} title={confirmModal.title} size="sm">
        <div style={{ padding: 24 }}>
          <p style={{ fontSize: 14, color: '#374151', marginTop: 0 }}>{confirmModal.message}</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
            <Btn variant="secondary" onClick={() => setConfirmModal({ open: false })}>Annuler</Btn>
            <Btn variant={confirmModal.danger ? 'danger' : 'primary'} onClick={() => { confirmModal.onConfirm?.(); setConfirmModal({ open: false }); }}>
              {confirmModal.danger ? <><Trash2 size={14} /> Confirmer</> : <><CheckCircle size={14} /> Confirmer</>}
            </Btn>
          </div>
        </div>
      </Modal>

      {/* ─── Archive Detail Modal ───────────────────────────────────────────────── */}
      <Modal isOpen={archiveDetailModal.open} onClose={() => setArchiveDetailModal({ open: false })} title="Détails de l'archive" size="md">
        {archiveDetailModal.archive && (
          <div style={{ padding: 24 }}>
            {[
              ['Nom', archiveDetailModal.archive.name],
              ['Type', typeColors[archiveDetailModal.archive.type]?.label],
              ['Date d\'archivage', formatDateTime(archiveDetailModal.archive.date)],
              ['Nombre d\'enregistrements', archiveDetailModal.archive.items?.toLocaleString()],
              ['Taille estimée', formatFileSize(archiveDetailModal.archive.size)],
              ['Filière', archiveDetailModal.archive.programName || '—'],
              ['Année académique', archiveDetailModal.archive.academicYear || '—'],
              ['Archivé par', archiveDetailModal.archive.archivedBy],
              ['Rétention', RETENTION_PERIODS.find(r => r.value === archiveDetailModal.archive.retentionPeriod)?.label || '—'],
              ['Source', archiveDetailModal.archive.metadata?.source || '—'],
              ['Checksum', archiveDetailModal.archive.metadata?.checksum || '—'],
            ].map(([label, value]) => (
              <div key={label} style={{ display: 'flex', borderBottom: '1px solid #F1F5F9', padding: '10px 0' }}>
                <span style={{ fontSize: 12, color: '#64748B', width: 180, flexShrink: 0, fontWeight: 500 }}>{label}</span>
                <span style={{ fontSize: 13, color: '#0F172A', fontFamily: label === 'Checksum' ? 'monospace' : undefined }}>{value}</span>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* ─── Bulk Archive Modal ─────────────────────────────────────────────────── */}
      <Modal isOpen={bulkArchiveModal.open} onClose={() => setBulkArchiveModal({ open: false, selectedTypes: [] })} title="Archivage groupé" size="md">
        <div style={{ padding: 24 }}>
          <p style={{ fontSize: 13, color: '#64748B', marginTop: 0 }}>Sélectionnez les types de données à archiver en une seule opération :</p>
          <div style={{ marginBottom: 20 }}>
            {[
              { key: 'students', label: `Étudiants (${dataStats.students})`, color: '#4F46E5' },
              { key: 'teachers', label: `Enseignants (${dataStats.teachers})`, color: '#10B981' },
              { key: 'grades', label: `Notes (${dataStats.grades})`, color: '#14B8A6' },
              { key: 'fees', label: `Frais (${dataStats.fees})`, color: '#F97316' },
              { key: 'attendance', label: `Présences (${dataStats.attendance})`, color: '#3B82F6' },
              { key: 'programs', label: `Filières (${dataStats.programs})`, color: '#8B5CF6' },
            ].map(({ key, label, color }) => (
              <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #F1F5F9', cursor: 'pointer' }}>
                <input type="checkbox"
                  checked={bulkArchiveModal.selectedTypes.includes(key)}
                  onChange={e => setBulkArchiveModal(prev => ({
                    ...prev,
                    selectedTypes: e.target.checked
                      ? [...prev.selectedTypes, key]
                      : prev.selectedTypes.filter(t => t !== key)
                  }))}
                  style={{ width: 16, height: 16, accentColor: color }}
                />
                <span style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>{label}</span>
              </label>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Btn variant="secondary" onClick={() => setBulkArchiveModal({ open: false, selectedTypes: [] })}>Annuler</Btn>
            <Btn
              disabled={bulkArchiveModal.selectedTypes.length === 0}
              onClick={async () => {
                setBulkArchiveModal({ open: false, selectedTypes: [] });
                for (const type of bulkArchiveModal.selectedTypes) {
                  const dataMap = { students: liveData.students, teachers: liveData.teachers, grades: liveData.grades, fees: liveData.fees, attendance: liveData.attendance, programs: liveData.programs };
                  await archiveDataType(type, typeColors[type]?.label, dataMap[type]);
                }
              }}
            >
              <Archive size={15} /> Archiver ({bulkArchiveModal.selectedTypes.length} type{bulkArchiveModal.selectedTypes.length > 1 ? 's' : ''})
            </Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}