
// pages/student/StudentFeesPage.jsx
import { useState, useEffect, useCallback } from 'react';
import {
  DollarSign, Download, CheckCircle, Clock, AlertCircle,
  CreditCard, X, Receipt, Shield, Ban, RotateCcw,
  Wallet, TrendingUp, Calendar,
} from 'lucide-react';
import { feeAPI } from '../../services/services';
import { useAuth } from '../../components/context/AuthContext';

// ─── Helpers ───────────────────────────────────────────────────────────────────
const ACADEMIC_YEAR = () => {
  const y = new Date().getFullYear();
  const m = new Date().getMonth() + 1;
  return m >= 9 ? `${y}-${y + 1}` : `${y - 1}-${y}`;
};

const fmt = (n) =>
  n !== undefined && n !== null
    ? new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD' }).format(n)
    : '—';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '—';

const FEE_TYPE_LABELS = {
  tuition     : 'Frais de scolarité',
  inscription : "Frais d'inscription",
  bibliotheque: 'Frais bibliothèque',
  laboratoire : 'Frais laboratoire',
  sport       : 'Frais sportifs',
  autre       : 'Autre',
};

const getFeeLabel = (fee) => {
  if (fee?.items?.length) return fee.items.map(i => i.label).join(', ');
  if (fee?.feeType)       return FEE_TYPE_LABELS[fee.feeType] || fee.feeType;
  return 'Frais de scolarité';
};

const STATUS_CONFIG = {
  paid    : { label: 'Payé',       bg: '#D1FAE5', color: '#065F46', dot: '#10B981', Icon: CheckCircle },
  partial : { label: 'Partiel',    bg: '#FEF3C7', color: '#92400E', dot: '#F59E0B', Icon: Clock       },
  pending : { label: 'En attente', bg: '#DBEAFE', color: '#1E40AF', dot: '#3B82F6', Icon: Clock       },
  overdue : { label: 'En retard',  bg: '#FEE2E2', color: '#991B1B', dot: '#EF4444', Icon: AlertCircle },
  inactive: { label: 'Désactivé',  bg: '#F3F4F6', color: '#6B7280', dot: '#9CA3AF', Icon: Ban         },
};

const PAYMENT_METHODS = [
  { value: 'cash',           label: 'Espèces 💵'          },
  { value: 'carte_bancaire', label: 'Carte bancaire 💳'    },
  { value: 'virement',       label: 'Virement bancaire 🏦' },
  { value: 'cheque',         label: 'Chèque 📄'            },
  { value: 'ccp',            label: 'CCP 📮'               },
  { value: 'autre',          label: 'Autre 💰'             },
];

// ─── Base UI ───────────────────────────────────────────────────────────────────
function Spinner({ size = 24 }) {
  return (
    <div style={{
      width: size, height: size,
      border: '2px solid #E5E7EB', borderTopColor: '#4F46E5',
      borderRadius: '50%', animation: 'spin .7s linear infinite', flexShrink: 0,
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
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
        <X size={14} />
      </button>
    </div>
  );
}

function Badge({ children, bg, color, dot }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 20,
      fontSize: 11, fontWeight: 600, background: bg, color,
    }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: dot, display: 'inline-block' }} />}
      {children}
    </span>
  );
}

const inputStyle = {
  width: '100%', padding: '8px 12px', border: '1px solid #D1D5DB',
  borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box',
};

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
        style={{ ...inputStyle, cursor: 'pointer', background: '#fff' }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </Field>
  );
}

function Btn({ children, onClick, variant = 'primary', size = 'md', loading, disabled, type = 'button', fullWidth }) {
  const V = {
    primary : { background: '#4F46E5', color: '#fff',    border: 'none' },
    secondary:{ background: '#F9FAFB', color: '#374151', border: '1px solid #E5E7EB' },
    success : { background: '#D1FAE5', color: '#065F46', border: '1px solid #A7F3D0' },
    danger  : { background: '#FEF2F2', color: '#991B1B', border: '1px solid #FECACA' },
    warning : { background: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A' },
    ghost   : { background: 'transparent', color: '#6B7280', border: 'none' },
  };
  const S = {
    sm: { padding: '5px 12px', fontSize: 12 },
    md: { padding: '8px 16px', fontSize: 13 },
    lg: { padding: '10px 22px', fontSize: 14 },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled || loading}
      style={{
        ...V[variant], ...S[size], borderRadius: 8, fontWeight: 500,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled || loading ? 0.6 : 1,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        transition: 'all .15s', width: fullWidth ? '100%' : undefined,
      }}>
      {loading && <Spinner size={14} />}
      {children}
    </button>
  );
}

