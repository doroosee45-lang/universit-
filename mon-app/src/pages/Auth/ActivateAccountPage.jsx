import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, Shield } from 'lucide-react';
import { useAuth } from '../../components/context/AuthContext';
import { authAPI } from '../../services/services';

export default function ActivateAccountPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { login: setAuthUser } = useAuth();

  const [status, setStatus] = useState('loading'); // loading | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const activate = async () => {
      try {
        const res = await authAPI.activateAccount(token);
        // Stocker le token JWT et initialiser la session
        localStorage.setItem('token', res.data.token);
        // Petit délai pour afficher le succès avant de rediriger
        setStatus('success');
        setTimeout(() => {
          navigate('/force-change-password', { replace: true });
        }, 2000);
      } catch (err) {
        setStatus('error');
        setMessage(err.message || 'Lien d\'activation invalide ou expiré.');
      }
    };
    activate();
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-indigo-900 to-purple-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-indigo-900/50">
            <Shield size={38} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Collège Omedev</h1>
          <p className="text-indigo-300 text-sm mt-1">Activation de compte</p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-10 shadow-2xl text-center">
          {status === 'loading' && (
            <>
              <Loader2 size={56} className="text-indigo-400 animate-spin mx-auto mb-5" />
              <h2 className="text-xl font-bold text-white mb-2">Activation en cours…</h2>
              <p className="text-indigo-300 text-sm">Veuillez patienter quelques instants.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle size={44} className="text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Compte activé !</h2>
              <p className="text-indigo-300 text-sm mb-4">
                Votre compte a été activé avec succès. Vous allez être redirigé(e) vers la page de
                <strong className="text-white"> définition de votre mot de passe personnel</strong>.
              </p>
              <div className="h-1 bg-white/10 rounded-full overflow-hidden mx-auto w-3/4">
                <div className="h-full bg-emerald-500 rounded-full animate-[width_2s_linear_forwards]"
                  style={{ animation: 'none', background: 'linear-gradient(90deg,#10b981,#34d399)', width: '100%' }}
                />
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-5">
                <XCircle size={44} className="text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Activation échouée</h2>
              <p className="text-red-300 text-sm mb-6">{message}</p>
              <p className="text-indigo-400 text-xs mb-6">
                Ce lien a peut-être expiré (valide 48h) ou a déjà été utilisé.
                Contactez l'administration pour obtenir un nouveau lien.
              </p>
              <button
                onClick={() => navigate('/login', { replace: true })}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-colors"
              >
                Retour à la connexion
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
