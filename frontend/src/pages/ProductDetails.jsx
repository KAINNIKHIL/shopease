import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  ShoppingCart,
  Minus,
  Plus,
  Truck,
  RotateCcw,
  ShieldCheck,
  PackageSearch,
  RefreshCw,
  ChevronRight,
  Tag,
} from "lucide-react";

import api from "../services/axios.js";
import Navbar from "../components/Navbar";
import ImageGallery from "../components/ImageGallery";
import { useCart } from "../hooks/useCart";
import ReviewSection from "../components/ReviewSection.jsx";

const formatPrice = (price) =>
  (Number(price) || 0).toLocaleString("en-IN");

const ProductSkeleton = () => (
  <>
    <Navbar />
    <main className="min-h-screen bg-[var(--bg-main)] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="animate-skeleton mb-8 h-4 w-40 rounded" />

        <div className="grid gap-8 md:grid-cols-2 md:gap-12">
          <div className="animate-skeleton aspect-square rounded-2xl" />

          <div className="space-y-5 py-2">
            <div className="animate-skeleton h-4 w-24 rounded" />
            <div className="animate-skeleton h-8 w-4/5 rounded" />
            <div className="animate-skeleton h-8 w-2/5 rounded" />
            <div className="animate-skeleton h-4 w-full rounded" />
            <div className="animate-skeleton h-4 w-5/6 rounded" />
            <div className="animate-skeleton h-32 rounded-2xl" />
            <div className="animate-skeleton h-12 rounded-xl" />
          </div>
        </div>
      </div>
    </main>
  </>
);

