'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { FormEvent } from 'react';
import { useI18n } from '@/lib/i18n';
import BusinessCard from '@/components/business-card';
import type { BusinessListResponse, CategoryListResponse } from '@/lib/api';

interface HomeContentProps {
  businesses: BusinessListResponse | null;
  categories: CategoryListResponse | null;
  error: string | null;
  params: { city?: string; category?: string; page?: string; search?: string };
}

export default function HomeContent({ businesses, categories, error, params }: HomeContentProps) {
  const { t } = useI18n();
  const router = useRouter();
  const selectedCategory = categories?.data.find((cat) => cat.slug === params.category);
  const hasActiveFilters = Boolean(params.search || params.category || params.city);
  const activeFilters = [
    params.search ? `${t('home.summary.search')}: “${params.search}”` : null,
    selectedCategory ? `${t('home.summary.category')}: ${selectedCategory.name}` : null,
    params.city ? `${t('home.summary.city')}: ${params.city}` : null,
  ].filter(Boolean) as string[];

  const buildHomeHref = (overrides: Partial<Record<'city' | 'category' | 'page' | 'search', string | null>>) => {
    const next = {
      city: params.city ?? null,
      category: params.category ?? null,
      page: params.page ?? null,
      search: params.search ?? null,
      ...overrides,
    };
    const query = new URLSearchParams();

    Object.entries(next).forEach(([key, value]) => {
      const normalized = typeof value === 'string' ? value.trim() : value;
      if (normalized) query.set(key, normalized);
    });

    const queryString = query.toString();
    return queryString ? `/?${queryString}` : '/';
  };

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const search = formData.get('search');
    router.push(
      buildHomeHref({
        search: typeof search === 'string' ? search : null,
        page: null,
      }),
    );
  };

  return (
    <div>
      <div className="mb-8 rounded-[28px] border border-[var(--color-border)] bg-gradient-to-br from-white via-white to-amber-50/70 p-5 shadow-sm sm:p-6">
        <h1 className="mb-2 text-3xl font-bold text-stone-900">
          {t('home.title')}
        </h1>
        <p className="text-stone-500">
          {t('home.subtitle')}
        </p>

        <form onSubmit={handleSearchSubmit} className="mt-5">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="search"
              name="search"
              defaultValue={params.search}
              placeholder={t('home.searchPlaceholder')}
              className="w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-stone-900 outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/15"
            />
            <button
              type="submit"
              className="rounded-2xl bg-[var(--color-primary)] px-5 py-3 font-medium text-white transition hover:opacity-95"
            >
              {t('home.searchButton')}
            </button>
          </div>
        </form>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {hasActiveFilters ? (
              <>
                <span className="text-sm font-medium text-stone-600">{t('home.activeFilters')}</span>
                {activeFilters.map((filter) => (
                  <span
                    key={filter}
                    className="rounded-full bg-stone-100 px-3 py-1 text-sm text-stone-700"
                  >
                    {filter}
                  </span>
                ))}
              </>
            ) : (
              <span className="text-sm text-stone-500">{t('home.filtersHint')}</span>
            )}
          </div>

          {hasActiveFilters && (
            <Link
              href="/"
              className="text-sm font-medium text-[var(--color-primary)] hover:underline"
            >
              {t('home.reset')}
            </Link>
          )}
        </div>

        {categories && (
          <div className="mt-5">
            <p className="mb-3 text-sm font-medium text-stone-600">{t('home.categoriesTitle')}</p>
            <div className="flex flex-wrap gap-2">
              <Link
                href={buildHomeHref({ category: null, page: null })}
                className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  !params.category
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
                    : 'border-[var(--color-border)] bg-white text-stone-700 hover:border-[var(--color-border-hover)]'
                }`}
              >
                {t('home.all')}
              </Link>
              {categories.data.map((cat) => (
                <Link
                  key={cat.id}
                  href={buildHomeHref({ category: cat.slug, page: null })}
                  className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                    params.category === cat.slug
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
                      : 'border-[var(--color-border)] bg-white text-stone-700 hover:border-[var(--color-border-hover)]'
                  }`}
                >
                  {cat.icon} {cat.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-[var(--color-error-border)] bg-[var(--color-error-light)] p-4 text-[var(--color-error)]">
          <p className="font-medium">{t('home.error.title')}</p>
          <p className="mt-1 text-sm">{error}</p>
          <p className="mt-2 text-sm text-[var(--color-error)]">
            {t('home.error.hint')} <code className="rounded bg-[var(--color-error-light)] px-1">pnpm dev:worker</code>
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 rounded-lg border border-[var(--color-error-border)] px-4 py-1.5 text-sm font-medium text-[var(--color-error)] transition-colors hover:bg-[var(--color-error-light)]"
          >
            {t('home.error.retry')}
          </button>
        </div>
      )}

      {businesses && businesses.data.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[var(--color-border)] bg-white/70 py-16 text-center text-stone-400">
          <svg className="mx-auto mb-4 h-12 w-12 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <p className="text-lg font-medium text-stone-700">
            {hasActiveFilters ? t('home.noResultsTitle') : t('home.empty')}
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-stone-500">
            {hasActiveFilters ? t('home.noResultsBody') : t('home.emptyHint')}
          </p>
          <Link href="/" className="mt-4 inline-block text-[var(--color-primary)] hover:underline">
            {hasActiveFilters ? t('home.reset') : t('home.viewAll')}
          </Link>
        </div>
      )}

      {businesses && businesses.data.length > 0 && (
        <>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-stone-500">
              {t('home.showing')} {businesses.data.length} {t('home.of')} {businesses.meta.total} {t('home.businesses')}
            </p>
            {hasActiveFilters && (
              <Link href="/" className="text-sm font-medium text-[var(--color-primary)] hover:underline">
                {t('home.reset')}
              </Link>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {businesses.data.map((business) => (
              <BusinessCard key={business.id} business={business} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
