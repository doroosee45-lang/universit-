// pages/teacher/TeacherProfilePage.jsx
import { useState, useEffect } from 'react';
import { Save, Lock, Bell, User, Briefcase, AlertTriangle, X, Eye, EyeOff, Phone, MapPin, Building, Mail } from 'lucide-react';
import { teacherAPI, authAPI } from '../../services/services';
import { useAuth } from '../../components/context/AuthContext';

// ---------- Composants UI locaux ----------
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

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-100 ${className}`}>{children}</div>
);

const Input = ({ label, value, onChange, placeholder, type = "text", required, error }) => (
  <div className="space-y-1.5 mb-4">
    {label && <label className="block text-sm font-medium text-gray-700">{label}{required && '*'}</label>}
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className={`w-full px-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
    />
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

const TextArea = ({ label, value, onChange, placeholder, rows = 3 }) => (
  <div className="space-y-1.5 mb-4">
    {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm resize-none"
    />
  </div>
);

const Select = ({ label, value, onChange, options, required }) => (
  <div className="space-y-1.5 mb-4">
    {label && <label className="block text-sm font-medium text-gray-700">{label}{required && '*'}</label>}
    <select
      value={value}
      onChange={onChange}
      required={required}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
    >
      <option value="">Sélectionner...</option>
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

const Button = ({ children, onClick, variant = "primary", loading = false, disabled = false, className = "" }) => {
  const base = "rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 px-4 py-2 text-sm";
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200",
    danger: "bg-red-600 text-white hover:bg-red-700",
    outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
  };
  return (
    <button onClick={onClick} disabled={disabled || loading} className={`${base} ${variants[variant]} ${className}`}>
      {loading && <Spinner size={16} />}
      {children}
    </button>
  );
};

const Switch = ({ label, checked, onChange }) => (
  <label className="flex items-center justify-between cursor-pointer py-2">
    <span className="text-sm text-gray-700">{label}</span>
    <div className="relative inline-block w-10 mr-2 align-middle select-none">
      <input type="checkbox" checked={checked} onChange={onChange} className="absolute block w-5 h-5 rounded-full bg-white border-2 appearance-none cursor-pointer transition-all checked:translate-x-5 checked:bg-indigo-600" />
      <span className={`block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer transition-all ${checked ? 'bg-indigo-600' : ''}`}></span>
    </div>
  </label>
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

function useToast() {
  const [toast, setToast] = useState({ message: '', type: '' });
  const show = (msg, type = 'success') => setToast({ message: msg, type });
  const ToastContainer = () => <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: '' })} />;
  return { toast: show, ToastContainer };
}

// ---------- Options ----------
const TITLE_OPTIONS = [
  'Professeur',
  'Maître de Conférences A',
  'Maître de Conférences B',
  'Maître Assistant A',
  'Maître Assistant B',
  'Assistant',
  'Attaché d\'enseignement',
  'Vacataire'
];

const DEPARTMENT_OPTIONS = [
  'Informatique',
  'Mathématiques',
  'Physique',
  'Chimie',
  'Biologie',
  'Lettres et Langues',
  'Droit',
  'Économie et Gestion',
  'Médecine',
  'Pharmacie'
];

const CONTRACT_OPTIONS = [
  'Permanent',
  'CDD',
  'Vacataire',
  'Stagiaire'
];

