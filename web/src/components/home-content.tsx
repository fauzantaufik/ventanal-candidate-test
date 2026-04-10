'use client';

import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import BusinessCard from '@/components/business-card';
import type { BusinessListResponse, CategoryListResponse } from '@/lib/api';

interface HomeContentProps {
  businesses: BusinessListResponse | null;
  categories: CategoryListResponse | null;
  error: string | null;
  params: { city?: string; category?: string; page?: string };
}

export default function HomeContent({ businesses, categories, error, params }: HomeContentProps) {
  const { t } = useI18n();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-900 mb-2">
          {t('home.title')}
        </h1>
        <p className="text-stone-500">
          {t('home.subtitle')}
        </p>
      </div>

      {/* Category filter */}
      {categories && (
        <div className="flex gap-2 flex-wrap mb-6">
          <Link
            href="/"
            className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
              !params.category
                ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                : 'bg-white text-stone-700 border-[var(--color-border)] hover:border-[var(--color-border-hover)]'
            }`}
          >
            {t('home.all')}
          </Link>
          {categories.data.map((cat) => (
            <Link
              key={cat.id}
              href={`/?category=${cat.slug}`}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                params.category === cat.slug
                  ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                  : 'bg-white text-stone-700 border-[var(--color-border)] hover:border-[var(--color-border-hover)]'
              }`}
            >
              {cat.icon} {cat.name}
            </Link>
          ))}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          <p className="font-medium">{t('home.error.title')}</p>
          <p className="text-sm mt-1">{error}</p>
          <p className="text-sm mt-2 text-red-600">
            {t('home.error.hint')} <code className="bg-red-100 px-1 rounded">pnpm dev:worker</code>
          </p>
        </div>
      )}

      {/* Empty state */}
      {businesses && businesses.data.length === 0 && (
        <div className="text-center py-16 text-stone-400">
          <svg className="mx-auto mb-4 h-12 w-12 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <p className="text-lg">{t('home.empty')}</p>
          <Link href="/" className="text-[var(--color-primary)] hover:underline mt-2 inline-block">
            {t('home.viewAll')}
          </Link>
        </div>
      )}

      {/* Business grid */}
      {businesses && businesses.data.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {businesses.data.map((business) => (
              <BusinessCard key={business.id} business={business} />
            ))}
          </div>
          <p className="text-sm text-stone-500 mt-4">
            {t('home.showing')} {businesses.data.length} {t('home.of')} {businesses.meta.total} {t('home.businesses')}
          </p>
        </>
      )}
    </div>
  );
}
