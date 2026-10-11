import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { registerSchema } from "../schemas/auth.schema";
import { registerUser } from "../services/authService";
import { useAuth } from "../hooks/useAuth";

const Register = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const result = registerSchema.safeParse(formData);

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

      const res = await registerUser({
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      login(res.data.token);
      navigate("/");
    } catch (err) {
      setErrors({
        api:
          err.response?.data?.message ||
          "Registration failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const getInputClass = (field) =>
    `input-field bg-white text-sm text-[var(--text-main)] placeholder:text-[var(--text-secondary)]/60 ${
      errors[field]
        ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-400/20"
        : "border-gray-300 hover:border-indigo-300"
    }`;

  const labelClass =
    "mb-2 block text-sm font-medium text-[var(--text-main)]";

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
              YOUR NEXT FAVORITE FIND
            </span>

            <h1 className="max-w-md text-4xl font-bold leading-tight tracking-tight text-[var(--text-main)] xl:text-5xl">
              Shopping made
              <span className="mt-2 block text-[var(--primary)]">
                effortless.
              </span>
            </h1>

            <p className="mt-5 max-w-md text-base leading-7 text-[var(--text-secondary)]">
              Discover products you love, keep your cart organized,
              and manage your orders — all in one place.
            </p>

            <div className="mt-9 grid max-w-md grid-cols-3 gap-3">
              <div className="rounded-2xl border border-white bg-white/90 p-4 shadow-sm">
                <span className="text-xl text-[var(--primary)]">✦</span>
                <p className="mt-3 text-sm font-semibold text-[var(--text-main)]">
                  Easy shopping
                </p>
              </div>

              <div className="rounded-2xl border border-white bg-white/90 p-4 shadow-sm">
                <span className="text-xl text-[var(--primary)]">♡</span>
                <p className="mt-3 text-sm font-semibold text-[var(--text-main)]">
                  Your favorites
                </p>
              </div>

              <div className="rounded-2xl border border-white bg-white/90 p-4 shadow-sm">
                <span className="text-xl text-[var(--primary)]">↗</span>
                <p className="mt-3 text-sm font-semibold text-[var(--text-main)]">
                  Track orders
                </p>
              </div>
            </div>
          </div>

          <p className="relative z-10 text-xs text-[var(--text-secondary)]">
            © {new Date().getFullYear()} ShopEase. Made for better shopping.
          </p>
        </aside>

        {/* Registration form */}
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
                GET STARTED FOR FREE
              </p>

              <h2 className="text-3xl font-bold tracking-tight text-[var(--text-main)] sm:text-4xl">
                Create your account
              </h2>

              <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                Join ShopEase and make every shopping trip a little easier.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-5">

              {/* Username */}
              <div>
                <label htmlFor="username" className={labelClass}>
                  Username
                </label>

                <input
                  id="username"
                  type="text"
                  name="username"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleChange}
                  autoComplete="username"
                  aria-invalid={Boolean(errors.username)}
                  aria-describedby={
                    errors.username ? "username-error" : undefined
                  }
                  className={getInputClass("username")}
                />

                {errors.username && (
                  <p id="username-error" className="mt-1.5 text-xs text-red-600">
                    {errors.username}
                  </p>
                )}
              </div>

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
                  aria-describedby={
                    errors.email ? "email-error" : undefined
                  }
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
                <label htmlFor="password" className={labelClass}>
                  Password
                </label>

                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
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

              {/* Confirm password */}
              <div>
                <label htmlFor="confirmPassword" className={labelClass}>
                  Confirm password
                </label>

                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Re-enter your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    autoComplete="new-password"
                    aria-invalid={Boolean(errors.confirmPassword)}
                    aria-describedby={
                      errors.confirmPassword
                        ? "confirm-password-error"
                        : undefined
                    }
                    className={`${getInputClass("confirmPassword")} pr-16`}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword((prev) => !prev)
                    }
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                    className="absolute inset-y-0 right-0 px-4 text-xs font-semibold text-[var(--primary)] hover:text-[var(--primary-hover)]"
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>

                {errors.confirmPassword && (
                  <p
                    id="confirm-password-error"
                    className="mt-1.5 text-xs text-red-600"
                  >
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* API error */}
              {errors.api && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                >
                  {errors.api}
                </div>
              )}

              {/* Submit button using .btn-primary */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex items-center justify-center gap-2 py-3.5 shadow-md shadow-indigo-900/10 hover:shadow-indigo-900/20"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <span>Create account</span>
                    <span className="transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </>
                )}
              </button>
            </form>

            <p className="mt-7 text-center text-sm text-[var(--text-secondary)]">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-[var(--primary)] transition hover:text-[var(--primary-hover)]"
              >
                Sign in
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

export default Register;