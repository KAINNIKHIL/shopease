import { Star, StarHalf, MessageSquareText } from "lucide-react";

const RatingBreakdownSkeleton = () => (
  <div className="space-y-5">
    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
      <div className="space-y-3 sm:w-40">
        <div className="animate-skeleton h-10 w-20 rounded-lg" />
        <div className="animate-skeleton h-4 w-28 rounded" />
        <div className="animate-skeleton h-3 w-32 rounded" />
      </div>

      <div className="flex-1 space-y-3">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="animate-skeleton h-3 w-8 rounded" />
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-gray-100">
              <div
                className="animate-skeleton h-full rounded-full"
                style={{ width: `${85 - i * 15}%` }}
              />
            </div>
            <div className="animate-skeleton h-3 w-10 rounded" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

const RatingBreakdown = ({ reviews, loading = false }) => {
  const validReviews = Array.isArray(reviews)
    ? reviews.filter(
        (review) =>
          Number.isFinite(Number(review.rating)) &&
          Number(review.rating) >= 1 &&
          Number(review.rating) <= 5
      )
    : [];

  const total = validReviews.length;

  const ratingCounts = [5, 4, 3, 2, 1].map((star) => {
    const count = validReviews.filter(
      (review) => Number(review.rating) === star
    ).length;

    return {
      star,
      count,
      percent: total ? Math.round((count / total) * 100) : 0,
    };
  });

  const average = total
    ? (
        validReviews.reduce(
          (sum, review) => sum + Number(review.rating),
          0
        ) / total
      ).toFixed(1)
    : "0.0";

  if (loading) {
    return (
      <section
        aria-label="Loading rating breakdown"
        className="card p-5 sm:p-6"
      >
        <RatingBreakdownSkeleton />
      </section>
    );
  }

  if (!total) {
    return (
      <section className="card p-6 sm:p-8">
        <div className="flex flex-col items-center justify-center py-5 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-[var(--primary)]">
            <MessageSquareText size={26} />
          </div>

          <h3 className="text-base font-semibold text-[var(--text-main)]">
            No ratings yet
          </h3>
          <p className="mt-1 max-w-xs text-sm leading-6 text-[var(--text-secondary)]">
            Customer ratings will appear here once reviews are available.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      aria-label="Customer rating breakdown"
      className="card p-5 transition-shadow duration-300 hover:shadow-xl sm:p-6"
    >
      <div className="mb-6">
        <h2 className="text-lg font-bold text-[var(--text-main)]">
          Customer ratings
        </h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Here's what customers think about this product.
        </p>
      </div>

      <div className="flex flex-col gap-7 sm:flex-row sm:items-center sm:gap-8">
        {/* Average rating */}
        <div className="flex shrink-0 flex-col items-center text-center sm:w-40 sm:border-r sm:border-gray-200 sm:pr-8">
          <div className="flex items-center gap-2">
            <Star
              size={25}
              className="fill-amber-400 text-amber-400"
            />
            <span className="text-4xl font-bold tracking-tight text-[var(--text-main)]">
              {average}
            </span>
          </div>

          <div
            className="mt-2 flex items-center gap-0.5"
            aria-label={`${average} out of 5 stars`}
          >
            {Array.from({ length: 5 }, (_, i) => {
              const difference = Number(average) - i;

              return difference >= 1 ? (
                <Star
                  key={i}
                  size={17}
                  className="fill-amber-400 text-amber-400"
                />
              ) : difference >= 0.5 ? (
                <StarHalf
                  key={i}
                  size={17}
                  className="fill-amber-400 text-amber-400"
                />
              ) : (
                <Star
                  key={i}
                  size={17}
                  className="text-gray-200"
                />
              );
            })}
          </div>

          <p className="mt-2 text-sm font-medium text-[var(--text-secondary)]">
            {total.toLocaleString("en-IN")}{" "}
            {total === 1 ? "review" : "reviews"}
          </p>
        </div>

        {/* Rating distribution */}
        <div className="w-full flex-1 space-y-4">
          {ratingCounts.map(({ star, count, percent }) => (
            <div
              key={star}
              className="grid grid-cols-[34px_minmax(0,1fr)_68px] items-center gap-3"
            >
              <div className="flex items-center gap-1.5 text-sm font-medium text-[var(--text-main)]">
                <span>{star}</span>
                <Star
                  size={13}
                  className="fill-amber-400 text-amber-400"
                />
              </div>

              <div
                className="h-2.5 overflow-hidden rounded-full bg-gray-100"
                role="progressbar"
                aria-label={`${star} star ratings`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={percent}
              >
                <div
                  className="h-full rounded-full bg-[var(--primary)] transition-all duration-700 ease-out"
                  style={{ width: `${percent}%` }}
                />
              </div>

              <span className="text-right text-xs text-[var(--text-secondary)] sm:text-sm">
                {percent}% <span className="text-gray-400">({count})</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RatingBreakdown;