function Modal({ isOpen, onClose, title, children }) {
  useEffect(() => {
    const h = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);
  if (!isOpen) return null;
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)',
      backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 1000, padding: 16,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#fff', borderRadius: 16, width: '100%',
        maxWidth: 480, maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,.2)',
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '18px 24px', borderBottom: '1px solid #E5E7EB',
          position: 'sticky', top: 0, background: '#fff', zIndex: 1,
        }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: '#111' }}>{title}</h2>
          <button onClick={onClose} style={{
            width: 30, height: 30, borderRadius: 8, border: 'none',
            background: '#F3F4F6', cursor: 'pointer', fontSize: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280',
          }}>×</button>
        </div>
        <div style={{ padding: '20px 24px' }}>{children}</div>
      </div>
    </div>
  );
}

function ConfirmModal({ message, confirmLabel, confirmVariant = 'danger', onConfirm, onCancel, loading }) {
  return (
    <div>
      <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.6, marginBottom: 24 }}>{message}</p>
      <div style={{ display: 'flex', gap: 12 }}>
        <Btn variant="secondary" onClick={onCancel} fullWidth>Annuler</Btn>
        <Btn variant={confirmVariant} onClick={onConfirm} loading={loading} fullWidth>{confirmLabel}</Btn>
      </div>
    </div>
  );
}

// ─── Payment Modal ─────────────────────────────────────────────────────────────
function PaymentModal({ fee, onSuccess, onCancel }) {
  const [method,    setMethod]    = useState('cash');
  const [amount,    setAmount]    = useState(fee?.remainingAmount || 0);
  const [reference, setReference] = useState('');
  const [loading,   setLoading]   = useState(false);
  const [err,       setErr]       = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const a = Number(amount);
    if (!a || a <= 0)              { setErr('Montant invalide'); return; }
    if (a > fee.remainingAmount)   { setErr(`Maximum : ${fmt(fee.remainingAmount)}`); return; }
    setLoading(true);
    try {
      // ✅ POST /api/fees/:id/pay
      await feeAPI.recordPayment(fee._id, { amount: a, method, reference });
      onSuccess();
    } catch (err) {
      setErr(err?.response?.data?.message || 'Erreur paiement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {err && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '8px 12px', marginBottom: 14, fontSize: 13, color: '#991B1B', display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertCircle size={14} /> {err}
        </div>
      )}
      <div style={{ background: '#F9FAFB', borderRadius: 12, padding: 16, marginBottom: 20, border: '1px solid #E5E7EB' }}>
        {[
          ['Total dû',   fmt(fee?.totalAmount),     '#111',     700],
          ['Déjà payé',  fmt(fee?.paidAmount),      '#059669',  600],
          ['Restant dû', fmt(fee?.remainingAmount), '#DC2626',  700],
        ].map(([l, v, c, w], i) => (
          <div key={i} style={{
            display: 'flex', justifyContent: 'space-between',
            padding: i === 2 ? '8px 0 0' : '0 0 8px',
            borderTop: i === 2 ? '1px solid #E5E7EB' : 'none',
          }}>
            <span style={{ fontSize: 13, color: '#6B7280' }}>{l}</span>
            <span style={{ fontSize: 14, fontWeight: w, color: c }}>{v}</span>
          </div>
        ))}
      </div>
      <Input label="Montant à payer (DA)" type="number" required value={amount}
        onChange={e => setAmount(e.target.value)} max={fee?.remainingAmount} />
      <Select label="Mode de paiement" value={method}
        onChange={e => setMethod(e.target.value)} options={PAYMENT_METHODS} />
      <Input label="Référence" value={reference}
        onChange={e => setReference(e.target.value)} placeholder="N° chèque, virement… (optionnel)" />
      <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
        <Btn variant="secondary" onClick={onCancel} fullWidth>Annuler</Btn>
        <Btn type="submit" loading={loading} fullWidth><CreditCard size={15} /> Confirmer</Btn>
      </div>
    </form>
  );
}

