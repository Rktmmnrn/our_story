import React, { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { authApi } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import type { User } from '../../types';

interface ProfileModalProps {
  user: User;
  onClose: () => void;
}

export default function ProfileModal({ user, onClose }: ProfileModalProps) {
  const { setUser } = useAuthStore();
  const [displayName, setDisplayName] = useState(user.display_name);
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim() || displayName === user.display_name) return;
    setLoading(true);
    try {
      await authApi.updateMe(displayName.trim());
      const updated = await authApi.me();
      setUser(updated);
      toast.success('Profil mis à jour ♡');
    } catch {
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarLoading(true);
    try {
      await authApi.uploadAvatar(file);
      const updated = await authApi.me();
      setUser(updated);
      toast.success('Avatar mis à jour ♡');
    } catch {
      toast.error('Erreur lors de l\'upload');
    } finally {
      setAvatarLoading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-x" onClick={onClose}>✕</button>

        <div className="auth-modal-header">
          <div
            className="profile-avatar-large"
            onClick={() => fileRef.current?.click()}
            title="Changer l'avatar"
          >
            {avatarLoading ? (
              <span className="spinner" />
            ) : user.avatar_url ? (
              <img src={user.avatar_url} alt={user.display_name} />
            ) : (
              <span>{user.display_name?.[0]?.toUpperCase()}</span>
            )}
            <div className="profile-avatar-overlay">📷</div>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleAvatarChange}
          />
          <h2 className="auth-modal-title">Mon profil</h2>
          <p className="auth-modal-sub">{user.email}</p>
        </div>

        <form onSubmit={handleSaveName} className="auth-form">
          <div className="auth-field">
            <label>Prénom affiché</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              minLength={2}
              maxLength={100}
              required
            />
          </div>
          <div className="auth-field">
            <label>Email</label>
            <input type="email" value={user.email} disabled style={{ opacity: 0.5, cursor: 'not-allowed' }} />
          </div>
          <div className="auth-field">
            <label>Rôle</label>
            <input type="text" value={user.role} disabled style={{ opacity: 0.5, cursor: 'not-allowed' }} />
          </div>
          <button
            className="auth-submit-btn"
            type="submit"
            disabled={loading || displayName === user.display_name}
          >
            {loading ? <span className="spinner" /> : 'Sauvegarder ✦'}
          </button>
        </form>
      </div>
    </div>
  );
}