// ---------- Composant principal ----------
export default function TeacherProfilePage() {
  const { user, refreshUser } = useAuth();
  const { toast, ToastContainer } = useToast();

  // États pour les formulaires
  const [profileForm, setProfileForm] = useState({
    phone: user?.phone || '',
    address: user?.address || { street: '', city: '', wilaya: '' },
    bio: user?.bio || '',
  });
  
  const [professionalForm, setProfessionalForm] = useState({
    department: user?.department || '',
    title: user?.title || '',
    specialties: user?.specialties?.join(', ') || '',
    office: user?.office || '',
    contractType: user?.contractType || '',
  });
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [notifications, setNotifications] = useState({
    email: user?.settings?.emailNotifications !== false,
    push: user?.settings?.pushNotifications !== false,
    sms: user?.settings?.smsNotifications || false
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState({
    profile: false,
    professional: false,
    password: false,
    delete: false
  });
  const [errors, setErrors] = useState({});
  const [deleteModal, setDeleteModal] = useState(false);

  // Gestionnaires de changement
  const handleProfileChange = (field, value) => {
    setProfileForm(prev => ({ ...prev, [field]: value }));
  };
  
  const handleAddressChange = (field, value) => {
    setProfileForm(prev => ({ ...prev, address: { ...prev.address, [field]: value } }));
  };
  
  const handleProfessionalChange = (field, value) => {
    setProfessionalForm(prev => ({ ...prev, [field]: value }));
  };
  
  const handlePasswordChange = (field, value) => {
    setPasswordForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };
  
  const handleNotificationChange = (key, value) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
  };

  // Sauvegarde des informations personnelles
  const saveProfile = async () => {
    setLoading(prev => ({ ...prev, profile: true }));
    try {
      await teacherAPI.updateProfile({ 
        phone: profileForm.phone, 
        address: profileForm.address,
        bio: profileForm.bio 
      });
      await refreshUser();
      toast('Informations personnelles mises à jour');
    } catch (err) {
      toast(err.message || 'Erreur', 'error');
    } finally {
      setLoading(prev => ({ ...prev, profile: false }));
    }
  };

  // Sauvegarde des informations professionnelles
  const saveProfessional = async () => {
    setLoading(prev => ({ ...prev, professional: true }));
    try {
      const payload = {
        department: professionalForm.department,
        title: professionalForm.title,
        specialties: professionalForm.specialties ? professionalForm.specialties.split(',').map(s => s.trim()) : [],
        office: professionalForm.office,
        contractType: professionalForm.contractType,
      };
      await teacherAPI.updateProfessional(payload);
      await refreshUser();
      toast('Informations professionnelles mises à jour');
    } catch (err) {
      toast(err.message || 'Erreur', 'error');
    } finally {
      setLoading(prev => ({ ...prev, professional: false }));
    }
  };

  // Changement de mot de passe
  const changePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast('Tous les champs sont requis', 'error');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setErrors({ confirmPassword: 'Les mots de passe ne correspondent pas' });
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setErrors({ newPassword: 'Au moins 6 caractères' });
      return;
    }
    setLoading(prev => ({ ...prev, password: true }));
    try {
      await authAPI.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast('Mot de passe modifié avec succès');
    } catch (err) {
      toast(err.message || 'Erreur', 'error');
    } finally {
      setLoading(prev => ({ ...prev, password: false }));
    }
  };

  // Sauvegarde des préférences de notification
  const saveNotifications = async () => {
    setLoading(prev => ({ ...prev, notifications: true }));
    try {
      await teacherAPI.updateSettings({ notifications });
      await refreshUser();
      toast('Préférences enregistrées');
    } catch (err) {
      toast(err.message || 'Erreur', 'error');
    } finally {
      setLoading(prev => ({ ...prev, notifications: false }));
    }
  };

  // Suppression de compte
  const deleteAccount = async () => {
    setLoading(prev => ({ ...prev, delete: true }));
    try {
      await authAPI.deleteAccount();
      localStorage.removeItem('token');
      window.location.href = '/login';
    } catch (err) {
      toast(err.message || 'Erreur lors de la suppression', 'error');
      setDeleteModal(false);
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <ToastContainer />
      
      <h1 className="text-2xl font-bold text-gray-900">Paramètres du compte enseignant</h1>

      {/* Section Profil personnel */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <User size={20} className="text-indigo-600" />
          <h2 className="text-lg font-semibold text-gray-800">Informations personnelles</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-400">Nom complet</p>
            <p className="text-sm font-medium text-gray-800 mt-0.5">{user.firstName} {user.lastName}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-400">Email</p>
            <p className="text-sm font-medium text-gray-800 mt-0.5">{user.email}</p>
          </div>
          <Input 
            label="Téléphone" 
            value={profileForm.phone} 
            onChange={e => handleProfileChange('phone', e.target.value)} 
            placeholder="+213 5 XX XX XX XX"
          />
          <div className="col-span-2">
            <Input 
              label="Rue / Adresse" 
              value={profileForm.address.street} 
              onChange={e => handleAddressChange('street', e.target.value)} 
            />
          </div>
          <Input 
            label="Ville" 
            value={profileForm.address.city} 
            onChange={e => handleAddressChange('city', e.target.value)} 
          />
          <Input 
            label="Wilaya" 
            value={profileForm.address.wilaya} 
            onChange={e => handleAddressChange('wilaya', e.target.value)} 
          />
          <div className="col-span-2">
            <TextArea 
              label="Bio / Présentation" 
              value={profileForm.bio} 
              onChange={e => handleProfileChange('bio', e.target.value)} 
              placeholder="Présentation personnelle..." 
              rows={3}
            />
          </div>
        </div>
        <Button onClick={saveProfile} loading={loading.profile} className="mt-2">
          <Save size={16} /> Enregistrer
        </Button>
      </Card>

      {/* Section Professionnelle */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Briefcase size={20} className="text-indigo-600" />
          <h2 className="text-lg font-semibold text-gray-800">Informations professionnelles</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-400">ID Enseignant</p>
            <p className="text-sm font-medium text-gray-800 mt-0.5 font-mono">{user.employeeId || user._id?.slice(-8)}</p>
          </div>
          <Select
            label="Département"
            value={professionalForm.department}
            onChange={e => handleProfessionalChange('department', e.target.value)}
            options={DEPARTMENT_OPTIONS}
          />
          <Select
            label="Grade / Titre"
            value={professionalForm.title}
            onChange={e => handleProfessionalChange('title', e.target.value)}
            options={TITLE_OPTIONS}
          />
          <Select
            label="Type de contrat"
            value={professionalForm.contractType}
            onChange={e => handleProfessionalChange('contractType', e.target.value)}
            options={CONTRACT_OPTIONS}
          />
          <Input 
            label="Spécialités (séparées par des virgules)" 
            value={professionalForm.specialties} 
            onChange={e => handleProfessionalChange('specialties', e.target.value)} 
            placeholder="IA, Base de données, Réseaux, ..."
          />
          <Input 
            label="Bureau / Local" 
            value={professionalForm.office} 
            onChange={e => handleProfessionalChange('office', e.target.value)} 
            placeholder="Bâtiment A, Bureau 101"
          />
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-400">Date d'embauche</p>
            <p className="text-sm font-medium text-gray-800 mt-0.5">
              {user.hireDate ? new Date(user.hireDate).toLocaleDateString('fr-FR') : '—'}
            </p>
          </div>
        </div>
        <Button onClick={saveProfessional} loading={loading.professional} className="mt-2">
          <Save size={16} /> Mettre à jour
        </Button>
      </Card>

      {/* Section Sécurité – Mot de passe */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lock size={20} className="text-indigo-600" />
          <h2 className="text-lg font-semibold text-gray-800">Sécurité</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Input
              label="Mot de passe actuel"
              type={showPassword ? "text" : "password"}
              value={passwordForm.currentPassword}
              onChange={e => handlePasswordChange('currentPassword', e.target.value)}
              required
            />
          </div>
          <div />
          <div className="relative">
            <Input
              label="Nouveau mot de passe"
              type={showPassword ? "text" : "password"}
              value={passwordForm.newPassword}
              onChange={e => handlePasswordChange('newPassword', e.target.value)}
              required
              error={errors.newPassword}
            />
          </div>
          <div className="relative">
            <Input
              label="Confirmer le mot de passe"
              type={showPassword ? "text" : "password"}
              value={passwordForm.confirmPassword}
              onChange={e => handlePasswordChange('confirmPassword', e.target.value)}
              required
              error={errors.confirmPassword}
            />
          </div>
        </div>
        <div className="flex items-center justify-between mt-2">
          <button 
            onClick={() => setShowPassword(!showPassword)} 
            className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            {showPassword ? "Masquer" : "Afficher"} les mots de passe
          </button>
        </div>
        <Button onClick={changePassword} loading={loading.password} className="mt-4">
          <Lock size={16} /> Changer le mot de passe
        </Button>
      </Card>

      {/* Section Notifications */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Bell size={20} className="text-indigo-600" />
          <h2 className="text-lg font-semibold text-gray-800">Notifications</h2>
        </div>
        <div className="space-y-2">
          <Switch 
            label="Recevoir des notifications par email" 
            checked={notifications.email} 
            onChange={e => handleNotificationChange('email', e.target.checked)} 
          />
          <Switch 
            label="Recevoir des notifications push" 
            checked={notifications.push} 
            onChange={e => handleNotificationChange('push', e.target.checked)} 
          />
          <Switch 
            label="Recevoir des SMS" 
            checked={notifications.sms} 
            onChange={e => handleNotificationChange('sms', e.target.checked)} 
          />
        </div>
        <Button onClick={saveNotifications} loading={loading.notifications} className="mt-4">
          <Save size={16} /> Enregistrer les préférences
        </Button>
      </Card>

      {/* Section Dangereuse – Suppression de compte */}
      <Card className="p-6 border-red-200">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle size={20} className="text-red-600" />
          <h2 className="text-lg font-semibold text-red-800">Zone de danger</h2>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          La suppression de votre compte est irréversible. Toutes vos données seront effacées.
        </p>
        <Button variant="danger" onClick={() => setDeleteModal(true)}>
          <AlertTriangle size={16} /> Supprimer mon compte
        </Button>
      </Card>

      {/* Modal de confirmation de suppression */}
      <Modal isOpen={deleteModal} onClose={() => setDeleteModal(false)} title="Confirmation de suppression">
        <p className="text-gray-600 mb-4">Êtes-vous sûr de vouloir supprimer définitivement votre compte ? Cette action est irréversible.</p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setDeleteModal(false)} className="flex-1">Annuler</Button>
          <Button variant="danger" onClick={deleteAccount} loading={loading.delete} className="flex-1">Confirmer la suppression</Button>
        </div>
      </Modal>
    </div>
  );
}