import { hc, type InferRequestType, type InferResponseType } from 'hono/client';
import type { AppType } from '../../../worker/src/index';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8787';
const TUNNEL_HEADERS: HeadersInit = /ngrok(?:-free)?\.(?:app|dev|io)$/i.test(new URL(API_URL).hostname)
  ? { 'ngrok-skip-browser-warning': 'true' }
  : {};

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

// Reviews — manual typed fetch because the worker reviews route is not yet
// registered with Hono RPC validator middleware, so InferResponseType would
// resolve to `unknown`. We define the shape here and cast.
export interface ReviewItem {
  id: string;
  user_name: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface ReviewListResponse {
  data: ReviewItem[];
  meta: {
    total: number;
    limit: number;
    offset: number;
  };
}

export async function getReviews(
  slug: string,
  params?: { limit?: number; offset?: number }
): Promise<ReviewListResponse> {
  const limit = params?.limit ?? 10;
  const offset = params?.offset ?? 0;
  const url = `${API_URL}/businesses/${encodeURIComponent(slug)}/reviews?limit=${limit}&offset=${offset}`;
  const res = await fetch(url, {
    headers: TUNNEL_HEADERS,
  });
  if (!res.ok) throw new Error(`Failed to fetch reviews: ${res.status}`);
  return (await res.json()) as ReviewListResponse;
}

export interface SubmitReviewPayload {
  rating: number;
  comment?: string;
}

export interface SubmitReviewResponse {
  success: true;
  data: {
    id: string;
    user_name: string;
    rating: number;
    comment: string | null;
    created_at: string;
  };
  business: {
    avg_rating: number;
    review_count: number;
  };
}

export class ReviewError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ReviewError';
  }
}

export async function submitReview(
  slug: string,
  payload: SubmitReviewPayload,
  token: string,
): Promise<SubmitReviewResponse> {
  const res = await fetch(`${API_URL}/businesses/${encodeURIComponent(slug)}/reviews`, {
    method: 'POST',
    headers: {
      ...TUNNEL_HEADERS,
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (res.ok) {
    return (await res.json()) as SubmitReviewResponse;
  }

  const errBody = await res.json().catch(() => ({})) as { error?: string };
  const message = errBody.error ?? 'No se pudo guardar la reseña. Inténtalo de nuevo.';
  throw new ReviewError(message, res.status);
}
