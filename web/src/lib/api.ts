import { hc, type InferRequestType, type InferResponseType } from 'hono/client';
import type { AppType } from '../../../worker/src/index';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8787';
const client = hc<AppType>(API_URL);
const categoriesClient = client.categories;
const businessesClient = client.businesses;
const businessBySlugClient = client.businesses[':slug'];

export type CategoryListResponse = InferResponseType<typeof categoriesClient.$get, 200>;
export type Category = CategoryListResponse['data'][number];

export type BusinessesRequest = InferRequestType<typeof businessesClient.$get>;
// Hono infers query types fully when routes use validator middleware.
export type BusinessesQuery = BusinessesRequest extends { query: infer Q }
  ? NonNullable<Q>
  : {
      page?: string;
      city?: string;
      category?: string;
    };
export type BusinessListResponse = InferResponseType<typeof businessesClient.$get, 200>;
export type Business = BusinessListResponse['data'][number];

export type BusinessRequest = InferRequestType<typeof businessBySlugClient.$get>;
export type BusinessSlug = BusinessRequest extends { param: { slug: infer S } }
  ? S
  : string;
export type BusinessResponse = InferResponseType<typeof businessBySlugClient.$get, 200>;

export async function getBusinesses(params?: {
  page?: number | BusinessesQuery['page'];
  city?: BusinessesQuery['city'];
  category?: BusinessesQuery['category'];
}): Promise<BusinessListResponse> {
  const query: BusinessesQuery = {};

  if (params?.page) query.page = String(params.page);
  if (params?.city) query.city = params.city;
  if (params?.category) query.category = params.category;

  const res = await businessesClient.$get({ query });
  if (!res.ok) throw new Error(`Failed to fetch businesses: ${res.status}`);

  return (await res.json()) as BusinessListResponse;
}

export async function getBusiness(slug: BusinessSlug): Promise<BusinessResponse> {
  const res = await businessBySlugClient.$get({ param: { slug } });

  if (!res.ok) {
    if (res.status === 404) throw new Error('Business not found');
    throw new Error(`Failed to fetch business: ${res.status}`);
  }

  return (await res.json()) as BusinessResponse;
}

export async function getCategories(): Promise<CategoryListResponse> {
  const res = await categoriesClient.$get();
  if (!res.ok) throw new Error(`Failed to fetch categories: ${res.status}`);

  return (await res.json()) as CategoryListResponse;
}
