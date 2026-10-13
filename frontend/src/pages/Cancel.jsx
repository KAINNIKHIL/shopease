import { Link } from "react-router-dom";
import { XCircle, ShoppingCart, ArrowRight, RefreshCw, HelpCircle } from "lucide-react";
import Navbar from "../components/Navbar";

const Cancel = () => {
  return (
    <>
      <Navbar />

      <main className="min-h-[calc(100vh-72px)] flex items-center justify-center px-4 py-8 sm:py-12 bg-[var(--bg-main)]">
        <section
          aria-labelledby="cancel-heading"
          className="w-full max-w-lg rounded-3xl border border-[var(--border-color,#e5e7eb)] bg-[var(--card-bg)] p-6 sm:p-10 text-center shadow-lg transition-all"
        >
          {/* Status Badge & Icon */}
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400">
            <XCircle size={44} strokeWidth={1.8} aria-hidden="true" />
          </div>

          <span className="inline-flex items-center rounded-full bg-red-50 dark:bg-red-950/50 px-3 py-1 text-xs font-semibold text-red-700 dark:text-red-300 mb-3">
            Payment Not Completed
          </span>

          <h1
            id="cancel-heading"
            className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-main)]"
          >
            Payment Cancelled
          </h1>

          <p className="mt-3 mx-auto max-w-sm text-sm sm:text-base leading-relaxed text-[var(--text-secondary)]">
            No worries! Your transaction was not completed and you haven't been charged.
            Your items are still waiting in your cart.
          </p>

          {/* Context Card */}
          <div className="mt-6 flex items-start gap-3 rounded-2xl bg-[var(--bg-main)] p-4 text-left border border-[var(--border-color,#f3f4f6)]">
            <RefreshCw
              size={18}
              className="mt-0.5 shrink-0 text-[var(--primary)]"
              aria-hidden="true"
            />
            <div className="text-xs sm:text-sm">
              <p className="font-semibold text-[var(--text-main)]">
                Next Steps
              </p>
              <p className="mt-0.5 leading-5 text-[var(--text-secondary)]">
                Return to your cart to verify your order details, select a different payment method, or retry checkout.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-7 flex flex-col sm:flex-row gap-3">
            <Link
              to="/cart"
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:brightness-110 active:scale-[0.98]"
            >
              <ShoppingCart size={17} aria-hidden="true" />
              <span>Return to Cart</span>
              <ArrowRight size={16} aria-hidden="true" />
            </Link>

            <Link
              to="/"
              className="flex-1 inline-flex items-center justify-center rounded-xl border border-[var(--border-color,#e5e7eb)] px-5 py-3.5 text-sm font-semibold text-[var(--text-main)] transition-all hover:bg-[var(--bg-main)] active:scale-[0.98]"
            >
              Continue Shopping
            </Link>
          </div>

          {/* Support / Disclaimer */}
          <p className="mt-6 text-xs text-[var(--text-secondary)] flex items-center justify-center gap-1.5">
            <HelpCircle size={14} className="shrink-0" aria-hidden="true" />
            <span>
              Accidentally charged? Check your bank statement or contact support.
            </span>
          </p>
        </section>
      </main>
    </>
  );
};

export default Cancel;