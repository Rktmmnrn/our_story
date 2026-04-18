import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export default function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { isAuthenticated, user, fetchMe, isLoading } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && !user) fetchMe();
  }, [isAuthenticated, user, fetchMe]);

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
