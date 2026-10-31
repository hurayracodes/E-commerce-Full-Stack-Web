import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "motion/react";
import {
  Search,
  ShoppingBag,
  Menu,
  X,
  ChevronDown,
  PlusCircle,
  Settings,
  LifeBuoy,
  LogOut,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Theme: dark bar (INK) with LIME text.                              */
/*  LIME_SOFT = subtle lime tint for pills/buttons on dark surfaces.   */
/* ------------------------------------------------------------------ */
const LIME = "#C5F24E";
const INK = "#10140a";
const LIME_SOFT = "rgba(197,242,78,0.12)";

const LINKS = [
  { to: "/", label: "Home" },
  { to: "/collection", label: "Collection" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

const MENU_ITEMS = [
  { label: "Create Product", to: "/create-product", icon: PlusCircle },
  { label: "Account settings", to: "#", icon: Settings },
  { label: "Support", to: "#", icon: LifeBuoy },
  { label: "Sign out", to: "#", icon: LogOut },
];

const TICKER = [
  "Free shipping on orders over $50",
  "New drops every Friday",
  "Easy 30-day returns",
  "Msee — shop smart",
];

/* Text that "rolls" up on hover */
function RollText({ children }) {
  return (
    <span className="relative inline-block overflow-hidden align-middle leading-tight">
      <span className="block transition-transform duration-300 ease-out group-hover:-translate-y-full">
        {children}
      </span>
      <span
        aria-hidden
        className="absolute left-0 top-0 block translate-y-full transition-transform duration-300 ease-out group-hover:translate-y-0"
      >
        {children}
      </span>
    </span>
  );
}

function Navigation({ cartCount = 0 }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [prevPath, setPrevPath] = useState(location.pathname);
  const menuRef = useRef(null);
  const searchRef = useRef(null);

  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 24));

  // close things on route change (adjust state during render, no effect needed)
  if (prevPath !== location.pathname) {
    setPrevPath(location.pathname);
    setMobileOpen(false);
    setMenuOpen(false);
    setSearchOpen(false);
  }

  // outside click + escape
  useEffect(() => {
    const onDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setSearchOpen(false);
        setMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  // lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  const submitSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    navigate(`/collection?search=${encodeURIComponent(q)}`);
    setQuery("");
    setSearchOpen(false);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* ---------- Ticker strip (ink bg, lime text) ---------- */}
      <div
        className="overflow-hidden text-[11px] font-semibold uppercase tracking-[0.18em]"
        style={{ background: INK, color: LIME }}
      >
        <motion.div
          className="flex w-max gap-12 whitespace-nowrap py-1.5"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 28, ease: "linear", repeat: Infinity }}
        >
          {[...TICKER, ...TICKER, ...TICKER, ...TICKER].map((t, i) => (
            <span key={i} className="flex items-center gap-12">
              {t}
              <Sparkles className="h-3 w-3" />
            </span>
          ))}
        </motion.div>
      </div>

      {/* ---------- Main bar (ink bg, lime text) ---------- */}
      <motion.nav
        animate={{
          paddingTop: scrolled ? 8 : 14,
          paddingBottom: scrolled ? 8 : 14,
        }}
        transition={{ duration: 0.25 }}
        className="relative px-4 sm:px-6 lg:px-10"
        style={{
          background: INK,
          color: LIME,
          boxShadow: scrolled ? "0 14px 30px -12px rgba(0,0,0,.6)" : "none",
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="group flex items-center gap-2.5">
            <span className="text-2xl font-black tracking-tight" style={{ color: LIME }}>
              Msee<span style={{ color: LIME, opacity: 0.6 }}>.</span>
            </span>
          </Link>

          {/* Desktop links */}
          <ul
            className="hidden items-center gap-1 rounded-full p-1 md:flex"
            style={{ background: LIME_SOFT }}
          >
            {LINKS.map((l) => (
              <li key={l.to}>
                <NavLink to={l.to} end={l.to === "/"} className="group relative block">
                  {({ isActive }) => (
                    <span className="relative z-10 block px-4 py-2 text-sm font-bold">
                      {isActive && (
                        <motion.span
                          layoutId="lime-active"
                          transition={{ type: "spring", stiffness: 420, damping: 32 }}
                          className="absolute inset-0 -z-10 rounded-full"
                          style={{ background: LIME }}
                        />
                      )}
                      <span style={{ color: isActive ? INK : LIME }}>
                        <RollText>{l.label}</RollText>
                      </span>
                    </span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <form onSubmit={submitSearch} className="hidden items-center md:flex">
              <motion.div
                animate={{ width: searchOpen ? 220 : 42 }}
                transition={{ type: "spring", stiffness: 260, damping: 26 }}
                className="flex h-10 items-center overflow-hidden rounded-full"
                style={{
                  background: LIME_SOFT,
                  color: LIME,
                }}
              >
                <button
                  type={searchOpen && query ? "submit" : "button"}
                  onClick={() => !searchOpen && setSearchOpen(true)}
                  aria-label="Search"
                  className="grid h-10 w-10 shrink-0 place-items-center"
                  style={{ color: LIME }}
                >
                  <Search className="h-[18px] w-[18px]" />
                </button>
                <input
                  ref={searchRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onBlur={() => !query && setSearchOpen(false)}
                  placeholder="Search products…"
                  className="w-full bg-transparent pr-3 text-sm font-medium outline-none placeholder:text-[#C5F24E]/50"
                  style={{ color: LIME }}
                />
              </motion.div>
            </form>

            {/* Options dropdown */}
            <div ref={menuRef} className="relative hidden md:block">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                aria-expanded={menuOpen}
                className="group flex h-10 items-center gap-1.5 rounded-full px-4 text-sm font-bold"
                style={{ background: LIME_SOFT, color: LIME }}
              >
                <RollText>Options</RollText>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${menuOpen ? "rotate-180" : ""}`}
                />
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.18 }}
                    className="absolute right-0 top-[calc(100%+12px)] w-60 origin-top-right rounded-2xl border p-2 shadow-2xl"
                    style={{
                      background: INK,
                      color: LIME,
                      borderColor: "rgba(197,242,78,.25)",
                    }}
                  >
                    {MENU_ITEMS.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.label}
                          to={item.to}
                          onClick={() => setMenuOpen(false)}
                          className="group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors hover:bg-[#C5F24E] hover:text-[#10140a]"
                        >
                          <span className="flex items-center gap-2.5">
                            <Icon className="h-4 w-4" />
                            {item.label}
                          </span>
                          <ArrowUpRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Cart */}
            <Link to="/cart" aria-label="Cart">
              <motion.span
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                className="relative flex h-10 items-center gap-2 rounded-full pl-3.5 pr-4 text-sm font-bold"
                style={{ background: LIME, color: INK }}
              >
                <ShoppingBag className="h-[18px] w-[18px]" />
                <span className="hidden sm:inline">Cart</span>
                <AnimatePresence>
                  {cartCount > 0 && (
                    <motion.span
                      key={cartCount}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="grid h-5 min-w-5 place-items-center rounded-full px-1 text-[11px] font-black"
                      style={{ background: INK, color: LIME }}
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.span>
            </Link>

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Menu"
              className="grid h-10 w-10 place-items-center rounded-full md:hidden"
              style={{ background: LIME_SOFT, color: LIME }}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* ---------- Mobile full-screen menu (ink bg, lime text) ---------- */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ clipPath: "circle(0% at 90% 4%)" }}
            animate={{ clipPath: "circle(150% at 90% 4%)" }}
            exit={{ clipPath: "circle(0% at 90% 4%)" }}
            transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
            className="fixed inset-0 top-0 z-[-1] flex flex-col px-6 pb-8 pt-28 md:hidden"
            style={{ background: INK, color: LIME }}
          >
            <form
              onSubmit={submitSearch}
              className="mb-8 flex items-center gap-3 rounded-full border px-4 py-3"
              style={{ borderColor: "rgba(197,242,78,.35)" }}
            >
              <Search className="h-5 w-5" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products…"
                className="w-full bg-transparent text-base font-medium outline-none placeholder:text-[#C5F24E]/50"
                style={{ color: LIME }}
              />
            </form>

            <ul className="flex flex-1 flex-col gap-1">
              {LINKS.map((l, i) => (
                <motion.li
                  key={l.to}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + i * 0.07 }}
                >
                  <NavLink
                    to={l.to}
                    end={l.to === "/"}
                    className="flex items-end justify-between border-b py-3 text-5xl font-black tracking-tight"
                    style={({ isActive }) => ({
                      color: LIME,
                      borderColor: "rgba(197,242,78,.2)",
                      opacity: isActive ? 1 : 0.6,
                    })}
                  >
                    {l.label}
                    <ArrowUpRight className="mb-2 h-7 w-7" />
                  </NavLink>
                </motion.li>
              ))}
            </ul>

            <div className="mt-6 grid grid-cols-2 gap-2">
              {MENU_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    to={item.to}
                    className="flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold"
                    style={{ background: LIME, color: INK }}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export default Navigation;