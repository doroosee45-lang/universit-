// import {
//   createContext,
//   useContext,
//   useState,
//   useEffect,
//   useCallback,
// } from 'react';
// import { authAPI } from '../../services/services';

// const AuthContext = createContext(null);

// // ─── Role → route mapping (single source of truth) ───────────────────────────
// const ROLE_ROUTES = {
//   admin:           '/admin/dashboard',
//   super_admin:     '/admin/dashboard',
//   staff:           '/admin/dashboard',
//   department_head: '/admin/dashboard',
//   teacher:         '/teacher/dashboard',
//   student:         '/student/dashboard',
// };

// export const getRouteForRole = (role) => ROLE_ROUTES[role] ?? '/login';

// // ─── Provider ─────────────────────────────────────────────────────────────────
// export const AuthProvider = ({ children }) => {
//   const [user, setUser]       = useState(null);
//   const [loading, setLoading] = useState(true);

//   const loadUser = useCallback(async () => {
//     const token = localStorage.getItem('token');
//     if (!token) { setLoading(false); return; }

//     try {
//       const res = await authAPI.getMe();
//       setUser(res.data);
//     } catch {
//       localStorage.removeItem('token');
//       setUser(null);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => { loadUser(); }, [loadUser]);

//   // Returns the logged-in user so LoginPage can navigate immediately
//   const login = async (email, password) => {
//     const res = await authAPI.login({ email, password });
//     localStorage.setItem('token', res.data.token);
//     setUser(res.data.user);
//     return res.data.user;          // ← LoginPage uses this
//   };

//   const logout = () => {
//     localStorage.removeItem('token');
//     setUser(null);
//   };

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         loading,
//         login,
//         logout,
//         // ── Derived booleans ──────────────────────────────
//         isAdmin:         ['admin', 'super_admin'].includes(user?.role),
//         isSuperAdmin:    user?.role === 'super_admin',
//         isTeacher:       user?.role === 'teacher',
//         isStudent:       user?.role === 'student',
//         isStaff:         user?.role === 'staff',
//         isDepartmentHead:user?.role === 'department_head',
//         // ── Helper ────────────────────────────────────────
//         getHomeRoute: () => getRouteForRole(user?.role),
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// // ─── Hook ─────────────────────────────────────────────────────────────────────
// export const useAuth = () => {
//   const ctx = useContext(AuthContext);
//   if (!ctx) throw new Error('useAuth must be used within AuthProvider');
//   return ctx;
// };



import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { authAPI } from '../../services/services';

const AuthContext = createContext(null);

// ─── Role → route mapping ─────────────────────────────────────────────────────
const ROLE_ROUTES = {
  admin:           '/admin/dashboard',
  super_admin:     '/admin/dashboard',
  staff:           '/admin/dashboard',
  department_head: '/admin/dashboard',
  teacher:         '/teacher/dashboard',
  student:         '/student/dashboard',
};

export const getRouteForRole = (role) => ROLE_ROUTES[role] ?? '/login';

// ─── Provider ─────────────────────────────────────────────────────────────────
export const AuthProvider = ({ children }) => {
  const [user, setUser]                       = useState(null);
  const [loading, setLoading]                 = useState(true);
  const [mustChangePassword, setMustChange]   = useState(false);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }

    try {
      const res = await authAPI.getMe();
      setUser(res.data);
      setMustChange(res.data?.mustChangePassword || false);
    } catch {
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUser(); }, [loadUser]);

  // ─── Login : retourne l'utilisateur pour la navigation immédiate ──────────
  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    setMustChange(res.data.mustChangePassword || res.data.user?.mustChangePassword || false);
    return res.data; // { token, user, mustChangePassword }
  };

  // ─── Après changement forcé du mot de passe ───────────────────────────────
  const onPasswordChanged = (newToken, newUser) => {
    if (newToken) localStorage.setItem('token', newToken);
    setMustChange(false);
    if (newUser) setUser({ ...newUser, mustChangePassword: false });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setMustChange(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        mustChangePassword,
        login,
        logout,
        onPasswordChanged,
        // ── Derived booleans ──────────────────────────────
        isAdmin:          ['admin', 'super_admin'].includes(user?.role),
        isSuperAdmin:     user?.role === 'super_admin',
        isTeacher:        user?.role === 'teacher',
        isStudent:        user?.role === 'student',
        isStaff:          user?.role === 'staff',
        isDepartmentHead: user?.role === 'department_head',
        // ── Helper ────────────────────────────────────────
        getHomeRoute: () => getRouteForRole(user?.role),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};