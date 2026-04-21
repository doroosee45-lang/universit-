import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../common';

export const MainLayout = ({ allowedRoles }) => {
  const { user, loading } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Spinner size={36} />
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/unauthorized" replace />;

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <Header onMenuToggle={() => setCollapsed(!collapsed)} collapsed={collapsed} />
      <main className={`transition-all duration-300 pt-16 min-h-screen ${collapsed ? 'ml-16' : 'ml-64'}`}>
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};