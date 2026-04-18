import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { coupleApi } from '../../services/api';
import type { Couple } from '../../types';

interface CoupleSettingsModalProps {
  couple: Couple;
  onUpdated: (couple: Couple) => void;
  onClose: () => void;
}

export default function CoupleSettingsModal({ couple, onUpdated, onClose }: CoupleSettingsModalProps) {
  const [form, setForm] = useState({
    couple_name: couple.couple_name || '',
    anniversary_date: couple.anniversary_date,
  });
  const [loading, setLoading] = useState(false);
  const [dissolveConfirm, setDissolveConfirm] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await coupleApi.update(
        form.anniversary_date !== couple.anniversary_date ? form.anniversary_date : undefined,
        form.couple_name !== couple.couple_name ? form.couple_name || undefined : undefined
      );
      const updated = await coupleApi.get();
      onUpdated(updated);
      toast.success('Paramètres mis à jour ♡');
      onClose();
    } catch {
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const handleDissolve = async () => {
    setLoading(true);
    try {
      await coupleApi.dissolve();
      toast.success('Couple dissous');
      window.location.reload();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="auth-modal setup-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-x" onClick={onClose}>✕</button>

        <div className="auth-modal-header">
          <div className="auth-heart">⚙</div>
          <h2 className="auth-modal-title">Paramètres du couple</h2>
          <p className="auth-modal-sub">Modifiez vos informations</p>
        </div>

        <form onSubmit={handleSave} className="auth-form">
          <div className="auth-field">
            <label>Nom du couple</label>
            <input
              type="text"
              placeholder="ex: Marie & Julien"
              value={form.couple_name}
              onChange={set('couple_name')}
            />
          </div>
          <div className="auth-field">
            <label>Date d'anniversaire *</label>
            <input
              type="date"
              value={form.anniversary_date}
              onChange={set('anniversary_date')}
              required
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
          <button className="auth-submit-btn" type="submit" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Sauvegarder ✦'}
          </button>
        </form>

        <div className="couple-danger-zone">
          <p className="danger-zone-label">Zone dangereuse</p>
          {!dissolveConfirm ? (
            <button className="danger-btn" onClick={() => setDissolveConfirm(true)}>
              Dissoudre le couple
            </button>
          ) : (
            <div className="danger-confirm">
              <p>Confirmer la dissolution ? Toutes les données seront supprimées.</p>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button className="outline-btn" onClick={() => setDissolveConfirm(false)}>Annuler</button>
                <button className="danger-btn" onClick={handleDissolve} disabled={loading}>
                  {loading ? <span className="spinner" /> : 'Confirmer'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
