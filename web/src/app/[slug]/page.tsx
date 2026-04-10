import { getBusiness } from '@/lib/api';
import { notFound } from 'next/navigation';
import BusinessDetail from '@/components/business-detail';

export const dynamic = 'force-dynamic';

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

  return <BusinessDetail business={business} slug={slug} />;
}
