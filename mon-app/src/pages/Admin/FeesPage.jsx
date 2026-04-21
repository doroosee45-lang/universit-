


// pages/admin/FeesPage.jsx
import { useState, useEffect, useCallback } from 'react';
import {
  Plus, DollarSign, RefreshCw, Users, Mail,
  X, AlertCircle, CheckCircle, Clock,
  Ban, RotateCcw, Trash2, Receipt, Search,
  TrendingUp, Wallet, ChevronDown, ChevronUp,
} from 'lucide-react';
import { feeAPI, programAPI } from '../../services/services';

// ─── Constants ────────────────────────────────────────────────────────────────
const ACADEMIC_YEAR = () => {
  const y = new Date().getFullYear();
  return `${y}-${y + 1}`;
};

const STATUS_OPTS = [
  { value: '',         label: 'Tous les statuts' },
  { value: 'pending',  label: 'En attente'       },
  { value: 'partial',  label: 'Partiel'           },
  { value: 'paid',     label: 'Payé'              },
  { value: 'overdue',  label: 'En retard'         },
  { value: 'inactive', label: 'Désactivé'         },
];

const PAYMENT_METHODS = [
  { value: 'cash',           label: 'Espèces'        },
  { value: 'carte_bancaire', label: 'Carte bancaire' },
  { value: 'virement',       label: 'Virement'       },
  { value: 'cheque',         label: 'Chèque'         },
  { value: 'ccp',            label: 'CCP'            },
  { value: 'autre',          label: 'Autre'          },
];

const FEE_TYPES = [
  { value: 'tuition',      label: 'Frais de scolarité'  },
  { value: 'inscription',  label: "Frais d'inscription" },
  { value: 'bibliotheque', label: 'Frais bibliothèque'  },
  { value: 'laboratoire',  label: 'Frais laboratoire'   },
  { value: 'sport',        label: 'Frais sportifs'      },
  { value: 'autre',        label: 'Autre'               },
];

const LEVEL_OPTS = [
  { value: '',   label: 'Tous les niveaux' },
  { value: 'L1', label: 'Licence 1 (L1)'  },
  { value: 'L2', label: 'Licence 2 (L2)'  },
  { value: 'L3', label: 'Licence 3 (L3)'  },
  { value: 'M1', label: 'Master 1 (M1)'   },
  { value: 'M2', label: 'Master 2 (M2)'   },
  { value: 'D',  label: 'Doctorat (D)'    },
];

const STATUS_CONFIG = {
  paid    : { label: 'Payé',       bg: '#D1FAE5', color: '#065F46', dot: '#10B981' },
  partial : { label: 'Partiel',    bg: '#FEF3C7', color: '#92400E', dot: '#F59E0B' },
  pending : { label: 'En attente', bg: '#DBEAFE', color: '#1E40AF', dot: '#3B82F6' },
  overdue : { label: 'En retard',  bg: '#FEE2E2', color: '#991B1B', dot: '#EF4444' },
  inactive: { label: 'Désactivé',  bg: '#F3F4F6', color: '#6B7280', dot: '#9CA3AF' },
};

const fmt = (n) =>
  n !== undefined && n !== null
    ? new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD' }).format(n)
    : '—';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '—';

const getFeeLabel = (fee) => {
  if (fee?.items?.length) return fee.items.map(i => i.label).join(', ');
  if (fee?.feeType) {
    const t = FEE_TYPES.find(f => f.value === fee.feeType);
    return t?.label || fee.feeType;
  }
  return 'Frais de scolarité';
};

// ─── Base UI ──────────────────────────────────────────────────────────────────
function Spinner({ size = 24 }) {
  return (
    <div style={{
      width: size, height: size,
      border: '2px solid #E5E7EB', borderTopColor: '#4F46E5',
      borderRadius: '50%', animation: 'spin 0.7s linear infinite', flexShrink: 0,
    }} />
  );
}

function Toast({ message, type, onClose }) {
  if (!message) return null;
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '12px 18px', borderRadius: 12, fontSize: 13, fontWeight: 500,
      boxShadow: '0 8px 24px rgba(0,0,0,.15)',
      background: type === 'error' ? '#FEF2F2' : '#F0FDF4',
      border: `1px solid ${type === 'error' ? '#FECACA' : '#BBF7D0'}`,
      color: type === 'error' ? '#991B1B' : '#166534',
    }}>
      {type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
      {message}
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: 4 }}>
        <X size={14} />
      </button>
    </div>
  );
}

function useToast() {
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const show = useCallback((msg, type = 'success') => {
    setToast({ message: msg, type });
    setTimeout(() => setToast({ message: '', type: 'success' }), 3500);
  }, []);
  const ToastEl = <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />;
  return { toast: show, ToastEl };
}

