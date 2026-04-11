import React, { useState, useRef } from 'react';
import type { TimelineItem } from '../types';
import useIntersection from '../hooks/useIntersection';

// ============================================================
//  COMPONENT — TimelineItem
// ============================================================
interface TimelineItemProps {
  item: TimelineItem;
  index: number;
}

function TimelineItemCard({ item, index }: TimelineItemProps): React.JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useIntersection(ref, { threshold: 0.2 });
  const isOdd = index % 2 === 0;

  return (
    <div className={`tl-item ${isOdd ? 'tl-odd' : 'tl-even'}`}>
      <div className="tl-dot" />
      <div ref={ref} className={`tl-content ${visible ? 'visible' : ''}`}>
        <span className="tl-emoji">{item.emoji}</span>
        <div className="tl-date">{item.date}</div>
        <div className="tl-title">{item.title}</div>
        <p className="tl-desc">{item.desc}</p>
      </div>
    </div>
  );
}

// ============================================================
//  COMPONENT — AddMomentModal
// ============================================================
interface AddMomentModalProps {
  onSave: (item: TimelineItem) => void;
  onClose: () => void;
}

function AddMomentModal({ onSave, onClose }: AddMomentModalProps): React.JSX.Element {
  const [form, setForm] = useState<TimelineItem>({ date: '', title: '', desc: '', emoji: '♡' });

  const set =
    (k: keyof TimelineItem) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
      setForm((f) => ({ ...f, [k]: e.target.value }));
    };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">✦ Nouveau moment</h3>
        <div className="modal-field">
          <label>Date</label>
          <input placeholder="ex: Juillet 2024" value={form.date} onChange={set('date')} />
        </div>
        <div className="modal-field">
          <label>Titre</label>
          <input placeholder="Notre premier..." value={form.title} onChange={set('title')} />
        </div>
        <div className="modal-field">
          <label>Description</label>
          <textarea
            placeholder="Ce moment était..."
            value={form.desc}
            onChange={set('desc')}
            rows={3}
          />
        </div>
        <div className="modal-field">
          <label>Emoji</label>
          <input
            placeholder="🌺"
            value={form.emoji}
            onChange={set('emoji')}
            style={{ width: 80 }}
          />
        </div>
        <div className="modal-actions">
          <button className="outline-btn" onClick={onClose}>
            Annuler
          </button>
          <button
            className="filled-btn"
            onClick={() => {
              if (form.date && form.title) {
                onSave(form);
                onClose();
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

// ============================================================
//  COMPONENT — TimelineSection
// ============================================================
interface TimelineSectionProps {
  moments: TimelineItem[];
  onAddMoment: (item: TimelineItem) => void;
}

function TimelineSection({ moments, onAddMoment }: TimelineSectionProps): React.JSX.Element {
  const [showModal, setShowModal] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const headerVisible = useIntersection(headerRef, { threshold: 0.15 });

  return (
    <section id="timeline" className="timeline-section">
      <div ref={headerRef} className={`section-header reveal ${headerVisible ? 'visible' : ''}`}>
        <p className="section-tag">✦ Notre chemin</p>
        <h2 className="section-title">
          Nos <em>Moments</em>
        </h2>
        <div className="divider" />
      </div>
      <div className="timeline">
        {moments.map((item, i) => (
          <TimelineItemCard key={i} item={item} index={i} />
        ))}
      </div>
      <div style={{ textAlign: 'center', marginTop: 48 }}>
        <button className="outline-btn" onClick={() => setShowModal(true)}>
          + Ajouter un moment
        </button>
      </div>
      {showModal && (
        <AddMomentModal onSave={onAddMoment} onClose={() => setShowModal(false)} />
      )}
    </section>
  );
}

export default TimelineSection;
