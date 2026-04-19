import React, { useState } from 'react';
import type { Quote } from '../../types';
import { useIntersection } from '../../hooks/useIntersection';

interface QuotesSectionProps {
  quotes: Quote[];
  onCreate: (text: string, author?: string) => void;
  onToggleFav: (id: string, current: boolean) => void;
  onDelete: (id: string) => void;
}

export default function QuotesSection({ quotes, onCreate, onToggleFav, onDelete }: QuotesSectionProps) {
  const [showModal, setShowModal] = useState(false);
  const [showFavOnly, setShowFavOnly] = useState(false);
  const [headerRef, headerVisible] = useIntersection({ threshold: 0.15 });

  const displayed = showFavOnly ? quotes.filter(q => q.is_favorite) : quotes;

  return (
    <section id="citations" className="quotes-section">
      <div ref={headerRef} className={`section-header reveal ${headerVisible ? 'visible' : ''}`}>
        <p className="section-tag">✦ Nos mots</p>
        <h2 className="section-title">Nos <em>Citations</em></h2>
        <div className="divider" />
      </div>

      <div className="quotes-controls">
        <button
          className={`quotes-filter-btn ${!showFavOnly ? 'active' : ''}`}
          onClick={() => setShowFavOnly(false)}
        >
          Toutes ({quotes.length})
        </button>
        <button
          className={`quotes-filter-btn ${showFavOnly ? 'active' : ''}`}
          onClick={() => setShowFavOnly(true)}
        >
          ♥ Favoris ({quotes.filter(q => q.is_favorite).length})
        </button>
      </div>

      {displayed.length === 0 ? (
        <div className="quotes-empty">
          <p>{showFavOnly ? 'Aucun favori pour l\'instant' : 'Ajoutez vos premières citations ♡'}</p>
        </div>
      ) : (
        <div className="quotes-grid">
          {displayed.map(q => (
            <QuoteCard
              key={q.id}
              quote={q}
              onToggleFav={() => onToggleFav(q.id, q.is_favorite)}
              onDelete={() => onDelete(q.id)}
            />
          ))}
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: 40 }}>
        <button className="outline-btn" onClick={() => setShowModal(true)}>
          + Ajouter une citation
        </button>
      </div>

      {showModal && (
        <AddQuoteModal
          onSave={(text, author) => { onCreate(text, author); setShowModal(false); }}
          onClose={() => setShowModal(false)}
        />
      )}
    </section>
  );
}

function QuoteCard({ quote, onToggleFav, onDelete }: {
  quote: Quote;
  onToggleFav: () => void;
  onDelete: () => void;
}) {
  const [hover, setHover] = useState(false);

  return (
    <div
      className={`quote-card ${quote.is_favorite ? 'quote-fav' : ''}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="quote-mark">"</div>
      <p className="quote-text">{quote.text}</p>
      {quote.author && <div className="quote-author">— {quote.author}</div>}

      <div className={`quote-actions ${hover ? 'visible' : ''}`}>
        <button
          className={`quote-fav-btn ${quote.is_favorite ? 'active' : ''}`}
          onClick={onToggleFav}
          title={quote.is_favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          {/* ♥ rempli si favori, ♡ vide sinon — visuellement distincts */}
          {quote.is_favorite ? '♥' : '♡'}
        </button>
        <button className="quote-del-btn" onClick={onDelete} title="Supprimer">✕</button>
      </div>

      {/* Badge favori toujours visible sur la carte */}
      {quote.is_favorite && (
        <div style={{
          position: 'absolute', top: 12, left: 12,
          color: 'var(--rose-deep)', fontSize: 14,
        }}>
          ♥
        </div>
      )}
    </div>
  );
}

function AddQuoteModal({ onSave, onClose }: {
  onSave: (text: string, author?: string) => void;
  onClose: () => void;
}) {
  const [text, setText] = useState('');
  const [author, setAuthor] = useState('');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <h3 className="modal-title">✦ Nouvelle citation</h3>
        <div className="modal-field">
          <label>Citation *</label>
          <textarea
            placeholder="Il y a toi, et puis il y a tout le reste..."
            value={text}
            onChange={e => setText(e.target.value)}
            rows={4}
          />
        </div>
        <div className="modal-field">
          <label>Auteur</label>
          <input
            placeholder="Anonyme, ou votre prénom..."
            value={author}
            onChange={e => setAuthor(e.target.value)}
          />
        </div>
        <div className="modal-actions">
          <button className="outline-btn" onClick={onClose}>Annuler</button>
          <button
            className="filled-btn"
            onClick={() => { if (text.trim()) onSave(text.trim(), author || undefined); }}
            disabled={!text.trim()}
          >
            Ajouter ♡
          </button>
        </div>
      </div>
    </div>
  );
}