function Badge({ children, bg, color, dot }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 20,
      fontSize: 11, fontWeight: 600, background: bg, color,
    }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: dot }} />}
      {children}
    </span>
  );
}

function Btn({ children, onClick, variant = 'primary', size = 'md', loading, disabled, type = 'button', fullWidth }) {
  const V = {
    primary  : { background: '#4F46E5', color: '#fff',    border: 'none'                    },
    secondary: { background: '#F9FAFB', color: '#374151', border: '1px solid #E5E7EB'       },
    danger   : { background: '#FEF2F2', color: '#991B1B', border: '1px solid #FECACA'       },
    success  : { background: '#D1FAE5', color: '#065F46', border: '1px solid #A7F3D0'       },
    warning  : { background: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A'       },
    ghost    : { background: 'transparent', color: '#6B7280', border: 'none'                },
  };
  const S = {
    sm: { padding: '4px 10px',  fontSize: 12 },
    md: { padding: '8px 16px',  fontSize: 13 },
    lg: { padding: '10px 22px', fontSize: 14 },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled || loading}
      style={{
        ...V[variant], ...S[size], borderRadius: 8, fontWeight: 500,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled || loading ? 0.6 : 1,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        transition: 'all 0.15s', width: fullWidth ? '100%' : undefined,
      }}>
      {loading && <Spinner size={14} />}
      {children}
    </button>
  );
}

function Field({ label, required, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && (
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>
          {label} {required && <span style={{ color: '#EF4444' }}>*</span>}
        </label>
      )}
      {children}
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '8px 12px',
  border: '1px solid #D1D5DB', borderRadius: 8,
  fontSize: 13, outline: 'none', background: '#fff', boxSizing: 'border-box',
};

function Input({ label, required, ...props }) {
  return (
    <Field label={label} required={required}>
      <input style={inputStyle} required={required} {...props}
        onFocus={e => e.target.style.borderColor = '#6366F1'}
        onBlur={e => e.target.style.borderColor = '#D1D5DB'} />
    </Field>
  );
}

function Select({ label, required, value, onChange, options }) {
  return (
    <Field label={label} required={required}>
      <select value={value} onChange={onChange} required={required}
        style={{ ...inputStyle, cursor: 'pointer' }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </Field>
  );
}

function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    const h = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);
  if (!isOpen) return null;
  const W = { sm: 420, md: 560, lg: 780 };
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)',
      backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 1000, padding: 16,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#fff', borderRadius: 16, width: '100%',
        maxWidth: W[size], maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,.2)',
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '18px 24px', borderBottom: '1px solid #E5E7EB',
          position: 'sticky', top: 0, background: '#fff', zIndex: 1,
        }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: '#111', margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{
            width: 30, height: 30, borderRadius: 8, border: 'none',
            background: '#F3F4F6', cursor: 'pointer', fontSize: 18, color: '#6B7280',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, bg, iconColor }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 12, padding: 18,
      border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: 14,
    }}>
      <div style={{
        width: 46, height: 46, borderRadius: 12,
        background: bg, color: iconColor,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>{icon}</div>
      <div>
        <p style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, marginBottom: 2 }}>{title}</p>
        <p style={{ fontSize: 18, fontWeight: 800, color: '#111' }}>{value}</p>
      </div>
    </div>
  );
}

// ─── Confirm Modal ─────────────────────────────────────────────────────────────
function ConfirmModal({ message, confirmLabel, confirmVariant = 'danger', onConfirm, onCancel, loading }) {
  return (
    <div style={{ padding: '20px 24px' }}>
      <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.7, marginBottom: 24 }}>{message}</p>
      <div style={{ display: 'flex', gap: 12 }}>
        <Btn variant="secondary" onClick={onCancel} fullWidth>Annuler</Btn>
        <Btn variant={confirmVariant} onClick={onConfirm} loading={loading} fullWidth>{confirmLabel}</Btn>
      </div>
    </div>
  );
}

