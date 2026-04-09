import type { Business } from '@/lib/api';

interface BusinessCardProps {
  business: Business;
}

export default function BusinessCard({ business }: BusinessCardProps) {
  const verifiedIcon = business.verified === 2 ? '⭐' : business.verified === 1 ? '✓' : null;

  return (
    <a
      href={`/${business.slug}`}
      className="block bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-300 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs text-gray-500">
          {business.category_icon} {business.category_name}
        </span>
        {verifiedIcon && (
          <span className="text-xs text-green-600 font-medium">
            {verifiedIcon} Verificado
          </span>
        )}
      </div>

      <h2 className="font-semibold text-gray-900 mb-1">{business.name}</h2>
      <p className="text-sm text-gray-600 line-clamp-2 mb-3">{business.description}</p>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>📍 {business.city}</span>
        {business.review_count > 0 ? (
          <span className="text-yellow-600 font-medium">
            ★ {business.avg_rating.toFixed(1)} ({business.review_count})
          </span>
        ) : (
          <span>Sin reseñas aún</span>
        )}
      </div>
    </a>
  );
}
