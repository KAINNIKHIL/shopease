import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  UserRound,
  Search,
  X,
  ChevronDown,
  Package,
  LogOut,
} from "lucide-react";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";
import { useState, useEffect, useRef } from "react";

const Navbar = () => {
  const { totalItems, setCartItems } = useCart();
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);
  const [accountOpen, setAccountOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const searchRef = useRef(null);
  const accountRef = useRef(null);

  const handleLogout = () => {
    setCartItems([]);
    localStorage.removeItem("cart");
    logout();
    setAccountOpen(false);
    navigate("/");
  };

  // Live product search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    const controller = new AbortController();

    const timeoutId = setTimeout(async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/products/search?query=${encodeURIComponent(searchQuery)}`,
          { signal: controller.signal }
        );

        if (!res.ok) throw new Error("Search request failed");

        const data = await res.json();
        if (data.success) {
          setResults((data.data || []).slice(0, 6));
        } else {
          setResults([]);
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Search failed", err);
        }
      }
    }, 300);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [searchQuery]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setResults([]);
      }

      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setAccountOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    const query = searchQuery.trim();
    if (!query) return;

    navigate(`/search?query=${encodeURIComponent(query)}`);
    setResults([]);
    setMobileSearchOpen(false);
  };

  const closeSearch = () => {
    setResults([]);
    setMobileSearchOpen(false);
  };

  const renderSearchResults = () =>
    results.length > 0 && (
      <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-80 overflow-y-auto rounded-2xl border border-gray-200 bg-[var(--card-bg)] p-2 shadow-xl shadow-slate-200/70">
        {results.map((product) => (
          <Link
            key={product.id}
            to={`/product/${product.id}`}
            onClick={closeSearch}
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-[var(--text-main)] transition hover:bg-indigo-50/70 hover:text-[var(--primary)]"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-[var(--primary)]">
              <Search size={16} />
            </span>
            <span className="min-w-0 flex-1 truncate font-medium">
              {product.title}
            </span>
          </Link>
        ))}
      </div>
    );

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/95 shadow-sm shadow-slate-200/30 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Main navbar row */}
        <div className="flex h-[76px] items-center justify-between gap-4">

          {/* Logo */}
          <Link
            to="/"
            className="flex shrink-0 items-center gap-2.5"
            aria-label="ShopEase home"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary)] text-xl font-extrabold text-white shadow-md shadow-indigo-950/15">
              S
            </span>

            <span className="text-2xl font-extrabold tracking-tight text-[var(--text-main)]">
              Shop<span className="text-[var(--primary)]">Ease</span>
            </span>
          </Link>

          {/* Desktop search */}
          <form
            onSubmit={handleSubmit}
            ref={searchRef}
            role="search"
            className="relative mx-4 hidden max-w-xl flex-1 md:block"
          >
            <div className="flex items-center rounded-2xl border border-gray-300 bg-[var(--bg-main)] transition focus-within:border-[var(--primary)] focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-900/10">
              <Search
                size={19}
                className="ml-4 shrink-0 text-[var(--text-secondary)]"
              />

              <input
                type="search"
                aria-label="Search products"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-[var(--text-main)] outline-none placeholder:text-[var(--text-secondary)]/60"
              />

              

              <button
                type="submit"
                className="m-1.5 flex items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--primary-hover)]"
              >
                Search
              </button>
            </div>

            {renderSearchResults()}
          </form>

          {/* Right actions */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-4">

            {/* Mobile search toggle */}
            <button
              type="button"
              aria-label={mobileSearchOpen ? "Close search" : "Open search"}
              aria-expanded={mobileSearchOpen}
              onClick={() => {
                setMobileSearchOpen((prev) => !prev);
                setResults([]);
              }}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-[var(--text-secondary)] transition hover:bg-indigo-50 hover:text-[var(--primary)] md:hidden"
            >
              {mobileSearchOpen ? <X size={21} /> : <Search size={21} />}
            </button>

            {/* Cart */}
            <Link
              to="/cart"
              aria-label={`Shopping cart, ${totalItems} items`}
              className="group relative flex h-11 w-11 items-center justify-center rounded-xl text-[var(--text-main)] transition hover:bg-indigo-50 hover:text-[var(--primary)]"
            >
              <ShoppingCart
                size={23}
                strokeWidth={1.8}
                className="transition-transform group-hover:-translate-y-0.5"
              />

              {totalItems > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-[var(--primary)] px-1 text-[10px] font-bold text-white">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </Link>

            {/* Account menu */}
            {isAuthenticated ? (
              <div className="relative" ref={accountRef}>
                <button
                  type="button"
                  aria-expanded={accountOpen}
                  onClick={() => setAccountOpen((prev) => !prev)}
                  className="flex h-10 items-center gap-2 rounded-xl border border-gray-300 px-3 text-sm font-semibold text-[var(--text-main)] transition hover:border-indigo-300 hover:bg-indigo-50/70 hover:text-[var(--primary)]"
                >
                  <UserRound size={18} />
                  <span className="hidden sm:inline">Account</span>
                  <ChevronDown
                    size={15}
                    className={`hidden transition-transform sm:block ${
                      accountOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {accountOpen && (
                  <div className="absolute right-0 top-full z-50 mt-3 w-48 overflow-hidden rounded-2xl border border-gray-200 bg-[var(--card-bg)] p-1.5 shadow-xl shadow-slate-200/70">
                    <Link
                      to="/orders"
                      onClick={() => setAccountOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[var(--text-main)] transition hover:bg-indigo-50 hover:text-[var(--primary)]"
                    >
                      <Package size={17} />
                      My orders
                    </Link>

                    <div className="my-1 border-t border-gray-100" />

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-red-600 transition hover:bg-red-50"
                    >
                      <LogOut size={17} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="btn-primary !w-auto flex h-10 items-center gap-2 px-3 text-sm sm:px-4"
              >
                <UserRound size={18} />
                <span>Sign in</span>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile search */}
        {mobileSearchOpen && (
          <form
            onSubmit={handleSubmit}
            ref={searchRef}
            role="search"
            className="relative pb-4 md:hidden"
          >
            <div className="flex items-center rounded-xl border border-gray-300 bg-[var(--bg-main)] focus-within:border-[var(--primary)] focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-900/10">
              <Search size={18} className="ml-3 shrink-0 text-[var(--text-secondary)]" />

              <input
                type="search"
                aria-label="Search products"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-[var(--text-main)] outline-none placeholder:text-[var(--text-secondary)]/60"
              />

              <button
                type="submit"
                aria-label="Submit search"
                className="m-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)] text-white transition hover:bg-[var(--primary-hover)]"
              >
                <Search size={18} />
              </button>
            </div>

            {renderSearchResults()}
          </form>
        )}
      </div>
    </nav>
  );
};

export default Navbar;