const CartCTA = ({ product, productId, cartItem, qty, addToCart, updateQty }) => {
  const inCart = qty > 0;

  const handleAdd = () => {
    if (!product) return;

    addToCart({
      productId: productId,
      id: cartItem?.id || productId,
      title: product.title,
      price: product.price,
      image: product.images?.[0] || "/placeholder.png",
      images: product.images,
      qty: 1,
    });
  };

  const handleDecrease = () => {
    const targetId = cartItem?.id || productId;
    const newQty = Math.max(0, qty - 1);
    updateQty(targetId, newQty, productId);
  };

  const handleIncrease = () => {
    const targetId = cartItem?.id || productId;
    const newQty = qty + 1;
    updateQty(targetId, newQty, productId);
  };

  if (!inCart) {
    return (
      <button
        type="button"
        onClick={handleAdd}
        className="btn-primary flex w-full items-center justify-center gap-2 py-3.5 text-sm font-semibold shadow-sm transition hover:shadow-md sm:text-base"
      >
        <ShoppingCart size={19} />
        Add to Cart
        <span className="opacity-80">·</span>
        ₹{formatPrice(product?.price)}
      </button>
    );
  }

  return (
    <div className="flex items-center justify-between overflow-hidden rounded-xl border border-gray-200 bg-[var(--card-bg)] shadow-sm">
      <button
        type="button"
        onClick={handleDecrease}
        aria-label="Decrease quantity"
        className="flex h-12 w-14 items-center justify-center text-[var(--text-main)] transition hover:bg-indigo-50 hover:text-[var(--primary)] disabled:opacity-50"
      >
        <Minus size={18} />
      </button>

      <span
        className="min-w-10 text-center text-base font-bold text-[var(--text-main)]"
        aria-live="polite"
      >
        {qty}
      </span>

      <button
        type="button"
        onClick={handleIncrease}
        aria-label="Increase quantity"
        className="flex h-12 w-14 items-center justify-center text-[var(--text-main)] transition hover:bg-indigo-50 hover:text-[var(--primary)]"
      >
        <Plus size={18} />
      </button>
    </div>
  );
};

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { cartItems = [], addToCart, updateQty } = useCart();

  useEffect(() => {
    let cancelled = false;

    const fetchProduct = async () => {
      setLoading(true);
      setError("");
      setProduct(null);

      try {
        const response = await api.get(`/products/${id}`);

        if (cancelled) return;

        const data = response.data?.product ?? response.data?.data ?? response.data;
        setProduct(data?.id || data?._id ? data : null);
      } catch (err) {
        if (cancelled) return;

        console.error("Failed to fetch product:", err);
        setError(
          err.response?.status === 404
            ? "This product could not be found."
            : "We couldn't load this product. Please try again."
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchProduct();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return <ProductSkeleton />;
  }

  if (error || !product) {
    return (
      <>
        <Navbar />
        <main className="flex min-h-[70vh] items-center justify-center bg-[var(--bg-main)] px-4 py-12">
          <div className="card w-full max-w-md p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-[var(--primary)]">
              {error ? (
                <RefreshCw size={27} />
              ) : (
                <PackageSearch size={27} />
              )}
            </div>

            <h1 className="mt-4 text-xl font-bold text-[var(--text-main)]">
              {error ? "Something went wrong" : "Product not found"}
            </h1>

            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
              {error || "The product may have been removed or is no longer available."}
            </p>

            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              {error && (
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="btn-primary !w-auto inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold shadow-sm"
                >
                  <RefreshCw size={16} />
                  Try Again
                </button>
              )}

              <Link
                to="/products"
                className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-[var(--text-main)] transition hover:bg-gray-50"
              >
                Browse Products
              </Link>
            </div>
          </div>
        </main>
      </>
    );
  }

  // Consistent ID resolution
  const productId = String(product.id ?? product._id ?? id);

  // Robust cartItem matching
  const cartItem = cartItems.find((item) => {
    const itemTargetId =
      item?.productId ??
      item?.product?.id ??
      item?.product?._id ??
      item?.id;

    return itemTargetId != null && String(itemTargetId) === productId;
  });

  const qty = Number(cartItem?.qty) || 0;
  const originalPrice = Math.round(Number(product.price || 0) * 1.3);

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[var(--bg-main)] pb-28 md:pb-12">
        <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-8">
          {/* Breadcrumbs */}
          <nav
            aria-label="Breadcrumb"
            className="mb-6 flex flex-wrap items-center gap-2 text-sm text-[var(--text-secondary)]"
          >
            <Link to="/" className="transition hover:text-[var(--primary)]">
              Home
            </Link>
            <ChevronRight size={15} />
            <Link
              to="/"
              className="transition hover:text-[var(--primary)]"
            >
              Products
            </Link>
            <ChevronRight size={15} />
            <span className="max-w-[200px] truncate font-medium text-[var(--text-main)]">
              {product.title}
            </span>
          </nav>

          {/* Main product content */}
          <div className="grid items-start gap-7 md:grid-cols-2 md:gap-10 lg:gap-14">
            {/* Product gallery */}
            <div className="min-w-0">
              <div className="card overflow-hidden p-2 shadow-sm sm:p-4">
                <ImageGallery images={product.images || []} />
              </div>
            </div>

            {/* Product information */}
            <div className="min-w-0 space-y-6">
              <div>
                <div className="mb-3 inline-flex items-center gap-1.5 rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-[var(--primary)]">
                  <Tag size={14} />
                  Special offer
                </div>

                <h1 className="text-2xl font-bold leading-tight tracking-tight text-[var(--text-main)] sm:text-3xl lg:text-4xl">
                  {product.title}
                </h1>
              </div>

              {/* Pricing */}
              <div className="card p-4 shadow-sm sm:p-5">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <span className="text-3xl font-bold tracking-tight text-[var(--text-main)] sm:text-4xl">
                    ₹{formatPrice(product.price)}
                  </span>

                  <span className="text-base text-[var(--text-secondary)] line-through">
                    ₹{formatPrice(originalPrice)}
                  </span>

                  <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-bold text-[var(--primary)] sm:text-sm">
                    30% OFF
                  </span>
                </div>

                <p className="mt-2 text-xs text-[var(--text-secondary)]">
                  Inclusive of all taxes
                </p>
              </div>

              {/* Description */}
              <div>
                <h2 className="mb-2 text-base font-semibold text-[var(--text-main)]">
                  Product Description
                </h2>
                <p className="whitespace-pre-line text-sm leading-7 text-[var(--text-secondary)] sm:text-base">
                  {product.description || "No product description is available yet."}
                </p>
              </div>

              {/* Product attributes */}
              {product.attributes &&
                typeof product.attributes === "object" &&
                Object.keys(product.attributes).length > 0 && (
                  <div className="border-t border-gray-200 pt-5">
                    <h2 className="mb-3 text-lg font-semibold text-[var(--text-main)]">
                      Product Details
                    </h2>

                    <dl className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                      {Object.entries(product.attributes).map(([key, value]) => (
                        <div
                          key={key}
                          className="grid grid-cols-2 gap-4 border-b border-gray-200 px-4 py-3 last:border-b-0 odd:bg-[var(--bg-main)]"
                        >
                          <dt className="break-words text-sm font-medium capitalize text-[var(--text-secondary)]">
                            {key.replace(/([A-Z])/g, " $1").replace(/[_-]/g, " ")}
                          </dt>
                          <dd className="break-words text-right text-sm font-medium text-[var(--text-main)]">
                            {value == null
                              ? "—"
                              : typeof value === "object"
                                ? JSON.stringify(value)
                                : String(value)}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                )}

              {/* Delivery and trust */}
              <div className="card space-y-4 p-4 shadow-sm sm:p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-[var(--primary)]">
                    <Truck size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--text-main)]">
                      Free Delivery
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
                      Estimated delivery in 3–5 days
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-[var(--primary)]">
                    <RotateCcw size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--text-main)]">
                      Easy Returns
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
                      7-day return policy
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-[var(--primary)]">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--text-main)]">
                      Shop with Confidence
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
                      Secure checkout and trusted service
                    </p>
                  </div>
                </div>
              </div>

              {/* Desktop cart action */}
              <div className="hidden pt-1 sm:block">
                <CartCTA
                  product={product}
                  productId={productId}
                  cartItem={cartItem}
                  qty={qty}
                  addToCart={addToCart}
                  updateQty={updateQty}
                />
              </div>
            </div>
          </div>

          {/* Customer reviews */}
          <div className="mt-12 border-t border-gray-200 pt-8 sm:mt-16 sm:pt-10">
            <ReviewSection productId={productId} />
          </div>
        </div>
      </main>

      {/* Mobile sticky cart action */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-[var(--card-bg)]/95 p-3 shadow-[0_-8px_24px_rgba(0,0,0,0.06)] backdrop-blur-md sm:hidden">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-[var(--text-secondary)]">
              {product.title}
            </p>
            <p className="text-lg font-bold text-[var(--text-main)]">
              ₹{formatPrice(product.price)}
            </p>
          </div>

          <div className="w-[54%] max-w-[220px]">
            <CartCTA
              product={product}
              productId={productId}
              cartItem={cartItem}
              qty={qty}
              addToCart={addToCart}
              updateQty={updateQty}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetails;