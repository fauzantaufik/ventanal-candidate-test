import Link from 'next/link';
import { getBusiness } from '@/lib/api';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function BusinessPage({ params }: PageProps) {
  const { slug } = await params;

  let business;
  try {
    const result = await getBusiness(slug);
    business = result.data;
  } catch (e) {
    if (e instanceof Error && e.message === 'Business not found') {
      notFound();
    }
    throw e;
  }

  const verifiedLabels: Record<number, { label: string; color: string }> = {
    0: { label: 'Sin verificar', color: 'bg-gray-100 text-gray-600' },
    1: { label: 'Verificado', color: 'bg-green-100 text-green-700' },
    2: { label: 'Premium', color: 'bg-yellow-100 text-yellow-700' },
  };
  const badge = verifiedLabels[business.verified] ?? verifiedLabels[0];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back link */}
      <Link href="/" className="text-sm text-blue-600 hover:underline mb-6 inline-block">
        ← Volver al directorio
      </Link>

      {/* Business header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <span className="text-sm text-gray-500">
              {business.category_icon} {business.category_name}
            </span>
            <h1 className="text-2xl font-bold text-gray-900 mt-1">{business.name}</h1>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${badge.color}`}>
            {badge.label}
          </span>
        </div>

        <p className="text-gray-700 mb-4">{business.description}</p>

        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>📍 {business.city}</span>
          {business.address && <span>{business.address}</span>}
        </div>

        {/* Rating summary */}
        {business.review_count > 0 && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
            <span className="text-yellow-500 font-semibold">
              {'★'.repeat(Math.round(business.avg_rating))}{'☆'.repeat(5 - Math.round(business.avg_rating))}
            </span>
            <span className="text-sm text-gray-600">
              {business.avg_rating.toFixed(1)} ({business.review_count} reseñas)
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
              className="flex-1 text-center bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              Llamar
            </a>
          )}
        </div>
      </div>

      {/* Reviews section — placeholder */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Reseñas</h2>

        {/* TODO: Replace this placeholder with ReviewList and ReviewForm components */}
        <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
          <p className="text-sm font-medium">Sistema de reseñas — por implementar</p>
          <p className="text-xs mt-1">
            Agrega los componentes ReviewList y ReviewForm aquí.
            <br />
            Ver <code>FEATURE_REQUEST.md</code> para los detalles.
          </p>
        </div>
      </div>
    </div>
  );
}
