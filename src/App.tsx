import React, { Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useNetworkStatus } from './hooks/useNetworkStatus';

import LandingPage from './pages/LandingPage';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy loading des autres pages
const AppPage = lazy(() => import(
  /* webpackPrefetch: true */
  /* webpackChunkName: "app-page" */
  './pages/AppPage'
));

const AdminPage = lazy(() => import(
  /* webpackPrefetch: true */
  /* webpackChunkName: "admin-page" */
  './pages/AdminPage'
));

const JoinPage = lazy(() => import(
  /* webpackPrefetch: true */
  /* webpackChunkName: "join-page" */
  './pages/JoinPage'
));

// Composant Suspense Fallback élégant
const RomanticFallback: React.FC = () => (
  <div
    style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--cream)',
      fontFamily: "'Cormorant Garamond', serif",
    }}
  >
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2rem',
      }}
    >
      <div
        className="heart-animation"
        style={{
          fontSize: '4rem',
          color: 'var(--rose-deep)',
          animation: 'pulse 1.8s ease-in-out infinite',
        }}
      >
        ♡
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 0.5;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.15);
          }
        }
      `}</style>
    </div>
  </div>
);

export default function App() {
  const { isAuthenticated, user, fetchMe } = useAuthStore();
  const networkStatus = useNetworkStatus();

  useEffect(() => {
    if (isAuthenticated && !user) fetchMe();
  }, []);

  // Préchargement intelligent de AppPage si token présent
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      // Précharge AppPage en arrière-plan
      import('./pages/AppPage').catch(() => {
        // Silencieux - le chargement se fera à la navigation
      });
    }
  }, []);

  // Handle pending join after login
  useEffect(() => {
    if (isAuthenticated && user) {
      const pendingToken = sessionStorage.getItem('pending_join_token');
      if (pendingToken) {
        sessionStorage.removeItem('pending_join_token');
        window.location.href = `/join/${pendingToken}`;
      }
    }
  }, [isAuthenticated, user]);

  // Préchargement au hover du bouton de connexion
  useEffect(() => {
    const preloadAuthModal = () => {
      import('./components/auth/AuthModal').catch(() => { });
    };

    const loginButtons = document.querySelectorAll('[data-login-trigger]');
    loginButtons.forEach(btn => {
      btn.addEventListener('mouseenter', preloadAuthModal, { once: true });
    });

    return () => {
      loginButtons.forEach(btn => {
        btn.removeEventListener('mouseenter', preloadAuthModal);
      });
    };
  }, []);

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
            error: { iconTheme: { primary: '#c0392b', secondary: '#fdf8f2' } },
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
