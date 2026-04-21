// // pages/teacher/TeacherSettingsPage.jsx
// import { useState, useEffect } from 'react';
// import { Save, Lock, Bell, User, Briefcase, AlertTriangle, X, Shield } from 'lucide-react';
// import { teacherAPI, authAPI } from '../../services/services';
// import { useAuth } from '../../components/context/AuthContext';

// // ---------- Composants UI locaux ----------
// const Toast = ({ message, type, onClose }) => {
//   if (!message) return null;
//   const bgColor = type === 'error' ? 'bg-red-500' : 'bg-green-500';
//   return (
//     <div className={`fixed bottom-4 right-4 z-50 ${bgColor} text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2`}>
//       <span>{message}</span>
//       <button onClick={onClose} className="hover:opacity-80"><X size={16} /></button>
//     </div>
//   );
// };

// const Spinner = ({ size = 24 }) => (
//   <div className="flex justify-center items-center">
//     <div className={`border-2 border-indigo-600 border-t-transparent rounded-full animate-spin`} style={{ width: size, height: size }} />
//   </div>
// );

// const Card = ({ children, className = "" }) => (
//   <div className={`bg-white rounded-xl shadow-sm border border-gray-100 ${className}`}>{children}</div>
// );

// const Input = ({ label, value, onChange, placeholder, type = "text", required, error }) => (
//   <div className="space-y-1.5 mb-4">
//     {label && <label className="block text-sm font-medium text-gray-700">{label}{required && '*'}</label>}
//     <input
//       type={type}
//       value={value}
//       onChange={onChange}
//       placeholder={placeholder}
//       required={required}
//       className={`w-full px-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
//     />
//     {error && <p className="text-xs text-red-500">{error}</p>}
//   </div>
// );

// const Select = ({ label, value, onChange, options, required }) => (
//   <div className="space-y-1.5 mb-4">
//     {label && <label className="block text-sm font-medium text-gray-700">{label}{required && '*'}</label>}
//     <select
//       value={value}
//       onChange={onChange}
//       required={required}
//       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
//     >
//       {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
//     </select>
//   </div>
// );

// const Button = ({ children, onClick, variant = "primary", loading = false, disabled = false, className = "" }) => {
//   const base = "rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 px-4 py-2 text-sm";
//   const variants = {
//     primary: "bg-indigo-600 text-white hover:bg-indigo-700",
//     secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200",
//     danger: "bg-red-600 text-white hover:bg-red-700",
//     outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
//   };
//   return (
//     <button onClick={onClick} disabled={disabled || loading} className={`${base} ${variants[variant]} ${className}`}>
//       {loading && <Spinner size={16} />}
//       {children}
//     </button>
//   );
// };

// const Switch = ({ label, checked, onChange }) => (
//   <label className="flex items-center justify-between cursor-pointer py-2">
//     <span className="text-sm text-gray-700">{label}</span>
//     <div className="relative inline-block w-10 mr-2 align-middle select-none">
//       <input type="checkbox" checked={checked} onChange={onChange} className="absolute block w-5 h-5 rounded-full bg-white border-2 appearance-none cursor-pointer transition-all checked:translate-x-5 checked:bg-indigo-600" />
//       <span className={`block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer transition-all ${checked ? 'bg-indigo-600' : ''}`}></span>
//     </div>
//   </label>
// );

// const Modal = ({ isOpen, onClose, title, children }) => {
//   if (!isOpen) return null;
//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
//       <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
//         <div className="flex justify-between items-center p-4 border-b">
//           <h3 className="text-lg font-semibold">{title}</h3>
//           <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100"><X size={20} /></button>
//         </div>
//         <div className="p-4">{children}</div>
//       </div>
//     </div>
//   );
// };

// function useToast() {
//   const [toast, setToast] = useState({ message: '', type: '' });
//   const show = (msg, type = 'success') => setToast({ message: msg, type });
//   const ToastContainer = () => <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: '' })} />;
//   return { toast: show, ToastContainer };
// }

// // ---------- Composant principal ----------
// export default function TeacherSettingsPage() {
//   const { user, refreshUser } = useAuth();
//   const { toast, ToastContainer } = useToast();

