// pages/admin/InternshipsPage.jsx
import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Building2, Eye, Calendar, User, Phone, Mail, MapPin, Briefcase } from 'lucide-react';
import { internshipAPI } from '../../services/services';

// ─── Constants ────────────────────────────────────────────────────────────────
const STATUS_OPTS = [
  { value: '', label: 'Tous les statuts' },
  { value: 'candidature', label: 'Candidature' },
  { value: 'accepted', label: 'Accepté' },
  { value: 'ongoing', label: 'En cours' },
  { value: 'report_submitted', label: 'Rapport soumis' },
  { value: 'defended', label: 'Soutenu' },
  { value: 'validated', label: 'Validé' },
  { value: 'failed', label: 'Échoué' },
];

const STATUS_LABELS = {
  candidature: 'Candidature',
  accepted: 'Accepté',
  ongoing: 'En cours',
  report_submitted: 'Rapport soumis',
  defended: 'Soutenu',
  validated: 'Validé',
  failed: 'Échoué'
};

const getStatusColor = (status) => {
  const colors = {
    candidature: { background: '#FEF3C7', color: '#92400E' },
    accepted: { background: '#DBEAFE', color: '#1E40AF' },
    ongoing: { background: '#D1FAE5', color: '#065F46' },
    report_submitted: { background: '#F3E8FF', color: '#9333EA' },
    defended: { background: '#E0E7FF', color: '#3730A3' },
    validated: { background: '#D1FAE5', color: '#059669' },
    failed: { background: '#FEE2E2', color: '#991B1B' }
  };
  return colors[status] || colors.candidature;
};

const formatDate = (date) => {
  if (!date) return '—';
  const d = new Date(date);
  return d.toLocaleDateString('fr-FR');
};

