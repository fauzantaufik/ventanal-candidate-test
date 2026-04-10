import { getBusinesses, getCategories } from '@/lib/api';
import HomeContent from '@/components/home-content';

interface SearchParams {
  city?: string;
  category?: string;
  page?: string;
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  let businesses;
  let categories;
  let error: string | null = null;

  try {
    [businesses, categories] = await Promise.all([
      getBusinesses({
        city: params.city,
        category: params.category,
        page: params.page ? parseInt(params.page) : 1,
      }),
      getCategories(),
    ]);
  } catch (e) {
    error = e instanceof Error ? e.message : 'Error loading businesses';
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
