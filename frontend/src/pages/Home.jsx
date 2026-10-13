import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  PackageSearch,
  RefreshCw,
  Sparkles,
} from "lucide-react";

import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import Footer from "../components/Footer";
import Carousel from "../components/Carousel";
import api from "../services/axios";

const INITIAL_VISIBLE_COUNT = 8;

const Home = () => {
  const [products, setProducts] = useState([]);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/products");
      const data = response.data;
      const productList = Array.isArray(data)
        ? data
        : Array.isArray(data?.products)
          ? data.products
          : [];

      setProducts(productList);
      setVisibleCount(INITIAL_VISIBLE_COUNT);
    } catch (err) {
      console.error("Failed to fetch home products:", err);
      setError("We couldn't load the products. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleViewAll = () => {
    setVisibleCount(products.length);
  };

  const handleRetry = () => {
    fetchProducts();
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[var(--bg-main)]">
        {/* Hero carousel */}
        <section className="px-3 pb-5 pt-4 sm:px-5 sm:pb-8 sm:pt-6 lg:px-8">
          <div className="mx-auto max-w-7xl overflow-hidden rounded-2xl sm:rounded-3xl">
            <Carousel />
          </div>
        </section>

        {/* Featured products */}
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          <div className="mb-7 flex items-end justify-between gap-4 sm:mb-9">
            <div>
              <div className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--primary)]">
                <Sparkles size={15} />
                Handpicked for you
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-[var(--text-main)] sm:text-3xl">
                Featured Products
              </h1>

              <p className="mt-2 max-w-md text-sm leading-6 text-[var(--text-secondary)] sm:text-base">
                Discover products worth adding to your everyday collection.
              </p>
            </div>

            {!loading && !error && products.length > INITIAL_VISIBLE_COUNT && visibleCount < products.length && (
              <button
                type="button"
                onClick={handleViewAll}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-[var(--primary)] transition hover:bg-indigo-50 sm:px-4"
              >
                View All
                <ArrowRight size={16} />
              </button>
            )}
          </div>

          {/* Loading skeletons */}
          {loading && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
              {Array.from({ length: INITIAL_VISIBLE_COUNT }).map((_, index) => (
                <div key={index} className="min-w-0">
                  <ProductCard loading />
                </div>
              ))}
            </div>
          )}

          {/* Error state */}
          {!loading && error && (
            <div
              className="rounded-2xl border border-red-200 bg-red-50 px-5 py-12 text-center"
              role="alert"
            >
              <RefreshCw size={34} className="mx-auto text-red-500" />

              <h2 className="mt-4 text-lg font-semibold text-red-800">
                Products couldn't be loaded
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

          {/* Empty state */}
          {!loading && !error && products.length === 0 && (
            <div className="card border-dashed px-5 py-14 text-center">
              <PackageSearch
                size={40}
                className="mx-auto text-[var(--text-secondary)]"
              />

              <h2 className="mt-4 text-lg font-semibold text-[var(--text-main)]">
                No products available yet
              </h2>

              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                Check back soon for new arrivals.
              </p>
            </div>
          )}

          {/* Product grid */}
          {!loading && !error && products.length > 0 && (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
                {products.slice(0, visibleCount).map((product) => (
                  <div
                    key={product.id ?? product._id}
                    className="min-w-0"
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>

              {visibleCount < products.length && (
                <div className="mt-9 text-center">
                  <button
                    type="button"
                    onClick={handleViewAll}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-[var(--card-bg)] px-6 py-3 text-sm font-semibold text-[var(--text-main)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
                  >
                    Explore All {products.length} Products
                    <ArrowRight size={17} />
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        {/* Bottom shopping CTA */}
        {!loading && !error && products.length > 0 && (
          <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 sm:pb-16 lg:px-8">
            <div className="flex flex-col items-start justify-between gap-5 rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/70 via-white to-indigo-100/40 p-6 sm:flex-row sm:items-center sm:p-8">
              <div>
                <h2 className="text-xl font-bold text-[var(--text-main)] sm:text-2xl">
                  Find something you'll love
                </h2>
                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                  Browse the full collection and find your next favorite.
                </p>
              </div>

              <Link
                to="/"
                className="btn-primary !w-auto inline-flex shrink-0 items-center justify-center gap-2 px-6 py-3 text-sm font-semibold shadow-sm"
              >
                Explore Products
                <ArrowRight size={17} />
              </Link>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </>
  );
};

export default Home;