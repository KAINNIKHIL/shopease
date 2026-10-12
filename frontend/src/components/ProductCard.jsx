import { Link } from "react-router-dom";
import { ShoppingBag, ArrowUpRight } from "lucide-react";

// Skeleton for Product Card
const ProductCardSkeleton = () => (
  <div className="card overflow-hidden bg-[var(--card-bg)] shadow-sm">
    {/* Image Skeleton */}
    <div className="animate-skeleton relative h-44 sm:h-48">
      <div className="absolute left-3 top-3 h-6 w-16 rounded-lg bg-gray-300" />
    </div>

    {/* Content Skeleton */}
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

// Actual Product Card
const ProductCard = ({ product }) => {
  // Fixed discount for dummy project showcase
  const discountPercent = 30;
  const originalPrice = Math.round(Number(product.price) * 1.3);
  const price = Number(product.price) || 0;

  return (
    <article className="card group overflow-hidden bg-[var(--card-bg)] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-950/10">
      {/* Product Image */}
      <Link
        to={`/product/${product.id}`}
        aria-label={`View ${product.title}`}
        className="relative block overflow-hidden bg-gradient-to-br from-indigo-50/50 to-gray-50/80"
      >
        <div className="flex h-44 items-center justify-center p-3 sm:h-48 sm:p-4">
          <img
            src={product.images?.[0] || "/placeholder.png"}
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
      <div className="flex flex-col p-3.5 sm:p-4">
        <Link
          to={`/product/${product.id}`}
          className="min-h-[40px] text-sm font-medium leading-5 text-[var(--text-main)] transition-colors hover:text-[var(--primary)]"
        >
          <h2 className="line-clamp-2">
            {product.title || "Untitled product"}
          </h2>
        </Link>

        {/* Price */}
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
};

// Wrapper: Skeleton or Actual Product
const ProductCardWrapper = ({ product, loading }) => {
  if (loading) {
    return <ProductCardSkeleton />;
  }

  if (!product) {
    return null;
  }

  return <ProductCard product={product} />;
};

export default ProductCardWrapper;