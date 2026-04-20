import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { coupleApi } from '../services/api';
import { useAuthStore } from '../store/authStore';

export default function JoinPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, fetchMe } = useAuthStore();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState('');

  // useEffect(() => {
  //   if (isAuthenticated && user) {
  //     const pending = sessionStorage.getItem('pending_join_token');
  //     if (pending) {
  //       sessionStorage.removeItem('pending_join_token');
  //       window.location.href = `/join/${pending}`;  // ✅ Ça c'est correct
  //     }
  //   }
  // }, [isAuthenticated, user]);

  useEffect(() => {
    if (!token) { navigate('/'); return; }
    if (!isAuthenticated) {
      // Store token and redirect to login
      sessionStorage.setItem('pending_join_token', token);
      navigate('/');
      toast('Connectez-vous d\'abord pour rejoindre le couple ♡');
      return;
    }
    joinCouple();
  }, [token, isAuthenticated]);

  const joinCouple = async () => {
    if (!token) return;
    try {
      await coupleApi.join(token);
      await fetchMe();
      setStatus('success');
      setTimeout(() => navigate('/app'), 2000);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Lien invalide ou expiré');
      setStatus('error');
    }
  };

  return (
    <div className="join-page">
      <div className="join-card">
        <div className="join-heart">♡</div>
        {status === 'loading' && (
          <>
            <h2>Rejoindre le couple...</h2>
            <div className="spinner large" />
          </>
        )}
        {status === 'success' && (
          <>
            <div className="join-success-icon">✓</div>
            <h2>Bienvenue dans votre histoire ♡</h2>
            <p>Redirection en cours...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <h2>Lien invalide</h2>
            <p className="join-error">{error}</p>
            <button className="filled-btn" onClick={() => navigate('/')}>
              Retour à l'accueil
            </button>
          </>
        )}
      </div>
    </div>
  );
}
