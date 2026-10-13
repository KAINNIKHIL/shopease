import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Truck,
  PackageCheck,
} from "lucide-react";

import Navbar from "../components/Navbar";
import { useCart } from "../hooks/useCart";

const formatPrice = (price) =>
  `₹${Number(price || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;

const Cart = () => {
  const {
    cartItems,
    updateQty,
    totalPrice,
    totalItems,
    removeItem,
  } = useCart();

  const navigate = useNavigate();
  const [removingId, setRemovingId] = useState(null);

  const handleRemove = async (item) => {
    const itemId = item.id || item.productId;
    setRemovingId(itemId);

    try {
      await removeItem(itemId);
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[var(--bg-main)] pb-32 md:pb-12">
        <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 md:py-10 lg:px-8">
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <button
              onClick={() => navigate("/")}
              className="hover:underline hover:text-[var(--primary)]"
            >
              Home
            </button>
            <span>/</span>
            <span className="font-medium text-[var(--text-main)]">
              Shopping Cart
            </span>
          </div>

          {/* Page heading */}
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[var(--text-main)] md:text-3xl">
                Shopping Cart
              </h1>
              <p className="mt-2 text-sm text-[var(--text-secondary)] md:text-base">
                {totalItems > 0
                  ? `${totalItems} ${totalItems === 1 ? "item" : "items"} in your cart`
                  : "Review your items before checkout"}
              </p>
            </div>

            {cartItems.length > 0 && (
              <button
                onClick={() => navigate("/")}
                className="hidden items-center gap-2 text-sm font-semibold text-[var(--primary)] transition hover:gap-3 sm:inline-flex"
              >
                Continue shopping <ArrowRight size={16} />
              </button>
            )}
          </div>

          {/* Empty cart */}
          {cartItems.length === 0 ? (
            <section className="card p-8 text-center sm:p-14">
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-indigo-50 text-[var(--primary)]">
                <ShoppingBag size={42} strokeWidth={1.5} />
              </div>

              <h2 className="text-xl font-bold text-[var(--text-main)] md:text-2xl">
                Your cart is feeling lonely
              </h2>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--text-secondary)]">
                Looks like you haven't added anything yet. Explore our
                collection and find something you'll love.
              </p>

              <button
                onClick={() => navigate("/")}
                className="btn-primary !w-auto mt-7 inline-flex items-center justify-center gap-2 px-6 py-3 font-semibold shadow-sm"
              >
                <ShoppingCart size={18} />
                Start shopping
                <ArrowRight size={17} />
              </button>
            </section>
          ) : (
            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3 lg:gap-8">
              {/* Cart items */}
              <section className="space-y-4 lg:col-span-2">
                {cartItems.map((item) => {
                  const price = Number(
                    item.product?.price ?? item.price ?? 0
                  );
                  const title =
                    item.product?.title || item.title || "Product";
                  const image =
                    item.product?.images?.[0] ||
                    item.image ||
                    item.product?.image;

                  const subtotal = price * Number(item.qty || 0);
                  const itemKey = item.id || item.productId;

                  return (
                    <article
                      key={itemKey}
                      className="card p-4 transition-shadow hover:shadow-md sm:p-5"
                    >
                      <div className="flex gap-4 sm:gap-5">
                        {/* Product image */}
                        <button
                          onClick={() =>
                            navigate(`/product/${item.productId || item.product?.id}`)
                          }
                          className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-indigo-50/40 to-gray-50/70 sm:h-32 sm:w-32"
                          aria-label={`View ${title}`}
                        >
                          {image ? (
                            <img
                              src={image}
                              alt={title}
                              className="h-full w-full object-contain p-2 transition-transform duration-300 hover:scale-105"
                            />
                          ) : (
                            <ShoppingBag
                              size={32}
                              className="text-[var(--text-secondary)]"
                            />
                          )}
                        </button>

                        {/* Product details */}
                        <div className="flex min-w-0 flex-1 flex-col">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <button
                                onClick={() =>
                                  navigate(`/product/${item.productId || item.product?.id}`)
                                }
                                className="line-clamp-2 text-left text-sm font-semibold text-[var(--text-main)] hover:text-[var(--primary)] hover:underline sm:text-base"
                              >
                                {title}
                              </button>

                              <p className="mt-1.5 text-sm text-[var(--text-secondary)]">
                                {formatPrice(price)}{" "}
                                <span className="text-xs">/ item</span>
                              </p>

                              {item.selectedVariant &&
                                Object.keys(item.selectedVariant).length > 0 && (
                                  <p className="mt-2 text-xs leading-5 text-[var(--text-secondary)]">
                                    {Object.entries(item.selectedVariant)
                                      .map(([key, value]) => `${key}: ${value}`)
                                      .join(" · ")}
                                  </p>
                                )}
                            </div>

                            <button
                              onClick={() => handleRemove(item)}
                              disabled={removingId === itemKey}
                              className="shrink-0 rounded-lg p-2 text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                              aria-label={`Remove ${title}`}
                              title="Remove item"
                            >
                              <Trash2 size={17} />
                            </button>
                          </div>

                          <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-4">
                            {/* Quantity controls */}
                            <div className="inline-flex items-center overflow-hidden rounded-xl border border-gray-200 bg-[var(--card-bg)] shadow-sm">
                              <button
                                onClick={() =>
                                  updateQty(
                                    item.id,
                                    Math.max(0, Number(item.qty) - 1),
                                    item.productId
                                  )
                                }
                                className="flex h-9 w-9 items-center justify-center text-[var(--text-main)] transition hover:bg-indigo-50 hover:text-[var(--primary)]"
                                aria-label="Decrease quantity"
                              >
                                <Minus size={14} />
                              </button>

                              <span className="min-w-9 text-center text-sm font-semibold text-[var(--text-main)]">
                                {item.qty}
                              </span>

                              <button
                                onClick={() =>
                                  updateQty(
                                    item.id,
                                    Number(item.qty) + 1,
                                    item.productId
                                  )
                                }
                                className="flex h-9 w-9 items-center justify-center text-[var(--text-main)] transition hover:bg-indigo-50 hover:text-[var(--primary)]"
                                aria-label="Increase quantity"
                              >
                                <Plus size={14} />
                              </button>
                            </div>

                            <div className="text-right">
                              <p className="mb-1 text-xs text-[var(--text-secondary)]">
                                Subtotal
                              </p>
                              <p className="text-base font-bold text-[var(--text-main)] sm:text-lg">
                                {formatPrice(subtotal)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}

                {/* Shopping assurance */}
                <div className="card grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-indigo-50 p-2.5 text-[var(--primary)]">
                      <Truck size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--text-main)]">
                        Shipping
                      </p>
                      <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                        Free shipping
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-indigo-50 p-2.5 text-[var(--primary)]">
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--text-main)]">
                        Secure checkout
                      </p>
                      <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                        Continue to review your order
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Order summary */}
              <aside className="card p-5 sm:p-6 lg:sticky lg:top-24">
                <h2 className="text-lg font-bold text-[var(--text-main)]">
                  Order Summary
                </h2>

                <div className="mt-6 space-y-4">
                  <div className="flex justify-between gap-4 text-sm text-[var(--text-secondary)]">
                    <span>Subtotal ({totalItems} items)</span>
                    <span className="font-medium text-[var(--text-main)]">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4 text-sm text-[var(--text-secondary)]">
                    <span>Shipping</span>
                    <span className="font-semibold text-emerald-600">Free</span>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-between gap-4">
                      <span className="font-semibold text-[var(--text-main)]">
                        Total
                      </span>
                      <span className="text-xl font-bold text-[var(--primary)]">
                        {formatPrice(totalPrice)}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-[var(--text-secondary)]">
                      Final charges are shown at checkout.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => navigate("/checkout")}
                  className="btn-primary mt-6 hidden !w-full items-center justify-center gap-2 py-3.5 font-semibold shadow-sm hover:shadow-md lg:flex"
                >
                  Proceed to Checkout
                  <ArrowRight size={18} />
                </button>

                <button
                  onClick={() => navigate("/")}
                  className="mt-3 hidden w-full rounded-xl py-3 text-sm font-semibold text-[var(--primary)] transition hover:bg-indigo-50 lg:block"
                >
                  Continue Shopping
                </button>

                <div className="mt-5 flex items-center justify-center gap-2 text-xs text-[var(--text-secondary)]">
                  <PackageCheck size={15} />
                  Review your items before placing an order
                </div>
              </aside>
            </div>
          )}
        </div>
      </main>

      {/* Mobile checkout bar */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 z-40 w-full border-t border-gray-200 bg-[var(--card-bg)]/95 p-4 shadow-[0_-8px_24px_rgba(0,0,0,0.06)] backdrop-blur-md md:hidden">
          <div className="mx-auto max-w-7xl">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-[var(--text-secondary)]">
                  Total ({totalItems} items)
                </p>
                <p className="text-lg font-bold text-[var(--text-main)]">
                  {formatPrice(totalPrice)}
                </p>
              </div>

              <button
                onClick={() => navigate("/")}
                className="text-xs font-semibold text-[var(--primary)] hover:underline"
              >
                Continue shopping
              </button>
            </div>

            <button
              onClick={() => navigate("/checkout")}
              className="btn-primary !w-full flex items-center justify-center gap-2 py-3.5 font-semibold shadow-sm"
            >
              Proceed to Checkout
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Cart;