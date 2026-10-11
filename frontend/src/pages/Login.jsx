import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

import { loginSchema } from "../schemas/auth.schema";
import { loginUser } from "../services/authService";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { setCartItems } = useCart();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => {
      if (!prev[name] && !prev.api) return prev;

      const next = { ...prev };
      delete next[name];
      delete next.api;
      return next;
    });
  };

  const getInputClass = (field) =>
    `input-field bg-white text-sm text-[var(--text-main)] placeholder:text-[var(--text-secondary)]/60 ${
      errors[field]
        ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-400/20"
        : "border-gray-300 hover:border-indigo-300"
    }`;

  const labelClass =
    "mb-2 block text-sm font-medium text-[var(--text-main)]";

  /* Google login */
  const handleGoogleLogin = async (response) => {
    try {
      setLoading(true);
      setErrors({});

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/google`,
        { idToken: response.credential }
      );

      const token = res.data.token;
      const decoded = jwtDecode(token);

      login(token, {
        id: decoded.userId,
        role: decoded.role,
      });

      if (decoded.role === "ADMIN") {
        navigate("/admin");
        return;
      }

      // Merge guest cart
      const guestCart = JSON.parse(
        localStorage.getItem("cart") || "[]"
      );

      if (guestCart.length > 0) {
        const formattedGuestCart = guestCart.map((item) => ({
          productId: item.productId,
          qty: item.qty,
          price: item.price,
        }));

        const mergeRes = await fetch(
          `${import.meta.env.VITE_API_URL}/cart/merge`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              items: formattedGuestCart,
            }),
          }
        );

        if (!mergeRes.ok) {
          throw new Error("Could not merge your guest cart.");
        }

        localStorage.removeItem("cart");
      }

      // Fetch user's cart
      const cartRes = await fetch(
        `${import.meta.env.VITE_API_URL}/cart/my-cart`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!cartRes.ok) {
        throw new Error("Could not fetch your cart.");
      }

      const dbCart = await cartRes.json();
      setCartItems(dbCart.items || []);

      navigate("/");
    } catch (err) {
      console.error("Google login error:", err);

      setErrors({
        api:
          err.response?.data?.message ||
          err.message ||
          "Google login failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let interval;
    let cancelled = false;

    const initializeGoogle = () => {
      if (cancelled || !window.google || !document.getElementById("googleBtn")) {
        return false;
      }

      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleLogin,
      });

      const button = document.getElementById("googleBtn");
      button.innerHTML = "";

      window.google.accounts.id.renderButton(button, {
        theme: "outline",
        size: "large",
        shape: "rectangular",
        text: "continue_with",
        width: 320,
      });

      return true;
    };

    if (!initializeGoogle()) {
      interval = setInterval(() => {
        if (initializeGoogle()) {
          clearInterval(interval);
        }
      }, 200);
    }

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  /* Email/password login */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const result = loginSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors = {};

      result.error.issues.forEach((issue) => {
        const fieldName = String(issue.path[0] || "form");

        if (!fieldErrors[fieldName]) {
          fieldErrors[fieldName] = issue.message;
        }
      });

      setErrors(fieldErrors);
      return;
    }

    try {
      setLoading(true);

      const res = await loginUser(formData);
      const token = res.data.token;
      const decoded = jwtDecode(token);

      login(token, {
        id: decoded.userId,
        role: decoded.role,
      });

      if (decoded.role === "ADMIN") {
        navigate("/admin");
        return;
      }

      // Merge guest cart
      const guestCart = JSON.parse(
        localStorage.getItem("cart") || "[]"
      );

      if (guestCart.length > 0) {
        const formattedGuestCart = guestCart.map((item) => ({
          productId: item.productId,
          qty: item.qty,
          price: item.price,
        }));

        const mergeRes = await fetch(
          `${import.meta.env.VITE_API_URL}/cart/merge`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              items: formattedGuestCart,
            }),
          }
        );

        if (mergeRes.ok) {
          localStorage.removeItem("cart");
        } else {
          console.error("Cart merge failed:", await mergeRes.text());
        }
      }

      // Fetch cart
      const cartRes = await fetch(
        `${import.meta.env.VITE_API_URL}/cart/my-cart`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!cartRes.ok) {
        throw new Error("Could not fetch your cart.");
      }

      const dbCart = await cartRes.json();
      setCartItems(dbCart.items || []);

      navigate("/");
    } catch (err) {
      console.error("Login error:", err.response?.data || err);

      setErrors({
        api:
          err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Login failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl overflow-hidden rounded-3xl border border-gray-200 bg-[var(--card-bg)] shadow-xl shadow-slate-200/60 sm:min-h-[calc(100vh-5rem)]">

        {/* Branding panel */}
        <aside className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-indigo-50/70 via-white to-indigo-100/60 p-10 lg:flex xl:p-14">
          <div className="absolute -right-20 top-20 h-72 w-72 rounded-full bg-indigo-200/40 blur-3xl" />
          <div className="absolute -bottom-20 -left-16 h-72 w-72 rounded-full bg-indigo-300/30 blur-3xl" />

          <Link
            to="/"
            className="relative z-10 flex w-fit items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--primary)] text-xl font-bold text-white shadow-lg shadow-indigo-950/15">
              S
            </div>

            <span className="text-2xl font-bold tracking-tight text-[var(--text-main)]">
              Shop<span className="text-[var(--primary)]">Ease</span>
            </span>
          </Link>

          <div className="relative z-10 my-12">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/90 px-4 py-2 text-xs font-semibold tracking-wide text-[var(--primary)]">
              <span className="h-2 w-2 rounded-full bg-[var(--primary)]" />
              WELCOME BACK
            </span>

            <h1 className="max-w-md text-4xl font-bold leading-tight tracking-tight text-[var(--text-main)] xl:text-5xl">
              Good to see
              <span className="mt-2 block text-[var(--primary)]">
                you again.
              </span>
            </h1>

            <p className="mt-5 max-w-md text-base leading-7 text-[var(--text-secondary)]">
              Sign in to explore your favorite products, pick up where
              you left off, and keep your shopping journey organized.
            </p>

            <div className="mt-9 space-y-4">
              {[
                ["✓", "Access your shopping cart"],
                ["✓", "Keep track of your orders"],
                ["✓", "Discover products you love"],
              ].map(([icon, text]) => (
                <div key={text} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100/80 text-sm font-bold text-[var(--primary)]">
                    {icon}
                  </span>
                  <span className="text-sm font-medium text-[var(--text-main)]">
                    {text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <p className="relative z-10 text-xs text-[var(--text-secondary)]">
            © {new Date().getFullYear()} ShopEase. Made for better shopping.
          </p>
        </aside>

        {/* Login form */}
        <main className="flex w-full items-center justify-center px-5 py-8 sm:px-10 lg:w-1/2 lg:px-12 xl:px-16">
          <div className="w-full max-w-md">

            {/* Mobile branding */}
            <Link
              to="/"
              className="mb-9 flex w-fit items-center gap-3 lg:hidden"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary)] text-lg font-bold text-white">
                S
              </div>

              <span className="text-2xl font-bold text-[var(--text-main)]">
                Shop<span className="text-[var(--primary)]">Ease</span>
              </span>
            </Link>

            <div className="mb-7">
              <p className="mb-3 text-sm font-semibold text-[var(--primary)]">
                WELCOME BACK
              </p>

              <h2 className="text-3xl font-bold tracking-tight text-[var(--text-main)] sm:text-4xl">
                Sign in to ShopEase
              </h2>

              <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                Enter your details to continue shopping.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {/* Email */}
              <div>
                <label htmlFor="email" className={labelClass}>
                  Email address
                </label>

                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  className={getInputClass("email")}
                />

                {errors.email && (
                  <p id="email-error" className="mt-1.5 text-xs text-red-600">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label htmlFor="password" className="text-sm font-medium text-[var(--text-main)]">
                    Password
                  </label>

                  <button
                    type="button"
                    onClick={() => navigate("/forgot-password")}
                    className="text-xs font-semibold text-[var(--primary)] transition hover:text-[var(--primary-hover)]"
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                    aria-invalid={Boolean(errors.password)}
                    aria-describedby={
                      errors.password ? "password-error" : undefined
                    }
                    className={`${getInputClass("password")} pr-16`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute inset-y-0 right-0 px-4 text-xs font-semibold text-[var(--primary)] hover:text-[var(--primary-hover)]"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>

                {errors.password && (
                  <p id="password-error" className="mt-1.5 text-xs text-red-600">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* API Error */}
              {errors.api && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                >
                  {errors.api}
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex items-center justify-center gap-2 py-3.5 shadow-md shadow-indigo-900/10 hover:shadow-indigo-900/20"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign in</span>
                    <span className="transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-gray-200" />
              <span className="text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">
                or continue with
              </span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>

            {/* Google sign-in */}
            <div className="flex min-h-10 justify-center">
              <div id="googleBtn" />
            </div>

            <p className="mt-7 text-center text-sm text-[var(--text-secondary)]">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-semibold text-[var(--primary)] transition hover:text-[var(--primary-hover)]"
              >
                Create account
              </Link>
            </p>

            <p className="mt-5 text-center text-xs leading-5 text-[var(--text-secondary)]/80">
              Your account helps keep your shopping experience organized
              and convenient.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Login;