// ─── Add Fee Modal ─────────────────────────────────────────────────────────────
function AddFeeModal({ onSave, onCancel }) {
  const { toast, ToastEl } = useToast();
  const [loading, setLoading]       = useState(false);
  const [programs, setPrograms]     = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  const [form, setForm] = useState({
    filterLevel: '', filterProgram: '',
    feeType: 'tuition', amount: '',
    academicYear: ACADEMIC_YEAR(), dueDate: '', description: '',
  });

  useEffect(() => {
    programAPI.getAll({ limit: 100 })
      .then(r => setPrograms(r.data?.data || r.data || []))
      .catch(() => toast('Erreur chargement filières', 'error'))
      .finally(() => setLoadingData(false));
  }, []);

  const programOptions = [
    { value: '', label: 'Toutes les filières' },
    ...programs.map(p => ({ value: p._id, label: p.name })),
  ];

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || Number(form.amount) <= 0) return toast('Montant invalide', 'error');
    setLoading(true);
    try {
      await feeAPI.create({
        level       : form.filterLevel   || undefined,
        programId   : form.filterProgram || undefined,
        feeType     : form.feeType,
        amount      : Number(form.amount),
        academicYear: form.academicYear,
        dueDate     : form.dueDate || undefined,
        description : form.description,
      });
      onSave();
    } catch (err) {
      toast(err?.response?.data?.message || err.message || 'Erreur', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: '20px 24px' }}>
      {ToastEl}
      <div style={{ background: '#F8FAFF', border: '1px solid #E0E7FF', borderRadius: 10, padding: 14, marginBottom: 16 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#4F46E5', marginBottom: 10 }}>🎯 Cibler les étudiants</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Select label="Niveau" value={form.filterLevel}
            onChange={e => set('filterLevel', e.target.value)} options={LEVEL_OPTS} />
          <Select label="Filière" value={form.filterProgram}
            onChange={e => set('filterProgram', e.target.value)} options={programOptions} />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Select label="Type de frais" value={form.feeType}
          onChange={e => set('feeType', e.target.value)} options={FEE_TYPES} />
        <Input label="Montant (DA)" type="number" required value={form.amount}
          onChange={e => set('amount', e.target.value)} placeholder="0" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Input label="Année académique" value={form.academicYear}
          onChange={e => set('academicYear', e.target.value)} />
        <Input label="Date d'échéance" type="date" value={form.dueDate}
          onChange={e => set('dueDate', e.target.value)} />
      </div>
      <Input label="Description" value={form.description}
        onChange={e => set('description', e.target.value)} placeholder="Optionnel" />
      <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
        <Btn variant="secondary" onClick={onCancel} fullWidth>Annuler</Btn>
        <Btn type="submit" loading={loading} fullWidth><Plus size={15} /> Ajouter</Btn>
      </div>
    </form>
  );
}

// ─── Bulk Add Fee Modal ────────────────────────────────────────────────────────
function BulkAddFeeModal({ onSave, onCancel }) {
  const { toast, ToastEl } = useToast();
  const [loading, setLoading]       = useState(false);
  const [programs, setPrograms]     = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  const [form, setForm] = useState({
    target: 'all', programId: '', level: '',
    feeType: 'tuition', amount: '',
    academicYear: ACADEMIC_YEAR(), dueDate: '', description: '',
  });

  useEffect(() => {
    programAPI.getAll({ limit: 100 })
      .then(r => setPrograms(r.data?.data || r.data || []))
      .catch(() => toast('Erreur chargement filières', 'error'))
      .finally(() => setLoadingData(false));
  }, []);

  const programOptions = [
    { value: '', label: 'Sélectionner une filière' },
    ...programs.map(p => ({ value: p._id, label: p.name })),
  ];
  const levelOnlyOpts = LEVEL_OPTS.slice(1);
  const targetOptions = [
    { value: 'all',     label: 'Tous les étudiants actifs' },
    { value: 'level',   label: 'Par niveau (L1, L2…)'     },
    { value: 'program', label: 'Par filière'               },
  ];
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || Number(form.amount) <= 0) return toast('Montant invalide', 'error');
    if (form.target === 'program' && !form.programId) return toast('Choisissez une filière', 'error');
    if (form.target === 'level'   && !form.level)     return toast('Choisissez un niveau', 'error');
    setLoading(true);
    try {
      const res = await feeAPI.create({
        target: form.target, programId: form.programId || undefined,
        level: form.level || undefined, feeType: form.feeType,
        amount: Number(form.amount), academicYear: form.academicYear,
        dueDate: form.dueDate || undefined, description: form.description,
      });
      onSave(res?.data?.data);
    } catch (err) {
      toast(err?.response?.data?.message || err.message || 'Erreur', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: '20px 24px' }}>
      {ToastEl}
      <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 10, padding: 12, marginBottom: 16, fontSize: 12, color: '#92400E' }}>
        ⚠️ L'ajout en masse créera une fiche pour chaque étudiant correspondant. Les fiches existantes seront ignorées.
      </div>
      <Select label="Cibler" value={form.target} onChange={e => set('target', e.target.value)} options={targetOptions} />
      {form.target === 'program' && (
        <Select label="Filière" required value={form.programId} onChange={e => set('programId', e.target.value)} options={programOptions} />
      )}
      {form.target === 'level' && (
        <Select label="Niveau" required value={form.level} onChange={e => set('level', e.target.value)}
          options={[{ value: '', label: '-- Choisir --' }, ...levelOnlyOpts]} />
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Select label="Type de frais" value={form.feeType} onChange={e => set('feeType', e.target.value)} options={FEE_TYPES} />
        <Input label="Montant (DA)" type="number" required value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="0" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Input label="Année académique" value={form.academicYear} onChange={e => set('academicYear', e.target.value)} />
        <Input label="Date d'échéance" type="date" value={form.dueDate} onChange={e => set('dueDate', e.target.value)} />
      </div>
      <Input label="Description" value={form.description} onChange={e => set('description', e.target.value)} placeholder="Optionnel" />
      <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
        <Btn variant="secondary" onClick={onCancel} fullWidth>Annuler</Btn>
        <Btn type="submit" loading={loading} fullWidth><Users size={15} /> Ajouter en masse</Btn>
      </div>
    </form>
  );
}

