import { Star, Pencil, MessageSquareText } from "lucide-react";

const ReviewListSkeleton = () => (
  <div className="mt-6 space-y-4" aria-label="Loading reviews">
    {Array.from({ length: 3 }, (_, idx) => (
      <div key={idx} className="card p-5 sm:p-6">
        <div className="mb-5 flex items-start gap-3">
          <div className="animate-skeleton h-11 w-11 shrink-0 rounded-full" />

          <div className="flex-1 space-y-2 pt-1">
            <div className="animate-skeleton h-4 w-28 rounded-md" />
            <div className="animate-skeleton h-3 w-24 rounded-md" />
          </div>

          <div className="animate-skeleton h-8 w-16 rounded-lg" />
        </div>

        <div className="space-y-2">
          <div className="animate-skeleton h-3 w-full rounded-md" />
          <div className="animate-skeleton h-3 w-11/12 rounded-md" />
          <div className="animate-skeleton h-3 w-2/3 rounded-md" />
        </div>
      </div>
    ))}
  </div>
);

const ReviewList = ({ reviews = [], currentUserId, onEdit, loading }) => {
  if (loading) {
    return <ReviewListSkeleton />;
  }

  if (!Array.isArray(reviews) || reviews.length === 0) {
    return (
      <div className="card mt-6 px-5 py-10 text-center sm:py-12">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-[var(--primary)]">
          <MessageSquareText size={27} />
        </div>

        <h3 className="text-base font-bold text-[var(--text-main)]">
          No reviews yet
        </h3>

        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[var(--text-secondary)]">
          Be the first to share your experience with this product.
        </p>
      </div>
    );
  }

  return (
    <section className="mt-6 space-y-4" aria-label="Customer reviews">
      {reviews.map((review) => {
        const username = review.user?.username || "Anonymous";
        const isCurrentUser = review.userId === currentUserId;
        const rating = Math.min(
          5,
          Math.max(0, Number(review.rating) || 0)
        );

        return (
          <article
            key={review.id}
            className="card p-5 transition-all duration-300 hover:border-indigo-200 hover:shadow-md sm:p-6"
          >
            {/* Reviewer information */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-base font-bold text-[var(--primary)] ring-4 ring-indigo-50/60">
                  {username.charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[var(--text-main)] sm:text-base">
                    {username}
                  </p>

                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <div
                      className="flex items-center gap-0.5"
                      aria-label={`${rating} out of 5 stars`}
                    >
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={15}
                          strokeWidth={1.8}
                          className={
                            star <= rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-gray-200"
                          }
                        />
                      ))}
                    </div>

                    <span className="text-xs font-medium text-[var(--text-secondary)]">
                      {rating.toFixed(1)} / 5
                    </span>
                  </div>
                </div>
              </div>

              {isCurrentUser && (
                <button
                  type="button"
                  onClick={() => onEdit?.(review)}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-indigo-200 bg-white px-3 py-2 text-xs font-semibold text-[var(--primary)] transition hover:border-indigo-300 hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 sm:text-sm"
                  aria-label="Edit your review"
                >
                  <Pencil size={14} />
                  Edit
                </button>
              )}
            </div>

            {/* Review comment */}
            <div className="mt-5 border-t border-gray-100 pt-4">
              <p className="whitespace-pre-line break-words text-sm leading-7 text-[var(--text-main)] sm:text-base">
                {review.comment || "No comment provided."}
              </p>
            </div>
          </article>
        );
      })}
    </section>
  );
};

export default ReviewList;