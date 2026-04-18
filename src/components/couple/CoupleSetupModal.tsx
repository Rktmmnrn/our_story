import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { coupleApi } from '../../services/api';
import type { Couple } from '../../types';

interface CoupleSetupModalProps {
  onComplete: (couple: Couple) => void;
  onClose: () => void;
}

export default function CoupleSetupModal({ onComplete, onClose }: CoupleSetupModalProps) {
  const [form, setForm] = useState({
    couple_name: '',
    anniversary_date: '',
  });
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.anniversary_date) {
      toast.error('La date d\'anniversaire est requise');
      return;
    }
    setLoading(true);
    try {
      const couple = await coupleApi.create(
        form.anniversary_date,
        form.couple_name || undefined
      ) as unknown as Couple;
      toast.success('Votre espace est prêt ♡');
      onComplete(couple);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="auth-modal setup-modal" onClick={(e) => e.stopPropagation()}>
        <div className="auth-modal-header">
          <div className="auth-heart">♡</div>
          <h2 className="auth-modal-title">Créer votre espace</h2>
          <p className="auth-modal-sub">Configurez votre histoire ensemble</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
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
            <span className="field-hint">Le jour où tout a commencé</span>
          </div>

          <button className="auth-submit-btn" type="submit" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Créer notre espace ✦'}
          </button>
        </form>

        <p className="auth-switch">
          Vous pourrez inviter votre partenaire ensuite.
        </p>
      </div>
    </div>
  );
}
