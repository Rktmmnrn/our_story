import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { coupleApi } from '../../services/api';

interface InviteModalProps {
  coupleId: string;
  onClose: () => void;
}

export default function InviteModal({ coupleId, onClose }: InviteModalProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [sent, setSent] = useState(false);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await coupleApi.invite(email) as any;
      setInviteLink(result.invite_link || '');
      setSent(true);
      toast.success('Invitation envoyée ♡');
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Erreur lors de l\'envoi');
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      toast.success('Lien copié !');
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-x" onClick={onClose}>✕</button>

        <div className="auth-modal-header">
          <div className="auth-heart">♡</div>
          <h2 className="auth-modal-title">Inviter mon partenaire</h2>
          <p className="auth-modal-sub">Partagez votre espace d'histoire</p>
        </div>

        {!sent ? (
          <form onSubmit={handleInvite} className="auth-form">
            <div className="auth-field">
              <label>Email de votre partenaire</label>
              <input
                type="email"
                placeholder="partenaire@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <span className="field-hint">Un email avec le lien d'invitation sera envoyé</span>
            </div>
            <button className="auth-submit-btn" type="submit" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Envoyer l\'invitation ♡'}
            </button>
          </form>
        ) : (
          <div className="invite-success">
            <div className="invite-success-icon">✓</div>
            <p className="invite-success-text">Invitation envoyée à <strong>{email}</strong></p>
            {inviteLink && (
              <div className="invite-link-box">
                <p className="invite-link-label">Ou partagez ce lien directement :</p>
                <div className="invite-link-row">
                  <input readOnly value={inviteLink} className="invite-link-input" />
                  <button className="outline-btn" onClick={copyLink}>Copier</button>
                </div>
                <p className="invite-link-hint">Ce lien expire dans 24 heures</p>
              </div>
            )}
            <button className="filled-btn" onClick={onClose} style={{ marginTop: 24 }}>
              Fermer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
