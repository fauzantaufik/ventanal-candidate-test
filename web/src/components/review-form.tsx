'use client';

// TODO: Implement the ReviewForm component
//
// This component should:
// 1. Only render if the user is authenticated (check Supabase session)
// 2. Show a star rating picker (1-5 stars, interactive)
// 3. Show a textarea for the review comment (optional, max 500 chars)
// 4. Show a character count for the textarea
// 5. On submit, call POST /businesses/:slug/reviews with the JWT in the Authorization header
// 6. Show loading state while submitting
// 7. Show success message after submission, then clear the form
// 8. Show an error message if the API returns an error
// 9. If user is not authenticated, show a CTA to log in (link to /auth/login)
//
// The form should be disabled if the user has already reviewed this business
// (the API will return 409 — handle this gracefully)

interface ReviewFormProps {
  businessSlug: string;
  onReviewSubmitted?: () => void;
}

export default function ReviewForm({ businessSlug, onReviewSubmitted }: ReviewFormProps) {
  // TODO: Implement
  return (
    <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center text-sm text-gray-400">
      <p className="font-medium">ReviewForm — por implementar</p>
      <p className="mt-1 text-xs">businessSlug: {businessSlug}</p>
    </div>
  );
}
