import { useLocation, Link } from "react-router-dom";
import { useEffect, useState, useRef, useCallback } from "react";
import {
  Search,
  ShoppingBag,
  PackageSearch,
  RefreshCw,
  LoaderCircle,
  ArrowUpRight,
} from "lucide-react";
import api from "../services/axios.js";
import Navbar from "../components/Navbar";

const LIMIT = 8;

// Skeleton matching your exact ProductCardSkeleton
const SearchProductSkeleton = () => (
  <div className="card overflow-hidden bg-[var(--card-bg)] shadow-sm">
    <div className="animate-skeleton relative h-44 sm:h-48">
      <div className="absolute left-3 top-3 h-6 w-16 rounded-lg bg-gray-300" />
    </div>

    <div className="flex flex-col gap-3 p-3.5 sm:p-4">
      <div className="animate-skeleton h-4 w-4/5 rounded-md" />
      <div className="animate-skeleton h-4 w-2/5 rounded-md" />

      <div className="mt-1 flex items-center gap-2">
        <div className="animate-skeleton h-6 w-16 rounded-md" />
        <div className="animate-skeleton h-4 w-12 rounded-md" />
      </div>

      <div className="animate-skeleton mt-1 hidden h-10 rounded-xl md:block" />
    </div>
  </div>
);

