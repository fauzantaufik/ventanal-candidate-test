import { getBusinesses, getCategories } from '@/lib/api';
import HomeContent from '@/components/home-content';

export const dynamic = 'force-dynamic';

interface SearchParams {
  city?: string;
  category?: string;
  page?: string;
  search?: string;
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = params.page ? Number.parseInt(params.page, 10) : 1;

  let businesses;
  let categories;
  let error: string | null = null;

  try {
    [businesses, categories] = await Promise.all([
      getBusinesses({
        city: params.city,
        category: params.category,
        search: params.search?.trim() || undefined,
        page: Number.isFinite(page) && page > 0 ? page : 1,
      }),
      getCategories(),
    ]);
  } catch (e) {
    error = e instanceof Error ? e.message : 'No se pudieron cargar los negocios.';
    businesses = null;
    categories = null;
  }

  return (
    <HomeContent
      businesses={businesses ?? null}
      categories={categories ?? null}
      error={error}
      params={params}
    />
  );
}
