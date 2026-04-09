'use client';

// TODO: Implement the ReviewList component
//
// This component should:
// 1. Fetch reviews from GET /businesses/:slug/reviews on mount
// 2. Show a loading skeleton while fetching (loading state)
// 3. If there are no reviews, show a friendly empty state message
// 4. If there's an error, show an error state with a retry button
// 5. For each review, show:
//    - Star rating (★ symbols)
//    - Review comment (if any)
//    - Reviewer name
//    - Date (human-readable, e.g. "hace 3 días")
// 6. Newest reviews first
//
// This is the State Triad pattern: Loading → Empty | Error | Data

interface ReviewListProps {
  businessSlug: string;
}

export default function ReviewList({ businessSlug }: ReviewListProps) {
  // TODO: Implement
  return (
    <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center text-sm text-gray-400">
      <p className="font-medium">ReviewList — por implementar</p>
      <p className="mt-1 text-xs">businessSlug: {businessSlug}</p>
    </div>
  );
}