const SearchResults = () => {
  const location = useLocation();
  const loaderRef = useRef(null);
  const requestIdRef = useRef(0);
  const loadingRef = useRef(false);

  const query = new URLSearchParams(location.search).get("query")?.trim() || "";

  const [results, setResults] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState("");

  // Reset results whenever query changes
  useEffect(() => {
    requestIdRef.current += 1;
    loadingRef.current = false;

    setResults([]);
    setPage(1);
    setHasMore(true);
    setLoading(false);
    setError("");
  }, [query]);

  const fetchProducts = useCallback(async () => {
    if (!query || loadingRef.current || !hasMore || error) return;

    loadingRef.current = true;
    setLoading(true);

    const requestId = ++requestIdRef.current;

    try {
      const response = await api.get("/products/search", {
        params: { query, page, limit: LIMIT },
      });

      if (requestId !== requestIdRef.current) return;

      const newProducts =
        response.data?.success && Array.isArray(response.data.data)
          ? response.data.data
          : [];

      setResults((previous) => {
        const merged =
          page === 1 ? newProducts : [...previous, ...newProducts];

        return Array.from(
          new Map(merged.map((product) => [product.id, product])).values()
        );
      });

      setHasMore(newProducts.length === LIMIT);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;

      console.error("Search error:", err);
      setError("We couldn't load the products. Please try again.");
    } finally {
      if (requestId === requestIdRef.current) {
        loadingRef.current = false;
        setLoading(false);
      }
    }
  }, [query, page, hasMore, error]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Infinite scroll observer
  useEffect(() => {
    const sentinel = loaderRef.current;
    if (!sentinel || !hasMore || loading || error || !query) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !loadingRef.current && hasMore) {
          setPage((previous) => previous + 1);
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [hasMore, loading, error, query, results.length]);

  const handleRetry = () => {
    setError("");
  };

  const initialLoading = loading && results.length === 0;

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[var(--bg-main)]">
        <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
          {/* Search heading */}
          <div className="mb-8">
            <div className="mb-2 flex items-center gap-2 text-sm text-[var(--text-secondary)]">
              <Search size={16} />
              <span>Search results</span>
            </div>

            <h1 className="break-words text-2xl font-bold tracking-tight text-[var(--text-main)] sm:text-3xl">
              Results for{" "}
              <span className="text-[var(--primary)]">
                "{query || "all products"}"
              </span>
            </h1>

            {!loading && !error && (
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                {results.length} product{results.length !== 1 ? "s" : ""}
                {hasMore ? " loaded so far" : " found"}
              </p>
            )}
          </div>

          {/* Empty query */}
          {!query && (
            <div className="card px-5 py-16 text-center">
              <Search
                size={38}
                className="mx-auto text-[var(--text-secondary)]"
              />
              <h2 className="mt-4 text-lg font-semibold text-[var(--text-main)]">
                What are you looking for?
              </h2>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                Enter a product name in the search bar to get started.
              </p>
              <Link
                to="/products"
                className="btn-primary !w-auto mt-5 inline-flex items-center justify-center px-6 py-3 text-sm font-semibold shadow-sm"
              >
                Explore Products
              </Link>
            </div>
          )}

          {/* Initial loading skeletons */}
          {query && initialLoading && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <SearchProductSkeleton key={index} />
              ))}
            </div>
          )}

          {/* Request error */}
          {query && error && (
            <div
              className="rounded-2xl border border-red-200 bg-red-50 px-5 py-12 text-center"
              role="alert"
            >
              <RefreshCw size={32} className="mx-auto text-red-500" />
              <h2 className="mt-3 font-semibold text-red-800">
                Something went wrong
              </h2>
              <p className="mt-2 text-sm text-red-700">{error}</p>
              <button
                type="button"
                onClick={handleRetry}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                <RefreshCw size={16} />
                Try Again
              </button>
            </div>
          )}

          {/* No results */}
          {query && !loading && !error && results.length === 0 && (
            <div className="card px-5 py-16 text-center">
              <PackageSearch
                size={42}
                className="mx-auto text-[var(--text-secondary)]"
              />
              <h2 className="mt-4 text-lg font-semibold text-[var(--text-main)]">
                No products found
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--text-secondary)]">
                We couldn't find anything matching "{query}". Try a different
                product name or a shorter search term.
              </p>
              <Link
                to="/products"
                className="btn-primary !w-auto mt-5 inline-flex items-center justify-center px-6 py-3 text-sm font-semibold shadow-sm"
              >
                Browse All Products
              </Link>
            </div>
          )}

          {/* Product grid matching ProductCard */}
          {results.length > 0 && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
              {results.map((product) => {
                const discountPercent = 30;
                const price = Number(product.price) || 0;
                const originalPrice = Math.round(price * 1.3);
                const image = product.images?.[0] || "/placeholder.png";

                return (
                  <article
                    key={product.id}
                    className="card group flex min-w-0 flex-col overflow-hidden bg-[var(--card-bg)] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-950/10"
                  >
                    {/* Product Image & Badges */}
                    <Link
                      to={`/product/${product.id}`}
                      aria-label={`View ${product.title}`}
                      className="relative block overflow-hidden bg-gradient-to-br from-indigo-50/50 to-gray-50/80"
                    >
                      <div className="flex h-44 items-center justify-center p-3 sm:h-48 sm:p-4">
                        <img
                          src={image}
                          alt={product.title || "Product"}
                          loading="lazy"
                          onError={(event) => {
                            event.currentTarget.onerror = null;
                            event.currentTarget.src = "/placeholder.png";
                          }}
                          className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>

                      {/* Discount Badge */}
                      <span className="absolute left-3 top-3 rounded-lg bg-[var(--primary)] px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
                        {discountPercent}% OFF
                      </span>

                      {/* Quick View Icon */}
                      <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white/95 text-[var(--primary)] opacity-100 shadow-sm transition-all duration-200 sm:opacity-0 sm:group-hover:opacity-100">
                        <ArrowUpRight size={17} />
                      </span>
                    </Link>

                    {/* Product Details */}
                    <div className="flex flex-1 flex-col p-3.5 sm:p-4">
                      <Link
                        to={`/product/${product.id}`}
                        className="min-h-[40px] text-sm font-medium leading-5 text-[var(--text-main)] transition-colors hover:text-[var(--primary)]"
                      >
                        <h2 className="line-clamp-2">
                          {product.title || "Untitled product"}
                        </h2>
                      </Link>

                      {/* Price Section */}
                      <div className="mt-3 flex min-h-7 flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="text-lg font-bold text-[var(--text-main)]">
                          ₹{price.toLocaleString("en-IN")}
                        </span>

                        <span className="text-sm text-[var(--text-secondary)] line-through">
                          ₹{originalPrice.toLocaleString("en-IN")}
                        </span>

                        <span className="text-xs font-semibold text-[var(--primary)] min-[401px]:text-sm">
                          {discountPercent}% off
                        </span>
                      </div>

                      {/* Desktop View Product Button */}
                      <Link
                        to={`/product/${product.id}`}
                        className="btn-primary mt-4 hidden items-center justify-center gap-2 py-2.5 text-sm font-semibold shadow-sm hover:shadow-md md:flex"
                      >
                        <ShoppingBag size={16} />
                        View Product
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* Infinite-scroll sentinel */}
          {query && results.length > 0 && hasMore && !error && (
            <div
              ref={loaderRef}
              className="flex min-h-16 items-center justify-center py-6"
              aria-label="Load more products"
            >
              {loading && (
                <span className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                  <LoaderCircle
                    size={18}
                    className="animate-spin text-[var(--primary)]"
                  />
                  Loading more products...
                </span>
              )}
            </div>
          )}

          {query && results.length > 0 && !hasMore && !loading && !error && (
            <p className="py-8 text-center text-sm text-[var(--text-secondary)]">
              You've reached the end of the results.
            </p>
          )}
        </div>
      </main>
    </>
  );
};

export default SearchResults;