const getCurrentAcademicYear = () => {
  const y = new Date().getFullYear();
  return `${y}-${y + 1}`;
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
      padding: '4px 10px',
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
    success: { background: '#D1FAE5', color: '#065F46', border: 'none' },
    warning: { background: '#FEF3C7', color: '#92400E', border: 'none' },
    ghost: { background: 'transparent', color: '#6B7280', border: 'none' },
  };
  
  const sizes = {
    sm: { padding: '4px 10px', fontSize: 12 },
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
function Input({ label, value, onChange, placeholder, type = 'text', required }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && (
        <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#6B7280', marginBottom: 6 }}>
          {label} {required && '*'}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        style={{
          width: '100%',
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
    </div>
  );
}

// ─── Select Component ─────────────────────────────────────────────────────────
function Select({ label, value, onChange, options, required, style }) {
  return (
    <div style={{ marginBottom: 16, ...style }}>
      {label && (
        <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#6B7280', marginBottom: 6 }}>
          {label} {required && '*'}
        </label>
      )}
      <select
        value={value}
        onChange={onChange}
        required={required}
        style={{
          width: '100%',
          padding: '8px 12px',
          border: '1px solid #E5E7EB',
          borderRadius: 8,
          fontSize: 13,
          background: '#fff',
          outline: 'none',
          cursor: 'pointer',
        }}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
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

// ─── ConfirmDialog Component ──────────────────────────────────────────────────
function ConfirmDialog({ isOpen, onClose, onConfirm, loading, title, message }) {
  if (!isOpen) return null;
  
  return (
    <div onClick={onClose} style={styles.modalOverlay}>
      <div onClick={e => e.stopPropagation()} style={{ ...styles.modalContent, maxWidth: 400 }}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>{title}</h2>
          <button onClick={onClose} style={styles.modalClose}>×</button>
        </div>
        <div style={{ padding: '20px' }}>
          <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 20 }}>{message}</p>
          <div style={{ display: 'flex', gap: 12 }}>
            <Button variant="secondary" onClick={onClose} style={{ flex: 1, justifyContent: 'center' }}>Annuler</Button>
            <Button variant="danger" onClick={onConfirm} loading={loading} style={{ flex: 1, justifyContent: 'center' }}>Supprimer</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── StatCard Component ───────────────────────────────────────────────────────
function StatCard({ title, value, icon, color }) {
  const colors = {
    indigo: { background: '#EEF2FF', color: '#4338CA' },
    green: { background: '#D1FAE5', color: '#065F46' },
    blue: { background: '#DBEAFE', color: '#1E40AF' },
    amber: { background: '#FEF3C7', color: '#92400E' },
    red: { background: '#FEE2E2', color: '#991B1B' },
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

// ─── Internship Form Component ────────────────────────────────────────────────
function InternshipForm({ internship, onSave, onCancel }) {
  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [form, setForm] = useState(internship || {
    title: '', student: '', company: '', startDate: '', endDate: '',
    description: '', status: 'candidature', academicYear: getCurrentAcademicYear(),
    companyTutor: { name: '', position: '', email: '', phone: '' },
  });
  const [loading, setLoading] = useState(false);
  const { toast, ToastContainer } = useToast();

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      const res = await internshipAPI.getCompanies({ limit: 200 });
      setCompanies(res.data?.data || res.data || []);
    } catch (error) {
      toast('Erreur chargement entreprises', 'error');
    } finally {
      setLoadingCompanies(false);
    }
  };

  const companyOptions = [
    { value: '', label: 'Sélectionner une entreprise' },
    ...companies.map(c => ({ value: c._id, label: c.name }))
  ];
  
  const statusOptions = STATUS_OPTS.filter(s => s.value);
  
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setTutor = (k, v) => setForm(f => ({ ...f, companyTutor: { ...f.companyTutor, [k]: v } }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.student || !form.company) {
      toast('Veuillez remplir tous les champs obligatoires', 'error');
      return;
    }
    setLoading(true);
    try {
      if (internship?._id) await internshipAPI.update(internship._id, form);
      else await internshipAPI.create(form);
      toast(internship ? 'Stage mis à jour' : 'Stage créé avec succès');
      onSave();
    } catch (err) {
      toast(err.message || 'Erreur lors de la sauvegarde', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
      <ToastContainer />
      
      <Input label="Titre du stage" value={form.title} onChange={e => set('title', e.target.value)} required />
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Input label="ID Étudiant" value={form.student} onChange={e => set('student', e.target.value)} required placeholder="ID MongoDB" />
        <Select label="Entreprise" value={form.company} onChange={e => set('company', e.target.value)} options={companyOptions} required />
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Input label="Date début" type="date" value={form.startDate?.substring(0, 10)} onChange={e => set('startDate', e.target.value)} required />
        <Input label="Date fin" type="date" value={form.endDate?.substring(0, 10)} onChange={e => set('endDate', e.target.value)} required />
      </div>
      
      <Select label="Statut" value={form.status} onChange={e => set('status', e.target.value)} options={statusOptions} />
      
      <Input label="Description" value={form.description} onChange={e => set('description', e.target.value)} placeholder="Description du stage" />
      
      <p style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 8 }}>Tuteur entreprise</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Input label="Nom" value={form.companyTutor.name} onChange={e => setTutor('name', e.target.value)} />
        <Input label="Poste" value={form.companyTutor.position} onChange={e => setTutor('position', e.target.value)} />
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Input label="Email" type="email" value={form.companyTutor.email} onChange={e => setTutor('email', e.target.value)} />
        <Input label="Téléphone" value={form.companyTutor.phone} onChange={e => setTutor('phone', e.target.value)} />
      </div>
      
      <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
        <Button variant="secondary" onClick={onCancel} style={{ flex: 1, justifyContent: 'center' }}>Annuler</Button>
        <Button type="submit" loading={loading} style={{ flex: 1, justifyContent: 'center' }}>
          {internship ? 'Mettre à jour' : 'Créer le stage'}
        </Button>
      </div>
    </form>
  );
}

// ─── Company Form Component ───────────────────────────────────────────────────
function CompanyForm({ company, onSave, onCancel }) {
  const [form, setForm] = useState(company || {
    name: '', sector: '', phone: '', email: '', website: '',
    address: { street: '', city: '', postalCode: '' },
    contact: { name: '', position: '', phone: '', email: '' },
  });
  const [loading, setLoading] = useState(false);
  const { toast, ToastContainer } = useToast();
  
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setAddr = (k, v) => setForm(f => ({ ...f, address: { ...f.address, [k]: v } }));
  const setContact = (k, v) => setForm(f => ({ ...f, contact: { ...f.contact, [k]: v } }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) {
      toast('Le nom de l\'entreprise est obligatoire', 'error');
      return;
    }
    setLoading(true);
    try {
      if (company?._id) await internshipAPI.updateCompany(company._id, form);
      else await internshipAPI.createCompany(form);
      toast(company ? 'Entreprise mise à jour' : 'Entreprise ajoutée avec succès');
      onSave();
    } catch (err) {
      toast(err.message || 'Erreur lors de la sauvegarde', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
      <ToastContainer />
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Input label="Nom de l'entreprise" value={form.name} onChange={e => set('name', e.target.value)} required />
        <Input label="Secteur d'activité" value={form.sector} onChange={e => set('sector', e.target.value)} />
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Input label="Téléphone" value={form.phone} onChange={e => set('phone', e.target.value)} />
        <Input label="Email" type="email" value={form.email} onChange={e => set('email', e.target.value)} />
      </div>
      
      <Input label="Site web" value={form.website} onChange={e => set('website', e.target.value)} placeholder="https://..." />
      
      <p style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 8 }}>Adresse</p>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 16 }}>
        <Input label="Rue" value={form.address.street} onChange={e => setAddr('street', e.target.value)} />
        <Input label="Ville" value={form.address.city} onChange={e => setAddr('city', e.target.value)} />
        <Input label="Code postal" value={form.address.postalCode} onChange={e => setAddr('postalCode', e.target.value)} />
      </div>
      
      <p style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 8 }}>Contact principal</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Input label="Nom" value={form.contact.name} onChange={e => setContact('name', e.target.value)} />
        <Input label="Poste" value={form.contact.position} onChange={e => setContact('position', e.target.value)} />
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Input label="Email" type="email" value={form.contact.email} onChange={e => setContact('email', e.target.value)} />
        <Input label="Téléphone" value={form.contact.phone} onChange={e => setContact('phone', e.target.value)} />
      </div>
      
      <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
        <Button variant="secondary" onClick={onCancel} style={{ flex: 1, justifyContent: 'center' }}>Annuler</Button>
        <Button type="submit" loading={loading} style={{ flex: 1, justifyContent: 'center' }}>
          {company ? 'Mettre à jour' : 'Ajouter l\'entreprise'}
        </Button>
      </div>
    </form>
  );
}

// ─── Main Internships Page ────────────────────────────────────────────────────
export default function InternshipsPage() {
  const { toast, ToastContainer } = useToast();
  
  const [tab, setTab] = useState('internships');
  const [internships, setInternships] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(20);
  const [statusFilter, setStatusFilter] = useState('');
  
  const [internModal, setInternModal] = useState({ open: false, item: null });
  const [companyModal, setCompanyModal] = useState({ open: false, item: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, item: null, type: null });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadInternships();
  }, [page, statusFilter]);

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadInternships = async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (statusFilter) params.status = statusFilter;
      const res = await internshipAPI.getAll(params);
      setInternships(res.data?.data || res.data || []);
      setTotal(res.data?.total || res.total || 0);
    } catch (error) {
      console.error('Erreur chargement stages:', error);
      toast('Erreur lors du chargement des stages', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadCompanies = async () => {
    try {
      const res = await internshipAPI.getCompanies({ limit: 200 });
      setCompanies(res.data?.data || res.data || []);
    } catch (error) {
      console.error('Erreur chargement entreprises:', error);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      if (deleteDialog.type === 'internship') {
        await internshipAPI.delete(deleteDialog.item._id);
        loadInternships();
        toast('Stage supprimé avec succès');
      } else {
        await internshipAPI.deleteCompany(deleteDialog.item._id);
        loadCompanies();
        toast('Entreprise supprimée avec succès');
      }
      setDeleteDialog({ open: false, item: null, type: null });
    } catch (err) {
      toast(err.message || 'Erreur lors de la suppression', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const ongoingCount = internships.filter(i => i.status === 'ongoing').length;
  const totalCompanies = companies.length;

  const internColumns = [
    {
      header: 'Stage',
      key: 'title',
      render: (v, row) => (
        <div>
          <div style={{ fontWeight: 500, color: '#111' }}>{v}</div>
          <div style={{ fontSize: 11, color: '#9CA3AF' }}>{row.company?.name}</div>
        </div>
      )
    },
    {
      header: 'Étudiant',
      key: 'student',
      render: (_, row) => `${row.student?.firstName || ''} ${row.student?.lastName || ''}` || row.studentId || '—'
    },
    { header: 'Début', key: 'startDate', render: v => formatDate(v) },
    { header: 'Fin', key: 'endDate', render: v => formatDate(v) },
    {
      header: 'Statut',
      key: 'status',
      render: v => {
        const colors = getStatusColor(v);
        return <Badge style={{ background: colors.background, color: colors.color }}>{STATUS_LABELS[v] || v}</Badge>;
      }
    },
    {
      header: 'Actions',
      key: '_id',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 4 }}>
          <Button size="sm" variant="ghost" onClick={() => setInternModal({ open: true, item: row })}>
            <Edit size={13} />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setDeleteDialog({ open: true, item: row, type: 'internship' })}>
            <Trash2 size={13} />
          </Button>
        </div>
      )
    },
  ];

  const companyColumns = [
    {
      header: 'Entreprise',
      key: 'name',
      render: (v, row) => (
        <div>
          <div style={{ fontWeight: 500, color: '#111' }}>{v}</div>
          <div style={{ fontSize: 11, color: '#9CA3AF' }}>{row.sector}</div>
        </div>
      )
    },
    { header: 'Email', key: 'email', render: v => v || '—' },
    { header: 'Téléphone', key: 'phone', render: v => v || '—' },
    { header: 'Ville', key: 'address', render: (_, row) => row.address?.city || '—' },
    {
      header: 'Total stages',
      key: 'totalInterns',
      render: v => <span style={{ fontWeight: 'bold', color: '#4F46E5' }}>{v || 0}</span>
    },
    {
      header: 'Actions',
      key: '_id',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 4 }}>
          <Button size="sm" variant="ghost" onClick={() => setCompanyModal({ open: true, item: row })}>
            <Edit size={13} />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setDeleteDialog({ open: true, item: row, type: 'company' })}>
            <Trash2 size={13} />
          </Button>
        </div>
      )
    },
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
          <h1 style={styles.title}>💼 Stages & Alternance</h1>
          <p style={styles.subtitle}>Gestion des stages étudiants</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Button variant="secondary" onClick={() => setCompanyModal({ open: true, item: null })}>
            <Building2 size={15} /> Ajouter entreprise
          </Button>
          <Button onClick={() => setInternModal({ open: true, item: null })}>
            <Plus size={16} /> Nouveau stage
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        <StatCard title="Stages total" value={total} icon={<Briefcase size={22} />} color="indigo" />
        <StatCard title="En cours" value={ongoingCount} icon={<Calendar size={22} />} color="green" />
        <StatCard title="Entreprises" value={totalCompanies} icon={<Building2 size={22} />} color="blue" />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, borderRadius: 12, overflow: 'hidden', border: '1px solid #E5E7EB', width: 'fit-content', marginBottom: 20, background: '#fff' }}>
        <button
          onClick={() => setTab('internships')}
          style={{
            padding: '10px 20px',
            fontSize: 13,
            fontWeight: 500,
            background: tab === 'internships' ? '#4F46E5' : '#fff',
            color: tab === 'internships' ? '#fff' : '#6B7280',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          Stages
        </button>
        <button
          onClick={() => setTab('companies')}
          style={{
            padding: '10px 20px',
            fontSize: 13,
            fontWeight: 500,
            background: tab === 'companies' ? '#4F46E5' : '#fff',
            color: tab === 'companies' ? '#fff' : '#6B7280',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          Entreprises
        </button>
      </div>

      {/* Internships Tab */}
      {tab === 'internships' && (
        <>
          <Card style={{ padding: 16, marginBottom: 20 }}>
            <Select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              options={STATUS_OPTS}
              style={{ width: 200, marginBottom: 0 }}
            />
          </Card>
          <Card>
            <Table columns={internColumns} data={internships} loading={loading} emptyText="Aucun stage trouvé" />
            <Pagination page={page} total={total} limit={limit} onPageChange={setPage} />
          </Card>
        </>
      )}

      {/* Companies Tab */}
      {tab === 'companies' && (
        <Card>
          <Table columns={companyColumns} data={companies} loading={false} emptyText="Aucune entreprise" />
        </Card>
      )}

      {/* Internship Modal */}
      <Modal isOpen={internModal.open} onClose={() => setInternModal({ open: false, item: null })} title={internModal.item ? 'Modifier le stage' : 'Nouveau stage'} size="lg">
        <InternshipForm
          internship={internModal.item}
          onSave={() => {
            setInternModal({ open: false, item: null });
            loadInternships();
          }}
          onCancel={() => setInternModal({ open: false, item: null })}
        />
      </Modal>

      {/* Company Modal */}
      <Modal isOpen={companyModal.open} onClose={() => setCompanyModal({ open: false, item: null })} title={companyModal.item ? 'Modifier l\'entreprise' : 'Ajouter une entreprise'} size="lg">
        <CompanyForm
          company={companyModal.item}
          onSave={() => {
            setCompanyModal({ open: false, item: null });
            loadCompanies();
          }}
          onCancel={() => setCompanyModal({ open: false, item: null })}
        />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, item: null, type: null })}
        onConfirm={handleDelete}
        loading={deleting}
        title="Confirmer la suppression"
        message={`Supprimer ${deleteDialog.type === 'internship' ? 'le stage' : 'l\'entreprise'} "${deleteDialog.item?.title || deleteDialog.item?.name}" ? Cette action est irréversible.`}
      />
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
  
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 16,
    marginBottom: 20,
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
















// // pages/admin/InternshipsPage.jsx (corrigé, complet)
// import { useState, useEffect, useCallback } from 'react';
// import { Plus, Edit, Trash2, Building2, Eye, Calendar, User, Briefcase, X } from 'lucide-react';
// import { internshipAPI } from '../../services/services';

// // (tous les composants UI locaux identiques à ceux que vous avez déjà – je ne les recopie pas pour gagner de la place, mais ils sont présents dans votre code)

// // ⚠️ Assurez-vous que les composants comme Card, Button, Modal, Table, Pagination, etc. sont définis dans le même fichier (vous les avez déjà dans votre code fourni). Je vais juste résumer la partie logique.

// export default function InternshipsPage() {
//   const { toast, ToastContainer } = useToast();
//   const [tab, setTab] = useState('internships');
//   const [internships, setInternships] = useState([]);
//   const [companies, setCompanies] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [page, setPage] = useState(1);
//   const [total, setTotal] = useState(0);
//   const [limit] = useState(20);
//   const [statusFilter, setStatusFilter] = useState('');
//   const [internModal, setInternModal] = useState({ open: false, item: null });
//   const [companyModal, setCompanyModal] = useState({ open: false, item: null });
//   const [deleteDialog, setDeleteDialog] = useState({ open: false, item: null, type: null });
//   const [deleting, setDeleting] = useState(false);

//   useEffect(() => { loadInternships(); }, [page, statusFilter]);
//   useEffect(() => { loadCompanies(); }, []);

//   const loadInternships = async () => {
//     setLoading(true);
//     try {
//       const params = { page, limit };
//       if (statusFilter) params.status = statusFilter;
//       const res = await internshipAPI.getAll(params);
//       setInternships(res.data?.data || res.data || []);
//       setTotal(res.data?.total || res.total || 0);
//     } catch (err) { toast('Erreur chargement stages', 'error'); }
//     finally { setLoading(false); }
//   };

//   const loadCompanies = async () => {
//     try {
//       const res = await internshipAPI.getCompanies({ limit: 200 });
//       setCompanies(res.data?.data || res.data || []);
//     } catch (err) { toast('Erreur chargement entreprises', 'error'); }
//   };

//   const handleDelete = async () => {
//     setDeleting(true);
//     try {
//       if (deleteDialog.type === 'internship') await internshipAPI.delete(deleteDialog.item._id);
//       else await internshipAPI.deleteCompany(deleteDialog.item._id);
//       if (deleteDialog.type === 'internship') loadInternships();
//       else loadCompanies();
//       toast('Suppression réussie');
//       setDeleteDialog({ open: false, item: null, type: null });
//     } catch (err) { toast(err.message, 'error'); }
//     finally { setDeleting(false); }
//   };

//   // Colonnes (identique à votre code)
//   // ... (les mêmes colonnes que vous avez déjà)

//   return (
//     <div style={styles.container}>
//       <ToastContainer />
//       {/* ... reste identique à votre code ... */}
//     </div>
//   );
// }














// // // pages/admin/InternshipsPage.jsx (corrigé, complet)
// // import { useState, useEffect, useCallback } from 'react';
// // import { Plus, Edit, Trash2, Building2, Eye, Calendar, User, Briefcase, X } from 'lucide-react';
// // import { internshipAPI } from '../../services/services';

// // // (tous les composants UI locaux identiques à ceux que vous avez déjà – je ne les recopie pas pour gagner de la place, mais ils sont présents dans votre code)

// // // ⚠️ Assurez-vous que les composants comme Card, Button, Modal, Table, Pagination, etc. sont définis dans le même fichier (vous les avez déjà dans votre code fourni). Je vais juste résumer la partie logique.

// // export default function InternshipsPage() {
// //   const { toast, ToastContainer } = useToast();
// //   const [tab, setTab] = useState('internships');
// //   const [internships, setInternships] = useState([]);
// //   const [companies, setCompanies] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [page, setPage] = useState(1);
// //   const [total, setTotal] = useState(0);
// //   const [limit] = useState(20);
// //   const [statusFilter, setStatusFilter] = useState('');
// //   const [internModal, setInternModal] = useState({ open: false, item: null });
// //   const [companyModal, setCompanyModal] = useState({ open: false, item: null });
// //   const [deleteDialog, setDeleteDialog] = useState({ open: false, item: null, type: null });
// //   const [deleting, setDeleting] = useState(false);

// //   useEffect(() => { loadInternships(); }, [page, statusFilter]);
// //   useEffect(() => { loadCompanies(); }, []);

// //   const loadInternships = async () => {
// //     setLoading(true);
// //     try {
// //       const params = { page, limit };
// //       if (statusFilter) params.status = statusFilter;
// //       const res = await internshipAPI.getAll(params);
// //       setInternships(res.data?.data || res.data || []);
// //       setTotal(res.data?.total || res.total || 0);
// //     } catch (err) { toast('Erreur chargement stages', 'error'); }
// //     finally { setLoading(false); }
// //   };

// //   const loadCompanies = async () => {
// //     try {
// //       const res = await internshipAPI.getCompanies({ limit: 200 });
// //       setCompanies(res.data?.data || res.data || []);
// //     } catch (err) { toast('Erreur chargement entreprises', 'error'); }
// //   };

// //   const handleDelete = async () => {
// //     setDeleting(true);
// //     try {
// //       if (deleteDialog.type === 'internship') await internshipAPI.delete(deleteDialog.item._id);
// //       else await internshipAPI.deleteCompany(deleteDialog.item._id);
// //       if (deleteDialog.type === 'internship') loadInternships();
// //       else loadCompanies();
// //       toast('Suppression réussie');
// //       setDeleteDialog({ open: false, item: null, type: null });
// //     } catch (err) { toast(err.message, 'error'); }
// //     finally { setDeleting(false); }
// //   };

// //   // Colonnes (identique à votre code)
// //   // ... (les mêmes colonnes que vous avez déjà)

// //   return (
// //     <div style={styles.container}>
// //       <ToastContainer />
// //       {/* ... reste identique à votre code ... */}
// //     </div>
// //   );
// // }