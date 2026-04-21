import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff, CheckCircle, Lock, AlertTriangle } from 'lucide-react';
import { useAuth, getRouteForRole } from '../../components/context/AuthContext';
import { authAPI } from '../../services/services';

// ─── Règles de validation du mot de passe ─────────────────────────────────────
const rules = [
  { id: 'length',  label: 'Au moins 8 caractères',           test: (p) => p.length >= 8 },
  { id: 'upper',   label: 'Une lettre majuscule',             test: (p) => /[A-Z]/.test(p) },
  { id: 'lower',   label: 'Une lettre minuscule',             test: (p) => /[a-z]/.test(p) },
  { id: 'digit',   label: 'Un chiffre',                      test: (p) => /\d/.test(p) },
  { id: 'special', label: 'Un caractère spécial (@#!$...)',   test: (p) => /[^A-Za-z0-9]/.test(p) },
];

const strength = (p) => {
  const score = rules.filter(r => r.test(p)).length;
  if (score <= 1) return { label: 'Très faible', color: 'bg-red-500',    width: 'w-1/5' };
  if (score === 2) return { label: 'Faible',      color: 'bg-orange-400', width: 'w-2/5' };
  if (score === 3) return { label: 'Moyen',        color: 'bg-yellow-400', width: 'w-3/5' };
  if (score === 4) return { label: 'Fort',          color: 'bg-blue-400',  width: 'w-4/5' };
  return              { label: 'Très fort',        color: 'bg-emerald-500', width: 'w-full' };
};

export default function ForceChangePasswordPage() {
  const { user, onPasswordChanged, getHomeRoute } = useAuth();
  const navigate = useNavigate();

  const [newPassword, setNewPassword]     = useState('');
  const [confirmPass, setConfirmPass]     = useState('');
  const [showNew, setShowNew]             = useState(false);
  const [showConfirm, setShowConfirm]     = useState(false);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState('');
  const [success, setSuccess]             = useState(false);

  const pw = strength(newPassword);
  const allRulesPassed = rules.every(r => r.test(newPassword));
  const passwordsMatch = newPassword === confirmPass && confirmPass.length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!allRulesPassed) { setError('Votre mot de passe ne respecte pas tous les critères.'); return; }
    if (!passwordsMatch)  { setError('Les mots de passe ne correspondent pas.'); return; }

    setLoading(true);
    setError('');

    try {
      const res = await authAPI.forceChangePassword(newPassword);
      // res.data = { token, user }
      onPasswordChanged(res.data.token, res.data.user);
      setSuccess(true);

      // Redirection après 1.5s
      setTimeout(() => {
        navigate(getHomeRoute(), { replace: true });
      }, 1500);
    } catch (err) {
      setError(err.message || 'Erreur lors du changement de mot de passe.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
      {/* Arrière-plan */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">

        {/* Icône & titre */}
        <div className="text-center mb-8">
          <div className="relative inline-flex">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-900/60">
              <Shield size={38} className="text-white" />
            </div>
            <span className="absolute -top-1 -right-1 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center">
              <AlertTriangle size={14} className="text-amber-900" />
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-4">
            Sécurisez votre compte
          </h1>
          <p className="text-slate-400 text-sm mt-2 max-w-xs mx-auto">
            Bonjour <span className="text-indigo-300 font-medium">{user?.firstName}</span>,
            vous devez définir un nouveau mot de passe personnel avant de continuer.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">

          {success ? (
            /* ─── Succès ─── */
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Mot de passe mis à jour !</h3>
              <p className="text-slate-400 text-sm">Redirection vers votre tableau de bord…</p>
              <div className="mt-4 h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full animate-[grow_1.5s_ease-in-out_forwards]"
                  style={{ animation: 'width 1.5s linear forwards', width: '0%' }}
                />
              </div>
            </div>
          ) : (
            /* ─── Formulaire ─── */
            <>
              {error && (
                <div className="mb-5 p-3 bg-red-500/15 border border-red-400/25 rounded-xl flex items-start gap-2">
                  <AlertTriangle size={15} className="text-red-400 mt-0.5 shrink-0" />
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Nouveau mot de passe */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Nouveau mot de passe</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type={showNew ? 'text' : 'password'}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="Choisissez un mot de passe fort"
                      required
                      className="w-full pl-10 pr-11 py-3 bg-white/8 border border-white/15 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition"
                    />
                    <button type="button" onClick={() => setShowNew(!showNew)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition">
                      {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {/* Barre de force */}
                  {newPassword.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="h-1.5 bg-white/10 rounded-full flex-1 overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-300 ${pw.color} ${pw.width}`} />
                        </div>
                        <span className={`ml-3 text-xs font-medium ${
                          pw.width === 'w-full' ? 'text-emerald-400' : 'text-slate-400'
                        }`}>{pw.label}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Règles */}
                <div className="grid grid-cols-1 gap-1.5">
                  {rules.map(rule => {
                    const ok = rule.test(newPassword);
                    return (
                      <div key={rule.id} className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-all duration-200 ${
                          ok ? 'bg-emerald-500' : 'bg-white/10'
                        }`}>
                          {ok && <CheckCircle size={10} className="text-white" />}
                        </div>
                        <span className={`text-xs transition-colors ${ok ? 'text-emerald-400' : 'text-slate-500'}`}>
                          {rule.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Confirmation */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Confirmer le mot de passe</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPass}
                      onChange={e => setConfirmPass(e.target.value)}
                      placeholder="Répétez le mot de passe"
                      required
                      className={`w-full pl-10 pr-11 py-3 bg-white/8 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition ${
                        confirmPass.length > 0
                          ? passwordsMatch
                            ? 'border-emerald-500/50'
                            : 'border-red-500/50'
                          : 'border-white/15'
                      }`}
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition">
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {confirmPass.length > 0 && !passwordsMatch && (
                    <p className="text-xs text-red-400">Les mots de passe ne correspondent pas.</p>
                  )}
                </div>

                {/* Bouton */}
                <button
                  type="submit"
                  disabled={loading || !allRulesPassed || !passwordsMatch}
                  className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-indigo-900/40 mt-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Mise à jour…
                    </>
                  ) : (
                    <>
                      <Shield size={16} />
                      Définir mon mot de passe
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Info matricule */}
        {user?.matricule && (
          <p className="text-center text-slate-600 text-xs mt-4">
            Matricule : <span className="text-slate-400 font-mono">{user.matricule}</span>
          </p>
        )}
      </div>
    </div>
  );
}