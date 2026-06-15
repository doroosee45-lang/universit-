import { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../common';

export const MainLayout = ({ allowedRoles }) => {
  const { user, loading } = useAuth();
  // Desktop : sidebar réduite aux icônes
  const [collapsed, setCollapsed] = useState(false);
  // Mobile : sidebar affichée en overlay
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Fermer le sidebar mobile lors d'un changement de route
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, []);

  // Fermer le sidebar mobile sur grand écran si la fenêtre s'agrandit
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setMobileSidebarOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Spinner size={36} />
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/unauthorized" replace />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Overlay sombre sur mobile quand le sidebar est ouvert */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(c => !c)}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      <Header
        onMenuToggle={() => setMobileSidebarOpen(o => !o)}
        collapsed={collapsed}
      />

      {/* Contenu principal
          Mobile  : pleine largeur (pas de marge gauche)
          Desktop : marge gauche = largeur du sidebar */}
      <main className={`
        transition-all duration-300 pt-16 min-h-screen
        ${collapsed ? 'md:ml-16' : 'md:ml-64'}
      `}>
        <div className="p-3 sm:p-4 md:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
