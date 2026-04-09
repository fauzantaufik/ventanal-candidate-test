const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8787';

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

export interface Business {
  id: string;
  slug: string;
  name: string;
  description: string;
  category_id: string;
  category_name: string;
  category_slug: string;
  category_icon: string;
  city: string;
  address: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  website: string | null;
  verified: number;
  avg_rating: number;
  review_count: number;
  created_at: string;
}

export interface BusinessListResponse {
  data: Business[];
  meta: { total: number; page: number; limit: number };
}

export async function getBusinesses(params?: {
  page?: number;
  city?: string;
  category?: string;
}): Promise<BusinessListResponse> {
  const url = new URL(`${API_URL}/businesses`);
  if (params?.page) url.searchParams.set('page', String(params.page));
  if (params?.city) url.searchParams.set('city', params.city);
  if (params?.category) url.searchParams.set('category', params.category);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Failed to fetch businesses: ${res.status}`);
  return res.json();
}

export async function getBusiness(slug: string): Promise<{ data: Business }> {
  const res = await fetch(`${API_URL}/businesses/${slug}`);
  if (!res.ok) {
    if (res.status === 404) throw new Error('Business not found');
    throw new Error(`Failed to fetch business: ${res.status}`);
  }
  return res.json();
}

export async function getCategories(): Promise<{ data: Category[] }> {
  const res = await fetch(`${API_URL}/categories`);
  if (!res.ok) throw new Error(`Failed to fetch categories: ${res.status}`);
  return res.json();
}