// ─── Payment Modal ─────────────────────────────────────────────────────────────
function PaymentModal({ fee, onSave, onCancel }) {
  const { toast, ToastEl } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ amount: fee?.remainingAmount || '', method: 'cash', reference: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const a = Number(form.amount);
    if (!a || a <= 0) return toast('Montant invalide', 'error');
    if (a > fee.remainingAmount) return toast(`Max : ${fmt(fee.remainingAmount)}`, 'error');
    setLoading(true);
    try {
      await feeAPI.recordPayment(fee._id, { ...form, amount: a });
      onSave();
    } catch (err) {
      toast(err?.response?.data?.message || 'Erreur paiement', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: '20px 24px' }}>
      {ToastEl}
      <div style={{ background: '#F9FAFB', borderRadius: 12, padding: 16, marginBottom: 20, border: '1px solid #E5E7EB' }}>
        {[
          ['Total dû',   fmt(fee?.totalAmount),     '#111',     700],
          ['Déjà payé',  fmt(fee?.paidAmount),      '#059669',  600],
          ['Restant dû', fmt(fee?.remainingAmount), '#DC2626',  700],
        ].map(([l, v, c, w], i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: i === 2 ? '8px 0 0' : '0 0 8px', borderTop: i === 2 ? '1px solid #E5E7EB' : 'none' }}>
            <span style={{ fontSize: 13, color: '#6B7280' }}>{l}</span>
            <span style={{ fontSize: 14, fontWeight: w, color: c }}>{v}</span>
          </div>
        ))}
      </div>
      <Input label="Montant à payer (DA)" type="number" required value={form.amount}
        onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} max={fee?.remainingAmount} placeholder="0" />
      <Select label="Mode de paiement" value={form.method}
        onChange={e => setForm(f => ({ ...f, method: e.target.value }))} options={PAYMENT_METHODS} />
      <Input label="Référence / N° chèque" value={form.reference}
        onChange={e => setForm(f => ({ ...f, reference: e.target.value }))} placeholder="Optionnel" />
      <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
        <Btn variant="secondary" onClick={onCancel} fullWidth>Annuler</Btn>
        <Btn type="submit" loading={loading} fullWidth><DollarSign size={15} /> Enregistrer</Btn>
      </div>
    </form>
  );
}

