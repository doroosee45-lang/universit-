// import { useState } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { School, Eye, EyeOff, Lock, Mail } from 'lucide-react';
// import { useAuth } from '../../components/context/AuthContext';
// import { Button, Alert } from '../../components/common';
// export default function LoginPage() {
//   const { login, getHomeRoute } = useAuth();     // ← Ajoute getHomeRoute ici
//   const navigate = useNavigate();

//   const [form, setForm] = useState({ email: '', password: '' });
//   const [showPass, setShowPass] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//     try {
//       await login(form.email, form.password);
      
//       // ✅ Solution propre : on utilise la fonction du context
//       const homeRoute = getHomeRoute();
//       navigate(homeRoute);

//     } catch (err) {
//       setError(err.message || 'Erreur de connexion');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-indigo-900 to-purple-900 flex items-center justify-center p-4">
//       {/* Background decoration */}
//       <div className="absolute inset-0 overflow-hidden">
//         <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
//         <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
//       </div>

//       <div className="relative w-full max-w-md">
//         {/* Logo */}
//         <div className="text-center mb-8">
//           <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-900/50">
//             <School size={32} className="text-white" />
//           </div>
//           <h1 className="text-3xl font-bold text-white">UniManage</h1>
//           <p className="text-indigo-300 text-sm mt-1">Système de Gestion Universitaire</p>
//         </div>

//         {/* Card */}
//         <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
//           <h2 className="text-xl font-bold text-white mb-1">Bienvenue</h2>
//           <p className="text-indigo-300 text-sm mb-6">Connectez-vous à votre espace</p>

//           {error && <Alert type="error" message={error} className="mb-4" />}

//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div className="space-y-1.5">
//               <label className="text-sm font-medium text-indigo-200">Adresse email</label>
//               <div className="relative">
//                 <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-400" />
//                 <input
//                   type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
//                   placeholder="votre@email.com" required
//                   className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-sm"
//                 />
//               </div>
//             </div>

//             <div className="space-y-1.5">
//               <label className="text-sm font-medium text-indigo-200">Mot de passe</label>
//               <div className="relative">
//                 <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-400" />
//                 <input
//                   type={showPass ? 'text' : 'password'} value={form.password}
//                   onChange={e => setForm({ ...form, password: e.target.value })}
//                   placeholder="••••••••" required
//                   className="w-full pl-10 pr-11 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-sm"
//                 />
//                 <button type="button" onClick={() => setShowPass(!showPass)}
//                   className="absolute right-3.5 top-1/2 -translate-y-1/2 text-indigo-400 hover:text-white transition-colors">
//                   {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
//                 </button>
//               </div>
//             </div>

//             <div className="flex justify-end">
//               <Link to="/reset-password/:toke" className="text-xs text-indigo-300 hover:text-white transition-colors">
//                 Mot de passe oublié ?
//               </Link>
//             </div>

//             <button type="submit" disabled={loading}
//               className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg shadow-indigo-900/30 mt-2">
//               {loading ? (
//                 <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Connexion...</>
//               ) : 'Se connecter'}
//             </button>
//           </form>

//           {/* Roles hint */}
//           <div className="mt-6 pt-6 border-t border-white/10">
//             <p className="text-xs text-indigo-400 text-center mb-3">Comptes de démonstration</p>
//             <div className="grid grid-cols-3 gap-2">
//               {[
//                 { role: 'Admin', email: 'admin@uni.dz' },
//                 { role: 'Enseignant', email: 'prof@uni.dz' },
//                 { role: 'Étudiant', email: 'etud@uni.dz' },
//               ].map(d => (
//                 <button key={d.role} onClick={() => setForm({ email: d.email, password: 'Pass@123' })}
//                   className="text-[11px] py-1.5 px-2 bg-white/5 hover:bg-white/10 rounded-lg text-indigo-300 transition-colors border border-white/10">
//                   {d.role}
//                 </button>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { School, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useAuth, getRouteForRole } from '../../components/context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm]       = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await login(form.email, form.password);
      // data = { token, user, mustChangePassword }

      if (data.mustChangePassword) {
        // ⭐ Premier login avec mot de passe temporaire
        navigate('/force-change-password', { replace: true });
      } else {
        // Redirection normale vers le dashboard
        navigate(getRouteForRole(data.user.role), { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-indigo-900 to-purple-900 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-900/50">
            <School size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">UniManage</h1>
          <p className="text-indigo-300 text-sm mt-1">Système de Gestion Universitaire</p>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-1">Bienvenue</h2>
          <p className="text-indigo-300 text-sm mb-6">Connectez-vous à votre espace</p>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-400/30 rounded-xl text-red-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-indigo-200">Adresse email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-400" />
                <input
                  type="email" value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="votre@email.com" required
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-indigo-200">Mot de passe</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-400" />
                <input
                  type={showPass ? 'text' : 'password'} value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••" required
                  className="w-full pl-10 pr-11 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-sm"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-indigo-400 hover:text-white transition-colors">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs text-indigo-300 hover:text-white transition-colors">
                Mot de passe oublié ?
              </Link>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg shadow-indigo-900/30 mt-2">
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Connexion...
                </>
              ) : 'Se connecter'}
            </button>
          </form>

          {/* Démo */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-xs text-indigo-400 text-center mb-3">Comptes de démonstration</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { role: 'Super Admin', email: 'superadmin@uni.dz' },
                { role: 'Admin',       email: 'admin@uni.dz' },
                { role: 'Étudiant',    email: 'etud@uni.dz' },
              ].map(d => (
                <button key={d.role}
                  onClick={() => setForm({ email: d.email, password: 'Pass@123' })}
                  className="text-[11px] py-1.5 px-2 bg-white/5 hover:bg-white/10 rounded-lg text-indigo-300 transition-colors border border-white/10">
                  {d.role}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}