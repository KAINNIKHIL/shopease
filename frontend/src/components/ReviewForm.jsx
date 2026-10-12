import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Star, MessageSquareText, LogIn, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/axios";

const ReviewForm = ({ productId, existingReview, onSuccess }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [rating, setRating] = useState(existingReview?.rating || 5);
  const [comment, setComment] = useState(existingReview?.comment || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hoverRating, setHoverRating] = useState(0);

  const submitReview = async (event) => {
    event.preventDefault();

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!comment.trim()) {
      setError("Please share your experience before submitting.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const { data } = await api.post(`/reviews/${productId}`, {
        rating,
        comment: comment.trim(),
      });

      onSuccess?.(data);
      setComment("");
      setRating(5);
      setHoverRating(0);
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError(
        err.response?.data?.message ||
          "We couldn't save your review. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <section className="card mt-6 p-6 text-center shadow-sm sm:p-8">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-[var(--primary)]">
          <MessageSquareText size={26} />
        </div>

        <h3 className="text-lg font-bold text-[var(--text-main)]">
          Share your experience
        </h3>

        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[var(--text-secondary)]">
          Sign in to rate this product and let other shoppers know what you think.
        </p>

        <button
          type="button"
          onClick={() => navigate("/login")}
          className="btn-primary !w-auto mt-5 inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold shadow-sm"
        >
          <LogIn size={17} />
          Login to Review
        </button>
      </section>
    );
  }

  const displayedRating = hoverRating || rating;

  return (
    <section className="card mt-6 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="border-b border-gray-200 bg-gradient-to-r from-indigo-50/70 via-white to-white px-5 py-5 sm:px-6">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-[var(--primary)]">
            <MessageSquareText size={22} />
          </div>

          <div>
            <h3 className="text-lg font-bold text-[var(--text-main)]">
              {existingReview ? "Edit your review" : "Write a review"}
            </h3>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Your feedback helps other shoppers make better decisions.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={submitReview} className="space-y-6 p-5 sm:p-6">
        {/* Star Rating */}
        <div>
          <label className="mb-3 block text-sm font-semibold text-[var(--text-main)]">
            How would you rate this product?
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <div
              className="flex items-center gap-1"
              onMouseLeave={() => setHoverRating(0)}
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) {
                  setHoverRating(0);
                }
              }}
              role="group"
              aria-label="Choose a rating from 1 to 5 stars"
            >
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  disabled={loading}
                  onClick={() => setRating(value)}
                  onMouseEnter={() => setHoverRating(value)}
                  aria-label={`${value} ${value === 1 ? "star" : "stars"}`}
                  aria-pressed={rating === value}
                  className="rounded-lg p-1 transition-transform duration-150 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] disabled:cursor-not-allowed"
                >
                  <Star
                    size={29}
                    strokeWidth={1.8}
                    className={`transition-colors duration-150 sm:h-8 sm:w-8 ${
                      value <= displayedRating
                        ? "fill-amber-400 text-amber-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>

            <span className="rounded-lg bg-indigo-50 px-3 py-1.5 text-sm font-semibold text-[var(--primary)]">
              {displayedRating}/5
            </span>
          </div>

          <p className="mt-2 text-xs text-[var(--text-secondary)]">
            {displayedRating === 5
              ? "Excellent!"
              : displayedRating === 4
                ? "Very good!"
                : displayedRating === 3
                  ? "It's okay."
                  : displayedRating === 2
                    ? "Could be better."
                    : "Not satisfied."}
          </p>
        </div>

        {/* Review Comment */}
        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <label
              htmlFor="review-comment"
              className="text-sm font-semibold text-[var(--text-main)]"
            >
              Your review
            </label>

            <span className="text-xs text-[var(--text-secondary)]">
              {comment.length} characters
            </span>
          </div>

          <textarea
            id="review-comment"
            value={comment}
            onChange={(event) => {
              setComment(event.target.value);
              if (error) setError("");
            }}
            placeholder="What did you like or dislike? Share your experience..."
            rows={4}
            maxLength={2000}
            disabled={loading}
            required
            className="w-full resize-y rounded-xl border border-gray-300 bg-[var(--bg-main)] p-4 text-sm leading-6 text-[var(--text-main)] outline-none transition placeholder:text-[var(--text-secondary)]/60 hover:border-indigo-300 focus:border-[var(--primary)] focus:bg-white focus:ring-2 focus:ring-indigo-900/10 disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
          />

          <p className="mt-2 text-xs text-[var(--text-secondary)]">
            Please keep your feedback helpful and respectful.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
          >
            {error}
          </div>
        )}

        {/* Submit Button */}
        <div className="flex flex-col gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-5 text-[var(--text-secondary)]">
            Your rating:{" "}
            <span className="font-semibold text-[var(--text-main)]">
              {rating} out of 5 stars
            </span>
          </p>

          <button
            type="submit"
            disabled={loading || !comment.trim()}
            className="btn-primary !w-full inline-flex items-center justify-center gap-2 py-3 text-sm font-semibold shadow-sm hover:shadow-md sm:!w-auto sm:px-6"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Saving Review...
              </>
            ) : (
              <>
                <Send size={16} />
                {existingReview ? "Update Review" : "Submit Review"}
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  );
};

export default ReviewForm;