//   // États pour les formulaires
//   const [profileForm, setProfileForm] = useState({
//     phone: user?.phone || '',
//     address: user?.address || { street: '', city: '', wilaya: '' }
//   });
//   const [professionalForm, setProfessionalForm] = useState({
//     department: user?.department || '',
//     speciality: user?.speciality || '',
//     title: user?.title || '' // Maître de conférences, Professeur, etc.
//   });
//   const [passwordForm, setPasswordForm] = useState({
//     currentPassword: '',
//     newPassword: '',
//     confirmPassword: ''
//   });
//   const [notifications, setNotifications] = useState({
//     email: user?.settings?.emailNotifications !== false,
//     push: user?.settings?.pushNotifications !== false,
//     sms: user?.settings?.smsNotifications || false
//   });
//   const [loading, setLoading] = useState({
//     profile: false,
//     professional: false,
//     password: false,
//     delete: false
//   });
//   const [errors, setErrors] = useState({});
//   const [deleteModal, setDeleteModal] = useState(false);

//   // Options pour les formulaires professionnels
//   const departmentOptions = [
//     { value: '', label: 'Sélectionner un département' },
//     { value: 'informatique', label: 'Informatique' },
//     { value: 'mathematiques', label: 'Mathématiques' },
//     { value: 'physique', label: 'Physique' },
//     { value: 'chimie', label: 'Chimie' },
//     { value: 'biologie', label: 'Biologie' },
//     { value: 'lettres', label: 'Lettres et Langues' },
//     { value: 'droit', label: 'Droit' },
//     { value: 'economie', label: 'Économie et Gestion' }
//   ];
//   const titleOptions = [
//     { value: '', label: 'Sélectionner un grade' },
//     { value: 'assistant', label: 'Assistant' },
//     { value: 'maitre_assistant', label: 'Maître Assistant' },
//     { value: 'maitre_conference', label: 'Maître de Conférences' },
//     { value: 'professeur', label: 'Professeur' }
//   ];

//   // Gestionnaires de changement
//   const handleProfileChange = (field, value) => {
//     setProfileForm(prev => ({ ...prev, [field]: value }));
//   };
//   const handleAddressChange = (field, value) => {
//     setProfileForm(prev => ({ ...prev, address: { ...prev.address, [field]: value } }));
//   };
//   const handleProfessionalChange = (field, value) => {
//     setProfessionalForm(prev => ({ ...prev, [field]: value }));
//   };
//   const handlePasswordChange = (field, value) => {
//     setPasswordForm(prev => ({ ...prev, [field]: value }));
//     if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
//   };
//   const handleNotificationChange = (key, value) => {
//     setNotifications(prev => ({ ...prev, [key]: value }));
//   };

//   // Sauvegarde des informations personnelles
//   const saveProfile = async () => {
//     setLoading(prev => ({ ...prev, profile: true }));
//     try {
//       await teacherAPI.updateProfile({ phone: profileForm.phone, address: profileForm.address });
//       await refreshUser();
//       toast('Informations personnelles mises à jour');
//     } catch (err) {
//       toast(err.message || 'Erreur', 'error');
//     } finally {
//       setLoading(prev => ({ ...prev, profile: false }));
//     }
//   };

//   // Sauvegarde des informations professionnelles
//   const saveProfessional = async () => {
//     if (!professionalForm.department) {
//       toast('Le département est requis', 'error');
//       return;
//     }
//     setLoading(prev => ({ ...prev, professional: true }));
//     try {
//       await teacherAPI.updateProfessional(professionalForm);
//       await refreshUser();
//       toast('Informations professionnelles mises à jour');
//     } catch (err) {
//       toast(err.message || 'Erreur', 'error');
//     } finally {
//       setLoading(prev => ({ ...prev, professional: false }));
//     }
//   };

//   // Changement de mot de passe
//   const changePassword = async () => {
//     if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
//       toast('Tous les champs sont requis', 'error');
//       return;
//     }
//     if (passwordForm.newPassword !== passwordForm.confirmPassword) {
//       setErrors({ confirmPassword: 'Les mots de passe ne correspondent pas' });
//       return;
//     }
//     if (passwordForm.newPassword.length < 6) {
//       setErrors({ newPassword: 'Au moins 6 caractères' });
//       return;
//     }
//     setLoading(prev => ({ ...prev, password: true }));
//     try {
//       await authAPI.changePassword({
//         currentPassword: passwordForm.currentPassword,
//         newPassword: passwordForm.newPassword
//       });
//       setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
//       toast('Mot de passe modifié avec succès');
//     } catch (err) {
//       toast(err.message || 'Erreur', 'error');
//     } finally {
//       setLoading(prev => ({ ...prev, password: false }));
//     }
//   };

