import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { School, Eye, EyeOff, Lock, Mail, GraduationCap, Users, BookOpen } from 'lucide-react';
import { useAuth, getRouteForRole } from '../../components/context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await login(form.email, form.password);
      if (data.mustChangePassword) {
        navigate('/force-change-password', { replace: true });
      } else {
        navigate(getRouteForRole(data.user.role), { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const studentPhotos = [
    'https://doroosee45-lang.github.io/monentreprise/assets/os5-DrRWmxrx.jpeg',
    'https://doroosee45-lang.github.io/monentreprise/assets/fido-CF5soql5.jpeg',
    'https://doroosee45-lang.github.io/monentreprise/assets/am-De_7vhyN.jpeg',
    'https://doroosee45-lang.github.io/monentreprise/assets/Lo2-ivgBVyMg.jpeg',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop',
    'https://doroosee45-lang.github.io/monentreprise/assets/os2-DZaMK9rg.jpg',
    'https://doroosee45-lang.github.io/monentreprise/assets/glo-C0t0A0EO.jpeg',
    'https://doroosee45-lang.github.io/monentreprise/assets/os1-DPKV-3kV.jpg',
    'https://doroosee45-lang.github.io/monentreprise/assets/ro-DvGxBXhu.jpeg',
    'https://doroosee45-lang.github.io/monentreprise/assets/mm-Cf5gIEnD.jpeg',
    'https://doroosee45-lang.github.io/monentreprise/assets/Log1-CoOG_Tn1.jpeg',
  ];

  const positions = [
    { top: '5%', left: '5%' },
    { top: '5%', right: '5%' },
    { top: '50%', left: '2%' },
    { top: '50%', right: '2%' },
    { bottom: '5%', left: '5%' },
    { bottom: '5%', right: '5%' },
    { top: '20%', left: '15%' },
    { top: '20%', right: '15%' },
    { top: '80%', left: '15%' },
    { top: '80%', right: '15%' },
    { top: '35%', left: '8%' },
    { top: '65%', right: '8%' },
    { top: '10%', left: '40%' },
  ];

  const rotations = [
    'rotate-3', '-rotate-2', 'rotate-6', '-rotate-4', 'rotate-0', 'rotate-2',
    '-rotate-3', 'rotate-5', '-rotate-1', 'rotate-4', '-rotate-6', 'rotate-1',
    '-rotate-5',
  ];

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      {/* Arrière-plan */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1562774053-701939374585?w=1920&h=1080&fit=crop")',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/30 via-indigo-900/20 to-purple-900/30" />
      </div>

      {/* Photos d'étudiants */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {studentPhotos.map((src, idx) => {
          const pos = positions[idx];
          const style = { position: 'absolute', ...pos };
          return (
            <div
              key={idx}
              style={{ animationDelay: `${(idx % 5) * 0.2}s`, ...style }}
              className="transform transition-all duration-500 hover:scale-110 hover:z-10 animate-float"
            >
              <div className={`relative ${rotations[idx]} transition-all duration-300`}>
                <div className="w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden shadow-2xl border-2 border-white/40 backdrop-blur-sm bg-white/10">
                  <img
                    src={src}
                    alt={`Étudiant ${idx + 1}`}
                    className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity duration-300"
                    loading="lazy"
                  />
                </div>
                <div className="absolute inset-0 rounded-full shadow-inner pointer-events-none" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Décors flottants */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 text-indigo-400/30 animate-pulse-slow">
          <GraduationCap size={140} strokeWidth={1} />
        </div>
        <div className="absolute bottom-1/3 right-1/5 text-purple-400/30 animate-pulse-slow" style={{ animationDelay: '1s' }}>
          <BookOpen size={120} strokeWidth={1} />
        </div>
        <div className="absolute top-2/3 right-1/4 text-indigo-400/20 animate-pulse-slow" style={{ animationDelay: '2s' }}>
          <Users size={100} strokeWidth={1} />
        </div>
      </div>

      {/* Formulaire */}
      <div className="relative w-full max-w-md z-10">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-indigo-900/50 border border-white/20">
            <School size={38} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight drop-shadow-lg">Omedev School</h1>
          <p className="text-indigo-200 text-sm mt-2 font-medium">Système de Gestion Universitaire</p>
        </div>

        <div className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-3xl p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-1">Bienvenue</h2>
          <p className="text-indigo-200 text-sm mb-6">Connectez-vous à votre espace</p>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-400/30 rounded-xl text-red-200 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-indigo-200">Adresse email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-300" />
                <input
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="votre@email.com"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white/15 border border-white/30 rounded-xl text-white placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-indigo-200">Mot de passe</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-300" />
                <input
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-11 py-3 bg-white/15 border border-white/30 rounded-xl text-white placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-indigo-300 hover:text-white transition-colors"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs text-indigo-200 hover:text-white transition-colors">
                Mot de passe oublié ?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg shadow-indigo-900/30 mt-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Connexion...
                </>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>
        </div>
      </div>

      {/* ✅ <style> sans jsx prop — compatible React standard */}
      <style>{`
        @keyframes float {
          0%   { transform: translateY(0px) rotate(0deg); }
          50%  { transform: translateY(-10px) rotate(2deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50%       { opacity: 0.35; transform: scale(1.05); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}