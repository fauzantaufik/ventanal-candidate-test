'use client';

import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { StarIcon, StarOutlineIcon, MapPinIcon } from '@/components/icons';
import ReviewForm from '@/components/review-form';
import ReviewList from '@/components/review-list';

interface Business {
  slug: string;
  name: string;
  description: string;
  city: string;
  address: string | null;
  phone: string | null;
  whatsapp: string | null;
  category_name: string;
  category_icon: string;
  verified: number;
  avg_rating: number;
  review_count: number;
}

interface BusinessDetailProps {
  business: Business;
  slug: string;
}

export default function BusinessDetail({ business, slug }: BusinessDetailProps) {
  const { t } = useI18n();

  const verifiedLabels: Record<number, { label: string; color: string }> = {
    0: { label: t('detail.unverified'), color: 'bg-stone-100 text-stone-500' },
    1: { label: t('detail.verified'), color: 'bg-green-100 text-green-700' },
    2: { label: t('detail.premium'), color: 'bg-amber-100 text-amber-700' },
  };
  const badge = verifiedLabels[business.verified] ?? verifiedLabels[0];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back link */}
      <Link href="/" className="text-sm text-[var(--color-primary)] hover:underline mb-6 inline-block">
        {t('detail.back')}
      </Link>

      {/* Business header */}
      <div className="bg-white rounded-xl border border-[var(--color-border)] p-6 mb-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <span className="text-sm text-stone-500">
              {business.category_icon} {business.category_name}
            </span>
            <h1 className="text-2xl font-bold text-stone-900 mt-1">{business.name}</h1>
          </div>
          <span
            title={business.verified === 2 ? t('badge.premium.tooltip') : business.verified === 1 ? t('badge.verified.tooltip') : undefined}
            className={`text-xs px-2 py-1 rounded-full font-medium ${badge.color} ${business.verified > 0 ? 'cursor-help' : ''}`}
          >
            {badge.label}
          </span>
        </div>

        <p className="text-stone-700 mb-4">{business.description}</p>

        <div className="flex items-center gap-4 text-sm text-stone-500">
          <span className="inline-flex items-center gap-1">
            <MapPinIcon className="h-4 w-4 text-[var(--color-primary)]" /> {business.city}
          </span>
          {business.address && <span>{business.address}</span>}
        </div>

        {/* Rating summary */}
        {business.review_count > 0 && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-stone-100">
            <span className="flex items-center gap-0.5 text-amber-500">
              {Array.from({ length: 5 }).map((_, i) =>
                i < Math.round(business.avg_rating)
                  ? <StarIcon key={i} className="h-5 w-5" />
                  : <StarOutlineIcon key={i} className="h-5 w-5" />
              )}
            </span>
            <span className="text-sm text-stone-500">
              {business.avg_rating.toFixed(1)} ({business.review_count} {t('detail.reviews')})
            </span>
          </div>
        )}

        {/* Contact buttons */}
        <div className="flex gap-3 mt-4">
          {business.whatsapp && (
            <a
              href={`https://wa.me/${business.whatsapp.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600"
            >
              WhatsApp
            </a>
          )}
          {business.phone && (
            <a
              href={`tel:${business.phone}`}
              className="flex-1 text-center bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[var(--color-primary-hover)] transition-colors"
            >
              {t('detail.call')}
            </a>
          )}
        </div>
      </div>

      {/* Reviews section */}
      <section id="reviews" className="bg-white rounded-xl border border-[var(--color-border)] p-6">
        <h2 className="text-lg font-semibold text-stone-900 mb-4">{t('detail.reviewsTitle')}</h2>

        <div className="mb-6">
          <ReviewForm businessSlug={slug} />
        </div>

        <div className="pt-6 border-t border-stone-100">
          <ReviewList businessSlug={slug} />
        </div>
      </section>
    </div>
  );
}
