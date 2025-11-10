'use client';

import { Star } from 'lucide-react';
import { useState } from 'react';

interface RatingStarsProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  size?: number;
  readonly?: boolean;
  showValue?: boolean;
}

export default function RatingStars({
  rating,
  onRatingChange,
  size = 20,
  readonly = false,
  showValue = false,
}: RatingStarsProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const displayRating = hoverRating || rating;

  const handleClick = (value: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(value);
    }
  };

  const handleMouseEnter = (value: number) => {
    if (!readonly) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverRating(0);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((value) => {
        const isFilled = displayRating >= value;
        const isHalf = displayRating >= value - 0.5 && displayRating < value;

        return (
          <div
            key={value}
            className={`relative ${!readonly ? 'cursor-pointer' : ''}`}
            onClick={() => handleClick(value)}
            onMouseEnter={() => handleMouseEnter(value)}
            onMouseLeave={handleMouseLeave}
          >
            {/* Étoile vide */}
            <Star
              size={size}
              className={`${
                isFilled || isHalf
                  ? 'text-yellow-400'
                  : 'text-gray-600'
              } transition-colors`}
              fill={isFilled ? 'currentColor' : 'none'}
            />

            {/* Demi-étoile */}
            {isHalf && (
              <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
                <Star
                  size={size}
                  className="text-yellow-400"
                  fill="currentColor"
                />
              </div>
            )}

            {/* Hover pour demi-étoile */}
            {!readonly && (
              <div
                className="absolute inset-0 w-1/2"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClick(value - 0.5);
                }}
                onMouseEnter={(e) => {
                  e.stopPropagation();
                  handleMouseEnter(value - 0.5);
                }}
              />
            )}
          </div>
        );
      })}

      {showValue && (
        <span className="ml-2 text-sm font-semibold text-gray-300">
          {displayRating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
