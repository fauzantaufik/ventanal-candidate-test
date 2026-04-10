import Link from 'next/link';
import { getBusinesses, getCategories } from '@/lib/api';
import BusinessCard from '@/components/business-card';

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
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Encuentra negocios locales
        </h1>
        <p className="text-gray-600">
          Descubre servicios verificados cerca de ti
        </p>
      </div>

      {/* Category filter */}
      {categories && (
        <div className="flex gap-2 flex-wrap mb-6">
          <Link
            href="/"
            className={`px-3 py-1.5 rounded-full text-sm border ${
              !params.category
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
            }`}
          >
            Todos
          </Link>
          {categories.data.map((cat) => (
            <Link
              key={cat.id}
              href={`/?category=${cat.slug}`}
              className={`px-3 py-1.5 rounded-full text-sm border ${
                params.category === cat.slug
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
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
          <p className="font-medium">Error al cargar negocios</p>
          <p className="text-sm mt-1">{error}</p>
          <p className="text-sm mt-2 text-red-600">
            Asegúrate de que el worker esté corriendo: <code className="bg-red-100 px-1 rounded">pnpm dev:worker</code>
          </p>
        </div>
      )}

      {/* Empty state */}
      {businesses && businesses.data.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg">No se encontraron negocios</p>
          <Link href="/" className="text-blue-600 hover:underline mt-2 inline-block">
            Ver todos los negocios
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
          <p className="text-sm text-gray-500 mt-4">
            Mostrando {businesses.data.length} de {businesses.meta.total} negocios
          </p>
        </>
      )}
    </div>
  );
}