//   // Sauvegarde des préférences de notification
//   const saveNotifications = async () => {
//     setLoading(prev => ({ ...prev, notifications: true }));
//     try {
//       await teacherAPI.updateSettings({ notifications });
//       await refreshUser();
//       toast('Préférences enregistrées');
//     } catch (err) {
//       toast(err.message || 'Erreur', 'error');
//     } finally {
//       setLoading(prev => ({ ...prev, notifications: false }));
//     }
//   };

//   // Suppression de compte
//   const deleteAccount = async () => {
//     setLoading(prev => ({ ...prev, delete: true }));
//     try {
//       await authAPI.deleteAccount();
//       localStorage.removeItem('token');
//       window.location.href = '/login';
//     } catch (err) {
//       toast(err.message || 'Erreur lors de la suppression', 'error');
//       setDeleteModal(false);
//     } finally {
//       setLoading(prev => ({ ...prev, delete: false }));
//     }
//   };

//   if (!user) return <div className="flex justify-center items-center h-64"><Spinner size={40} /></div>;

//   return (
//     <div className="space-y-6 max-w-3xl mx-auto">
//       <ToastContainer />
//       <h1 className="text-2xl font-bold text-gray-900">Paramètres du compte enseignant</h1>

//       {/* Section Profil personnel */}
//       <Card className="p-6">
//         <div className="flex items-center gap-2 mb-4">
//           <User size={20} className="text-indigo-600" />
//           <h2 className="text-lg font-semibold text-gray-800">Informations personnelles</h2>
//         </div>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <Input label="Téléphone" value={profileForm.phone} onChange={e => handleProfileChange('phone', e.target.value)} />
//           <Input label="Rue" value={profileForm.address.street} onChange={e => handleAddressChange('street', e.target.value)} />
//           <Input label="Ville" value={profileForm.address.city} onChange={e => handleAddressChange('city', e.target.value)} />
//           <Input label="Wilaya" value={profileForm.address.wilaya} onChange={e => handleAddressChange('wilaya', e.target.value)} />
//         </div>
//         <Button onClick={saveProfile} loading={loading.profile} className="mt-2"><Save size={16} /> Enregistrer</Button>
//       </Card>

//       {/* Section Professionnelle */}
//       <Card className="p-6">
//         <div className="flex items-center gap-2 mb-4">
//           <Briefcase size={20} className="text-indigo-600" />
//           <h2 className="text-lg font-semibold text-gray-800">Informations professionnelles</h2>
//         </div>
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <Select
//             label="Département"
//             value={professionalForm.department}
//             onChange={e => handleProfessionalChange('department', e.target.value)}
//             options={departmentOptions}
//             required
//           />
//           <Input
//             label="Spécialité"
//             value={professionalForm.speciality}
//             onChange={e => handleProfessionalChange('speciality', e.target.value)}
//             placeholder="ex: Intelligence Artificielle"
//           />
//           <Select
//             label="Grade"
//             value={professionalForm.title}
//             onChange={e => handleProfessionalChange('title', e.target.value)}
//             options={titleOptions}
//           />
//         </div>
//         <Button onClick={saveProfessional} loading={loading.professional} className="mt-2"><Save size={16} /> Mettre à jour</Button>
//       </Card>

