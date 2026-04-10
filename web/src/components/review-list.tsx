'use client';

import { useState, useEffect, useCallback } from 'react';
import { getReviews, type ReviewItem, type ReviewListResponse } from '@/lib/api';

interface ReviewListProps {
  businessSlug: string;
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  const intervals: [number, string, string][] = [
    [31536000, 'año', 'años'],
    [2592000, 'mes', 'meses'],
    [604800, 'semana', 'semanas'],
    [86400, 'día', 'días'],
    [3600, 'hora', 'horas'],
    [60, 'minuto', 'minutos'],
  ];
  for (const [secs, singular, plural] of intervals) {
    const count = Math.floor(seconds / secs);
    if (count >= 1) return `hace ${count} ${count === 1 ? singular : plural}`;
  }
  return 'ahora mismo';
}

function formatReviewDate(dateStr: string): string {
  const date = new Date(dateStr);

  if (Number.isNaN(date.getTime())) {
    return dateStr;
  }

  return new Intl.DateTimeFormat('es-VE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function StarRating({ rating }: { rating: number }) {
  const filled = Math.max(0, Math.min(5, Math.round(rating)));
  return (
    <span className="text-yellow-500" aria-label={`${rating} de 5 estrellas`}>
      {'★'.repeat(filled)}
      <span className="text-gray-300">{'☆'.repeat(5 - filled)}</span>
    </span>
  );
}

function ReviewCard({ review }: { review: ReviewItem }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-start justify-between gap-3 mb-2">
        <StarRating rating={review.rating} />
        <div className="text-right">
          <p className="text-xs text-gray-500 font-medium">{timeAgo(review.created_at)}</p>
          <p className="text-[11px] text-gray-400">{formatReviewDate(review.created_at)}</p>
        </div>
      </div>
      {review.comment && (
        <p className="text-sm text-gray-700 mb-2 leading-relaxed">
          &ldquo;{review.comment}&rdquo;
        </p>
      )}
      <p className="text-xs text-gray-500">— {review.user_name}</p>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="h-4 w-20 bg-gray-200 rounded" />
        <div className="h-3 w-16 bg-gray-200 rounded" />
      </div>
      <div className="h-3 w-full bg-gray-200 rounded mb-2" />
      <div className="h-3 w-3/4 bg-gray-200 rounded mb-3" />
      <div className="h-3 w-24 bg-gray-200 rounded" />
    </div>
  );
}

const PAGE_SIZE = 10;

export default function ReviewList({ businessSlug }: ReviewListProps) {
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
        setError('No se pudieron cargar las reseñas. Por favor intenta de nuevo.');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [businessSlug]
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
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-red-700 font-medium mb-3">{error}</p>
        <button
          onClick={handleRetry}
          className="text-sm font-medium text-red-700 border border-red-300 rounded-lg px-4 py-1.5 hover:bg-red-100 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  // Empty state
  if (reviews.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400">
        <p className="text-sm font-medium">
          Este negocio aún no tiene reseñas. ¡Sé el primero!
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
            className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg px-5 py-2 hover:bg-blue-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loadingMore ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-blue-600"
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
                Cargando...
              </>
            ) : (
              'Cargar más reseñas'
            )}
          </button>
        </div>
      )}
    </div>
  );
}
