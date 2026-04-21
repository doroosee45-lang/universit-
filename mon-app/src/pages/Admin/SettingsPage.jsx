// pages/admin/SettingsPage.jsx
import { useState, useEffect, useCallback } from 'react';
import {
  Save, School, Calendar, DollarSign, BookOpen,
  Bell, Shield, Clock,
} from 'lucide-react';
import { settingsAPI } from '../../services/services';

// ─── Constantes ───────────────────────────────────────────────────────────────
const SEMESTERS = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6'];

const DEFAULT_SETTINGS = {
  academicYear: '2024-2025',
  currentSemester: 'S1',
  schoolInfo: {
    name: 'Université des Sciences et de la Technologie',
    arabicName: 'جامعة العلوم والتكنولوجيا',
    shortName: 'UST',
    address: "123 Boulevard de l'Université, 16000 Alger",
    phone: '+213 (0) 23 45 67 89',
    email: 'contact@universite.dz',
    website: 'www.universite.dz',
    rector: 'Pr. Mohamed BENALI',
    viceRector: 'Pr. Fatima ZOHRA',
    secretaryGeneral: 'M. Ahmed KADRI',
    logo: '',
    establishedYear: '1985',
    fiscalNumber: '123456789',
    bankAccount: '12345 67890 1234567890 12',
  },
  semesterDates: [
    { semester: 'S1', startDate: '2024-09-15', endDate: '2024-12-20', examStartDate: '2024-12-22', examEndDate: '2024-12-31' },
    { semester: 'S2', startDate: '2025-01-05', endDate: '2025-03-28', examStartDate: '2025-03-30', examEndDate: '2025-04-08' },
  ],
  gradingScale: { passingGrade: 10, maxGrade: 20, minGrade: 0, decimalPlaces: 2, roundingMethod: 'half_up' },
  mentionScale: [
    { min: 18,  max: 20,    label: 'Excellent',  color: '#9333EA', creditsBonus: 0 },
    { min: 16,  max: 17.99, label: 'Très Bien',  color: '#2563EB', creditsBonus: 0 },
    { min: 14,  max: 15.99, label: 'Bien',        color: '#059669', creditsBonus: 0 },
    { min: 12,  max: 13.99, label: 'Assez Bien',  color: '#0D9488', creditsBonus: 0 },
    { min: 10,  max: 11.99, label: 'Passable',    color: '#D97706', creditsBonus: 0 },
    { min: 0,   max: 9.99,  label: 'Non validé', color: '#DC2626', creditsBonus: 0 },
  ],
  academicSettings: { ectsPerSemester: 30, ectsPerYear: 60, maxAbsencesPerCourse: 3, maxAbsencesPerSemester: 10, retakePolicy: 'automatic', maxRetakes: 2 },
  financialSettings: { tuitionFee: 50000, registrationFee: 15000, libraryFee: 2000, sportFee: 1000, insuranceFee: 3000, latePaymentPenalty: 5000, paymentDeadlineDays: 30, scholarshipDiscount: 50, siblingsDiscount: 10 },
  librarySettings: { maxLoanDays: 14, maxRenewals: 2, finePerDay: 50, maxBooksPerStudent: 5, maxBooksPerTeacher: 10, reservationDays: 3, digitalLoanDays: 7 },
  attendanceSettings: { maxAbsencePercentage: 25, alertThreshold: 20, lateToleranceMinutes: 15, generateQRCode: true, qrCodeExpiryMinutes: 15, autoMarkAbsent: true, requireJustification: true, justificationDeadlineDays: 5 },
  notificationSettings: { enableEmail: true, enableSMS: false, enablePush: true, adminEmail: 'admin@universite.dz', smtpHost: 'smtp.gmail.com', smtpPort: 587, smtpUser: '', smtpPassword: '', reminderDays: [7, 3, 1] },
  securitySettings: { sessionTimeout: 60, maxLoginAttempts: 5, passwordExpiryDays: 90, twoFactorAuth: false, allowSelfRegistration: false, requireEmailVerification: true, allowedDomains: ['universite.dz', 'edu.dz'] },
};

