import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  CheckCircle2,
  XCircle,
  ShoppingBag,
  ArrowRight,
  Package,
  LoaderCircle,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { useCart } from "../hooks/useCart";
import Navbar from "../components/Navbar";
import api from "../services/axios";

const Success = () => {
  const { setCartItems } = useCart();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const sessionId = searchParams.get("session_id");

  const [status, setStatus] = useState("verifying"); // "verifying" | "success" | "failed"
  const [orderId, setOrderId] = useState(null);
  
  // Guard against double execution in React Strict Mode
  const verifiedRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    if (!sessionId) {
      setStatus("failed");
      return;
    }

    if (verifiedRef.current) return;
    verifiedRef.current = true;

    const verifyPayment = async () => {
      try {
        const { data } = await api.post("/payment/verify-session", {
          sessionId,
        });

        if (!isMounted) return;

        setOrderId(data.order?.id || null);

        // Clear the server-side cart after successful verification
        await api.delete("/cart/clear");

        if (!isMounted) return;

        setCartItems([]);
        setStatus("success");
      } catch (err) {
        console.error(
          "Payment verification failed:",
          err.response?.data || err.message
        );

        if (isMounted) {
          setStatus("failed");
        }
      }
    };

    verifyPayment();

    return () => {
      isMounted = false;
    };
  }, [sessionId, setCartItems]);

  const isSuccess = status === "success";
  const isFailed = status === "failed";
  const isVerifying = status === "verifying";

  return (
    <>
      <Navbar />

      <main className="min-h-[calc(100vh-72px)] flex items-center justify-center px-4 py-8 sm:py-12 bg-[var(--bg-main)]">
        <section
          aria-live="polite"
          className="w-full max-w-lg rounded-3xl border border-[var(--border-color,#e5e7eb)] bg-[var(--card-bg)] p-6 sm:p-10 text-center shadow-lg transition-all"
        >
          {/* VERIFYING STATE */}
          {isVerifying && (
            <div className="flex flex-col items-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--bg-main)] text-[var(--primary)] shadow-inner">
                <LoaderCircle size={42} className="animate-spin" />
              </div>

              <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 dark:bg-violet-950/40 px-3.5 py-1 text-xs font-semibold text-violet-700 dark:text-violet-300 mb-4">
                <ShieldCheck size={14} />
                Secure Payment Verification
              </span>

              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-main)]">
                Confirming Your Payment
              </h1>

              <p className="mt-3 text-sm sm:text-base leading-relaxed text-[var(--text-secondary)] max-w-sm">
                Please hold on while we verify your transaction and prepare your order confirmation.
              </p>

              <div className="mt-8 h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg-main)]">
                <div className="h-full w-2/5 animate-[pulse_1.5s_ease-in-out_infinite] rounded-full bg-[var(--primary)]" />
              </div>
            </div>
          )}

          {/* SUCCESS STATE */}
          {isSuccess && (
            <div className="flex flex-col items-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 size={44} strokeWidth={1.8} />
              </div>

              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 px-3.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-4">
                <CheckCircle2 size={14} />
                Payment Confirmed
              </span>

              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-main)]">
                Order Placed Successfully!
              </h1>

              <p className="mt-3 mx-auto max-w-sm text-sm sm:text-base leading-relaxed text-[var(--text-secondary)]">
                Thank you for your purchase. We have received your payment and are getting your package ready.
              </p>

              {orderId && (
                <div className="mt-6 flex w-full items-center gap-3.5 rounded-2xl border border-[var(--border-color,#e5e7eb)] bg-[var(--bg-main)] p-4 text-left">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-950/60 text-[var(--primary)]">
                    <Package size={22} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-[var(--text-secondary)]">
                      Order Reference
                    </p>
                    <p className="mt-0.5 truncate text-sm font-bold text-[var(--text-main)]">
                      #{orderId}
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-8 flex w-full flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/orders")}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 active:scale-[0.98]"
                >
                  <Package size={17} />
                  <span>My Orders</span>
                  <ArrowRight size={16} />
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border-color,#e5e7eb)] px-5 py-3.5 text-sm font-semibold text-[var(--text-main)] transition hover:bg-[var(--bg-main)] active:scale-[0.98]"
                >
                  <ShoppingBag size={17} />
                  <span>Shop More</span>
                </button>
              </div>
            </div>
          )}

          {/* FAILED STATE */}
          {isFailed && (
            <div className="flex flex-col items-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400">
                <XCircle size={44} strokeWidth={1.8} />
              </div>

              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 dark:bg-red-950/50 px-3.5 py-1 text-xs font-semibold text-red-700 dark:text-red-300 mb-4">
                <AlertTriangle size={13} />
                Verification Failed
              </span>

              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-main)]">
                Unable to Confirm Payment
              </h1>

              <p className="mt-3 mx-auto max-w-sm text-sm sm:text-base leading-relaxed text-[var(--text-secondary)]">
                We couldn't confirm this transaction. Please check your bank status or review your orders before retrying.
              </p>

              <div className="mt-6 w-full rounded-2xl border border-[var(--border-color,#f3f4f6)] bg-[var(--bg-main)] p-4 text-left text-xs sm:text-sm leading-relaxed text-[var(--text-secondary)]">
                If your account was already debited, it might take a few minutes to reconcile. Avoid placing a duplicate order right away.
              </div>

              <div className="mt-8 flex w-full flex-col gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/orders")}
                  className="w-full rounded-xl bg-[var(--primary)] px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 active:scale-[0.98]"
                >
                  Check Order History
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/checkout")}
                  className="w-full rounded-xl border border-[var(--border-color,#e5e7eb)] px-5 py-3.5 text-sm font-semibold text-[var(--text-main)] transition hover:bg-[var(--bg-main)] active:scale-[0.98]"
                >
                  Return to Checkout
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="pt-2 text-xs font-medium text-[var(--text-secondary)] transition hover:text-[var(--text-main)] hover:underline"
                >
                  Back to Home
                </button>
              </div>
            </div>
          )}
        </section>
      </main>
    </>
  );
};

export default Success;