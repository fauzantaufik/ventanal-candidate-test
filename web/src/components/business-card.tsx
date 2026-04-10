'use client';

import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import type { Business } from '@/lib/api';

interface BusinessCardProps {
  business: Business;
}

export default function BusinessCard({ business }: BusinessCardProps) {
  const { t } = useI18n();
  const verifiedLabel = business.verified === 2
    ? `⭐ ${t('business.premium')}`
    : business.verified === 1
      ? `✓ ${t('business.verified')}`
      : null;

  return (
    <Link
      href={`/${business.slug}`}
      className="block rounded-xl border border-gray-200 bg-white p-4 transition-all hover:border-blue-300 hover:shadow-sm"
    >
      <div className="mb-2 flex items-start justify-between gap-3">
        <span className="text-xs text-gray-500">
          {business.category_icon} {business.category_name}
        </span>
        {verifiedLabel && (
          <span className="text-xs font-medium text-green-600">
            {verifiedLabel}
          </span>
        )}
      </div>

      <h2 className="mb-1 font-semibold text-gray-900">{business.name}</h2>
      {business.description && (
        <p className="mb-3 line-clamp-2 text-sm text-gray-600">{business.description}</p>
      )}

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>📍 {business.city}</span>
        {business.review_count > 0 ? (
          <span className="font-medium text-yellow-600">
            ★ {business.avg_rating.toFixed(1)} ({business.review_count})
          </span>
        ) : (
          <span>{t('business.noReviews')}</span>
        )}
      </div>
    </Link>
  );
}
