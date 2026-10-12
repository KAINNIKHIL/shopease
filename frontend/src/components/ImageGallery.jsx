import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ImageGallery = ({ images = [], loading = false }) => {
  const containerRef = useRef(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    setActive(0);

    if (containerRef.current) {
      containerRef.current.scrollTo({ left: 0, behavior: "auto" });
    }
  }, [images]);

  const scrollToIndex = (index) => {
    const container = containerRef.current;
    if (!container) return;

    const safeIndex = Math.max(0, Math.min(index, images.length - 1));

    container.scrollTo({
      left: container.clientWidth * safeIndex,
      behavior: "smooth",
    });

    setActive(safeIndex);
  };

  const handleScroll = () => {
    const container = containerRef.current;
    if (!container || !container.clientWidth) return;

    setActive(
      Math.max(
        0,
        Math.min(
          Math.round(container.scrollLeft / container.clientWidth),
          images.length - 1
        )
      )
    );
  };

  if (!images.length && !loading) return null;

  const skeletons = [0, 1, 2];
  const displayedImages = loading ? skeletons : images;

  return (
    <div className="w-full">
      {/* Main image gallery container */}
      <div className="card relative overflow-hidden bg-[var(--card-bg)] shadow-md shadow-slate-200/50">
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="no-scrollbar flex aspect-square snap-x snap-mandatory overflow-x-auto scroll-smooth sm:aspect-[4/3] md:aspect-[4/5]"
          aria-label="Product images"
        >
          {displayedImages.map((img, index) => (
            <div
              key={loading ? `skeleton-${index}` : `${img}-${index}`}
              className="flex h-full min-w-full snap-center items-center justify-center bg-gradient-to-br from-white via-indigo-50/30 to-white p-4 sm:p-6 md:p-8"
            >
              {loading ? (
                <div className="animate-skeleton h-full w-full rounded-xl" />
              ) : (
                <img
                  src={img}
                  alt={`Product image ${index + 1}`}
                  loading={index === 0 ? "eager" : "lazy"}
                  className="h-full w-full object-contain transition-transform duration-500 hover:scale-[1.03]"
                />
              )}
            </div>
          ))}
        </div>

        {/* Desktop navigation arrows */}
        {!loading && images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() =>
                scrollToIndex(active === 0 ? images.length - 1 : active - 1)
              }
              aria-label="Previous product image"
              className="absolute left-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white/95 text-[var(--primary)] shadow-md transition hover:scale-105 hover:bg-[var(--primary)] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] md:flex"
            >
              <ChevronLeft size={21} />
            </button>

            <button
              type="button"
              onClick={() =>
                scrollToIndex(active === images.length - 1 ? 0 : active + 1)
              }
              aria-label="Next product image"
              className="absolute right-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white/95 text-[var(--primary)] shadow-md transition hover:scale-105 hover:bg-[var(--primary)] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] md:flex"
            >
              <ChevronRight size={21} />
            </button>
          </>
        )}

        {/* Mobile pagination dots */}
        {!loading && images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-gray-200 bg-white/90 px-3 py-2 shadow-sm backdrop-blur-sm md:hidden">
            {images.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => scrollToIndex(index)}
                aria-label={`Show product image ${index + 1}`}
                aria-current={active === index ? "true" : undefined}
                className={`h-2 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] ${
                  active === index
                    ? "w-6 bg-[var(--primary)]"
                    : "w-2 bg-indigo-200 hover:bg-indigo-300"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Desktop thumbnails */}
      {!loading && images.length > 1 && (
        <div className="mt-4 hidden flex-wrap gap-3 md:flex">
          {images.map((img, index) => (
            <button
              key={`${img}-${index}`}
              type="button"
              onClick={() => scrollToIndex(index)}
              aria-label={`View product image ${index + 1}`}
              aria-pressed={active === index}
              className={`h-20 w-20 overflow-hidden rounded-xl border-2 bg-white p-1 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] ${
                active === index
                  ? "border-[var(--primary)] shadow-md shadow-indigo-900/10"
                  : "border-gray-200 hover:border-indigo-300"
              }`}
            >
              <img
                src={img}
                alt=""
                loading="lazy"
                className="h-full w-full rounded-lg object-contain"
              />
            </button>
          ))}
        </div>
      )}

      {/* Thumbnail loading skeletons */}
      {loading && (
        <div className="mt-4 hidden gap-3 md:flex">
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className="animate-skeleton h-20 w-20 rounded-xl border border-gray-200"
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;