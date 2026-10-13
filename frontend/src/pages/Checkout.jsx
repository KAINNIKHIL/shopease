import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Phone,
  CreditCard,
  Banknote,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  ShoppingBag,
  LoaderCircle,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import Navbar from "../components/Navbar";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";
import api from "../services/axios";

const formatPrice = (price) =>
  `₹${Number(price || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;

const initialAddress = {
  phone: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
};

const Checkout = () => {
  const { cartItems, totalPrice, setCartItems } = useCart();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [address, setAddress] = useState(initialAddress);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fetchingAddress, setFetchingAddress] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("stripe");

  const isCartEmpty = cartItems.length === 0;

  useEffect(() => {
    let active = true;

    const fetchLastAddress = async () => {
      if (!token) {
        setFetchingAddress(false);
        return;
      }

      try {
        setFetchingAddress(true);

        const { data } = await api.get("/addresses");

        if (!active) return;

        const addresses = Array.isArray(data)
          ? data
          : data?.addresses || [];

        if (addresses.length > 0) {
          const last = addresses[addresses.length - 1];

          setAddress({
            phone: last.phone || "",
            address: last.fullAddress || "",
            city: last.city || "",
            state: last.state || "",
            pincode: last.pincode || "",
          });
        }
      } catch (err) {
        console.error(
          "Fetch last address error:",
          err.response?.data || err.message
        );
      } finally {
        if (active) setFetchingAddress(false);
      }
    };

    fetchLastAddress();

    return () => {
      active = false;
    };
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setAddress((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  const validate = () => {
    if (!token) {
      setError("Please log in before placing your order.");
      return false;
    }

    if (isCartEmpty) {
      setError("Your cart is empty. Add products before checkout.");
      return false;
    }

    for (const [key, value] of Object.entries(address)) {
      if (!value.trim()) {
        setError(
          `Please enter your ${
            key === "address" ? "full address" : key
          }.`
        );
        return false;
      }
    }

    if (!/^\d{10}$/.test(address.phone.trim())) {
      setError("Enter a valid 10-digit phone number.");
      return false;
    }

    if (!/^\d{6}$/.test(address.pincode.trim())) {
      setError("Enter a valid 6-digit PIN code.");
      return false;
    }

    setError("");
    return true;
  };

  const placeOrder = async (method = paymentMethod) => {
    if (loading || !validate()) return;

    setLoading(true);
    setError("");

    try {
      const addressResponse = await api.post("/addresses", address);
      const savedAddress = addressResponse.data;

      if (!savedAddress?.id) {
        throw new Error("Could not save your delivery address.");
      }

      const itemsPayload = cartItems.map((item) => ({
        productId: item.productId || item.product?.id,
        name: item.product?.title || item.title,
        price: Number(item.product?.price ?? item.price ?? 0),
        qty: Number(item.qty),
      }));

      if (
        itemsPayload.some(
          (item) =>
            !item.productId ||
            !Number.isFinite(item.price) ||
            item.price < 0 ||
            !Number.isInteger(item.qty) ||
            item.qty < 1
        )
      ) {
        throw new Error("Some cart items are invalid. Please review your cart.");
      }

      if (method === "stripe") {
        const { data } = await api.post(
          "/payment/create-checkout-session",
          {
            items: itemsPayload,
            addressId: savedAddress.id,
          }
        );

        if (!data?.url) {
          throw new Error("Unable to start card payment. Please try again.");
        }

        window.location.href = data.url;
        return;
      }

      if (method === "cod") {
        const { data } = await api.post("/orders/create-cod-order", {
          items: itemsPayload,
          addressId: savedAddress.id,
        });

        if (!data?.order?.id) {
          throw new Error("Your COD order could not be confirmed.");
        }

        setCartItems([]);
        navigate(`/cod-success/${data.order.id}`);
      }
    } catch (err) {
      console.error(
        "Checkout error:",
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-gray-300 bg-[var(--bg-main)] px-4 py-3 text-sm text-[var(--text-main)] outline-none transition placeholder:text-[var(--text-secondary)]/60 focus:border-[var(--primary)] focus:bg-white focus:ring-2 focus:ring-indigo-900/10";

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[var(--bg-main)] pb-36 md:pb-12">
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
            <button
              onClick={() => navigate("/cart")}
              className="hover:underline hover:text-[var(--primary)]"
            >
              Cart
            </button>
            <span>/</span>
            <span className="font-medium text-[var(--text-main)]">Checkout</span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text-main)] md:text-3xl">
              Checkout
            </h1>
            <p className="mt-2 text-sm text-[var(--text-secondary)] md:text-base">
              Confirm your delivery details and payment method.
            </p>
          </div>

          {/* Checkout steps */}
          <div className="card mb-7 grid grid-cols-3 p-3 sm:p-4">
            {[
              { number: "1", label: "Shopping Cart", done: true },
              { number: "2", label: "Checkout", active: true },
              { number: "3", label: "Confirmation" },
            ].map((step) => (
              <div
                key={step.number}
                className="flex items-center justify-center gap-2"
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    step.active || step.done
                      ? "bg-[var(--primary)] text-white shadow-sm"
                      : "bg-gray-100 text-[var(--text-secondary)]"
                  }`}
                >
                  {step.done ? <CheckCircle2 size={16} /> : step.number}
                </span>
                <span
                  className={`hidden text-xs font-medium sm:inline md:text-sm ${
                    step.active || step.done
                      ? "text-[var(--text-main)] font-semibold"
                      : "text-[var(--text-secondary)]"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>

          {/* Error alert */}
          {error && (
            <div
              role="alert"
              className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              <AlertCircle size={19} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isCartEmpty ? (
            <section className="card p-8 text-center sm:p-12">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-indigo-50 text-[var(--primary)]">
                <ShoppingBag size={36} />
              </div>

              <h2 className="mt-5 text-xl font-bold text-[var(--text-main)]">
                Your cart is empty
              </h2>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                Add something to your cart before checking out.
              </p>

              <button
                onClick={() => navigate("/products")}
                className="btn-primary !w-auto mt-6 inline-flex px-6 py-3 font-semibold shadow-sm"
              >
                Explore Products
              </button>
            </section>
          ) : (
            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3 lg:gap-8">
              {/* Delivery address & Payment */}
              <section className="space-y-6 lg:col-span-2">
                <div className="card p-5 sm:p-7">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="rounded-xl bg-indigo-50 p-3 text-[var(--primary)]">
                      <MapPin size={22} />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-[var(--text-main)]">
                        Delivery Address
                      </h2>
                      <p className="mt-1 text-xs text-[var(--text-secondary)]">
                        Where should we deliver your order?
                      </p>
                    </div>
                  </div>

                  {fetchingAddress ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {[1, 2, 3, 4].map((item) => (
                          <div
                            key={item}
                            className="animate-skeleton h-12 rounded-xl"
                          />
                        ))}
                      </div>
                      <div className="animate-skeleton h-24 rounded-xl" />
                    </div>
                  ) : (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        placeOrder(paymentMethod);
                      }}
                      className="space-y-4"
                    >
                      <div>
                        <label
                          htmlFor="phone"
                          className="mb-2 block text-sm font-medium text-[var(--text-main)]"
                        >
                          Phone Number
                        </label>
                        <div className="relative">
                          <Phone
                            size={17}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
                          />
                          <input
                            id="phone"
                            name="phone"
                            type="tel"
                            inputMode="numeric"
                            autoComplete="tel"
                            maxLength={10}
                            placeholder="10-digit phone number"
                            value={address.phone}
                            onChange={handleChange}
                            className={`${inputClass} pl-10`}
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="address"
                          className="mb-2 block text-sm font-medium text-[var(--text-main)]"
                        >
                          Full Address
                        </label>
                        <textarea
                          id="address"
                          name="address"
                          autoComplete="street-address"
                          placeholder="House / flat number, street, locality"
                          rows={3}
                          value={address.address}
                          onChange={handleChange}
                          className={`${inputClass} resize-y`}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label
                            htmlFor="city"
                            className="mb-2 block text-sm font-medium text-[var(--text-main)]"
                          >
                            City
                          </label>
                          <input
                            id="city"
                            name="city"
                            autoComplete="address-level2"
                            placeholder="Enter city"
                            value={address.city}
                            onChange={handleChange}
                            className={inputClass}
                            required
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="state"
                            className="mb-2 block text-sm font-medium text-[var(--text-main)]"
                          >
                            State
                          </label>
                          <input
                            id="state"
                            name="state"
                            autoComplete="address-level1"
                            placeholder="Enter state"
                            value={address.state}
                            onChange={handleChange}
                            className={inputClass}
                            required
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="pincode"
                            className="mb-2 block text-sm font-medium text-[var(--text-main)]"
                          >
                            PIN Code
                          </label>
                          <input
                            id="pincode"
                            name="pincode"
                            type="text"
                            inputMode="numeric"
                            autoComplete="postal-code"
                            maxLength={6}
                            placeholder="6-digit PIN code"
                            value={address.pincode}
                            onChange={handleChange}
                            className={inputClass}
                            required
                          />
                        </div>
                      </div>
                    </form>
                  )}
                </div>

                {/* Payment method selection */}
                <div className="card p-5 sm:p-7">
                  <h2 className="text-lg font-bold text-[var(--text-main)]">
                    Payment Method
                  </h2>
                  <p className="mb-5 mt-1 text-sm text-[var(--text-secondary)]">
                    Choose how you'd like to pay.
                  </p>

                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("stripe")}
                      className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition ${
                        paymentMethod === "stripe"
                          ? "border-[var(--primary)] bg-indigo-50/60 shadow-sm"
                          : "border-gray-200 bg-[var(--card-bg)] hover:border-indigo-200"
                      }`}
                    >
                      <div className="rounded-xl bg-indigo-50 p-3 text-[var(--primary)]">
                        <CreditCard size={22} />
                      </div>

                      <div className="flex-1">
                        <p className="text-sm font-semibold text-[var(--text-main)]">
                          Pay with Card
                        </p>
                        <p className="mt-1 text-xs text-[var(--text-secondary)]">
                          Continue to secure Stripe checkout
                        </p>
                      </div>

                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                          paymentMethod === "stripe"
                            ? "border-[var(--primary)]"
                            : "border-gray-300"
                        }`}
                      >
                        {paymentMethod === "stripe" && (
                          <span className="h-2.5 w-2.5 rounded-full bg-[var(--primary)]" />
                        )}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("cod")}
                      className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition ${
                        paymentMethod === "cod"
                          ? "border-[var(--primary)] bg-indigo-50/60 shadow-sm"
                          : "border-gray-200 bg-[var(--card-bg)] hover:border-indigo-200"
                      }`}
                    >
                      <div className="rounded-xl bg-indigo-50 p-3 text-[var(--primary)]">
                        <Banknote size={22} />
                      </div>

                      <div className="flex-1">
                        <p className="text-sm font-semibold text-[var(--text-main)]">
                          Cash on Delivery
                        </p>
                        <p className="mt-1 text-xs text-[var(--text-secondary)]">
                          Pay when your order arrives
                        </p>
                      </div>

                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                          paymentMethod === "cod"
                            ? "border-[var(--primary)]"
                            : "border-gray-300"
                        }`}
                      >
                        {paymentMethod === "cod" && (
                          <span className="h-2.5 w-2.5 rounded-full bg-[var(--primary)]" />
                        )}
                      </span>
                    </button>
                  </div>
                </div>
              </section>

              {/* Order summary */}
              <aside className="card p-5 sm:p-6 lg:sticky lg:top-24">
                <h2 className="text-lg font-bold text-[var(--text-main)]">
                  Order Summary
                </h2>

                <div className="mt-5 max-h-72 space-y-4 overflow-y-auto pr-1">
                  {cartItems.map((item) => {
                    const name =
                      item.product?.title || item.title || "Product";
                    const price = Number(
                      item.product?.price ?? item.price ?? 0
                    );
                    const image =
                      item.product?.images?.[0] ||
                      item.image ||
                      item.product?.image;

                    return (
                      <div
                        key={item.id || item.productId}
                        className="flex items-center gap-3"
                      >
                        <div className="relative flex mt-2 h-14 w-14 shrink-0 items-center justify-center  rounded-xl bg-gradient-to-br from-indigo-50/40 to-gray-50/70">
                          {image ? (
                            <img
                              src={image}
                              alt={name}
                              className="h-full w-full object-contain p-1.5"
                            />
                          ) : (
                            <ShoppingBag
                              size={20}
                              className="text-[var(--text-secondary)]"
                            />
                          )}

                          <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--primary)] px-1 text-[10px] font-bold text-white shadow-sm">
                            {item.qty}
                          </span>
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 text-sm font-medium text-[var(--text-main)]">
                            {name}
                          </p>
                          <p className="mt-1 text-xs text-[var(--text-secondary)]">
                            {formatPrice(price)} each
                          </p>
                        </div>

                        <p className="shrink-0 text-sm font-semibold text-[var(--text-main)]">
                          {formatPrice(price * Number(item.qty || 0))}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="my-5 border-t border-gray-200" />

                <div className="space-y-3">
                  <div className="flex justify-between gap-3 text-sm text-[var(--text-secondary)]">
                    <span>
                      Items (
                      {cartItems.reduce(
                        (sum, item) => sum + Number(item.qty || 0),
                        0
                      )}
                      )
                    </span>
                    <span className="font-medium text-[var(--text-main)]">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>

                  <div className="flex justify-between gap-3 text-sm text-[var(--text-secondary)]">
                    <span>Shipping</span>
                    <span className="font-semibold text-emerald-600">Free</span>
                  </div>
                </div>

                <div className="mt-5 border-t border-gray-200 pt-5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold text-[var(--text-main)]">
                      Total
                    </span>
                    <span className="text-xl font-bold text-[var(--primary)]">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => placeOrder(paymentMethod)}
                  disabled={loading || fetchingAddress || isCartEmpty}
                  className="btn-primary mt-6 hidden !w-full items-center justify-center gap-2 py-3.5 font-semibold shadow-sm hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 lg:flex"
                >
                  {loading ? (
                    <>
                      <LoaderCircle size={18} className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {paymentMethod === "stripe"
                        ? "Continue to Payment"
                        : "Place COD Order"}
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>

                <div className="mt-5 flex items-center justify-center gap-2 text-xs text-[var(--text-secondary)]">
                  <ShieldCheck size={16} />
                  Your order details are protected
                </div>
              </aside>
            </div>
          )}

          <button
            onClick={() => navigate("/cart")}
            className="mt-6 hidden items-center gap-2 text-sm font-semibold text-[var(--text-secondary)] transition hover:gap-3 hover:text-[var(--primary)] md:inline-flex"
          >
            <ArrowLeft size={16} />
            Back to cart
          </button>
        </div>
      </main>

      {/* Mobile checkout bar */}
      {!isCartEmpty && (
        <div className="fixed bottom-0 left-0 z-40 w-full border-t border-gray-200 bg-[var(--card-bg)]/95 p-4 shadow-[0_-8px_24px_rgba(0,0,0,0.06)] backdrop-blur-md md:hidden">
          <div className="mx-auto max-w-7xl">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-[var(--text-secondary)]">
                  Total amount
                </p>
                <p className="text-lg font-bold text-[var(--text-main)]">
                  {formatPrice(totalPrice)}
                </p>
              </div>

              <span className="text-xs font-medium text-[var(--text-secondary)]">
                {paymentMethod === "stripe" ? "Card payment" : "Cash on Delivery"}
              </span>
            </div>

            <button
              type="button"
              onClick={() => placeOrder(paymentMethod)}
              disabled={loading || fetchingAddress || isCartEmpty}
              className="btn-primary !w-full flex items-center justify-center gap-2 py-3.5 font-semibold shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <LoaderCircle size={18} className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {paymentMethod === "stripe"
                    ? "Continue to Payment"
                    : "Place COD Order"}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Checkout;