//       {/* Section Sécurité – Mot de passe */}
//       <Card className="p-6">
//         <div className="flex items-center gap-2 mb-4">
//           <Lock size={20} className="text-indigo-600" />
//           <h2 className="text-lg font-semibold text-gray-800">Sécurité</h2>
//         </div>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <Input
//             label="Mot de passe actuel"
//             type="password"
//             value={passwordForm.currentPassword}
//             onChange={e => handlePasswordChange('currentPassword', e.target.value)}
//             required
//           />
//           <div />
//           <Input
//             label="Nouveau mot de passe"
//             type="password"
//             value={passwordForm.newPassword}
//             onChange={e => handlePasswordChange('newPassword', e.target.value)}
//             required
//             error={errors.newPassword}
//           />
//           <Input
//             label="Confirmer le mot de passe"
//             type="password"
//             value={passwordForm.confirmPassword}
//             onChange={e => handlePasswordChange('confirmPassword', e.target.value)}
//             required
//             error={errors.confirmPassword}
//           />
//         </div>
//         <Button onClick={changePassword} loading={loading.password} className="mt-2"><Lock size={16} /> Changer le mot de passe</Button>
//       </Card>

//       {/* Section Notifications */}
//       <Card className="p-6">
//         <div className="flex items-center gap-2 mb-4">
//           <Bell size={20} className="text-indigo-600" />
//           <h2 className="text-lg font-semibold text-gray-800">Notifications</h2>
//         </div>
//         <div className="space-y-2">
//           <Switch label="Recevoir des notifications par email" checked={notifications.email} onChange={e => handleNotificationChange('email', e.target.checked)} />
//           <Switch label="Recevoir des notifications push" checked={notifications.push} onChange={e => handleNotificationChange('push', e.target.checked)} />
//           <Switch label="Recevoir des SMS" checked={notifications.sms} onChange={e => handleNotificationChange('sms', e.target.checked)} />
//         </div>
//         <Button onClick={saveNotifications} loading={loading.notifications} className="mt-4"><Save size={16} /> Enregistrer les préférences</Button>
//       </Card>

//       {/* Section Dangereuse – Suppression de compte */}
//       <Card className="p-6 border-red-200">
//         <div className="flex items-center gap-2 mb-4">
//           <AlertTriangle size={20} className="text-red-600" />
//           <h2 className="text-lg font-semibold text-red-800">Zone de danger</h2>
//         </div>
//         <p className="text-sm text-gray-500 mb-4">
//           La suppression de votre compte est irréversible. Toutes vos données seront effacées.
//         </p>
//         <Button variant="danger" onClick={() => setDeleteModal(true)}><AlertTriangle size={16} /> Supprimer mon compte</Button>
//       </Card>

//       {/* Modal de confirmation de suppression */}
//       <Modal isOpen={deleteModal} onClose={() => setDeleteModal(false)} title="Confirmation de suppression">
//         <p className="text-gray-600 mb-4">Êtes-vous sûr de vouloir supprimer définitivement votre compte ? Cette action est irréversible.</p>
//         <div className="flex gap-3">
//           <Button variant="outline" onClick={() => setDeleteModal(false)} className="flex-1">Annuler</Button>
//           <Button variant="danger" onClick={deleteAccount} loading={loading.delete} className="flex-1">Confirmer la suppression</Button>
//         </div>
//       </Modal>
//     </div>
//   );
// }




// pages/teacher/TeacherSettingsPage.jsx
import { useState, useEffect } from 'react';
import { Save, Lock, Bell, User, Briefcase, AlertTriangle, X } from 'lucide-react';
import { teacherAPI, authAPI } from '../../services/services';
import { useAuth } from '../../components/context/AuthContext';

// ─── Composants UI ────────────────────────────────────────────────────────────
const Toast = ({ message, type, onClose }) => {
  if (!message) return null;
  return (
    <div style={{
      position: 'fixed', bottom: 16, right: 16, zIndex: 9999,
      background: type === 'error' ? '#EF4444' : '#22C55E',
      color: '#fff', padding: '10px 16px', borderRadius: 8,
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      display: 'flex', alignItems: 'center', gap: 8, fontSize: 14,
    }}>
      <span>{message}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', lineHeight: 1 }}>
        <X size={16} />
      </button>
    </div>
  );
};

function useToast() {
  const [toast, setToast] = useState({ message: '', type: '' });
  const show = (msg, type = 'success') => {
    setToast({ message: msg, type });
    setTimeout(() => setToast({ message: '', type: '' }), 3500);
  };
  const ToastContainer = () => (
    <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: '' })} />
  );
  return { toast: show, ToastContainer };
}