// ─── Reminder Modal ────────────────────────────────────────────────────────────
function ReminderModal({ onSave, onCancel }) {
  const { toast, ToastEl } = useToast();
  const [loading, setLoading] = useState(false);
  const [programs, setPrograms] = useState([]);
  const [form, setForm] = useState({ target: 'all', programId: '', level: '' });

  useEffect(() => {
    programAPI.getAll({ limit: 100 })
      .then(r => setPrograms(r.data?.data || r.data || []))
      .catch(() => {});
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const targetOptions = [
    { value: 'all',     label: 'Tous (impayés / partiels / en retard)' },
    { value: 'overdue', label: 'Uniquement en retard'                  },
    { value: 'pending', label: 'Uniquement en attente'                 },
    { value: 'program', label: 'Par filière'                           },
    { value: 'level',   label: 'Par niveau'                            },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await feeAPI.sendReminders(form);
      onSave(res?.data?.data?.sent);
    } catch (err) {
      toast(err?.response?.data?.message || 'Erreur envoi', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: '20px 24px' }}>
      {ToastEl}
      <Select label="Cible" value={form.target} onChange={e => set('target', e.target.value)} options={targetOptions} />
      {form.target === 'program' && (
        <Select label="Filière" required value={form.programId}
          onChange={e => set('programId', e.target.value)}
          options={[{ value: '', label: '-- Choisir --' }, ...programs.map(p => ({ value: p._id, label: p.name }))]} />
      )}
      {form.target === 'level' && (
        <Select label="Niveau" required value={form.level}
          onChange={e => set('level', e.target.value)} options={LEVEL_OPTS} />
      )}
      <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
        <Btn variant="secondary" onClick={onCancel} fullWidth>Annuler</Btn>
        <Btn type="submit" loading={loading} fullWidth><Mail size={15} /> Envoyer les rappels</Btn>
      </div>
    </form>
  );
}

// ─── Fee Card (Admin) ──────────────────────────────────────────────────────────
function AdminFeeCard({ fee, onAction }) {
  const [expanded, setExpanded] = useState(false);
  const cfg        = STATUS_CONFIG[fee.status] || STATUS_CONFIG.pending;
  const isInactive = fee.status === 'inactive';
  const pct        = fee.totalAmount > 0
    ? Math.min(100, Math.round((fee.paidAmount / fee.totalAmount) * 100)) : 0;

  return (
    <div style={{
      background: '#fff', borderRadius: 14,
      border: `1px solid ${isInactive ? '#F3F4F6' : '#E5E7EB'}`,
      overflow: 'hidden', opacity: isInactive ? 0.7 : 1,
      transition: 'box-shadow .2s',
      boxShadow: '0 1px 4px rgba(0,0,0,.05)',
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,.09)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,.05)'}
    >
      {/* Accent bar */}
      <div style={{ height: 3, background: isInactive ? '#E5E7EB' : cfg.dot }} />

      <div style={{ padding: '16px 18px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Étudiant */}
            <div style={{ fontWeight: 700, fontSize: 14, color: '#111', marginBottom: 1 }}>
              {fee.student?.firstName} {fee.student?.lastName}
            </div>
            <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 6 }}>
              {fee.student?.studentId}
              {fee.student?.level ? ` · ${fee.student.level}` : ''}
              {fee.student?.program?.name ? ` · ${fee.student.program.name}` : ''}
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              <Badge bg={cfg.bg} color={cfg.color} dot={cfg.dot}>{cfg.label}</Badge>
              <span style={{ fontSize: 11, color: '#9CA3AF' }}>{fee.academicYear}</span>
              <span style={{ fontSize: 11, color: '#9CA3AF' }}>· {getFeeLabel(fee)}</span>
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
            <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 2 }}>Total dû</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#111' }}>{fmt(fee.totalAmount)}</div>
          </div>
        </div>

        {/* Amounts */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
          <div style={{ background: '#F0FDF4', borderRadius: 8, padding: '8px 12px' }}>
            <div style={{ fontSize: 10, color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 2 }}>Payé</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#059669' }}>{fmt(fee.paidAmount)}</div>
          </div>
          <div style={{ background: fee.remainingAmount > 0 ? '#FEF2F2' : '#F0FDF4', borderRadius: 8, padding: '8px 12px' }}>
            <div style={{ fontSize: 10, color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 2 }}>Restant</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: fee.remainingAmount > 0 ? '#DC2626' : '#059669' }}>{fmt(fee.remainingAmount)}</div>
          </div>
        </div>

        {/* Progress */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9CA3AF', marginBottom: 4 }}>
            <span>Progression</span>
            <span style={{ fontWeight: 700, color: pct === 100 ? '#059669' : '#4F46E5' }}>{pct}%</span>
          </div>
          <div style={{ height: 6, background: '#F3F4F6', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 99,
              background: pct === 100 ? '#10B981' : isInactive ? '#9CA3AF' : 'linear-gradient(90deg,#6366F1,#10B981)',
              width: `${pct}%`, transition: 'width .6s ease',
            }} />
          </div>
        </div>

        {/* Échéance */}
        {fee.dueDate && (
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            padding: '5px 10px', borderRadius: 7, marginBottom: 12,
            background: fee.status === 'overdue' ? '#FEF2F2' : '#F9FAFB',
            fontSize: 12,
          }}>
            <span style={{ color: '#6B7280', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={11} /> Échéance
            </span>
            <span style={{ fontWeight: 700, color: fee.status === 'overdue' ? '#DC2626' : '#374151' }}>
              {fmtDate(fee.dueDate)}
            </span>
          </div>
        )}

        {/* ── Actions ── */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {/* Payer */}
          {fee.remainingAmount > 0 && !isInactive && (
            <Btn size="sm" onClick={() => onAction('pay', fee)}>
              <DollarSign size={12} /> Payer
            </Btn>
          )}

          {/* Marquer payé */}
          {fee.status !== 'paid' && !isInactive && (
            <Btn size="sm" variant="success" onClick={() => onAction('markPaid', fee)}>
              <CheckCircle size={12} /> Marquer payé
            </Btn>
          )}

          {/* Marquer impayé */}
          {fee.status === 'paid' && (
            <Btn size="sm" variant="warning" onClick={() => onAction('markUnpaid', fee)}>
              <RotateCcw size={12} /> Marquer impayé
            </Btn>
          )}

          {/* Marquer en retard */}
          {['pending', 'partial'].includes(fee.status) && (
            <Btn size="sm" variant="danger" onClick={() => onAction('markOverdue', fee)}>
              <AlertCircle size={12} /> En retard
            </Btn>
          )}

          {/* Désactiver / Réactiver */}
          {isInactive ? (
            <Btn size="sm" variant="secondary" onClick={() => onAction('reactivate', fee)}>
              <RotateCcw size={12} /> Réactiver
            </Btn>
          ) : (
            <Btn size="sm" variant="ghost" onClick={() => onAction('disable', fee)}>
              <Ban size={12} /> Désactiver
            </Btn>
          )}

          {/* Supprimer */}
          <Btn size="sm" variant="ghost" onClick={() => onAction('delete', fee)}
            style={{ color: '#EF4444' }}>
            <Trash2 size={12} />
          </Btn>

          {/* Détail items */}
          {fee.items?.length > 0 && (
            <Btn size="sm" variant="ghost" onClick={() => setExpanded(v => !v)}>
              {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />} Détail
            </Btn>
          )}
        </div>
      </div>

      {/* Items expandable */}
      {expanded && fee.items?.length > 0 && (
        <div style={{ borderTop: '1px solid #F3F4F6', padding: '10px 18px 14px', background: '#FAFAFA' }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '.05em' }}>Détail des frais</p>
          {fee.items.map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', fontSize: 12, borderBottom: i < fee.items.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
              <span style={{ color: '#374151' }}>{item.label}</span>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontWeight: 700 }}>{fmt(item.amount)}</span>
                <span style={{
                  fontSize: 10, fontWeight: 600, padding: '1px 7px', borderRadius: 20,
                  background: item.isPaid ? '#D1FAE5' : '#FEF3C7',
                  color: item.isPaid ? '#065F46' : '#92400E',
                }}>
                  {item.isPaid ? '✓' : '…'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Admin Page ───────────────────────────────────────────────────────────
export default function FeesPage() {
  const { toast, ToastEl } = useToast();
  const [fees,   setFees]   = useState([]);
  const [stats,  setStats]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [page,   setPage]   = useState(1);
  const [total,  setTotal]  = useState(0);
  const [actionLoading, setActionLoading] = useState(false);
  const LIMIT = 20;

  const [filters, setFilters] = useState({ status: '', academicYear: ACADEMIC_YEAR(), search: '' });
  const [modal,   setModal]   = useState(null);

  const loadFees = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT, ...filters };
      Object.keys(params).forEach(k => !params[k] && delete params[k]);
      const res = await feeAPI.getAll(params);
      setFees(res.data?.data || res.data || []);
      setTotal(res.data?.total || 0);
    } catch {
      toast('Erreur chargement', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  const loadStats = useCallback(async () => {
    try {
      const res = await feeAPI.getStats({ academicYear: ACADEMIC_YEAR() });
      setStats(res.data?.data || res.data || {});
    } catch { /* silencieux */ }
  }, []);

  useEffect(() => { loadFees(); }, [loadFees]);
  useEffect(() => { loadStats(); }, [loadStats]);

  // ── Dispatcher actions ──
  const handleAction = (action, fee) => {
    if (action === 'pay')         return setModal({ type: 'pay',         fee });
    if (action === 'markPaid')    return setModal({ type: 'markPaid',    fee });
    if (action === 'markUnpaid')  return setModal({ type: 'markUnpaid',  fee });
    if (action === 'markOverdue') return setModal({ type: 'markOverdue', fee });
    if (action === 'disable')     return setModal({ type: 'disable',     fee });
    if (action === 'reactivate')  return setModal({ type: 'reactivate',  fee });
    if (action === 'delete')      return setModal({ type: 'delete',      fee });
  };

  const confirmAction = async (action, fee) => {
    setActionLoading(true);
    try {
      if (action === 'markPaid')    await feeAPI.updateStatus(fee._id, { status: 'paid'     });
      if (action === 'markUnpaid')  await feeAPI.updateStatus(fee._id, { status: 'pending'  });
      if (action === 'markOverdue') await feeAPI.updateStatus(fee._id, { status: 'overdue'  });
      if (action === 'disable')     await feeAPI.updateStatus(fee._id, { status: 'inactive' });
      if (action === 'reactivate')  await feeAPI.updateStatus(fee._id, { status: 'pending'  });
      if (action === 'delete')      await feeAPI.delete(fee._id);
      setModal(null);
      await loadFees();
      await loadStats();
      toast(action === 'delete' ? 'Fiche supprimée' : 'Statut mis à jour !');
    } catch (err) {
      toast(err?.response?.data?.message || 'Erreur', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const totals = stats?.totals || {};
  const pages  = Math.ceil(total / LIMIT);

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', padding: 24, maxWidth: 1400, margin: '0 auto', minHeight: '100vh', background: '#F9FAFB' }}>
      {ToastEl}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111', margin: 0 }}>💰 Frais de Scolarité</h1>
          <p style={{ fontSize: 13, color: '#9CA3AF', marginTop: 4 }}>Gestion des paiements — {ACADEMIC_YEAR()}</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Btn variant="warning" size="sm" onClick={() => setModal('reminder')}>
            <Mail size={14} /> Rappels
          </Btn>
          <Btn variant="secondary" size="sm" onClick={() => setModal('bulk')}>
            <Users size={14} /> Ajout en masse
          </Btn>
          <Btn onClick={() => setModal('add')}>
            <Plus size={15} /> Nouveau frais
          </Btn>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 20 }}>
        <StatCard title="Total attendu" value={fmt(totals.totalRevenue)}   icon={<Wallet size={20} />}     bg="#EEF2FF" iconColor="#4338CA" />
        <StatCard title="Collecté"      value={fmt(totals.totalCollected)} icon={<TrendingUp size={20} />} bg="#D1FAE5" iconColor="#065F46" />
        <StatCard title="En attente"    value={fmt(totals.totalPending)}   icon={<Clock size={20} />}      bg="#FEF3C7" iconColor="#92400E" />
      </div>

      {/* Barre de recouvrement */}
      {totals.totalRevenue > 0 && (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: 18, marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Taux de recouvrement</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#4F46E5' }}>
              {Math.round((totals.totalCollected / totals.totalRevenue) * 100)}%
            </span>
          </div>
          <div style={{ height: 10, background: '#E5E7EB', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 99,
              background: 'linear-gradient(90deg,#6366F1,#10B981)',
              width: `${Math.min(100, Math.round((totals.totalCollected / totals.totalRevenue) * 100))}%`,
              transition: 'width .6s ease',
            }} />
          </div>
        </div>
      )}

      {/* Filtres */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: '12px 16px', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          {/* Recherche */}
          <div style={{ position: 'relative', minWidth: 200 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' }} />
            <input
              value={filters.search} placeholder="Nom, matricule…"
              onChange={e => { setFilters(f => ({ ...f, search: e.target.value })); setPage(1); }}
              style={{ ...inputStyle, paddingLeft: 32, width: 200 }}
              onFocus={e => e.target.style.borderColor = '#6366F1'}
              onBlur={e => e.target.style.borderColor = '#D1D5DB'}
            />
          </div>
          <div style={{ minWidth: 160 }}>
            <select value={filters.status}
              onChange={e => { setFilters(f => ({ ...f, status: e.target.value })); setPage(1); }}
              style={{ ...inputStyle, cursor: 'pointer', width: 170 }}>
              {STATUS_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <input value={filters.academicYear} placeholder="Année (ex: 2025-2026)"
              onChange={e => { setFilters(f => ({ ...f, academicYear: e.target.value })); setPage(1); }}
              style={{ ...inputStyle, width: 155 }}
              onFocus={e => e.target.style.borderColor = '#6366F1'}
              onBlur={e => e.target.style.borderColor = '#D1D5DB'}
            />
          </div>
          <Btn variant="ghost" size="sm" onClick={loadFees}><RefreshCw size={14} /></Btn>
          <span style={{ fontSize: 12, color: '#9CA3AF', marginLeft: 'auto' }}>
            {total} fiche{total !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Cards grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <Spinner size={36} />
        </div>
      ) : fees.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: 48, textAlign: 'center' }}>
          <Receipt size={40} style={{ color: '#D1D5DB', display: 'block', margin: '0 auto 12px' }} />
          <p style={{ color: '#6B7280', fontSize: 14 }}>Aucune fiche trouvée</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 14 }}>
          {fees.map(fee => (
            <AdminFeeCard key={fee._id} fee={fee} onAction={handleAction} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 24 }}>
          <Btn variant="secondary" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 1}>← Préc.</Btn>
          <span style={{ fontSize: 13, color: '#6B7280' }}>Page {page} / {pages}</span>
          <Btn variant="secondary" size="sm" onClick={() => setPage(p => p + 1)} disabled={page === pages}>Suiv. →</Btn>
        </div>
      )}

      {/* ── Modals ── */}
      <Modal isOpen={modal === 'add'} onClose={() => setModal(null)} title="Nouveau frais">
        <AddFeeModal onSave={() => { setModal(null); loadFees(); loadStats(); toast('Frais ajouté !'); }} onCancel={() => setModal(null)} />
      </Modal>

      <Modal isOpen={modal === 'bulk'} onClose={() => setModal(null)} title="Ajout en masse">
        <BulkAddFeeModal
          onSave={(d) => { setModal(null); loadFees(); loadStats(); toast(d ? `${d.created} créée(s), ${d.skipped} ignorée(s)` : 'Frais ajoutés !'); }}
          onCancel={() => setModal(null)} />
      </Modal>

      <Modal isOpen={modal === 'reminder'} onClose={() => setModal(null)} title="Envoyer des rappels" size="sm">
        <ReminderModal onSave={(sent) => { setModal(null); toast(`${sent ?? '?'} rappel(s) envoyé(s)`); }} onCancel={() => setModal(null)} />
      </Modal>

      <Modal isOpen={modal?.type === 'pay'} onClose={() => setModal(null)} title="Enregistrer un paiement" size="sm">
        {modal?.fee && (
          <PaymentModal fee={modal.fee}
            onSave={() => { setModal(null); loadFees(); loadStats(); toast('Paiement enregistré !'); }}
            onCancel={() => setModal(null)} />
        )}
      </Modal>

      <Modal isOpen={modal?.type === 'markPaid'} onClose={() => setModal(null)} title="Marquer comme payé" size="sm">
        <ConfirmModal message={`Marquer les frais de ${modal?.fee?.student?.firstName} ${modal?.fee?.student?.lastName} comme entièrement payés ?`}
          confirmLabel="Confirmer" confirmVariant="success" loading={actionLoading}
          onConfirm={() => confirmAction('markPaid', modal.fee)} onCancel={() => setModal(null)} />
      </Modal>

      <Modal isOpen={modal?.type === 'markUnpaid'} onClose={() => setModal(null)} title="Marquer comme impayé" size="sm">
        <ConfirmModal message={`Remettre les frais de ${modal?.fee?.student?.firstName} ${modal?.fee?.student?.lastName} en statut "En attente" ?`}
          confirmLabel="Confirmer" confirmVariant="warning" loading={actionLoading}
          onConfirm={() => confirmAction('markUnpaid', modal.fee)} onCancel={() => setModal(null)} />
      </Modal>

      <Modal isOpen={modal?.type === 'markOverdue'} onClose={() => setModal(null)} title="Marquer en retard" size="sm">
        <ConfirmModal message={`Marquer les frais de ${modal?.fee?.student?.firstName} ${modal?.fee?.student?.lastName} comme "En retard" ?`}
          confirmLabel="Marquer en retard" confirmVariant="danger" loading={actionLoading}
          onConfirm={() => confirmAction('markOverdue', modal.fee)} onCancel={() => setModal(null)} />
      </Modal>

      <Modal isOpen={modal?.type === 'disable'} onClose={() => setModal(null)} title="Désactiver la fiche" size="sm">
        <ConfirmModal message={`Désactiver la fiche de frais de ${modal?.fee?.student?.firstName} ${modal?.fee?.student?.lastName} ? Elle sera masquée des rappels.`}
          confirmLabel="Désactiver" confirmVariant="danger" loading={actionLoading}
          onConfirm={() => confirmAction('disable', modal.fee)} onCancel={() => setModal(null)} />
      </Modal>

      <Modal isOpen={modal?.type === 'reactivate'} onClose={() => setModal(null)} title="Réactiver la fiche" size="sm">
        <ConfirmModal message={`Réactiver la fiche de frais de ${modal?.fee?.student?.firstName} ${modal?.fee?.student?.lastName} ?`}
          confirmLabel="Réactiver" confirmVariant="primary" loading={actionLoading}
          onConfirm={() => confirmAction('reactivate', modal.fee)} onCancel={() => setModal(null)} />
      </Modal>

      <Modal isOpen={modal?.type === 'delete'} onClose={() => setModal(null)} title="Supprimer la fiche" size="sm">
        <ConfirmModal message={`⚠️ Supprimer définitivement la fiche de ${modal?.fee?.student?.firstName} ${modal?.fee?.student?.lastName} (${modal?.fee?.academicYear}) ? Cette action est irréversible.`}
          confirmLabel="Supprimer" confirmVariant="danger" loading={actionLoading}
          onConfirm={() => confirmAction('delete', modal.fee)} onCancel={() => setModal(null)} />
      </Modal>
    </div>
  );
}