// ─── Invoice Modal ─────────────────────────────────────────────────────────────
function InvoiceModal({ fee, user, onClose }) {
  const invoiceNum = `FACT-${String(fee._id).slice(-8).toUpperCase()}`;
  const today      = new Date().toLocaleDateString('fr-FR');
  return (
    <div>
      <div style={{ textAlign: 'center', paddingBottom: 16, borderBottom: '2px dashed #E5E7EB', marginBottom: 16 }}>
        <div style={{ width: 52, height: 52, background: '#EEF2FF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
          <Receipt size={24} style={{ color: '#4F46E5' }} />
        </div>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#111', margin: 0 }}>FACTURE DE SCOLARITÉ</h2>
        <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>N° {invoiceNum}</p>
      </div>
      <div style={{ background: '#F9FAFB', borderRadius: 10, padding: '10px 14px', marginBottom: 14 }}>
        <p style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 2 }}>Étudiant</p>
        <p style={{ fontWeight: 700, color: '#111', fontSize: 14 }}>{user?.firstName} {user?.lastName}</p>
        {(fee?.student?.studentId || user?.studentId) && (
          <p style={{ fontSize: 12, color: '#6B7280' }}>{fee?.student?.studentId || user?.studentId}</p>
        )}
      </div>
      {[["Date d'émission", today], ['Échéance', fmtDate(fee.dueDate)], ['Année académique', fee.academicYear], ['Type', getFeeLabel(fee)]].map(([l, v]) => (
        <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13 }}>
          <span style={{ color: '#6B7280' }}>{l}</span>
          <span style={{ fontWeight: 600, color: '#111' }}>{v}</span>
        </div>
      ))}
      <div style={{ marginTop: 16, padding: '12px 0', borderTop: '1px solid #E5E7EB', borderBottom: '1px solid #E5E7EB' }}>
        {[['Total dû', fmt(fee.totalAmount), '#111', 700], ['Montant payé', fmt(fee.paidAmount), '#059669', 600], ['Reste à payer', fmt(fee.remainingAmount), '#DC2626', 700]].map(([l, v, c, w]) => (
          <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 14 }}>
            <span style={{ color: '#374151' }}>{l}</span>
            <span style={{ fontWeight: w, color: c }}>{v}</span>
          </div>
        ))}
      </div>
      {fee.items?.length > 0 && (
        <div style={{ marginTop: 14 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.05em' }}>Détail</p>
          {fee.items.map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', borderRadius: 8, background: i % 2 === 0 ? '#F9FAFB' : 'transparent', fontSize: 13 }}>
              <span style={{ color: '#374151' }}>{item.label}</span>
              <span style={{ fontWeight: 600 }}>{fmt(item.amount)}</span>
            </div>
          ))}
        </div>
      )}
      <div style={{ marginTop: 16, padding: 12, background: '#F9FAFB', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 11, color: '#9CA3AF' }}>
        <Shield size={13} /> Document officiel – À conserver
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
        <Btn variant="secondary" onClick={onClose} fullWidth>Fermer</Btn>
        <Btn onClick={() => window.print()} fullWidth><Download size={15} /> Imprimer</Btn>
      </div>
    </div>
  );
}

