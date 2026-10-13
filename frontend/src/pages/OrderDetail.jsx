import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock3,
  XCircle,
  ArrowLeft,
  CalendarDays,
  ShoppingBag,
  AlertCircle,
  LoaderCircle,
  ChevronRight,
  ReceiptText,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import Navbar from "../components/Navbar";
import api from "../services/axios";

const statusSteps = [
  { label: "Pending", value: "PENDING", icon: Clock3 },
  { label: "Confirmed", value: "CONFIRMED", icon: CheckCircle2 },
  { label: "Shipped", value: "SHIPPED", icon: Truck },
  { label: "Delivered", value: "DELIVERED", icon: Package },
];

const getStatusStyle = (status) => {
  switch (String(status || "").toUpperCase()) {
    case "DELIVERED":
      return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300";
    case "SHIPPED":
      return "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300";
    case "CANCELLED":
      return "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300";
    case "CONFIRMED":
      return "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300";
    case "PENDING":
    default:
      return "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300";
  }
};

const OrderDetail = () => {
  const { token } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");
  
  const modalRef = useRef(null);

  const fetchOrder = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const { data } = await api.get(`/orders/${id}`);
      setOrder(data);
    } catch (err) {
      console.error("Failed to fetch order:", err.response?.data || err.message);
      setError(
        err.response?.status === 404
          ? "We couldn't find this order."
          : "Unable to load your order details. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  // Trap focus and support Escape to dismiss modal
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && showCancelModal) {
        setShowCancelModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showCancelModal]);

  const handleCancel = async () => {
    try {
      setCancelling(true);
      setCancelError("");

      const { data } = await api.patch(`/orders/${id}/cancel`, null, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      setOrder(data.order);
      setShowCancelModal(false);
    } catch (err) {
      console.error("Failed to cancel order:", err.response?.data || err.message);
      setCancelError(
        err.response?.data?.message || "Unable to cancel your order. Please try again."
      );
    } finally {
      setCancelling(false);
    }
  };

  const formatPrice = (value) =>
    Number(value || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const currentStep = order
    ? statusSteps.findIndex((step) => step.value === order.status)
    : 0;

  const isCancelled = order?.status === "CANCELLED";
  const canCancel = order && ["PENDING", "CONFIRMED"].includes(order.status);

  // loading state
  if (loading) {
    return (
      <>
        <Navbar />
        <main className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-[var(--bg-main)] px-4">
          <div className="text-center">
            <LoaderCircle size={38} className="mx-auto animate-spin text-[var(--primary)]" />
            <p className="mt-4 text-sm font-medium text-[var(--text-secondary)] animate-pulse">
              Loading your order details...
            </p>
          </div>
        </main>
      </>
    );
  }

  // error state
  if (!order || error) {
    return (
      <>
        <Navbar />
        <main className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-[var(--bg-main)] px-4 py-12">
          <section className="w-full max-w-md rounded-3xl border border-[var(--border-color,#e5e7eb)] bg-[var(--card-bg)] p-8 text-center shadow-lg">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400">
              <AlertCircle size={32} />
            </div>

            <h1 className="mt-5 text-2xl font-bold text-[var(--text-main)]">
              Order Unavailable
            </h1>

            <p className="mt-2.5 text-sm leading-relaxed text-[var(--text-secondary)]">
              {error || "This order could not be found."}
            </p>

            <button
              type="button"
              onClick={() => navigate("/orders")}
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 active:scale-[0.98]"
            >
              <ArrowLeft size={16} />
              <span>Back to My Orders</span>
            </button>
          </section>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="min-h-[calc(100vh-72px)] bg-[var(--bg-main)] px-4 py-8 sm:py-12">
        <div className="mx-auto max-w-5xl">
          {/* Back Action */}
          <button
            type="button"
            onClick={() => navigate("/orders")}
            className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--text-secondary)] transition hover:text-[var(--text-main)]"
          >
            <ArrowLeft size={16} />
            <span>Back to My Orders</span>
          </button>

          {/* Header Overview Card */}
          <section className="mb-6 rounded-3xl border border-[var(--border-color,#e5e7eb)] bg-[var(--card-bg)] p-5 sm:p-8 shadow-sm">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="mb-2.5 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--primary)]">
                  <Package size={15} />
                  Order overview
                </div>

                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl text-[var(--text-main)]">
                  Order Details
                </h1>

                <p className="mt-1.5 break-all font-mono text-xs sm:text-sm text-[var(--text-secondary)]">
                  Order ID: <span className="text-[var(--text-main)]">#{order.id}</span>
                </p>

                <p className="mt-2.5 flex items-center gap-1.5 text-xs sm:text-sm text-[var(--text-secondary)]">
                  <CalendarDays size={15} className="shrink-0" />
                  <span>
                    {order.createdAt && dayjs(order.createdAt).isValid()
                      ? dayjs(order.createdAt).format("ddd, DD MMM YYYY · hh:mm A")
                      : "Order date unavailable"}
                  </span>
                </p>
              </div>

              <span className={`inline-flex w-fit items-center rounded-full px-3.5 py-1.5 text-xs sm:text-sm font-semibold ${getStatusStyle(order.status)}`}>
                {order.status || "Pending"}
              </span>
            </div>
          </section>

          {/* Progress or Cancelled State banner */}
          {isCancelled ? (
            <section className="mb-6 flex items-start gap-4 rounded-2xl border border-red-100 bg-red-50/50 dark:bg-red-950/20 dark:border-red-900/50 p-5 sm:p-6 shadow-sm">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400">
                <XCircle size={24} />
              </div>

              <div>
                <h2 className="font-bold text-red-800 dark:text-red-300">Order cancelled</h2>
                <p className="mt-1 text-sm leading-relaxed text-red-700 dark:text-red-400">
                  This order was cancelled. If your payment was deducted, it will process and refund to your account according to our guidelines.
                </p>
              </div>
            </section>
          ) : (
            <section className="mb-6 rounded-3xl border border-[var(--border-color,#e5e7eb)] bg-[var(--card-bg)] p-5 sm:p-8 shadow-sm">
              <h2 className="text-lg font-bold text-[var(--text-main)]">Order Progress</h2>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                See where your order is currently at in our Fulfillment chain.
              </p>

              <div className="mt-8 grid grid-cols-4 relative">
                {statusSteps.map((step, index) => {
                  const StepIcon = step.icon;
                  const isComplete = currentStep >= 0 && index <= currentStep;
                  const isCurrent = index === currentStep;

                  return (
                    <div key={step.value} className="relative flex flex-col items-center text-center group">
                      {index < statusSteps.length - 1 && (
                        <div
                          className={`absolute left-1/2 top-4 sm:top-5 h-0.5 w-full -z-0 transition-all ${
                            currentStep >= 0 && index < currentStep
                              ? "bg-[var(--primary)]"
                              : "bg-neutral-200 dark:bg-neutral-800"
                          }`}
                        />
                      )}

                      <div
                        className={`relative z-10 flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full border-2 transition-all shadow-sm ${
                          isComplete
                            ? "bg-[var(--primary)] border-[var(--primary)] text-white"
                            : "bg-[var(--card-bg)] border-neutral-300 dark:border-neutral-700 text-[var(--text-secondary)]"
                        }`}
                        style={{
                          boxShadow: isCurrent ? "0 0 0 5px rgba(124,58,237,0.15)" : "none",
                        }}
                      >
                        {isComplete ? (
                          <StepIcon size={18} />
                        ) : (
                          <span className="text-xs sm:text-sm font-semibold">{index + 1}</span>
                        )}
                      </div>

                      <span className={`mt-3 text-[10px] sm:text-xs font-semibold ${
                        isComplete ? "text-[var(--primary)]" : "text-[var(--text-secondary)]"
                      }`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Line Items Card */}
          <section className="mb-6 rounded-3xl border border-[var(--border-color,#e5e7eb)] bg-[var(--card-bg)] p-5 sm:p-8 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-[var(--text-main)]">Items in your order</h2>
              <ShoppingBag size={20} className="text-[var(--primary)]" />
            </div>

            <div className="space-y-3">
              {(order.items || []).map((item, index) => {
                const productTitle = item.product?.title || item.title || "Product";
                const productImage = item.product?.images?.[0] || item.image || item.product?.image;

                return (
                  <div
                    key={item.productId || item.id || index}
                    className="flex items-center gap-3.5 rounded-2xl border border-[var(--border-color,#e5e7eb)] bg-[var(--bg-main)] p-3 sm:p-4"
                  >
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[var(--card-bg)] border border-[var(--border-color,#e5e7eb)] sm:h-20 sm:w-20">
                      {productImage ? (
                        <img
                          src={productImage}
                          alt={productTitle}
                          className="h-full w-full object-cover"
                          onError={(e) => { e.currentTarget.style.display = "none"; }}
                        />
                      ) : (
                        <ShoppingBag size={24} className="text-[var(--text-secondary)]" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm font-bold text-[var(--text-main)] leading-snug sm:text-base">
                        {productTitle}
                      </p>

                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-[var(--text-secondary)] font-medium">
                        <span>Quantity: {item.qty}</span>
                        <span>•</span>
                        <span>₹{formatPrice(item.price)} each</span>
                      </div>
                    </div>

                    <p className="shrink-0 text-sm font-bold sm:text-base text-[var(--text-main)]">
                      ₹{formatPrice(Number(item.price || 0) * Number(item.qty || 0))}
                    </p>
                  </div>
                );
              })}

              {(!order.items || order.items.length === 0) && (
                <p className="py-6 text-center text-sm text-[var(--text-secondary)]">
                  No item details are available for this order.
                </p>
              )}
            </div>
          </section>

          {/* Pricing Total Summary */}
          <section className="mb-8 rounded-3xl border border-[var(--border-color,#e5e7eb)] bg-[var(--card-bg)] p-5 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs sm:text-sm font-medium text-[var(--text-secondary)]">Total Amount</p>
                <p className="mt-0.5 text-2xl font-bold text-[var(--text-main)] sm:text-3xl">
                  ₹{formatPrice(order.totalAmount)}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 dark:bg-violet-950/40 text-[var(--primary)] shadow-inner">
                <ReceiptText size={24} />
              </div>
            </div>
          </section>

          {/* Navigation Action Footer */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => navigate("/orders")}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-[var(--border-color,#e5e7eb)] bg-[var(--card-bg)] px-5 py-3.5 text-sm font-semibold text-[var(--text-main)] transition hover:bg-[var(--bg-main)] active:scale-[0.98]"
            >
              <ArrowLeft size={16} />
              <span>All Orders</span>
            </button>

            <button
              type="button"
              onClick={() => navigate("/")}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[var(--primary)] px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 active:scale-[0.98]"
            >
              <span>Continue Shopping</span>
              <ChevronRight size={17} />
            </button>

            {canCancel && (
              <button
                type="button"
                onClick={() => {
                  setCancelError("");
                  setShowCancelModal(true);
                }}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-[var(--card-bg)] px-5 py-3.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 hover:border-red-300 active:scale-[0.98]"
              >
                Cancel Order
              </button>
            )}
          </div>
        </div>
      </main>

      {/* Dismissible Cancel confirmation Modal */}
      {showCancelModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-order-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-sm transition-all"
          onClick={(e) => {
            if (e.target === e.currentTarget && !cancelling) {
              setShowCancelModal(false);
            }
          }}
        >
          <section
            ref={modalRef}
            className="w-full max-w-md rounded-3xl border border-[var(--border-color,#e5e7eb)] bg-[var(--card-bg)] p-6 shadow-2xl sm:p-8 animate-in fade-in zoom-in duration-150"
          >
            <div className="mb-4.5 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400">
              <AlertCircle size={28} />
            </div>

            <h2 id="cancel-order-title" className="text-xl font-bold text-[var(--text-main)]">
              Cancel Order #{order.id}?
            </h2>

            <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
              Are you certain you wish to cancel this order? It might not be possible to restore or undo this transition.
            </p>

            {cancelError && (
              <p role="alert" className="mt-4 rounded-xl bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300 p-3.5 text-sm font-medium">
                {cancelError}
              </p>
            )}

            <div className="mt-6.5 flex flex-col-reverse gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                disabled={cancelling}
                className="flex-1 rounded-xl border border-[var(--border-color,#e5e7eb)] bg-transparent px-4 py-3 text-sm font-semibold text-[var(--text-main)] transition hover:bg-[var(--bg-main)] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
              >
                Go Back
              </button>

              <button
                type="button"
                onClick={handleCancel}
                disabled={cancelling}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-red-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {cancelling && <LoaderCircle size={15} className="animate-spin" />}
                <span>{cancelling ? "Cancelling..." : "Cancel Order"}</span>
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
};

export default OrderDetail;