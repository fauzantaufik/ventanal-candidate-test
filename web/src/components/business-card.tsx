'use client';

import { useI18n } from '@/lib/i18n';
import { MapPinIcon, CheckIcon, SparklesIcon } from '@/components/icons';
import StarRating from '@/components/star-rating';
import type { Business } from '@/lib/api';

interface BusinessCardProps {
  business: Business;
}

export default function BusinessCard({ business }: BusinessCardProps) {
  const { t } = useI18n();
  const isPremium = business.verified === 2;
  const isVerified = business.verified === 1;

  const borderClass = isPremium
    ? 'border-amber-300 bg-amber-50/40'
    : isVerified
    ? 'border-green-200'
    : 'border-[var(--color-border)]';

  return (
    <a
      href={`/${business.slug}`}
      className={`block bg-white rounded-xl border p-4 hover:border-[var(--color-border-hover)] hover:shadow-md transition-all ${borderClass}`}
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs text-stone-500">
          {business.category_icon} {business.category_name}
        </span>
        {isPremium && (
          <span
            title={t('badge.premium.tooltip')}
            className="inline-flex items-center gap-1 text-xs text-amber-700 font-medium bg-amber-100 px-2 py-0.5 rounded-full cursor-help"
          >
            <SparklesIcon className="h-3 w-3" /> Premium
          </span>
        )}
        {isVerified && (
          <span
            title={t('badge.verified.tooltip')}
            className="inline-flex items-center gap-1 text-xs text-green-700 font-medium bg-green-100 px-2 py-0.5 rounded-full cursor-help"
          >
            <CheckIcon className="h-3 w-3" /> {t('business.verified')}
          </span>
        )}
      </div>

      <h2 className="font-semibold text-stone-900 mb-1">{business.name}</h2>
      <p className="text-sm text-stone-600 line-clamp-2 mb-3">{business.description}</p>

      <div className="flex items-center justify-between text-xs text-stone-500">
        <span className="inline-flex items-center gap-1">
          <MapPinIcon className="h-3.5 w-3.5 text-[var(--color-primary)]" /> {business.city}
        </span>
        {business.review_count > 0 ? (
          <span className="inline-flex items-center gap-1 text-amber-600 font-medium">
            <StarRating rating={business.avg_rating} sizeClassName="h-3.5 w-3.5" className="shrink-0" />
            <span>{business.avg_rating.toFixed(1)} ({business.review_count})</span>
          </span>
        ) : (
          <span>{t('business.noReviews')}</span>
        )}
      </div>
    </a>
  );
}
