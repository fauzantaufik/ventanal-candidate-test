'use client';

import { useI18n } from '@/lib/i18n';
import { StarHalfIcon, StarIcon, StarOutlineIcon } from '@/components/icons';

interface StarRatingProps {
  rating: number;
  sizeClassName?: string;
  className?: string;
}

export default function StarRating({
  rating,
  sizeClassName = 'h-4 w-4',
  className = '',
}: StarRatingProps) {
  const { t } = useI18n();
  const clampedRating = Math.max(0, Math.min(5, rating));
  const roundedRating = Math.round(clampedRating * 2) / 2;
  const fullStars = Math.floor(roundedRating);
  const hasHalfStar = roundedRating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <span
      className={`inline-flex items-center gap-0.5 ${className}`.trim()}
      aria-label={`${clampedRating.toFixed(1)} ${t('reviews.starsLabel')}`}
      title={`${clampedRating.toFixed(1)} / 5`}
    >
      {Array.from({ length: fullStars }).map((_, index) => (
        <StarIcon key={`full-${index}`} className={`${sizeClassName} text-amber-500`} />
      ))}
      {hasHalfStar && <StarHalfIcon className={`${sizeClassName} text-amber-500`} />}
      {Array.from({ length: emptyStars }).map((_, index) => (
        <StarOutlineIcon key={`empty-${index}`} className={`${sizeClassName} text-stone-300`} />
      ))}
    </span>
  );
}
