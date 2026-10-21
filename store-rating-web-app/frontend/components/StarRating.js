'use client';

import { useState } from 'react';
import { StarIcon } from './Icon';

export default function StarRating({
  value = 0,
  onChange,
  readOnly = false,
  size = 18
}) {
  const [hovered, setHovered] = useState(0);
  const displayValue = hovered || value;

  return (
    <div
      className={`star-rating-group ${readOnly ? 'readonly' : 'interactive'}`}
      onMouseLeave={() => !readOnly && setHovered(0)}
      role={readOnly ? 'img' : 'radiogroup'}
      aria-label={`Rating: ${value} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map(star => {
        const isFilled = star <= Math.round(displayValue);
        if (readOnly) {
          return (
            <span
              key={star}
              className={`star-unit ${isFilled ? 'filled' : 'empty'}`}
            >
              <StarIcon filled={isFilled} size={size} />
            </span>
          );
        }
        return (
          <button
            key={star}
            type="button"
            className={`star-btn ${isFilled ? 'filled' : 'empty'} ${value === star ? 'selected' : ''}`}
            onMouseEnter={() => setHovered(star)}
            onClick={() => onChange && onChange(star)}
            title={`Select ${star} ${star === 1 ? 'star' : 'stars'}`}
            aria-label={`Rate ${star} out of 5`}
          >
            <StarIcon filled={isFilled} size={size} />
          </button>
        );
      })}
    </div>
  );
}
