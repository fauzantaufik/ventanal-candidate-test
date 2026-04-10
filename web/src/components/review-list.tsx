'use client';

import { useState, useEffect, useCallback } from 'react';
import { getReviews, type ReviewItem, type ReviewListResponse } from '@/lib/api';
import { useI18n, type TranslationKey } from '@/lib/i18n';
import StarRating from '@/components/star-rating';

interface ReviewListProps {
  businessSlug: string;
}

function ReviewCard({ review }: { review: ReviewItem }) {
  const { locale, t } = useI18n();

  function timeAgo(dateStr: string): string {
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    const intervals: [number, TranslationKey, TranslationKey][] = [
      [31536000, 'time.year', 'time.years'],
      [2592000, 'time.month', 'time.months'],
      [604800, 'time.week', 'time.weeks'],
      [86400, 'time.day', 'time.days'],
      [3600, 'time.hour', 'time.hours'],
      [60, 'time.minute', 'time.minutes'],
    ];
    for (const [secs, singular, plural] of intervals) {
      const count = Math.floor(seconds / secs);
      if (count >= 1) {
        const unit = t(count === 1 ? singular : plural);
        const prefix = t('time.ago');
        const suffix = t('time.agoSuffix');
        return prefix ? `${prefix} ${count} ${unit}` : `${count} ${unit} ${suffix}`;
      }
    }
    return t('time.now');
  }

  function formatReviewDate(dateStr: string): string {
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return dateStr;
    return new Intl.DateTimeFormat(locale === 'es' ? 'es-VE' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  }

  return (
    <div className="bg-white rounded-xl border border-[var(--color-border)] p-4">
      <div className="flex items-start justify-between gap-3 mb-2">
        <StarRating rating={review.rating} />
        <div className="text-right">
          <p className="text-xs text-stone-500 font-medium">{timeAgo(review.created_at)}</p>
          <p className="text-[11px] text-stone-400">{formatReviewDate(review.created_at)}</p>
        </div>
      </div>
      {review.comment && (
        <p className="text-sm text-stone-700 mb-2 leading-relaxed">
          &ldquo;{review.comment}&rdquo;
        </p>
      )}
      <p className="text-xs text-stone-500">— {review.user_name}</p>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-[var(--color-border)] p-4 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="h-4 w-20 bg-orange-100 rounded" />
        <div className="h-3 w-16 bg-orange-100 rounded" />
      </div>
      <div className="h-3 w-full bg-orange-50 rounded mb-2" />
      <div className="h-3 w-3/4 bg-orange-50 rounded mb-3" />
      <div className="h-3 w-24 bg-orange-100 rounded" />
    </div>
  );
}

const PAGE_SIZE = 10;

export default function ReviewList({ businessSlug }: ReviewListProps) {
  const { t } = useI18n();
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [meta, setMeta] = useState<ReviewListResponse['meta'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchReviews = useCallback(
    async (offset: number, append: boolean) => {
      try {
        if (offset === 0) setLoading(true);
        else setLoadingMore(true);
        setError(null);

        const result = await getReviews(businessSlug, { limit: PAGE_SIZE, offset });

        setMeta(result.meta);
        setReviews((prev) => (append ? [...prev, ...result.data] : result.data));
      } catch {
        setError(t('reviews.error'));
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [businessSlug, t]
  );

  useEffect(() => {
    fetchReviews(0, false);
  }, [fetchReviews]);

  const handleLoadMore = () => {
    if (!meta) return;
    fetchReviews(reviews.length, true);
  };

  const handleRetry = () => {
    fetchReviews(0, false);
  };

  // Loading state — 3 skeleton cards
  if (loading) {
    return (
      <div className="space-y-3">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="rounded-lg border border-[var(--color-error-border)] bg-[var(--color-error-light)] p-4">
        <p className="text-sm text-[var(--color-error)] font-medium mb-3">{error}</p>
        <button
          onClick={handleRetry}
          className="text-sm font-medium text-[var(--color-error)] border border-[var(--color-error-border)] rounded-lg px-4 py-1.5 hover:bg-[var(--color-error-light)] transition-colors"
        >
          {t('reviews.retry')}
        </button>
      </div>
    );
  }

  // Empty state
  if (reviews.length === 0) {
    return (
      <div className="text-center py-10 text-stone-400">
        <svg className="mx-auto mb-3 h-10 w-10 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
        </svg>
        <p className="text-sm font-medium">
          {t('reviews.empty')}
        </p>
      </div>
    );
  }

  const hasMore = meta !== null && reviews.length < meta.total;

  // Data state
  return (
    <div className="space-y-3">
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}

      {hasMore && (
        <div className="pt-2 text-center">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-primary)] border border-orange-200 rounded-lg px-5 py-2 hover:bg-orange-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loadingMore ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-[var(--color-primary)]"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
                {t('reviews.loading')}
              </>
            ) : (
              t('reviews.loadMore')
            )}
          </button>
        </div>
      )}
    </div>
  );
}
