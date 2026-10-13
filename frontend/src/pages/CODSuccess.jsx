import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  Package,
  Truck,
  ShoppingBag,
  ArrowRight,
  ReceiptText,
  CalendarDays,
  LoaderCircle,
  AlertCircle,
} from "lucide-react";
import dayjs from "dayjs";
import Navbar from "../components/Navbar";
import api from "../services/axios";

const CODSuccess = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchOrder = async () => {
      if (!orderId) {
        setError("Order ID is missing.");
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get(`/orders/${orderId}`);

        if (isMounted) {
          setOrder(data);
        }
      } catch (err) {
        console.error(
          "Failed to fetch order:",
          err.response?.data || err.message
        );

        if (isMounted) {
          setError(
            err.response?.data?.message || "Unable to load your order details."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchOrder();

    return () => {
      isMounted = false;
    };
  }, [orderId]);

  const formatPrice = (value) =>
    Number(value || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const getStatusBadge = (status) => {
    const rawStatus = String(status || "").toUpperCase();

    switch (rawStatus) {
      case "DELIVERED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "SHIPPED":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "CANCELLED":
        return "bg-red-50 text-red-700 border-red-200";
      case "CONFIRMED":
        return "bg-indigo-50 text-[var(--primary)] border-indigo-200";
      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  if (loading || error || !order) {
    return (
      <>
        <Navbar />

        <main className="flex min-h-[calc(100vh-76px)] items-center justify-center bg-[var(--bg-main)] px-4 py-12">
          <section className="card w-full max-w-md p-8 text-center shadow-sm">
            {loading ? (
              <>
                <LoaderCircle
                  size={38}
                  className="mx-auto animate-spin text-[var(--primary)]"
                />
                <h1 className="mt-5 text-xl font-bold text-[var(--text-main)]">
                  Loading your order...
                </h1>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                  Please wait while we retrieve your order details.
                </p>
              </>
            ) : (
              <>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600">
                  <AlertCircle size={32} />
                </div>
                <h1 className="mt-5 text-xl font-bold text-[var(--text-main)]">
                  Unable to Load Order
                </h1>
                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                  {error || "We couldn't find this order."}
                </p>
                <button
                  onClick={() => navigate("/orders")}
                  className="btn-primary !w-auto mt-6 inline-flex items-center justify-center gap-2 px-5 py-3 font-semibold shadow-sm"
                >
                  View My Orders
                  <ArrowRight size={17} />
                </button>
              </>
            )}
          </section>
        </main>
      </>
    );
  }

  const items = order.items || [];

  return (
    <>
      <Navbar />

      <main className="min-h-[calc(100vh-76px)] bg-[var(--bg-main)] px-4 py-8 sm:py-12">
        <div className="mx-auto max-w-3xl">
          {/* Success banner */}
          <section className="card p-6 text-center shadow-lg shadow-slate-200/50 sm:p-10">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/50">
              <CheckCircle2 size={46} strokeWidth={1.7} />
            </div>

            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
              <CheckCircle2 size={14} />
              Order confirmed
            </span>

            <h1 className="mt-4 text-2xl font-bold tracking-tight text-[var(--text-main)] sm:text-3xl">
              Order Placed Successfully!
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--text-secondary)] sm:text-base">
              Thank you for shopping with ShopEase. Your Cash on Delivery order
              has been placed successfully.
            </p>

            <div className="mx-auto mt-6 inline-flex items-center gap-3 rounded-2xl border border-gray-200 bg-[var(--bg-main)] px-4 py-3 text-left shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-[var(--primary)]">
                <Package size={23} />
              </div>

              <div>
                <p className="text-xs text-[var(--text-secondary)]">
                  Order reference
                </p>
                <p className="mt-1 break-all font-mono text-sm font-bold text-[var(--text-main)]">
                  #{order.id}
                </p>
              </div>
            </div>
          </section>

          {/* Order summary */}
          <section className="card mt-6 p-5 sm:p-7">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-[var(--text-main)]">
                Order Summary
              </h2>
              <ReceiptText
                size={22}
                className="text-[var(--primary)]"
              />
            </div>

            <div className="mt-5 flex flex-col gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs text-[var(--text-secondary)]">
                  Order ID
                </p>
                <p className="mt-1 break-all font-mono text-sm font-semibold text-[var(--text-main)]">
                  #{order.id}
                </p>
              </div>

              <div>
                <p className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                  <CalendarDays size={14} />
                  Order date
                </p>
                <p className="mt-1 text-sm font-medium text-[var(--text-main)]">
                  {order.createdAt && dayjs(order.createdAt).isValid()
                    ? dayjs(order.createdAt).format("DD MMM YYYY, hh:mm A")
                    : "Date unavailable"}
                </p>
              </div>

              <div>
                <p className="text-xs text-[var(--text-secondary)]">
                  Status
                </p>
                <span
                  className={`mt-1 inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusBadge(
                    order.status
                  )}`}
                >
                  {order.status || "PENDING"}
                </span>
              </div>
            </div>

            <div className="space-y-4 py-5">
              {items.map((item, index) => {
                const title =
                  item.product?.title || item.title || item.productId || "Product";
                const image =
                  item.product?.images?.[0] ||
                  item.product?.image ||
                  item.image;
                const quantity = Number(item.qty || 0);
                const price = Number(item.price || 0);

                return (
                  <div
                    key={item.id || item.productId || index}
                    className="flex items-center gap-3 sm:gap-4"
                  >
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-indigo-50/40 to-gray-50/70 sm:h-16 sm:w-16">
                      {image ? (
                        <img
                          src={image}
                          alt={title}
                          className="h-full w-full object-contain p-1.5"
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <ShoppingBag
                          size={24}
                          className="text-[var(--text-secondary)]"
                        />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm font-semibold text-[var(--text-main)]">
                        {title}
                      </p>
                      <p className="mt-1 text-xs text-[var(--text-secondary)]">
                        ₹{formatPrice(price)} × {quantity}
                      </p>
                    </div>

                    <p className="shrink-0 text-sm font-bold text-[var(--text-main)]">
                      ₹{formatPrice(price * quantity)}
                    </p>
                  </div>
                );
              })}

              {items.length === 0 && (
                <p className="py-4 text-sm text-[var(--text-secondary)]">
                  Item details are currently unavailable.
                </p>
              )}
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-gray-200 pt-5">
              <span className="font-semibold text-[var(--text-main)]">
                Total amount
              </span>
              <span className="text-xl font-bold text-[var(--primary)] sm:text-2xl">
                ₹{formatPrice(order.totalAmount)}
              </span>
            </div>
          </section>

          {/* COD information */}
          <section className="card mt-6 flex items-start gap-4 p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-[var(--primary)]">
              <Truck size={23} />
            </div>

            <div>
              <h3 className="font-semibold text-[var(--text-main)]">
                Cash on Delivery
              </h3>
              <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                Pay for your order when it arrives. You can track its progress
                anytime from your orders page.
              </p>
            </div>
          </section>

          {/* Actions */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => navigate("/orders")}
              className="btn-primary !w-full flex-1 items-center justify-center gap-2 py-3.5 font-semibold shadow-sm sm:flex"
            >
              <Package size={18} />
              View My Orders
              <ArrowRight size={17} />
            </button>

            <button
              onClick={() => navigate("/")}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-[var(--card-bg)] px-5 py-3.5 font-semibold text-[var(--primary)] transition hover:border-[var(--primary)] hover:bg-indigo-50/60"
            >
              <ShoppingBag size={18} />
              Continue Shopping
            </button>
          </div>
        </div>
      </main>
    </>
  );
};

export default CODSuccess;