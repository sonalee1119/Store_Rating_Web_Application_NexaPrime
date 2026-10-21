'use client';

import { useState, useEffect } from 'react';
import StarRating from './StarRating';
import { MapPinIcon, StarIcon, CheckIcon } from './Icon';

export default function StoreCard({
  store,
  onSubmitRating,
  isSaving = false,
  onOpenDetails
}) {
  const [selectedRating, setSelectedRating] = useState(store.myRating || 0);
  const [comment, setComment] = useState(store.myComment || '');
  const [feedbackMsg, setFeedbackMsg] = useState('');

  useEffect(() => {
    setSelectedRating(store.myRating || 0);
    setComment(store.myComment || '');
  }, [store.myRating, store.myComment]);

  const hasExistingRating = Boolean(store.myRating);
  const isUnchanged =
    hasExistingRating &&
    selectedRating === store.myRating &&
    (comment || '') === (store.myComment || '');

  async function handleSave(e) {
    e.preventDefault();
    if (!selectedRating || selectedRating < 1 || selectedRating > 5) return;
    setFeedbackMsg('');
    const ok = await onSubmitRating(store.id, selectedRating, comment);
    if (ok) {
      setFeedbackMsg(
        hasExistingRating ? 'Rating updated successfully' : 'Rating submitted successfully'
      );
      setTimeout(() => setFeedbackMsg(''), 3500);
    }
  }

  return (
    <article className="store-card">
      <div className="store-card-top">
        <div className="store-meta-row">
          <span className="category-pill">{store.category || 'Retail & Essentials'}</span>
          <div className="rating-summary-badge" title={`Average rating: ${store.averageRating} out of 5`}>
            <StarIcon filled size={15} />
            <span className="rating-score-num">
              {store.averageRating > 0 ? store.averageRating.toFixed(1) : 'New'}
            </span>
            <span className="rating-count-text">
              ({store.ratingCount} {store.ratingCount === 1 ? 'review' : 'reviews'})
            </span>
          </div>
        </div>

        <h3 className="store-title">{store.name}</h3>

        <p className="store-address">
          <MapPinIcon size={15} className="pin-icon" />
          <span>{store.address}</span>
        </p>
      </div>

      <div className="store-card-divider" />

      <form className="store-rating-panel" onSubmit={handleSave}>
        <div className="rating-panel-header">
          <span className="rating-panel-label">
            {hasExistingRating ? 'Your Submitted Rating' : 'Submit Your Rating (1 to 5)'}
          </span>
          {hasExistingRating ? (
            <span className="user-rated-pill">
              <CheckIcon size={13} /> Rated {store.myRating}/5
            </span>
          ) : (
            <span className="unrated-pill">Not rated yet</span>
          )}
        </div>

        <div className="interactive-rating-row">
          <StarRating
            value={selectedRating}
            onChange={val => setSelectedRating(val)}
            size={22}
          />
          <div className="quick-number-btns">
            {[1, 2, 3, 4, 5].map(num => (
              <button
                key={num}
                type="button"
                className={`num-rate-btn ${selectedRating === num ? 'active' : ''}`}
                onClick={() => setSelectedRating(num)}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        <div className="comment-input-wrap">
          <input
            type="text"
            className="input-sm"
            maxLength={200}
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Optional feedback note (e.g., helpful staff, fast checkout)..."
          />
        </div>

        <div className="store-card-actions">
          <button
            type="submit"
            className={`btn ${hasExistingRating ? 'btn-secondary' : 'btn-primary'} btn-full`}
            disabled={isSaving || !selectedRating || isUnchanged}
          >
            {isSaving
              ? 'Saving Rating...'
              : hasExistingRating
              ? isUnchanged
                ? 'Select New Score to Update'
                : `Update Rating to ${selectedRating}/5`
              : selectedRating
              ? `Submit ${selectedRating}/5 Rating`
              : 'Select 1–5 Score Above'}
          </button>

          {onOpenDetails && (
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => onOpenDetails(store)}
            >
              Details
            </button>
          )}
        </div>

        {feedbackMsg && (
          <div className="inline-feedback-success">
            <CheckIcon size={14} />
            <span>{feedbackMsg}</span>
          </div>
        )}
      </form>
    </article>
  );
}
