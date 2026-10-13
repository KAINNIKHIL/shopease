import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "../hooks/useAuth";
import { Star, MessageSquareText, X, Plus, RefreshCw } from "lucide-react";
import ReviewList from "./ReviewList";
import RatingBreakdown from "./RatingBreakdown";
import ReviewForm from "./ReviewForm";

const ReviewSection = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [editingReview, setEditingReview] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const { user } = useAuth();

  const fetchReviews = useCallback(async () => {
    if (!productId) {
      setReviews([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setFetchError("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/reviews/${productId}`
      );

      if (!response.ok) {
        throw new Error("Unable to load reviews.");
      }

      const data = await response.json();
      setReviews(Array.isArray(data.reviews) ? data.reviews : []);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
      setFetchError("We couldn't load the reviews. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Handle ESC key and lock background scrolling when modal is open
  useEffect(() => {
    if (!showForm) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setShowForm(false);
        setEditingReview(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showForm]);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return "0.0";

    const total = reviews.reduce(
      (sum, review) => sum + Number(review.rating || 0),
      0
    );

    return (total / reviews.length).toFixed(1);
  }, [reviews]);

  const openCreateForm = () => {
    setEditingReview(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingReview(null);
  };

  const handleReviewSuccess = (newReview) => {
    setReviews((previousReviews) => {
      const existingIndex = previousReviews.findIndex(
        (review) =>
          (newReview.id != null && review.id === newReview.id) ||
          (newReview.userId != null &&
            String(review.userId) === String(newReview.userId))
      );

      if (existingIndex !== -1) {
        const updatedReviews = [...previousReviews];
        updatedReviews[existingIndex] = {
          ...updatedReviews[existingIndex],
          ...newReview,
        };
        return updatedReviews;
      }

      return [newReview, ...previousReviews];
    });

    closeForm();
  };

  return (
    <section className="mt-12">
      {/* Section heading */}
      <div className="mb-7">
        <div className="mb-2 flex items-center gap-2">
          <MessageSquareText
            size={22}
            className="text-[var(--primary)]"
          />
          <h2 className="text-xl font-bold text-[var(--text-main)] sm:text-2xl">
            Customer Reviews
          </h2>
        </div>

        <p className="text-sm text-[var(--text-secondary)]">
          Honest feedback from people who shopped with ShopEase.
        </p>
      </div>

      {/* Rating summary */}
      {loading ? (
        <div className="mb-8 space-y-3">
          <div className="animate-skeleton h-6 w-36 rounded-md" />
          <div className="animate-skeleton h-3 w-full max-w-md rounded-full" />
        </div>
      ) : fetchError ? (
        <div
          className="mb-8 rounded-xl border border-red-200 bg-red-50 p-4"
          role="alert"
        >
          <p className="text-sm text-red-700">{fetchError}</p>
          <button
            type="button"
            onClick={fetchReviews}
            className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-red-700 hover:underline"
          >
            <RefreshCw size={15} />
            Try again
          </button>
        </div>
      ) : reviews.length > 0 ? (
        <div className="card mb-8 grid gap-6 p-5 sm:p-6 md:grid-cols-[minmax(150px,0.8fr)_minmax(0,2fr)] md:items-center">
          <div className="text-center md:border-r md:border-gray-200 md:pr-6">
            <p className="text-4xl font-bold tracking-tight text-[var(--text-main)]">
              {averageRating}
              <span className="text-lg font-medium text-[var(--text-secondary)]">
                /5
              </span>
            </p>

            <div
              className="mt-2 flex justify-center gap-1"
              aria-label={`Average rating: ${averageRating} out of 5`}
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={19}
                  className={
                    star <= Math.round(Number(averageRating))
                      ? "fill-amber-400 text-amber-400"
                      : "text-gray-300"
                  }
                />
              ))}
            </div>

            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Based on {reviews.length} review
              {reviews.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="min-w-0">
            <RatingBreakdown reviews={reviews} />
          </div>
        </div>
      ) : null}

      {/* Write review action */}
      <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <h3 className="text-lg font-semibold text-[var(--text-main)]">
          What shoppers are saying
        </h3>

        <button
          type="button"
          onClick={openCreateForm}
          className="btn-primary inline-flex !w-full items-center justify-center gap-2 px-5 py-3 text-sm font-semibold sm:!w-auto"
        >
          <Plus size={17} />
          Write a Review
        </button>
      </div>

      {/* Review list */}
      {fetchError ? null : (
        <ReviewList
          reviews={reviews}
          currentUserId={user?.id}
          loading={loading}
          onEdit={(review) => {
            setEditingReview(review);
            setShowForm(true);
          }}
        />
      )}

      {/* Review modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/50 p-3 backdrop-blur-[2px] sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeForm();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="review-modal-title"
            className="card relative my-auto max-h-[90vh] w-full max-w-xl overflow-y-auto p-0 shadow-2xl"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-[var(--card-bg)] px-5 py-4">
              <h3
                id="review-modal-title"
                className="font-semibold text-[var(--text-main)]"
              >
                {editingReview ? "Edit your review" : "Write a review"}
              </h3>

              <button
                type="button"
                onClick={closeForm}
                aria-label="Close review form"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--text-secondary)] transition hover:bg-gray-100 hover:text-[var(--text-main)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
              >
                <X size={19} />
              </button>
            </div>

            <div className="p-4 sm:p-6 [&>section]:mt-0 [&>section]:border-none [&>section]:shadow-none [&>section>div:first-child]:hidden">
              <ReviewForm
                key={editingReview?.id ?? "new-review"}
                productId={productId}
                existingReview={editingReview}
                onSuccess={handleReviewSuccess}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ReviewSection;