// ─── useToast ─────────────────────────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([]);
  const show = useCallback((msg, type = 'success') => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);
  const ToastContainer = () => (
    <div style={styles.toastContainer}>
      {toasts.map(t => (
        <div key={t.id} style={{
          ...styles.toast,
          background: t.type === 'error' ? '#FEF2F2' : '#F0FDF4',
          border: `1px solid ${t.type === 'error' ? '#FECACA' : '#BBF7D0'}`,
          color: t.type === 'error' ? '#991B1B' : '#166534',
        }}>{t.msg}</div>
      ))}
    </div>
  );
  return { toast: show, ToastContainer };
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
function Spinner({ size = 24 }) {
  return (
    <div style={{ width: size, height: size, border: '2px solid #E5E7EB', borderTopColor: '#4F46E5', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
  );
}

// ─── Button ───────────────────────────────────────────────────────────────────
function Button({ children, onClick, variant = 'primary', size = 'md', loading, disabled }) {
  const variants = {
    primary:   { background: '#4F46E5', color: '#fff',     border: 'none' },
    secondary: { background: '#F9FAFB', color: '#374151',  border: '1px solid #E5E7EB' },
    danger:    { background: '#FEF2F2', color: '#991B1B',  border: '1px solid #FECACA' },
  };
  const sizes = {
    sm: { padding: '4px 10px',  fontSize: 12 },
    md: { padding: '8px 16px',  fontSize: 13 },
    lg: { padding: '10px 20px', fontSize: 14 },
  };
  return (
    <button onClick={onClick} disabled={disabled || loading} style={{
      ...variants[variant], ...sizes[size],
      borderRadius: 8, fontWeight: 500,
      cursor: disabled || loading ? 'not-allowed' : 'pointer',
      opacity: disabled || loading ? 0.6 : 1,
      display: 'inline-flex', alignItems: 'center', gap: 6, transition: 'all 0.2s',
    }}>
      {loading && <Spinner size={16} />}
      {children}
    </button>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
function Card({ children, style }) {
  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden', ...style }}>
      {children}
    </div>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────
function Input({ label, value, onChange, placeholder, type = 'text', required, min, max }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#6B7280', marginBottom: 6 }}>{label}{required && ' *'}</label>}
      <input
        type={type} value={value ?? ''} onChange={onChange}
        placeholder={placeholder} required={required} min={min} max={max}
        style={{ width: '100%', padding: '8px 12px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
        onFocus={e => e.target.style.borderColor = '#6366F1'}
        onBlur={e => e.target.style.borderColor = '#E5E7EB'}
      />
    </div>
  );
}

// ─── Select ───────────────────────────────────────────────────────────────────
function Select({ label, value, onChange, options, required }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#6B7280', marginBottom: 6 }}>{label}{required && ' *'}</label>}
      <select value={value ?? ''} onChange={onChange} required={required}
        style={{ width: '100%', padding: '8px 12px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, background: '#fff', outline: 'none', cursor: 'pointer' }}>
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    </div>
  );
}

// ─── TextArea ─────────────────────────────────────────────────────────────────
function TextArea({ label, value, onChange, placeholder, rows = 3 }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#6B7280', marginBottom: 6 }}>{label}</label>}
      <textarea value={value ?? ''} onChange={onChange} placeholder={placeholder} rows={rows}
        style={{ width: '100%', padding: '8px 12px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, outline: 'none', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }}
        onFocus={e => e.target.style.borderColor = '#6366F1'}
        onBlur={e => e.target.style.borderColor = '#E5E7EB'}
      />
    </div>
  );
}

// ─── Switch ───────────────────────────────────────────────────────────────────
function Switch({ label, checked, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
      <span style={{ fontSize: 13, color: '#374151' }}>{label}</span>
      <button type="button" onClick={() => onChange(!checked)} style={{
        width: 44, height: 24, borderRadius: 12,
        background: checked ? '#4F46E5' : '#E5E7EB',
        position: 'relative', transition: 'all 0.2s', cursor: 'pointer', border: 'none',
      }}>
        <div style={{ width: 20, height: 20, borderRadius: 10, background: '#fff', position: 'absolute', top: 2, left: checked ? 22 : 2, transition: 'left 0.2s' }} />
      </button>
    </div>
  );
}

// ─── SettingsPage ─────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const { toast, ToastContainer } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [activeTab, setActiveTab] = useState('school');

  useEffect(() => { loadSettings(); }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await settingsAPI.get();
      // Gère les différentes structures de réponse possibles
      const data = res?.data?.data || res?.data || res;
      if (data && typeof data === 'object') {
        setSettings(prev => ({ ...prev, ...data }));
      }
    } catch (error) {
      console.error('Erreur chargement paramètres:', error);
      toast('Erreur lors du chargement des paramètres — valeurs par défaut utilisées', 'error');
      // On garde DEFAULT_SETTINGS déjà en state, pas de crash
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsAPI.update(settings);
      toast('Paramètres sauvegardés avec succès ✓');
    } catch (err) {
      toast(err?.message || 'Erreur lors de la sauvegarde', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Mise à jour profonde d'un champ par chemin pointé ("a.b.c")
  const setValue = useCallback((path, value) => {
    setSettings(prev => {
      const next = structuredClone ? structuredClone(prev) : JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let cur = next;
      for (let i = 0; i < keys.length - 1; i++) {
        if (cur[keys[i]] === undefined || cur[keys[i]] === null) cur[keys[i]] = {};
        cur = cur[keys[i]];
      }
      cur[keys[keys.length - 1]] = value;
      return next;
    });
  }, []);

  const TABS = [
    { id: 'school',        label: 'Établissement', icon: School },
    { id: 'academic',      label: 'Académique',    icon: Calendar },
    { id: 'grading',       label: 'Notation',      icon: BookOpen },
    { id: 'financial',     label: 'Financier',     icon: DollarSign },
    { id: 'library',       label: 'Bibliothèque',  icon: BookOpen },
    { id: 'attendance',    label: 'Présences',     icon: Clock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security',      label: 'Sécurité',      icon: Shield },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Spinner size={48} />
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <ToastContainer />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>⚙️ Paramètres du Système</h1>
          <p style={styles.subtitle}>Configuration générale de l'université</p>
        </div>
        <Button onClick={handleSave} loading={saving}>
          <Save size={16} /> Sauvegarder les modifications
        </Button>
      </div>

      {/* Tabs */}
      <div style={styles.tabsContainer}>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)} style={{
            ...styles.tab,
            background: activeTab === id ? '#4F46E5' : '#fff',
            color:      activeTab === id ? '#fff'    : '#6B7280',
            border:     activeTab === id ? 'none'    : '1px solid #E5E7EB',
          }}>
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {/* ── Établissement ── */}
      {activeTab === 'school' && (
        <Card style={{ padding: 24 }}>
          <h2 style={styles.sectionTitle}>Informations de l'établissement</h2>
          <div style={styles.formGrid}>
            <Input label="Nom de l'université"  value={settings.schoolInfo?.name}              onChange={e => setValue('schoolInfo.name', e.target.value)} />
            <Input label="Nom arabe"             value={settings.schoolInfo?.arabicName}        onChange={e => setValue('schoolInfo.arabicName', e.target.value)} />
            <Input label="Nom court"             value={settings.schoolInfo?.shortName}         onChange={e => setValue('schoolInfo.shortName', e.target.value)} />
            <Input label="Année de création"     value={settings.schoolInfo?.establishedYear}   onChange={e => setValue('schoolInfo.establishedYear', e.target.value)} />
            <Input label="Adresse"               value={settings.schoolInfo?.address}           onChange={e => setValue('schoolInfo.address', e.target.value)} />
            <Input label="Téléphone"             value={settings.schoolInfo?.phone}             onChange={e => setValue('schoolInfo.phone', e.target.value)} />
            <Input label="Email" type="email"    value={settings.schoolInfo?.email}             onChange={e => setValue('schoolInfo.email', e.target.value)} />
            <Input label="Site web"              value={settings.schoolInfo?.website}           onChange={e => setValue('schoolInfo.website', e.target.value)} />
            <Input label="Recteur / Doyen"       value={settings.schoolInfo?.rector}            onChange={e => setValue('schoolInfo.rector', e.target.value)} />
            <Input label="Vice-recteur"          value={settings.schoolInfo?.viceRector}        onChange={e => setValue('schoolInfo.viceRector', e.target.value)} />
            <Input label="Secrétaire général"    value={settings.schoolInfo?.secretaryGeneral}  onChange={e => setValue('schoolInfo.secretaryGeneral', e.target.value)} />
            <Input label="N° fiscal"             value={settings.schoolInfo?.fiscalNumber}      onChange={e => setValue('schoolInfo.fiscalNumber', e.target.value)} />
          </div>
        </Card>
      )}

      {/* ── Académique ── */}
      {activeTab === 'academic' && (
        <Card style={{ padding: 24 }}>
          <h2 style={styles.sectionTitle}>Année académique</h2>
          <div style={styles.formGrid}>
            <Input label="Année académique" placeholder="2024-2025"
              value={settings.academicYear}
              onChange={e => setValue('academicYear', e.target.value)} />
            <Select label="Semestre actuel"
              value={settings.currentSemester}
              onChange={e => setValue('currentSemester', e.target.value)}
              options={SEMESTERS.map(s => ({ value: s, label: s }))} />
            <Input label="ECTS par semestre" type="number"
              value={settings.academicSettings?.ectsPerSemester}
              onChange={e => setValue('academicSettings.ectsPerSemester', parseInt(e.target.value))} />
            <Input label="ECTS par année" type="number"
              value={settings.academicSettings?.ectsPerYear}
              onChange={e => setValue('academicSettings.ectsPerYear', parseInt(e.target.value))} />
          </div>

          <h3 style={{ ...styles.sectionTitle, fontSize: 16, marginTop: 24 }}>Dates des semestres</h3>
          {(settings.semesterDates || []).map((sem, idx) => (
            <div key={idx} style={styles.semesterCard}>
              <h4 style={{ fontSize: 14, fontWeight: 600, color: '#111', marginBottom: 12 }}>{sem.semester}</h4>
              <div style={styles.formGrid}>
                {['startDate', 'endDate', 'examStartDate', 'examEndDate'].map((field, fi) => (
                  <Input key={field}
                    label={['Début cours', 'Fin cours', 'Début examens', 'Fin examens'][fi]}
                    type="date"
                    value={sem[field]?.substring(0, 10) || ''}
                    onChange={e => {
                      const newDates = [...(settings.semesterDates || [])];
                      newDates[idx] = { ...newDates[idx], [field]: e.target.value };
                      setValue('semesterDates', newDates);
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </Card>
      )}

      {/* ── Notation ── */}
      {activeTab === 'grading' && (
        <Card style={{ padding: 24 }}>
          <h2 style={styles.sectionTitle}>Système de notation</h2>
          <div style={styles.formGrid}>
            <Input label="Note minimale de validation" type="number" min="0" max="20"
              value={settings.gradingScale?.passingGrade ?? 10}
              onChange={e => setValue('gradingScale.passingGrade', parseFloat(e.target.value))} />
            <Input label="Note maximale" type="number" min="1"
              value={settings.gradingScale?.maxGrade ?? 20}
              onChange={e => setValue('gradingScale.maxGrade', parseFloat(e.target.value))} />
            <Input label="Décimales" type="number" min="0" max="3"
              value={settings.gradingScale?.decimalPlaces ?? 2}
              onChange={e => setValue('gradingScale.decimalPlaces', parseInt(e.target.value))} />
          </div>

          <h3 style={{ ...styles.sectionTitle, fontSize: 16, marginTop: 24 }}>Barème des mentions</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                  {['Mention', 'Note min', 'Note max', 'Couleur'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(settings.mentionScale || []).map((mention, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #F3F4F6' }}>
                    <td style={{ padding: '8px 12px' }}>
                      <input type="text" value={mention.label} style={styles.inlineInput}
                        onChange={e => { const s = [...settings.mentionScale]; s[idx] = { ...s[idx], label: e.target.value }; setValue('mentionScale', s); }} />
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      <input type="number" step="0.01" value={mention.min} style={styles.inlineInput}
                        onChange={e => { const s = [...settings.mentionScale]; s[idx] = { ...s[idx], min: parseFloat(e.target.value) }; setValue('mentionScale', s); }} />
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      <input type="number" step="0.01" value={mention.max} style={styles.inlineInput}
                        onChange={e => { const s = [...settings.mentionScale]; s[idx] = { ...s[idx], max: parseFloat(e.target.value) }; setValue('mentionScale', s); }} />
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      <input type="color" value={mention.color}
                        style={{ width: 50, height: 30, borderRadius: 6, border: '1px solid #E5E7EB', cursor: 'pointer' }}
                        onChange={e => { const s = [...settings.mentionScale]; s[idx] = { ...s[idx], color: e.target.value }; setValue('mentionScale', s); }} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ── Financier ── */}
      {activeTab === 'financial' && (
        <Card style={{ padding: 24 }}>
          <h2 style={styles.sectionTitle}>Paramètres financiers</h2>
          <div style={styles.formGrid}>
            <Input label="Frais de scolarité (DA)"  type="number" value={settings.financialSettings?.tuitionFee ?? 50000}          onChange={e => setValue('financialSettings.tuitionFee', parseInt(e.target.value))} />
            <Input label="Frais d'inscription (DA)" type="number" value={settings.financialSettings?.registrationFee ?? 15000}      onChange={e => setValue('financialSettings.registrationFee', parseInt(e.target.value))} />
            <Input label="Frais bibliothèque (DA)"  type="number" value={settings.financialSettings?.libraryFee ?? 2000}            onChange={e => setValue('financialSettings.libraryFee', parseInt(e.target.value))} />
            <Input label="Frais sportifs (DA)"      type="number" value={settings.financialSettings?.sportFee ?? 1000}              onChange={e => setValue('financialSettings.sportFee', parseInt(e.target.value))} />
            <Input label="Assurance (DA)"           type="number" value={settings.financialSettings?.insuranceFee ?? 3000}          onChange={e => setValue('financialSettings.insuranceFee', parseInt(e.target.value))} />
            <Input label="Pénalité retard (DA)"     type="number" value={settings.financialSettings?.latePaymentPenalty ?? 5000}   onChange={e => setValue('financialSettings.latePaymentPenalty', parseInt(e.target.value))} />
            <Input label="Délai paiement (jours)"   type="number" value={settings.financialSettings?.paymentDeadlineDays ?? 30}    onChange={e => setValue('financialSettings.paymentDeadlineDays', parseInt(e.target.value))} />
            <Input label="Remise boursiers (%)" type="number" min="0" max="100" value={settings.financialSettings?.scholarshipDiscount ?? 50} onChange={e => setValue('financialSettings.scholarshipDiscount', parseInt(e.target.value))} />
          </div>
        </Card>
      )}

      {/* ── Bibliothèque ── */}
      {activeTab === 'library' && (
        <Card style={{ padding: 24 }}>
          <h2 style={styles.sectionTitle}>Paramètres de la bibliothèque</h2>
          <div style={styles.formGrid}>
            <Input label="Durée de prêt (jours)"  type="number" value={settings.librarySettings?.maxLoanDays ?? 14}          onChange={e => setValue('librarySettings.maxLoanDays', parseInt(e.target.value))} />
            <Input label="Renouvellements max"     type="number" value={settings.librarySettings?.maxRenewals ?? 2}           onChange={e => setValue('librarySettings.maxRenewals', parseInt(e.target.value))} />
            <Input label="Amende par jour (DA)"    type="number" value={settings.librarySettings?.finePerDay ?? 50}           onChange={e => setValue('librarySettings.finePerDay', parseInt(e.target.value))} />
            <Input label="Max livres étudiant"     type="number" value={settings.librarySettings?.maxBooksPerStudent ?? 5}    onChange={e => setValue('librarySettings.maxBooksPerStudent', parseInt(e.target.value))} />
            <Input label="Max livres enseignant"   type="number" value={settings.librarySettings?.maxBooksPerTeacher ?? 10}   onChange={e => setValue('librarySettings.maxBooksPerTeacher', parseInt(e.target.value))} />
            <Input label="Réservation (jours)"     type="number" value={settings.librarySettings?.reservationDays ?? 3}       onChange={e => setValue('librarySettings.reservationDays', parseInt(e.target.value))} />
          </div>
        </Card>
      )}

      {/* ── Présences ── */}
      {activeTab === 'attendance' && (
        <Card style={{ padding: 24 }}>
          <h2 style={styles.sectionTitle}>Paramètres des présences</h2>
          <div style={styles.formGrid}>
            <Input label="Taux d'absence max (%)"    type="number" min="0" max="100" value={settings.attendanceSettings?.maxAbsencePercentage ?? 25}    onChange={e => setValue('attendanceSettings.maxAbsencePercentage', parseInt(e.target.value))} />
            <Input label="Seuil d'alerte (%)"        type="number" min="0" max="100" value={settings.attendanceSettings?.alertThreshold ?? 20}           onChange={e => setValue('attendanceSettings.alertThreshold', parseInt(e.target.value))} />
            <Input label="Tolérance retard (min)"    type="number"                   value={settings.attendanceSettings?.lateToleranceMinutes ?? 15}     onChange={e => setValue('attendanceSettings.lateToleranceMinutes', parseInt(e.target.value))} />
            <Input label="Expiration QR (min)"       type="number"                   value={settings.attendanceSettings?.qrCodeExpiryMinutes ?? 15}      onChange={e => setValue('attendanceSettings.qrCodeExpiryMinutes', parseInt(e.target.value))} />
            <Input label="Délai justification (j)"   type="number"                   value={settings.attendanceSettings?.justificationDeadlineDays ?? 5} onChange={e => setValue('attendanceSettings.justificationDeadlineDays', parseInt(e.target.value))} />
          </div>
          <div style={{ marginTop: 16 }}>
            <Switch label="Générer QR Code automatiquement" checked={settings.attendanceSettings?.generateQRCode ?? true}        onChange={val => setValue('attendanceSettings.generateQRCode', val)} />
            <Switch label="Marquer absent automatiquement"  checked={settings.attendanceSettings?.autoMarkAbsent ?? true}         onChange={val => setValue('attendanceSettings.autoMarkAbsent', val)} />
            <Switch label="Exiger justification"            checked={settings.attendanceSettings?.requireJustification ?? true}   onChange={val => setValue('attendanceSettings.requireJustification', val)} />
          </div>
        </Card>
      )}

      {/* ── Notifications ── */}
      {activeTab === 'notifications' && (
        <Card style={{ padding: 24 }}>
          <h2 style={styles.sectionTitle}>Paramètres des notifications</h2>
          <div style={styles.formGrid}>
            <Input label="Email administrateur" type="email" value={settings.notificationSettings?.adminEmail || ''}  onChange={e => setValue('notificationSettings.adminEmail', e.target.value)} />
            <Input label="Serveur SMTP"                      value={settings.notificationSettings?.smtpHost || ''}    onChange={e => setValue('notificationSettings.smtpHost', e.target.value)} />
            <Input label="Port SMTP"            type="number" value={settings.notificationSettings?.smtpPort || 587}  onChange={e => setValue('notificationSettings.smtpPort', parseInt(e.target.value))} />
            <Input label="Utilisateur SMTP"                  value={settings.notificationSettings?.smtpUser || ''}    onChange={e => setValue('notificationSettings.smtpUser', e.target.value)} />
            <Input label="Mot de passe SMTP"    type="password" value={settings.notificationSettings?.smtpPassword || ''} onChange={e => setValue('notificationSettings.smtpPassword', e.target.value)} />
          </div>
          <div style={{ marginTop: 16 }}>
            <Switch label="Activer emails"             checked={settings.notificationSettings?.enableEmail ?? true}  onChange={val => setValue('notificationSettings.enableEmail', val)} />
            <Switch label="Activer SMS"                checked={settings.notificationSettings?.enableSMS ?? false}   onChange={val => setValue('notificationSettings.enableSMS', val)} />
            <Switch label="Activer notifications push" checked={settings.notificationSettings?.enablePush ?? true}   onChange={val => setValue('notificationSettings.enablePush', val)} />
          </div>
        </Card>
      )}

      {/* ── Sécurité ── */}
      {activeTab === 'security' && (
        <Card style={{ padding: 24 }}>
          <h2 style={styles.sectionTitle}>Paramètres de sécurité</h2>
          <div style={styles.formGrid}>
            <Input label="Timeout session (min)"          type="number" value={settings.securitySettings?.sessionTimeout ?? 60}       onChange={e => setValue('securitySettings.sessionTimeout', parseInt(e.target.value))} />
            <Input label="Tentatives de connexion max"    type="number" value={settings.securitySettings?.maxLoginAttempts ?? 5}      onChange={e => setValue('securitySettings.maxLoginAttempts', parseInt(e.target.value))} />
            <Input label="Expiration mot de passe (jours)" type="number" value={settings.securitySettings?.passwordExpiryDays ?? 90} onChange={e => setValue('securitySettings.passwordExpiryDays', parseInt(e.target.value))} />
            <TextArea label="Domaines autorisés (séparés par des virgules)"
              value={(settings.securitySettings?.allowedDomains || []).join(', ')}
              placeholder="universite.dz, edu.dz"
              onChange={e => setValue('securitySettings.allowedDomains', e.target.value.split(',').map(d => d.trim()).filter(Boolean))} />
          </div>
          <div style={{ marginTop: 16 }}>
            <Switch label="Authentification à deux facteurs" checked={settings.securitySettings?.twoFactorAuth ?? false}            onChange={val => setValue('securitySettings.twoFactorAuth', val)} />
            <Switch label="Auto-inscription"                  checked={settings.securitySettings?.allowSelfRegistration ?? false}   onChange={val => setValue('securitySettings.allowSelfRegistration', val)} />
            <Switch label="Vérification email requise"        checked={settings.securitySettings?.requireEmailVerification ?? true} onChange={val => setValue('securitySettings.requireEmailVerification', val)} />
          </div>
        </Card>
      )}
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = {
  container: { fontFamily: 'system-ui, -apple-system, sans-serif', padding: 24, maxWidth: 1400, margin: '0 auto', minHeight: '100vh', background: '#F9FAFB' },
  toastContainer: { position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 },
  toast: { padding: '12px 20px', borderRadius: 12, fontSize: 14, fontWeight: 500, boxShadow: '0 4px 12px rgba(0,0,0,.15)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 24 },
  title: { fontSize: 24, fontWeight: 700, color: '#111', margin: 0 },
  subtitle: { fontSize: 13, color: '#6B7280', marginTop: 4 },
  tabsContainer: { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 },
  tab: { display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' },
  sectionTitle: { fontSize: 18, fontWeight: 600, color: '#111', marginBottom: 20 },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 },
  semesterCard: { background: '#F9FAFB', borderRadius: 12, padding: 16, marginBottom: 16 },
  inlineInput: { width: '100%', padding: '6px 8px', border: '1px solid #E5E7EB', borderRadius: 6, fontSize: 13, outline: 'none', boxSizing: 'border-box' },
};