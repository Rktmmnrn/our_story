import React, { useState, useRef } from 'react';
import type { SpecialDate } from '../../types';
import { useIntersection } from '../../hooks/useIntersection';

interface TimelineSectionProps {
  dates: SpecialDate[];
  onAdd: (payload: { title: string; event_date: string; description?: string; emoji?: string }) => void;
  onDelete: (id: string) => void;
}

export default function TimelineSection({ dates, onAdd, onDelete }: TimelineSectionProps) {
  const [showModal, setShowModal] = useState(false);
  const [headerRef, headerVisible] = useIntersection({ threshold: 0.15 });

  return (
    <section id="timeline" className="timeline-section">
      <div ref={headerRef} className={`section-header reveal ${headerVisible ? 'visible' : ''}`}>
        <p className="section-tag">✦ Notre chemin</p>
        <h2 className="section-title">Nos <em>Moments</em></h2>
        <div className="divider" />
      </div>

      <div className="timeline">
        {dates.length === 0 ? (
          <div className="timeline-empty">
            <p>Ajoutez vos premiers souvenirs ♡</p>
          </div>
        ) : (
          dates.map((item, i) => (
            <TimelineItemCard key={item.id} item={item} index={i} onDelete={onDelete} />
          ))
        )}
      </div>

      <div style={{ textAlign: 'center', marginTop: 48 }}>
        <button className="outline-btn" onClick={() => setShowModal(true)}>
          + Ajouter un moment
        </button>
      </div>

      {showModal && (
        <AddMomentModal
          onSave={(data) => { onAdd(data); setShowModal(false); }}
          onClose={() => setShowModal(false)}
        />
      )}
    </section>
  );
}

function TimelineItemCard({ item, index, onDelete }: {
  item: SpecialDate; index: number; onDelete: (id: string) => void;
}) {
  const [ref, visible] = useIntersection({ threshold: 0.2 });
  const isOdd = index % 2 === 0;
  const [showDel, setShowDel] = useState(false);

  return (
    <div className={`tl-item ${isOdd ? 'tl-odd' : 'tl-even'}`}
      onMouseEnter={() => setShowDel(true)}
      onMouseLeave={() => setShowDel(false)}
    >
      <div className="tl-dot" />
      <div ref={ref} className={`tl-content ${visible ? 'visible' : ''}`}>
        <span className="tl-emoji">{item.emoji || '♡'}</span>
        <div className="tl-date">{new Date(item.event_date).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</div>
        <div className="tl-title">{item.title}</div>
        {item.description && <p className="tl-desc">{item.description}</p>}
        {showDel && (
          <button className="tl-delete-btn" onClick={() => onDelete(item.id)} title="Supprimer">✕</button>
        )}
      </div>
    </div>
  );
}

function AddMomentModal({ onSave, onClose }: {
  onSave: (data: { title: string; event_date: string; description?: string; emoji?: string }) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({ title: '', event_date: '', description: '', emoji: '♡' });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">✦ Nouveau moment</h3>
        <div className="modal-field">
          <label>Titre *</label>
          <input placeholder="Notre premier..." value={form.title} onChange={set('title')} required />
        </div>
        <div className="modal-field">
          <label>Date *</label>
          <input type="date" value={form.event_date} onChange={set('event_date')} required />
        </div>
        <div className="modal-field">
          <label>Description</label>
          <textarea placeholder="Ce moment était..." value={form.description} onChange={set('description')} rows={3} />
        </div>
        <div className="modal-field">
          <label>Emoji</label>
          <input placeholder="🌺" value={form.emoji} onChange={set('emoji')} style={{ width: 80 }} />
        </div>
        <div className="modal-actions">
          <button className="outline-btn" onClick={onClose}>Annuler</button>
          <button
            className="filled-btn"
            onClick={() => {
              if (form.title && form.event_date) {
                onSave({
                  title: form.title,
                  event_date: form.event_date,
                  description: form.description || undefined,
                  emoji: form.emoji || undefined,
                });
              }
            }}
          >
            Ajouter ♡
          </button>
        </div>
      </div>
    </div>
  );
}
