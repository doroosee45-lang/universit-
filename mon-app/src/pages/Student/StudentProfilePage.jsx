// pages/teacher/TeacherProfilePage.jsx
import { useState } from 'react';
import { Save, X } from 'lucide-react';
import { teacherAPI } from '../../services/services';
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

const Badge = ({ children, className }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>{children}</span>
);

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-100 ${className}`}>{children}</div>
);

const Input = ({ label, value, onChange, placeholder, type = "text", required }) => (
  <div className="space-y-1.5">
    {label && <label className="block text-sm font-medium text-gray-700">{label}{required && '*'}</label>}
    <input type={type} value={value} onChange={onChange} placeholder={placeholder} required={required}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm" />
  </div>
);

const Button = ({ children, onClick, variant = "primary", loading = false, disabled = false }) => {
  const base = "rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 px-4 py-2 text-sm";
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200"
  };
  return (
    <button onClick={onClick} disabled={disabled || loading} className={`${base} ${variants[variant]}`}>
      {loading && <Spinner size={16} />}
      {children}
    </button>
  );
};

const Avatar = ({ firstName, lastName, photo, size = "md" }) => {
  const initials = `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase() || '?';
  const sizeClass = size === "sm" ? "w-8 h-8 text-xs" : size === "md" ? "w-12 h-12 text-base" : "w-20 h-20 text-xl";
  if (photo) return <img src={photo} alt={`${firstName} ${lastName}`} className={`${sizeClass} rounded-full object-cover`} />;
  return <div className={`${sizeClass} rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-medium`}>{initials}</div>;
};

function useToast() {
  const [toast, setToast] = useState({ message: '', type: '' });
  const show = (msg, type = 'success') => setToast({ message: msg, type });
  const ToastContainer = () => <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: '' })} />;
  return { toast: show, ToastContainer };
}

const formatDate = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('fr-FR');
};

// ---------- Composant principal ----------
export default function TeacherProfilePage() {
  const { user } = useAuth();
  const { toast, ToastContainer } = useToast();
  const [form, setForm] = useState({
    phone: user?.phone || '',
    address: user?.address || { street: '', city: '', wilaya: '' },
    department: user?.department || '',
    title: user?.title || '',
    specialties: user?.specialties?.join(', ') || '',
    office: user?.office || '',
    bio: user?.bio || '',
  });
  const [saving, setSaving] = useState(false);

  const setField = (key, value) => setForm(f => ({ ...f, [key]: value }));
  const setAddress = (key, value) => setForm(f => ({ ...f, address: { ...f.address, [key]: value } }));

  const handleSave = async () => {
    if (!user?._id) return;
    setSaving(true);
    try {
      const payload = {
        phone: form.phone,
        address: form.address,
        department: form.department,
        title: form.title,
        specialties: form.specialties ? form.specialties.split(',').map(s => s.trim()) : [],
        office: form.office,
        bio: form.bio,
      };
      await teacherAPI.update(user._id, payload);
      toast('Profil mis à jour');
    } catch (err) {
      toast(err.message || 'Erreur lors de la mise à jour', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return <div className="flex justify-center items-center h-64"><Spinner size={40} /></div>;
  }

  const titleOptions = [
    'Professeur', 'Maître de Conférences A', 'Maître de Conférences B',
    'Maître Assistant A', 'Maître Assistant B', 'Attaché d\'enseignement', 'Vacataire'
  ];

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <ToastContainer />
      <h1 className="text-2xl font-bold text-gray-900">Mon Profil Enseignant</h1>

      {/* Carte d'identité */}
      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Avatar firstName={user.firstName} lastName={user.lastName} photo={user.profilePhoto} size="xl" />
          <div>
            <h2 className="text-xl font-bold text-gray-900">{user.firstName} {user.lastName}</h2>
            <p className="text-sm text-indigo-600 font-mono">{user.employeeId || user._id}</p>
            <div className="flex gap-2 mt-1">
              <Badge className="bg-indigo-100 text-indigo-700">{user.department || 'Département'}</Badge>
              <Badge className="bg-gray-100 text-gray-600">{user.title || 'Grade'}</Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            ['Email', user.email],
            ['Téléphone', user.phone || '—'],
            ['Date d\'embauche', formatDate(user.hireDate)],
            ['Type de contrat', user.contractType || '—'],
          ].map(([label, value]) => (
            <div key={label} className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400">{label}</p>
              <p className="text-sm font-medium text-gray-800 mt-0.5">{value}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Coordonnées modifiables */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-800 mb-4">Coordonnées</h3>
        <div className="space-y-4">
          <Input label="Téléphone" value={form.phone} onChange={e => setField('phone', e.target.value)} />
          <Input label="Rue" value={form.address.street} onChange={e => setAddress('street', e.target.value)} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Ville" value={form.address.city} onChange={e => setAddress('city', e.target.value)} />
            <Input label="Wilaya" value={form.address.wilaya} onChange={e => setAddress('wilaya', e.target.value)} />
          </div>
        </div>
      </Card>

      {/* Informations professionnelles */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-800 mb-4">Informations professionnelles</h3>
        <div className="space-y-4">
          <Input label="Département" value={form.department} onChange={e => setField('department', e.target.value)} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
            <select
              value={form.title}
              onChange={e => setField('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Sélectionner un grade</option>
              {titleOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          <Input label="Spécialités (séparées par des virgules)" value={form.specialties} onChange={e => setField('specialties', e.target.value)} placeholder="IA, Base de données, ..." />
          <Input label="Bureau" value={form.office} onChange={e => setField('office', e.target.value)} />
          <Input label="Bio / Présentation" value={form.bio} onChange={e => setField('bio', e.target.value)} textarea rows={3} />
        </div>
        <Button onClick={handleSave} loading={saving} className="mt-2"><Save size={16} /> Sauvegarder</Button>
      </Card>
    </div>
  );
}