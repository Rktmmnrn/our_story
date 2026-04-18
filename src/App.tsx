import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';

import LandingPage from './pages/LandingPage';
import AppPage from './pages/AppPage';
import AdminPage from './pages/AdminPage';
import JoinPage from './pages/JoinPage';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  const { isAuthenticated, user, fetchMe } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && !user) fetchMe();
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

  return (
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
        <Route path="/join/:token" element={<JoinPage />} />
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <AppPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