const Spinner = ({ size = 24 }) => (
  <div style={{ width: size, height: size, border: '2px solid #E5E7EB', borderTopColor: '#4F46E5', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
);

const Card = ({ children }) => (
  <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: 24, marginBottom: 20 }}>
    {children}
  </div>
);

const SectionHeader = ({ icon: Icon, title, color = '#4F46E5' }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
    <Icon size={20} color={color} />
    <h2 style={{ fontSize: 17, fontWeight: 600, color: '#1F2937', margin: 0 }}>{title}</h2>
  </div>
);

const inputStyle = (error) => ({
  width: '100%', padding: '8px 12px', fontSize: 13, boxSizing: 'border-box',
  border: `1px solid ${error ? '#EF4444' : '#E5E7EB'}`, borderRadius: 8, outline: 'none',
});

const Input = ({ label, value, onChange, placeholder, type = 'text', required, error }) => (
  <div style={{ marginBottom: 16 }}>
    {label && (
      <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#6B7280', marginBottom: 6 }}>
        {label}{required && ' *'}
      </label>
    )}
    <input type={type} value={value ?? ''} onChange={onChange} placeholder={placeholder} required={required}
      style={inputStyle(error)}
      onFocus={e => e.target.style.borderColor = '#6366F1'}
      onBlur={e => e.target.style.borderColor = error ? '#EF4444' : '#E5E7EB'}
    />
    {error && <p style={{ fontSize: 11, color: '#EF4444', marginTop: 4 }}>{error}</p>}
  </div>
);

const Select = ({ label, value, onChange, options, required }) => (
  <div style={{ marginBottom: 16 }}>
    {label && (
      <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#6B7280', marginBottom: 6 }}>
        {label}{required && ' *'}
      </label>
    )}
    <select value={value ?? ''} onChange={onChange} required={required}
      style={{ ...inputStyle(false), background: '#fff', cursor: 'pointer' }}>
      {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
  </div>
);

const Button = ({ children, onClick, variant = 'primary', loading = false, disabled = false, style = {} }) => {
  const variants = {
    primary: { background: '#4F46E5', color: '#fff', border: 'none' },
    danger:  { background: '#EF4444', color: '#fff', border: 'none' },
    outline: { background: '#fff',    color: '#374151', border: '1px solid #E5E7EB' },
  };
  return (
    <button onClick={onClick} disabled={disabled || loading}
      style={{ ...variants[variant], padding: '8px 16px', fontSize: 13, fontWeight: 500, borderRadius: 8,
        cursor: disabled || loading ? 'not-allowed' : 'pointer', opacity: disabled || loading ? 0.6 : 1,
        display: 'inline-flex', alignItems: 'center', gap: 6, transition: 'all 0.2s', ...style }}>
      {loading && <Spinner size={15} />}
      {children}
    </button>
  );
};

const Switch = ({ label, checked, onChange }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
    <span style={{ fontSize: 13, color: '#374151' }}>{label}</span>
    <button type="button" onClick={() => onChange(!checked)}
      style={{ width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
        background: checked ? '#4F46E5' : '#D1D5DB', position: 'relative', transition: 'background 0.2s' }}>
      <div style={{ width: 20, height: 20, borderRadius: 10, background: '#fff',
        position: 'absolute', top: 2, left: checked ? 22 : 2, transition: 'left 0.2s' }} />
    </button>
  </div>
);

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 12, width: '100%', maxWidth: 440, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #E5E7EB' }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}><X size={20} /></button>
        </div>
        <div style={{ padding: 20 }}>{children}</div>
      </div>
    </div>
  );
};

