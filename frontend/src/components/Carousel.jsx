import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import banner1 from "/pix1.png";
import banner2 from "/pix2.png";
import banner3 from "/pix3.png";
import banner4 from "/pix4.png";
import banner5 from "/banner5.avif";

const slides = [
  { image: banner2, alt: "ShopEase shopping collection banner" },
  { image: banner3, alt: "Explore products on ShopEase" },
  { image: banner4, alt: "ShopEase featured products" },
  { image: banner1, alt: "Discover offers on ShopEase" },
];

const Carousel = () => {
  const [current, setCurrent] = useState(0);
  const [loadedImages, setLoadedImages] = useState({});
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef(null);

  const allLoaded = slides.every((_, index) => loadedImages[index]);
  const secondaryLoaded = !!loadedImages.secondary;

  const prevSlide = useCallback(() => {
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  }, []);

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;

    intervalRef.current = setInterval(nextSlide, 4000);

    return () => clearInterval(intervalRef.current);
  }, [isPaused, nextSlide]);

  const handleImageLoad = (key) => {
    setLoadedImages((prev) => ({ ...prev, [key]: true }));
  };

  return (
    <section className="w-full bg-[var(--bg-main)]">
      {/* Main carousel */}
      <div
        className="group relative w-full overflow-hidden bg-indigo-50/60"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocus={() => setIsPaused(true)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            setIsPaused(false);
          }
        }}
        aria-label="Featured shopping banners"
        aria-roledescription="carousel"
      >
        <div className="relative aspect-[16/7] min-h-[180px] sm:aspect-[16/6] md:min-h-0">
          {!allLoaded && (
            <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-indigo-50 via-indigo-100/70 to-indigo-50" />
          )}

          <div
            className="flex h-full transition-transform duration-700 ease-in-out motion-reduce:transition-none"
            style={{ transform: `translateX(-${current * 100}%)` }}
          >
            {slides.map((slide, index) => (
              <div
                key={slide.image}
                className="relative h-full min-w-full overflow-hidden"
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} of ${slides.length}`}
              >
                <img
                  src={slide.image}
                  alt={slide.alt}
                  onLoad={() => handleImageLoad(index)}
                  onError={() => handleImageLoad(index)}
                  className={`h-full w-full object-cover transition-all duration-700 ${
                    loadedImages[index]
                      ? current === index
                        ? "scale-100 opacity-100"
                        : "scale-100 opacity-90"
                      : "opacity-0"
                  }`}
                  loading={index === 0 ? "eager" : "lazy"}
                  fetchPriority={index === 0 ? "high" : "auto"}
                />

                <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-transparent" />
              </div>
            ))}
          </div>
        </div>

        {/* Previous Button */}
        <button
          type="button"
          onClick={prevSlide}
          aria-label="Previous banner"
          className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/80 bg-white/90 text-[var(--primary)] shadow-md transition opacity-0 hover:scale-105 hover:bg-[var(--primary)] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] sm:left-6 sm:h-12 sm:w-12 md:group-hover:opacity-100 md:group-focus-within:opacity-100"
        >
          <ChevronLeft size={24} />
        </button>

        {/* Next Button */}
        <button
          type="button"
          onClick={nextSlide}
          aria-label="Next banner"
          className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/80 bg-white/90 text-[var(--primary)] shadow-md transition opacity-0 hover:scale-105 hover:bg-[var(--primary)] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] sm:right-6 sm:h-12 sm:w-12 md:group-hover:opacity-100 md:group-focus-within:opacity-100"
        >
          <ChevronRight size={24} />
        </button>

        {/* Slide indicators */}
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/20 px-3 py-2 backdrop-blur-sm sm:bottom-5">
          {slides.map((slide, index) => (
            <button
              key={slide.image}
              type="button"
              onClick={() => setCurrent(index)}
              aria-label={`Go to banner ${index + 1}`}
              aria-current={current === index ? "true" : undefined}
              className={`h-2 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                current === index
                  ? "w-7 bg-white"
                  : "w-2 bg-white/60 hover:bg-white"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Secondary promotional banner */}
      <div className="mx-auto mt-6 w-full max-w-[1600px] px-3 sm:mt-8 sm:px-5 lg:px-8">
        <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-r from-indigo-50/70 via-white to-indigo-100/50 shadow-sm transition-shadow duration-300 hover:shadow-md sm:rounded-2xl">
          {!secondaryLoaded && (
            <div className="absolute inset-0 animate-pulse bg-gray-200" />
          )}

          <img
            src={banner5}
            alt="ShopEase special offer"
            onLoad={() => handleImageLoad("secondary")}
            onError={() => handleImageLoad("secondary")}
            loading="lazy"
            className={`relative h-[120px] w-full object-contain transition-opacity duration-300 sm:h-[170px] md:h-[210px] ${
              secondaryLoaded ? "opacity-100" : "opacity-0"
            }`}
          />
        </div>
      </div>
    </section>
  );
};

export default Carousel;