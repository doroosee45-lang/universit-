import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { authAPI } from '../../services/services';

export default function VerifyEmailPage() {
  const { token } = useParams();
  const [status, setStatus] = useState('loading'); // loading | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verify = async () => {
      try {
        await authAPI.verifyEmail(token);
        setStatus('success');
        setMessage('Votre email a été vérifié avec succès !');
      } catch (err) {
        setStatus('error');
        setMessage(err.message || 'Lien de vérification invalide ou expiré.');
      }
    };
    verify();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-950 via-indigo-900 to-purple-900 p-4">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-10 text-center">
        {status === 'loading' && (
          <>
            <Loader2 size={56} className="text-indigo-400 animate-spin mx-auto mb-5" />
            <h2 className="text-xl font-bold text-white">Vérification en cours…</h2>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle size={56} className="text-emerald-400 mx-auto mb-5" />
            <h2 className="text-xl font-bold text-white mb-2">Email vérifié !</h2>
            <p className="text-indigo-300 text-sm mb-6">{message}</p>
            <Link
              to="/login"
              className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-semibold transition-colors text-sm"
            >
              Se connecter
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle size={56} className="text-red-400 mx-auto mb-5" />
            <h2 className="text-xl font-bold text-white mb-2">Échec de vérification</h2>
            <p className="text-red-300 text-sm mb-6">{message}</p>
            <Link
              to="/login"
              className="inline-block bg-white/10 hover:bg-white/20 text-white px-6 py-2.5 rounded-xl font-semibold transition-colors text-sm border border-white/20"
            >
              Retour à la connexion
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