// ─── Composant principal ──────────────────────────────────────────────────────
export default function TeacherSettingsPage() {
  const { user, refreshUser } = useAuth();
  const { toast, ToastContainer } = useToast();

  const [profileForm, setProfileForm] = useState({
    phone: user?.phone || '',
    address: user?.address || { street: '', city: '', wilaya: '' },
  });

  const [professionalForm, setProfessionalForm] = useState({
    department: user?.department || '',
    speciality: user?.speciality || '',
    title:      user?.title      || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '', newPassword: '', confirmPassword: '',
  });

  const [notifications, setNotifications] = useState({
    email: user?.settings?.emailNotifications !== false,
    push:  user?.settings?.pushNotifications  !== false,
    sms:   user?.settings?.smsNotifications   || false,
  });

  const [loading, setLoading] = useState({
    profile: false, professional: false, password: false,
    notifications: false, delete: false,
  });

  const [errors,      setErrors]      = useState({});
  const [deleteModal, setDeleteModal] = useState(false);

  // Sync form si user change
  useEffect(() => {
    if (!user) return;
    setProfileForm({ phone: user.phone || '', address: user.address || { street: '', city: '', wilaya: '' } });
    setProfessionalForm({ department: user.department || '', speciality: user.speciality || '', title: user.title || '' });
    setNotifications({
      email: user.settings?.emailNotifications !== false,
      push:  user.settings?.pushNotifications  !== false,
      sms:   user.settings?.smsNotifications   || false,
    });
  }, [user]);

  const departmentOptions = [
    { value: '', label: 'Sélectionner un département' },
    { value: 'informatique',  label: 'Informatique' },
    { value: 'mathematiques', label: 'Mathématiques' },
    { value: 'physique',      label: 'Physique' },
    { value: 'chimie',        label: 'Chimie' },
    { value: 'biologie',      label: 'Biologie' },
    { value: 'lettres',       label: 'Lettres et Langues' },
    { value: 'droit',         label: 'Droit' },
    { value: 'economie',      label: 'Économie et Gestion' },
  ];

  const titleOptions = [
    { value: '', label: 'Sélectionner un grade' },
    { value: 'assistant',         label: 'Assistant' },
    { value: 'maitre_assistant',  label: 'Maître Assistant' },
    { value: 'maitre_conference', label: 'Maître de Conférences' },
    { value: 'professeur',        label: 'Professeur' },
  ];

  const setLoad = (key, val) => setLoading(prev => ({ ...prev, [key]: val }));

  // Sauvegarde profil
  const saveProfile = async () => {
    setLoad('profile', true);
    try {
      await teacherAPI.updateProfile({ phone: profileForm.phone, address: profileForm.address });
      await refreshUser();
      toast('Informations personnelles mises à jour');
    } catch (err) {
      toast(err?.message || 'Erreur', 'error');
    } finally { setLoad('profile', false); }
  };

  // Sauvegarde infos professionnelles
  const saveProfessional = async () => {
    if (!professionalForm.department) {
      toast('Le département est requis', 'error'); return;
    }
    setLoad('professional', true);
    try {
      await teacherAPI.updateProfessional(professionalForm);
      await refreshUser();
      toast('Informations professionnelles mises à jour');
    } catch (err) {
      toast(err?.message || 'Erreur', 'error');
    } finally { setLoad('professional', false); }
  };

  // Changement mot de passe
  const changePassword = async () => {
    setErrors({});
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast('Tous les champs sont requis', 'error'); return;
    }
    if (passwordForm.newPassword.length < 6) {
      setErrors({ newPassword: 'Au moins 6 caractères' }); return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setErrors({ confirmPassword: 'Les mots de passe ne correspondent pas' }); return;
    }
    setLoad('password', true);
    try {
      await authAPI.changePassword({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast('Mot de passe modifié avec succès');
    } catch (err) {
      toast(err?.message || 'Erreur', 'error');
    } finally { setLoad('password', false); }
  };

  // Sauvegarde notifications
  const saveNotifications = async () => {
    setLoad('notifications', true);
    try {
      await teacherAPI.updateSettings({ notifications });
      await refreshUser();
      toast('Préférences enregistrées');
    } catch (err) {
      toast(err?.message || 'Erreur', 'error');
    } finally { setLoad('notifications', false); }
  };

  // Suppression compte
  const deleteAccount = async () => {
    setLoad('delete', true);
    try {
      await authAPI.deleteAccount();
      localStorage.removeItem('token');
      window.location.href = '/login';
    } catch (err) {
      toast(err?.message || 'Erreur lors de la suppression', 'error');
      setDeleteModal(false);
    } finally { setLoad('delete', false); }
  };

  if (!user) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 256 }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <Spinner size={40} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 768, margin: '0 auto', padding: '0 16px' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <ToastContainer />
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 24 }}>Paramètres du compte enseignant</h1>

      {/* Profil personnel */}
      <Card>
        <SectionHeader icon={User} title="Informations personnelles" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
          <Input label="Téléphone" value={profileForm.phone}          onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))} />
          <Input label="Rue"       value={profileForm.address.street} onChange={e => setProfileForm(p => ({ ...p, address: { ...p.address, street: e.target.value } }))} />
          <Input label="Ville"     value={profileForm.address.city}   onChange={e => setProfileForm(p => ({ ...p, address: { ...p.address, city: e.target.value } }))} />
          <Input label="Wilaya"    value={profileForm.address.wilaya} onChange={e => setProfileForm(p => ({ ...p, address: { ...p.address, wilaya: e.target.value } }))} />
        </div>
        <Button onClick={saveProfile} loading={loading.profile}><Save size={15} /> Enregistrer</Button>
      </Card>

      {/* Informations professionnelles */}
      <Card>
        <SectionHeader icon={Briefcase} title="Informations professionnelles" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          <Select label="Département" value={professionalForm.department} onChange={e => setProfessionalForm(p => ({ ...p, department: e.target.value }))} options={departmentOptions} required />
          <Input  label="Spécialité"  value={professionalForm.speciality} onChange={e => setProfessionalForm(p => ({ ...p, speciality: e.target.value }))} placeholder="ex: Intelligence Artificielle" />
          <Select label="Grade"       value={professionalForm.title}      onChange={e => setProfessionalForm(p => ({ ...p, title: e.target.value }))}      options={titleOptions} />
        </div>
        <Button onClick={saveProfessional} loading={loading.professional}><Save size={15} /> Mettre à jour</Button>
      </Card>

      {/* Sécurité – Mot de passe */}
      <Card>
        <SectionHeader icon={Lock} title="Sécurité" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
          <Input label="Mot de passe actuel"       type="password" value={passwordForm.currentPassword}  onChange={e => setPasswordForm(p => ({ ...p, currentPassword: e.target.value }))}  required />
          <div />
          <Input label="Nouveau mot de passe"      type="password" value={passwordForm.newPassword}      onChange={e => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))}      required error={errors.newPassword} />
          <Input label="Confirmer le mot de passe" type="password" value={passwordForm.confirmPassword}  onChange={e => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))}  required error={errors.confirmPassword} />
        </div>
        <Button onClick={changePassword} loading={loading.password}><Lock size={15} /> Changer le mot de passe</Button>
      </Card>

      {/* Notifications */}
      <Card>
        <SectionHeader icon={Bell} title="Notifications" />
        <Switch label="Recevoir des notifications par email" checked={notifications.email} onChange={val => setNotifications(p => ({ ...p, email: val }))} />
        <Switch label="Recevoir des notifications push"      checked={notifications.push}  onChange={val => setNotifications(p => ({ ...p, push: val }))} />
        <Switch label="Recevoir des SMS"                     checked={notifications.sms}   onChange={val => setNotifications(p => ({ ...p, sms: val }))} />
        <div style={{ marginTop: 8 }}>
          <Button onClick={saveNotifications} loading={loading.notifications}><Save size={15} /> Enregistrer les préférences</Button>
        </div>
      </Card>

      {/* Zone de danger */}
      <Card>
        <SectionHeader icon={AlertTriangle} title="Zone de danger" color="#EF4444" />
        <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 16 }}>
          La suppression de votre compte est irréversible. Toutes vos données seront effacées.
        </p>
        <Button variant="danger" onClick={() => setDeleteModal(true)}><AlertTriangle size={15} /> Supprimer mon compte</Button>
      </Card>

      {/* Modal confirmation */}
      <Modal isOpen={deleteModal} onClose={() => setDeleteModal(false)} title="Confirmation de suppression">
        <p style={{ fontSize: 14, color: '#4B5563', marginBottom: 20 }}>
          Êtes-vous sûr de vouloir supprimer définitivement votre compte ? Cette action est irréversible.
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <Button variant="outline" onClick={() => setDeleteModal(false)} style={{ flex: 1, justifyContent: 'center' }}>Annuler</Button>
          <Button variant="danger"  onClick={deleteAccount} loading={loading.delete} style={{ flex: 1, justifyContent: 'center' }}>Confirmer la suppression</Button>
        </div>
      </Modal>
    </div>
  );
}