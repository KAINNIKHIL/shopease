import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  ShoppingBag,
  ArrowRight,
  CalendarDays,
  ReceiptText,
  ChevronRight,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import dayjs from "dayjs";
import Navbar from "../components/Navbar";
import api from "../services/axios";

const getStatusBadge = (status) => {
  switch (String(status || "").toUpperCase()) {
    case "DELIVERED":
      return {
        label: "Delivered",
        classes: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
      };
    case "SHIPPED":
      return {
        label: "Shipped",
        classes: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
      };
    case "CANCELLED":
      return {
        label: "Cancelled",
        classes: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300",
      };
    case "PROCESSING":
      return {
        label: "Processing",
        classes: "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300",
      };
    case "PENDING":
    default:
      return {
        label: status || "Pending",
        classes: "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
      };
  }
};

const SkeletonCard = () => (
  <div className="animate-pulse rounded-2xl border border-[var(--border-color,#e5e7eb)] bg-[var(--card-bg)] p-5 sm:p-6">
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-2.5">
        <div className="h-4 w-28 rounded bg-neutral-200 dark:bg-neutral-800" />
        <div className="h-3.5 w-36 rounded bg-neutral-200 dark:bg-neutral-800" />
      </div>
      <div className="h-6 w-20 rounded-full bg-neutral-200 dark:bg-neutral-800" />
    </div>
    <div className="my-5 h-px bg-neutral-200/60 dark:bg-neutral-800" />
    <div className="flex items-center justify-between">
      <div className="h-4 w-16 rounded bg-neutral-200 dark:bg-neutral-800" />
      <div className="h-6 w-24 rounded bg-neutral-200 dark:bg-neutral-800" />
    </div>
    <div className="mt-6 h-11 w-full rounded-xl bg-neutral-200 dark:bg-neutral-800" />
  </div>
);

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await api.get("/orders/my-orders");
      setOrders(Array.isArray(data) ? data : data?.orders ?? []);
    } catch (err) {
      console.error("Failed to fetch orders:", err.response?.data || err.message);
      setError("We couldn't load your orders right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return (
    <>
      <Navbar />

      <main className="min-h-[calc(100vh-72px)] bg-[var(--bg-main)] px-4 py-8 sm:py-12">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2.5 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--primary)]">
                <Package size={15} />
                Shopping Activity
              </div>

              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl text-[var(--text-main)]">
                My Orders
              </h1>

              <p className="mt-1.5 text-sm sm:text-base text-[var(--text-secondary)]">
                Track current shipments, check past orders, and review receipt breakdowns.
              </p>
            </div>

            {!loading && orders.length > 0 && (
              <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-[var(--border-color,#e5e7eb)] bg-[var(--card-bg)] px-4 py-2.5 shadow-sm text-[var(--text-main)]">
                <ReceiptText size={18} className="text-[var(--primary)]" />
                <span className="text-sm font-medium">
                  {orders.length} {orders.length === 1 ? "Order" : "Orders"}
                </span>
              </div>
            )}
          </header>

          {/* Loading Skeleton */}
          {loading && (
            <div className="grid gap-5 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <SkeletonCard key={index} />
              ))}
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="rounded-3xl border border-[var(--border-color,#e5e7eb)] bg-[var(--card-bg)] p-8 text-center sm:p-12 shadow-sm">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400">
                <AlertCircle size={30} />
              </div>

              <h2 className="text-xl font-bold text-[var(--text-main)]">
                Couldn't Load Orders
              </h2>

              <p className="mx-auto mt-2 max-w-sm text-sm text-[var(--text-secondary)]">
                {error}
              </p>

              <button
                type="button"
                onClick={fetchOrders}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 active:scale-[0.98]"
              >
                <RefreshCw size={16} />
                Try Again
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && orders.length === 0 && (
            <div className="rounded-3xl border border-[var(--border-color,#e5e7eb)] bg-[var(--card-bg)] px-5 py-12 text-center sm:px-10 sm:py-16 shadow-sm">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-violet-50 dark:bg-violet-950/40 text-[var(--primary)]">
                <ShoppingBag size={36} strokeWidth={1.8} />
              </div>

              <h2 className="text-2xl font-bold text-[var(--text-main)]">
                No orders yet
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[var(--text-secondary)] sm:text-base">
                Looks like you haven't placed an order yet. Browse the catalog and start adding items to your cart!
              </p>

              <button
                type="button"
                onClick={() => navigate("/")}
                className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 active:scale-[0.98]"
              >
                Start Shopping
                <ArrowRight size={17} />
              </button>
            </div>
          )}

          {/* Orders List */}
          {!loading && !error && orders.length > 0 && (
            <div className="grid gap-5 sm:grid-cols-2">
              {orders.map((order) => {
                const statusBadge = getStatusBadge(order.status);

                return (
                  <article
                    key={order.id}
                    className="group flex flex-col justify-between rounded-2xl border border-[var(--border-color,#e5e7eb)] bg-[var(--card-bg)] p-5 sm:p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div>
                      {/* Top Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-950/40 text-[var(--primary)]">
                            <Package size={22} />
                          </div>

                          <div className="min-w-0">
                            <p className="text-xs font-medium text-[var(--text-secondary)]">
                              Order ID
                            </p>
                            <p className="mt-0.5 truncate font-mono text-sm font-bold text-[var(--text-main)]">
                              #{order.id}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${statusBadge.classes}`}
                        >
                          {statusBadge.label}
                        </span>
                      </div>

                      {/* Date */}
                      <div className="mt-4 flex items-center gap-2 text-xs sm:text-sm text-[var(--text-secondary)]">
                        <CalendarDays size={15} />
                        <span>
                          {order.createdAt && dayjs(order.createdAt).isValid()
                            ? dayjs(order.createdAt).format("DD MMM YYYY, hh:mm A")
                            : "Date unavailable"}
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="my-5 border-t border-[var(--border-color,#e5e7eb)]" />

                      {/* Total & Item Count */}
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs text-[var(--text-secondary)]">
                            Total Amount
                          </p>
                          <p className="mt-0.5 text-lg sm:text-xl font-bold text-[var(--primary)]">
                            ₹
                            {Number(order.totalAmount || 0).toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </p>
                        </div>

                        <span className="rounded-lg bg-[var(--bg-main)] px-2.5 py-1.5 text-xs font-medium text-[var(--text-secondary)] border border-[var(--border-color,#e5e7eb)]">
                          {order.items?.length
                            ? `${order.items.length} ${
                                order.items.length === 1 ? "item" : "items"
                              }`
                            : "Order summary"}
                        </span>
                      </div>

                      {/* Action */}
                      <button
                        type="button"
                        onClick={() => navigate(`/orders/${order.id}`)}
                        className="mt-5 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 active:scale-[0.98]"
                      >
                        <span>View Details</span>
                        <ChevronRight
                          size={17}
                          className="transition-transform group-hover:translate-x-0.5"
                        />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default Orders;