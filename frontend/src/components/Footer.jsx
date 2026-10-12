import { Link } from "react-router-dom";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  ArrowRight,
  ShoppingBag,
  Mail,
} from "lucide-react";

const Footer = ({ loading }) => {
  const quickLinks = [
    { label: "Home", to: "/" },
    { label: "Shop", to: "/products" },
    { label: "Cart", to: "/cart" },
    { label: "My Orders", to: "/orders" },
  ];

  const customerLinks = [
    { label: "FAQ", to: "/faq" },
    { label: "Shipping", to: "/shipping" },
    { label: "Returns", to: "/returns" },
    { label: "Support", to: "/support" },
  ];

  const socialLinks = [
    { label: "Facebook", Icon: Facebook, href: "https://facebook.com" },
    { label: "Twitter", Icon: Twitter, href: "https://twitter.com" },
    { label: "Instagram", Icon: Instagram, href: "https://instagram.com" },
    { label: "LinkedIn", Icon: Linkedin, href: "https://linkedin.com" },
  ];

  const headingClass =
    "mb-4 text-sm font-bold uppercase tracking-wider text-[var(--text-main)]";

  const linkClass =
    "text-sm text-[var(--text-secondary)] transition-colors duration-200 hover:text-[var(--primary)]";

  return (
    <footer className="mt-16 border-t border-gray-200 bg-[var(--card-bg)] text-[var(--text-secondary)]">
      {/* Main footer */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-5 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:gap-12 lg:py-14">
        {/* Brand */}
        <div>
          {loading ? (
            <>
              <div className="animate-skeleton mb-4 h-7 w-36 rounded-md" />
              <div className="animate-skeleton mb-2 h-4 w-full rounded-md" />
              <div className="animate-skeleton h-4 w-4/5 rounded-md" />
            </>
          ) : (
            <>
              <Link
                to="/"
                className="mb-4 inline-flex items-center gap-2 text-2xl font-extrabold tracking-tight text-[var(--primary)]"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-[var(--primary)]">
                  <ShoppingBag size={22} />
                </span>
                ShopEase
              </Link>

              <p className="max-w-xs text-sm leading-6 text-[var(--text-secondary)]">
                Your one-stop shop for the latest fashion, gadgets, and
                lifestyle products. Discover more, shop smarter.
              </p>

              <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50/70 px-3 py-2 text-xs font-medium text-[var(--primary)]">
                <span className="h-2 w-2 rounded-full bg-[var(--primary)]" />
                Your everyday shopping destination
              </div>
            </>
          )}
        </div>

        {/* Quick Links */}
        <div>
          {loading ? (
            <>
              <div className="animate-skeleton mb-5 h-5 w-28 rounded-md" />
              <div className="space-y-3">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="animate-skeleton h-4 w-24 rounded-md"
                  />
                ))}
              </div>
            </>
          ) : (
            <>
              <h3 className={headingClass}>Quick Links</h3>
              <ul className="space-y-3">
                {quickLinks.map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.to}
                      className={`${linkClass} group inline-flex items-center gap-2`}
                    >
                      <ArrowRight
                        size={14}
                        className="text-[var(--primary)] transition-transform duration-200 group-hover:translate-x-1"
                      />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        {/* Customer Care */}
        <div>
          {loading ? (
            <>
              <div className="animate-skeleton mb-5 h-5 w-32 rounded-md" />
              <div className="space-y-3">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="animate-skeleton h-4 w-24 rounded-md"
                  />
                ))}
              </div>
            </>
          ) : (
            <>
              <h3 className={headingClass}>Customer Care</h3>
              <ul className="space-y-3">
                {customerLinks.map((item) => (
                  <li key={item.label}>
                    <Link to={item.to} className={linkClass}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        {/* Contact and social links */}
        <div>
          {loading ? (
            <>
              <div className="animate-skeleton mb-4 h-5 w-32 rounded-md" />
              <div className="animate-skeleton mb-4 h-4 w-full rounded-md" />
              <div className="animate-skeleton mb-5 h-5 w-28 rounded-md" />
              <div className="flex gap-3">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="animate-skeleton h-10 w-10 rounded-xl"
                  />
                ))}
              </div>
            </>
          ) : (
            <>
              <h3 className={headingClass}>Stay Connected</h3>
              <p className="mb-4 text-sm leading-6 text-[var(--text-secondary)]">
                Follow us for shopping inspiration and the latest updates.
              </p>

              <a
                href="mailto:support@shopease.com"
                className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-[var(--primary)] transition hover:text-[var(--primary-hover)]"
              >
                <Mail size={17} />
                Contact us
              </a>

              <div className="flex flex-wrap gap-3">
                {socialLinks.map(({ label, Icon, href }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-[var(--text-secondary)] transition-all duration-200 hover:-translate-y-1 hover:border-indigo-300 hover:bg-indigo-50/70 hover:text-[var(--primary)]"
                  >
                    <Icon size={18} />
                  </a>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-200/80 bg-[var(--bg-main)]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 py-5 text-center sm:px-6 md:flex-row md:text-left">
          {loading ? (
            <>
              <div className="animate-skeleton h-4 w-56 rounded-md" />
              <div className="animate-skeleton h-4 w-32 rounded-md" />
            </>
          ) : (
            <>
              <p className="text-xs text-[var(--text-secondary)] sm:text-sm">
                © {new Date().getFullYear()} ShopEase. All rights reserved.
              </p>

              <p className="text-xs text-[var(--text-secondary)]/80 sm:text-sm">
                Made for a better shopping experience.
              </p>
            </>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;