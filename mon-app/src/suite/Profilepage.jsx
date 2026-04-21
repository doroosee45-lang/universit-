import { useState } from 'react';
import { Camera, Save, Lock } from 'lucide-react';
import { authAPI } from '../../api/services';
import { Button, Card, Input, Avatar, Badge, useToast, Alert } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import { getRoleLabel, getRoleColor, formatDate } from '../../utils/helpers';

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast, ToastContainer } = useToast();

  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [passLoading, setPassLoading] = useState(false);
  const [passError, setPassError] = useState('');

  const handlePassChange = async (e) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirm) { setPassError('Les mots de passe ne correspondent pas'); return; }
    if (passForm.newPassword.length < 6) { setPassError('Le mot de passe doit contenir au moins 6 caractères'); return; }
    setPassLoading(true);
    setPassError('');
    try {
      await authAPI.changePassword({ currentPassword: passForm.currentPassword, newPassword: passForm.newPassword });
      toast('Mot de passe modifié avec succès');
      setPassForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) { setPassError(err.message); }
    finally { setPassLoading(false); }
  };

  const infoItems = [
    ['Email', user?.email],
    ['Téléphone', user?.phone || '—'],
    ['Rôle', getRoleLabel(user?.role)],
    ['Membre depuis', formatDate(user?.createdAt)],
    ['Dernière connexion', formatDate(user?.lastLogin)],
    ...(user?.studentId ? [['N° Étudiant', user.studentId]] : []),
    ...(user?.employeeId ? [['N° Employé', user.employeeId]] : []),
    ...(user?.department ? [['Département', user.department]] : []),
    ...(user?.program?.name ? [['Filière', user.program.name]] : []),
    ...(user?.level ? [['Niveau', `${user.level} / ${user.currentSemester}`]] : []),
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      <ToastContainer />
      <h1 className="text-2xl font-bold text-gray-900">Mon Profil</h1>

      {/* Profile card */}
      <Card className="p-6">
        <div className="flex items-start gap-6 flex-wrap">
          <div className="relative">
            <Avatar firstName={user?.firstName} lastName={user?.lastName} photo={user?.profilePhoto} size="xl" />
            <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg hover:bg-indigo-700 transition-colors">
              <Camera size={13} className="text-white" />
            </button>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">{user?.firstName} {user?.lastName}</h2>
            <Badge className={`${getRoleColor(user?.role)} mt-1`}>{getRoleLabel(user?.role)}</Badge>
            <p className="text-sm text-gray-500 mt-1">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <div className={`w-2 h-2 rounded-full ${user?.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-xs text-gray-500">{user?.isActive ? 'Compte actif' : 'Compte inactif'}</span>
              {user?.isEmailVerified && <Badge className="bg-green-100 text-green-700 text-xs ml-1">Email vérifié ✓</Badge>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-6">
          {infoItems.map(([label, value]) => (
            <div key={label} className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-0.5">{label}</p>
              <p className="font-medium text-gray-800 text-sm">{value}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Change password */}
      <Card className="p-6">
        <h2 className="font-bold text-gray-800 flex items-center gap-2 mb-4">
          <Lock size={18} className="text-indigo-600" /> Changer le mot de passe
        </h2>
        {passError && <Alert type="error" message={passError} className="mb-4" />}
        <form onSubmit={handlePassChange} className="space-y-4">
          <Input label="Mot de passe actuel" type="password" value={passForm.currentPassword}
            onChange={e => setPassForm(f => ({ ...f, currentPassword: e.target.value }))} required />
          <Input label="Nouveau mot de passe" type="password" value={passForm.newPassword}
            onChange={e => setPassForm(f => ({ ...f, newPassword: e.target.value }))} required
            placeholder="Minimum 6 caractères" />
          <Input label="Confirmer le mot de passe" type="password" value={passForm.confirm}
            onChange={e => setPassForm(f => ({ ...f, confirm: e.target.value }))} required />
          <Button type="submit" loading={passLoading}>
            <Save size={15} /> Modifier le mot de passe
          </Button>
        </form>
      </Card>
    </div>
  );
}