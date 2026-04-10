'use client';

import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { StarIcon, MapPinIcon, CheckIcon, SparklesIcon } from '@/components/icons';
import type { Business } from '@/lib/api';

interface BusinessCardProps {
  business: Business;
}

export default function BusinessCard({ business }: BusinessCardProps) {
  const { t } = useI18n();
  const isPremium = business.verified === 2;
  const isVerified = business.verified === 1;
  const hasReviews = business.review_count > 0;

  const borderClass = isPremium
    ? 'border-amber-300 bg-amber-50/40'
    : isVerified
      ? 'border-green-200'
      : 'border-[var(--color-border)]';

  return (
    <Link
      href={`/${business.slug}`}
      className={`group block rounded-2xl border bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[var(--color-border-hover)] hover:shadow-md ${borderClass}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-stone-500">
            {business.category_icon} {business.category_name}
          </p>
          <h2 className="mt-2 text-lg font-semibold leading-tight text-stone-900 transition-colors group-hover:text-[var(--color-primary)]">
            {business.name}
          </h2>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {hasReviews ? (
          <>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-sm font-semibold text-amber-700">
              <StarIcon className="h-4 w-4" /> {business.avg_rating.toFixed(1)}
            </span>
            <span className="text-sm text-stone-500">
              {business.review_count} {t('business.reviews')}
            </span>
          </>
        ) : (
          <span className="rounded-full bg-stone-100 px-2.5 py-1 text-sm text-stone-500">
            {t('business.noReviews')}
          </span>
        )}

        {isPremium && (
          <span
            title={t('badge.premium.tooltip')}
            className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700"
          >
            <SparklesIcon className="h-3.5 w-3.5" /> {t('business.premium')}
          </span>
        )}

        {isVerified && (
          <span
            title={t('badge.verified.tooltip')}
            className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700"
          >
            <CheckIcon className="h-3.5 w-3.5" /> {t('business.verified')}
          </span>
        )}
      </div>

      {business.description && (
        <p className="mt-3 line-clamp-2 text-sm text-stone-600">{business.description}</p>
      )}

      <div className="mt-4 flex items-center gap-1 text-sm text-stone-500">
        <MapPinIcon className="h-4 w-4 text-[var(--color-primary)]" />
        <span>{business.city}</span>
      </div>
    </Link>
  );
}
