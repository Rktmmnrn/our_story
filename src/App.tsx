import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useNetworkStatus } from './hooks/useNetworkStatus';
import LandingPage from './pages/LandingPage';
import ProtectedRoute from './components/ProtectedRoute';

// ── Lazy loading des pages lourdes ───────────────────────────
const AppPage   = lazy(() => import('./pages/AppPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const JoinPage  = lazy(() => import('./pages/JoinPage'));

// ── Fallback élégant ─────────────────────────────────────────
function RomanticFallback() {
  return (
    <div className="page-loading">
      <div className="loading-heart">♡</div>
    </div>
  );
}

export default function App() {
  const { isAuthenticated, user, fetchMe } = useAuthStore();
  useNetworkStatus(); // active les toasts online/offline

  useEffect(() => {
    if (isAuthenticated && !user) fetchMe();
  }, [isAuthenticated, user, fetchMe]);

  // Préchargement silencieux si token présent
  useEffect(() => {
    if (localStorage.getItem('access_token')) {
      import('./pages/AppPage').catch(() => {});
    }
  }, []);

  // Gestion du token d'invitation en attente
  useEffect(() => {
    if (isAuthenticated && user) {
      const pending = sessionStorage.getItem('pending_join_token');
      if (pending) {
        sessionStorage.removeItem('pending_join_token');
        window.location.href = `/join/${pending}`;
      }
    }
  }, [isAuthenticated, user]);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              fontFamily: "'Jost', sans-serif",
              background: '#2a1a20',
              color: '#fdf8f2',
              border: '0.5px solid rgba(201,168,76,0.3)',
              borderRadius: '2px',
              fontSize: '13px',
              letterSpacing: '0.05em',
            },
            success: { iconTheme: { primary: '#d4607a', secondary: '#fdf8f2' } },
            error:   { iconTheme: { primary: '#c0392b', secondary: '#fdf8f2' } },
          }}
        />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/join/:token"
            element={
              <Suspense fallback={<RomanticFallback />}>
                <JoinPage />
              </Suspense>
            }
          />
          <Route
            path="/app"
            element={
              <Suspense fallback={<RomanticFallback />}>
                <ProtectedRoute>
                  <AppPage />
                </ProtectedRoute>
              </Suspense>
            }
          />
          <Route
            path="/admin"
            element={
              <Suspense fallback={<RomanticFallback />}>
                <ProtectedRoute adminOnly>
                  <AdminPage />
                </ProtectedRoute>
              </Suspense>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
