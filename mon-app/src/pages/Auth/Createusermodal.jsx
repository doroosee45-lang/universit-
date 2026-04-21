import { useState } from 'react';
import { X, UserPlus, Copy, CheckCircle, Eye, EyeOff, Mail } from 'lucide-react';
import { authAPI } from '../../services/services';

const ROLES = [
  { value: 'student',     label: '🎓 Étudiant',               adminAllowed: true },
  { value: 'teacher',     label: '👨‍🏫 Enseignant',              adminAllowed: true },
  { value: 'staff',       label: '🗂️ Personnel administratif', adminAllowed: true },
  { value: 'admin',       label: '🛡️ Administrateur',          adminAllowed: false }, // super_admin only
  { value: 'super_admin', label: '⚡ Super Administrateur',    adminAllowed: false }, // super_admin only
];

const POSITIONS = ['scolarite', 'bibliotheque', 'finances', 'secretariat', 'informatique', 'autre'];
const TEACHER_TITLES = [
  'Professeur', 'Maître de Conférences A', 'Maître de Conférences B',
  'Maître Assistant A', 'Maître Assistant B', 'Attaché d\'enseignement', 'Vacataire'
];
const LEVELS = ['L1', 'L2', 'L3', 'M1', 'M2', 'D1', 'D2', 'D3', 'BTS1', 'BTS2'];

export default function CreateUserModal({ isOpen, onClose, currentUserRole }) {
  const isSuperAdmin = currentUserRole === 'super_admin';

  const [step, setStep]       = useState(1); // 1: formulaire, 2: résultat
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [result, setResult]   = useState(null);
  const [copied, setCopied]   = useState('');

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'student',
    department: '',
    position: 'secretariat',
    title: 'Maître Assistant A',
    level: 'L1',
    currentSemester: 'S1',
  });

  const availableRoles = isSuperAdmin
    ? ROLES
    : ROLES.filter(r => r.adminAllowed);

  const handleChange = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await authAPI.createUser(form);
      setResult(res.data);
      setStep(2);
    } catch (err) {
      setError(err.message || 'Erreur lors de la création du compte.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text, key) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
  };

  const reset = () => {
    setStep(1);
    setResult(null);
    setError('');
    setForm({
      firstName: '', lastName: '', email: '', role: 'student',
      department: '', position: 'secretariat',
      title: 'Maître Assistant A', level: 'L1', currentSemester: 'S1',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600/20 rounded-xl flex items-center justify-center">
              <UserPlus size={20} className="text-indigo-400" />
            </div>
            <div>
              <h2 className="font-bold text-white">Créer un compte</h2>
              <p className="text-slate-500 text-xs">Les identifiants seront envoyés par email</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition">
            <X size={16} />
          </button>
        </div>

        <div className="p-6">
          {step === 1 ? (
            /* ─── Formulaire ─── */
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-500/15 border border-red-400/25 rounded-xl text-red-300 text-sm">
                  {error}
                </div>
              )}

              {/* Rôle */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Rôle</label>
                <select value={form.role} onChange={e => handleChange('role', e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  {availableRoles.map(r => (
                    <option key={r.value} value={r.value} className="bg-slate-800">{r.label}</option>
                  ))}
                </select>
              </div>

              {/* Nom / Prénom */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Prénom</label>
                  <input value={form.firstName} onChange={e => handleChange('firstName', e.target.value)}
                    required placeholder="Ahmed"
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Nom</label>
                  <input value={form.lastName} onChange={e => handleChange('lastName', e.target.value)}
                    required placeholder="Benali"
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Email</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input type="email" value={form.email} onChange={e => handleChange('email', e.target.value)}
                    required placeholder="ahmed.benali@uni.dz"
                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>

              {/* Champs spécifiques selon rôle */}
              {(form.role === 'teacher' || form.role === 'admin' || form.role === 'staff') && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Département</label>
                  <input value={form.department} onChange={e => handleChange('department', e.target.value)}
                    placeholder="Ex: Informatique, Mathématiques…"
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              )}

              {form.role === 'teacher' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Grade</label>
                  <select value={form.title} onChange={e => handleChange('title', e.target.value)}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    {TEACHER_TITLES.map(t => <option key={t} value={t} className="bg-slate-800">{t}</option>)}
                  </select>
                </div>
              )}

              {form.role === 'staff' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Poste</label>
                  <select value={form.position} onChange={e => handleChange('position', e.target.value)}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    {POSITIONS.map(p => <option key={p} value={p} className="bg-slate-800">{p}</option>)}
                  </select>
                </div>
              )}

              {form.role === 'student' && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Niveau</label>
                    <select value={form.level} onChange={e => handleChange('level', e.target.value)}
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      {LEVELS.map(l => <option key={l} value={l} className="bg-slate-800">{l}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Semestre</label>
                    <select value={form.currentSemester} onChange={e => handleChange('currentSemester', e.target.value)}
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      {['S1','S2','S3','S4','S5','S6'].map(s => <option key={s} value={s} className="bg-slate-800">{s}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {/* Info */}
              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3 flex items-start gap-2">
                <span className="text-indigo-400 mt-0.5 shrink-0">ℹ️</span>
                <p className="text-indigo-300 text-xs">
                  Un matricule et un mot de passe temporaire seront générés automatiquement et envoyés à l'adresse email.
                </p>
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                {loading ? (
                  <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Création en cours…</>
                ) : (
                  <><UserPlus size={16} /> Créer le compte</>
                )}
              </button>
            </form>

          ) : (
            /* ─── Résultat ─── */
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <CheckCircle size={24} className="text-emerald-400 shrink-0" />
                <div>
                  <p className="text-emerald-300 font-medium">Compte créé avec succès !</p>
                  <p className="text-emerald-400/70 text-xs">Les identifiants ont été envoyés par email.</p>
                </div>
              </div>

              {/* Identifiants */}
              <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                {[
                  { label: 'Matricule',            value: result?.matricule,    key: 'matricule' },
                  { label: 'Email',                value: result?.email,        key: 'email' },
                  { label: 'Mot de passe temp.', value: result?.tempPassword, key: 'password', mono: true, sensitive: true },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between p-3.5 border-b border-white/5 last:border-0">
                    <div>
                      <p className="text-slate-500 text-xs">{item.label}</p>
                      <p className={`text-white font-medium ${item.mono ? 'font-mono text-amber-300' : ''}`}>
                        {item.value}
                      </p>
                    </div>
                    <button onClick={() => copyToClipboard(item.value, item.key)}
                      className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition">
                      {copied === item.key
                        ? <CheckCircle size={14} className="text-emerald-400" />
                        : <Copy size={14} />}
                    </button>
                  </div>
                ))}
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-amber-300/80 text-xs">
                ⚠️ Conservez le mot de passe temporaire. L'utilisateur devra le changer à la première connexion.
              </div>

              <div className="flex gap-3">
                <button onClick={reset}
                  className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-sm font-medium transition">
                  Créer un autre compte
                </button>
                <button onClick={onClose}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition">
                  Terminer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}