// ─── Fee Card ──────────────────────────────────────────────────────────────────
function FeeCard({ fee, isCurrent, onAction }) {
  const cfg    = STATUS_CONFIG[fee.status] || STATUS_CONFIG.pending;
  const pct    = fee.totalAmount > 0 ? Math.min(100, Math.round((fee.paidAmount / fee.totalAmount) * 100)) : 0;
  const isInactive = fee.status === 'inactive';

  return (
    <div style={{
      background: '#fff', borderRadius: 16,
      border: `1px solid ${isCurrent ? '#C7D2FE' : '#E5E7EB'}`,
      overflow: 'hidden', opacity: isInactive ? 0.65 : 1,
      transition: 'box-shadow .2s',
      boxShadow: isCurrent ? '0 4px 20px rgba(79,70,229,.1)' : '0 1px 4px rgba(0,0,0,.04)',
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,.1)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = isCurrent ? '0 4px 20px rgba(79,70,229,.1)' : '0 1px 4px rgba(0,0,0,.04)'}
    >
      <div style={{ height: 4, background: isCurrent ? 'linear-gradient(90deg,#6366F1,#10B981)' : (isInactive ? '#E5E7EB' : cfg.dot) }} />
      <div style={{ padding: '18px 20px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
              <Badge bg={cfg.bg} color={cfg.color} dot={cfg.dot}>{cfg.label}</Badge>
              {isCurrent && (
                <span style={{ fontSize: 10, fontWeight: 700, background: '#EEF2FF', color: '#4F46E5', padding: '2px 8px', borderRadius: 20 }}>
                  ANNÉE EN COURS
                </span>
              )}
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#111', margin: '0 0 2px' }}>Année {fee.academicYear}</h3>
            <p style={{ fontSize: 12, color: '#9CA3AF', margin: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Calendar size={11} /> {getFeeLabel(fee)}
            </p>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
            <p style={{ fontSize: 11, color: '#9CA3AF', margin: '0 0 2px' }}>Total dû</p>
            <p style={{ fontSize: 20, fontWeight: 900, color: '#111', margin: 0 }}>{fmt(fee.totalAmount)}</p>
          </div>
        </div>

        {/* Amounts */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
          <div style={{ background: '#F0FDF4', borderRadius: 10, padding: '10px 12px' }}>
            <p style={{ fontSize: 10, color: '#6B7280', margin: '0 0 3px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em' }}>Payé</p>
            <p style={{ fontSize: 15, fontWeight: 800, color: '#059669', margin: 0 }}>{fmt(fee.paidAmount)}</p>
          </div>
          <div style={{ background: fee.remainingAmount > 0 ? '#FEF2F2' : '#F0FDF4', borderRadius: 10, padding: '10px 12px' }}>
            <p style={{ fontSize: 10, color: '#6B7280', margin: '0 0 3px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em' }}>Restant</p>
            <p style={{ fontSize: 15, fontWeight: 800, color: fee.remainingAmount > 0 ? '#DC2626' : '#059669', margin: 0 }}>{fmt(fee.remainingAmount)}</p>
          </div>
        </div>

        {/* Progress */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9CA3AF', marginBottom: 5 }}>
            <span>Progression</span>
            <span style={{ fontWeight: 700, color: pct === 100 ? '#059669' : '#4F46E5' }}>{pct}%</span>
          </div>
          <div style={{ height: 8, background: '#F3F4F6', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 99, background: pct === 100 ? '#10B981' : isInactive ? '#9CA3AF' : 'linear-gradient(90deg,#6366F1,#10B981)', width: `${pct}%`, transition: 'width .6s ease' }} />
          </div>
        </div>

        {/* Due date */}
        {fee.dueDate && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 12px', borderRadius: 8, marginBottom: 14, background: fee.status === 'overdue' ? '#FEF2F2' : '#F9FAFB', border: `1px solid ${fee.status === 'overdue' ? '#FECACA' : '#F3F4F6'}` }}>
            <span style={{ fontSize: 12, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 5 }}><Clock size={12} /> Échéance</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: fee.status === 'overdue' ? '#DC2626' : '#374151' }}>{fmtDate(fee.dueDate)}</span>
          </div>
        )}

        {/* Actions — étudiant : payer + facture seulement */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {fee.remainingAmount > 0 && !isInactive && (
            <Btn size="sm" onClick={() => onAction('pay', fee)}>
              <CreditCard size={13} /> Payer
            </Btn>
          )}
          <Btn size="sm" variant="secondary" onClick={() => onAction('invoice', fee)}>
            <Receipt size={13} /> Facture
          </Btn>
        </div>
      </div>

      {/* Items detail */}
      {fee.items?.length > 0 && (
        <div style={{ borderTop: '1px solid #F3F4F6', padding: '12px 20px', background: '#FAFAFA' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '.05em' }}>Détail</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {fee.items.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                <span style={{ color: '#374151' }}>{item.label}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 600, color: '#111' }}>{fmt(item.amount)}</span>
                  <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 7px', borderRadius: 20, background: item.isPaid ? '#D1FAE5' : '#FEF3C7', color: item.isPaid ? '#065F46' : '#92400E' }}>
                    {item.isPaid ? '✓ Payé' : 'Attente'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Summary Bar ───────────────────────────────────────────────────────────────
function SummaryBar({ fees }) {
  const totalDu        = fees.reduce((s, f) => s + (f.totalAmount    || 0), 0);
  const totalPaid      = fees.reduce((s, f) => s + (f.paidAmount     || 0), 0);
  const totalRemaining = fees.reduce((s, f) => s + (f.remainingAmount|| 0), 0);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 24 }}>
      {[
        { label: 'Total dû',   value: fmt(totalDu),        bg: '#F5F3FF', color: '#4F46E5', icon: <Wallet size={18} /> },
        { label: 'Total payé', value: fmt(totalPaid),      bg: '#F0FDF4', color: '#059669', icon: <TrendingUp size={18} /> },
        { label: 'Restant',    value: fmt(totalRemaining), bg: totalRemaining > 0 ? '#FEF2F2' : '#F0FDF4', color: totalRemaining > 0 ? '#DC2626' : '#059669', icon: <DollarSign size={18} /> },
      ].map(({ label, value, bg, color, icon }) => (
        <div key={label} style={{ background: bg, borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ color, flexShrink: 0 }}>{icon}</div>
          <div>
            <p style={{ fontSize: 11, color: '#9CA3AF', margin: '0 0 2px', fontWeight: 600 }}>{label}</p>
            <p style={{ fontSize: 15, fontWeight: 800, color, margin: 0 }}>{value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Student Page ─────────────────────────────────────────────────────────
export default function StudentFeesPage() {
  const { user }  = useAuth();
  const [fees,    setFees]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast,   setToast]   = useState({ message: '', type: '' });
  const [modal,   setModal]   = useState(null);

  const showToast = (message, type = 'success') => setToast({ message, type });

  const loadFees = useCallback(async () => {
    setLoading(true);
    try {
      // ✅ NE PAS passer ?student= — le backend filtre automatiquement par req.user._id
      // Appel simple : GET /api/fees  (le token JWT identifie l'étudiant)
      const res  = await feeAPI.getAll();
      let   data = res?.data?.data ?? res?.data ?? res ?? [];
      if (!Array.isArray(data)) data = [];
      setFees(data);
    } catch (err) {
      showToast(err?.response?.data?.message || 'Erreur chargement des frais', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadFees(); }, [loadFees]);

  const handleAction = (action, fee) => {
    if (action === 'pay')     return setModal({ type: 'pay',     fee });
    if (action === 'invoice') return setModal({ type: 'invoice', fee });
  };

  // Trier : année courante en premier
  const currentYear = ACADEMIC_YEAR();
  const sortedFees  = [...fees].sort((a, b) => {
    if (a.academicYear === currentYear) return -1;
    if (b.academicYear === currentYear) return 1;
    return b.academicYear.localeCompare(a.academicYear);
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 240 }}>
        <Spinner size={40} />
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', padding: 24, maxWidth: 860, margin: '0 auto' }}>
      <Toast {...toast} onClose={() => setToast({ message: '', type: '' })} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111', margin: 0 }}>Frais de Scolarité</h1>
        <p style={{ fontSize: 13, color: '#9CA3AF', marginTop: 4 }}>
          {user?.firstName} {user?.lastName} · Suivi de vos paiements
        </p>
      </div>

      {!sortedFees.length ? (
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB', padding: 48, textAlign: 'center' }}>
          <DollarSign size={48} style={{ color: '#D1D5DB', display: 'block', margin: '0 auto 12px' }} />
          <p style={{ color: '#6B7280', fontSize: 14 }}>Aucune fiche de frais disponible.</p>
          <p style={{ color: '#9CA3AF', fontSize: 12, marginTop: 4 }}>Contactez l'administration si vous pensez qu'il y a une erreur.</p>
        </div>
      ) : (
        <>
          <SummaryBar fees={sortedFees} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 16 }}>
            {sortedFees.map(fee => (
              <FeeCard key={fee._id} fee={fee} isCurrent={fee.academicYear === currentYear} onAction={handleAction} />
            ))}
          </div>
        </>
      )}

      {/* Modal Paiement */}
      <Modal isOpen={modal?.type === 'pay'} onClose={() => setModal(null)} title="Effectuer un paiement">
        {modal?.fee && (
          <PaymentModal
            fee={modal.fee}
            onSuccess={() => { setModal(null); loadFees(); showToast('Paiement effectué !'); }}
            onCancel={() => setModal(null)}
          />
        )}
      </Modal>

      {/* Modal Facture */}
      <Modal isOpen={modal?.type === 'invoice'} onClose={() => setModal(null)} title="Facture de scolarité">
        {modal?.fee && <InvoiceModal fee={modal.fee} user={user} onClose={() => setModal(null)} />}
      </Modal>
    </div>
  );
}