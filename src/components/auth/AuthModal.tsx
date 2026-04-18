import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../services/api';

interface AuthModalProps {
  mode: 'login' | 'register';
  onClose: () => void;
  onSwitchMode: (mode: 'login' | 'register') => void;
}

export default function AuthModal({ mode, onClose, onSwitchMode }: AuthModalProps) {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: '',
    password: '',
    display_name: '',
    confirmPassword: '',
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      const { user } = useAuthStore.getState();
      toast.success('Bienvenue ! ♡');
      onClose();
      navigate(user?.role === 'admin' ? '/admin' : '/app');
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Email ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    if (form.password.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }
    setLoading(true);
    try {
      await authApi.register(form.email, form.password, form.display_name);
      await login(form.email, form.password);
      toast.success('Compte créé avec succès ♡');
      onClose();
      navigate('/app');
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Erreur lors de la création du compte');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-x" onClick={onClose}>✕</button>

        <div className="auth-modal-header">
          <div className="auth-heart">♡</div>
          <h2 className="auth-modal-title">
            {mode === 'login' ? 'Bon retour' : 'Commencer'}
          </h2>
          <p className="auth-modal-sub">
            {mode === 'login'
              ? 'Connectez-vous à votre espace'
              : 'Créez votre espace intime'}
          </p>
        </div>

        <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="auth-form">
          {mode === 'register' && (
            <div className="auth-field">
              <label>Votre prénom</label>
              <input
                type="text"
                placeholder="ex: Marie"
                value={form.display_name}
                onChange={set('display_name')}
                required
                minLength={2}
              />
            </div>
          )}

          <div className="auth-field">
            <label>Email</label>
            <input
              type="email"
              placeholder="votre@email.com"
              value={form.email}
              onChange={set('email')}
              required
            />
          </div>

          <div className="auth-field">
            <label>Mot de passe</label>
            <input
              type="password"
              placeholder={mode === 'register' ? 'Minimum 8 caractères' : '••••••••'}
              value={form.password}
              onChange={set('password')}
              required
              minLength={8}
            />
          </div>

          {mode === 'register' && (
            <div className="auth-field">
              <label>Confirmer le mot de passe</label>
              <input
                type="password"
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={set('confirmPassword')}
                required
              />
            </div>
          )}

          <button className="auth-submit-btn" type="submit" disabled={loading}>
            {loading ? (
              <span className="spinner" />
            ) : mode === 'login' ? (
              'Se connecter ✦'
            ) : (
              'Créer mon compte ♡'
            )}
          </button>
        </form>

        <div className="auth-switch">
          {mode === 'login' ? (
            <>
              Pas encore de compte ?{' '}
              <button onClick={() => onSwitchMode('register')}>S'inscrire</button>
            </>
          ) : (
            <>
              Déjà un compte ?{' '}
              <button onClick={() => onSwitchMode('login')}>Se connecter</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
