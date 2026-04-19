import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export default function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuthStore();

  // Tokens présents mais profil pas encore chargé → on attend
  if (isLoading || (isAuthenticated && !user)) {
    return (
      <div className="page-loading">
        <div className="loading-heart">♡</div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/" replace />;

  if (isLoading && !user) {
    return (
      <div className="page-loading">
        <div className="loading-heart">♡</div>
      </div>
    );
  }

  if (adminOnly && user?.role !== 'admin') return <Navigate to="/app" replace />;

  return <>{children}</>;
}
