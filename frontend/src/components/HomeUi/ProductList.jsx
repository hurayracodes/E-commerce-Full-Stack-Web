import { useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { ShopContext } from "../context/ShopContext"; // path apne folder ke hisaab se (HomeUi mein: "../../context/ShopContext")
import { motion, AnimatePresence } from "motion/react";
import {
  ShoppingBag,
  Check,
  Star,
  Search,
  LayoutGrid,
  Shirt,
  Laptop,
  Footprints,
  Watch,
  Package,
  SearchX,
} from "lucide-react";

const LIME = "#C5F24E";
const INK = "#10140a";
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const API_URL = `${BASE_URL}/api/products`;

const CATEGORIES = [
  { name: "All", icon: LayoutGrid },
  { name: "Clothes", icon: Shirt },
  { name: "Tech", icon: Laptop },
  { name: "Shoes", icon: Footprints },
  { name: "Watches", icon: Watch },
  { name: "Others", icon: Package },
];

// Image: full URL ho to waisi hi, warna backend ke /uploads se
const imgSrc = (img) => {
  const image = Array.isArray(img) ? img[0] : img; // string ya array dono
  if (typeof image !== "string" || !image.trim()) return "";
  if (/^(https?:|data:|blob:)/i.test(image)) return image;
  if (image.startsWith("/")) return BASE_URL + image;
  return `${BASE_URL}/uploads/${image}`;
};

const norm = (s) => String(s ?? "").trim().toLowerCase();

/* ------------------------------ Card ------------------------------ */
function ProductCard({ product, onAddToCart }) {
  const [added, setAdded] = useState(false);
  const navigate = useNavigate();
  const ctx = useContext(ShopContext);

  const image = product.images?.[0] || product.img; // naye: images[], purane: img
  const hasSizes = Array.isArray(product.sizes) && product.sizes.length > 0;
  const outOfStock =
    product.stock !== undefined && product.stock !== null && Number(product.stock) <= 0;

  const handleAdd = () => {
    if (outOfStock) return;
    // size wale product ke liye pehle size choose karna zaroori hai
    if (hasSizes) {
      navigate(`/product/${product._id || product.id}`);
      return;
    }
    // parent ne onAddToCart diya ho to wo, warna seedha ShopContext ke cart mein
    if (typeof onAddToCart === "function") onAddToCart(product);
    else ctx?.addToCart?.(product._id || product.id, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ duration: 0.25 }}
      className="group flex flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-white transition-shadow hover:shadow-xl"
    >
      <Link
        to={`/product/${product._id || product.id}`}
        className="relative block aspect-[4/3] overflow-hidden bg-neutral-100"
      >
        {image ? (
          <img
            src={imgSrc(image)}
            alt={product.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-neutral-300">
            <Package className="h-10 w-10" />
          </div>
        )}
        <span
          className="absolute left-3 top-3 rounded-full px-3 py-1 text-[11px] font-bold"
          style={{ background: LIME, color: INK }}
        >
          {product.category || "Others"}
        </span>
        <span
          className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold shadow-sm backdrop-blur"
          style={{ color: INK }}
        >
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          {Number(product.rating || 0).toFixed(1)}
        </span>
        <span
          className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold shadow-sm backdrop-blur"
          style={{ color: INK }}
        >
          {product.condition || product.Condition || "New"}
        </span>
        {outOfStock && (
          <span className="absolute inset-0 grid place-items-center bg-white/70 text-sm font-black text-red-600">
            Out of stock
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4 text-neutral-900">
        <Link to={`/product/${product._id || product.id}`}>
          <h3 className="line-clamp-1 text-base font-extrabold hover:underline">{product.title}</h3>
        </Link>
        <p className="line-clamp-2 min-h-[2.5rem] text-sm text-neutral-500">{product.desc}</p>

        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-lg font-black">Rs. {product.price}</span>
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={handleAdd}
            disabled={outOfStock}
            className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-extrabold disabled:cursor-not-allowed disabled:opacity-40"
            style={{ background: added ? LIME : INK, color: added ? INK : LIME }}
          >
            {hasSizes ? (
              <>
                <ShoppingBag className="h-4 w-4" /> Select size
              </>
            ) : added ? (
              <>
                <Check className="h-4 w-4" /> Added
              </>
            ) : (
              <>
                <ShoppingBag className="h-4 w-4" /> Add
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
}

/* ----------------------------- Page ------------------------------- */
function ProductList({ onAddToCart }) {
  const [params, setParams] = useSearchParams();
  const search = params.get("search") || ""; // navbar search yahin se aata hai
  const category = params.get("category") || "All";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await axios.get(API_URL);
        if (!cancelled) setProducts(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Error in getting Product", err);
        if (!cancelled) setError("Products load nahi ho sake. Backend chal raha hai?");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Har category mein kitne products (search ke hisab se)
  const counts = useMemo(() => {
    const q = norm(search);
    const base = products.filter((p) => !q || norm(p.title).includes(q));
    const c = { All: base.length };
    base.forEach((p) => {
      const k = CATEGORIES.find((x) => norm(x.name) === norm(p.category))?.name || "Others";
      c[k] = (c[k] || 0) + 1;
    });
    return c;
  }, [products, search]);

  // Search (small/capital dono) + category filter
  const filtered = useMemo(() => {
    const q = norm(search);
    return products.filter((p) => {
      const matchSearch = !q || norm(p.title).includes(q);
      const matchCat = category === "All" || norm(p.category) === norm(category);
      return matchSearch && matchCat;
    });
  }, [products, search, category]);

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value && value !== "All") next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  return (
    <main className="min-h-screen bg-white px-4 py-8 text-neutral-900 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6">
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Collection</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {filtered.length} product{filtered.length !== 1 && "s"}
            {category !== "All" && ` in ${category}`}
            {search && ` for “${search}”`}
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[250px_1fr]">
          {/* ---------- Left: categories ---------- */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-3 lg:p-4">
              <p className="mb-3 hidden px-2 text-xs font-bold uppercase tracking-[0.18em] text-neutral-500 lg:block">
                Categories
              </p>

              {/* mobile: horizontal scroll, desktop: vertical list */}
              <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
                {CATEGORIES.map(({ name, icon: Icon }) => {
                  const active = category === name;
                  return (
                    <button
                      key={name}
                      onClick={() => setParam("category", name)}
                      className="relative flex shrink-0 items-center justify-between gap-3 rounded-full px-4 py-2.5 text-sm font-bold transition-colors lg:rounded-2xl"
                      style={{
                        color: active ? LIME : INK,
                        background: active ? "transparent" : "#fff",
                        border: active ? "1px solid transparent" : "1px solid #e5e5e5",
                      }}
                    >
                      {active && (
                        <motion.span
                          layoutId="cat-active"
                          transition={{ type: "spring", stiffness: 420, damping: 32 }}
                          className="absolute inset-0 rounded-full lg:rounded-2xl"
                          style={{ background: INK }}
                        />
                      )}
                      <span className="relative flex items-center gap-2.5">
                        <Icon className="h-4 w-4" />
                        {name}
                      </span>
                      <span
                        className="relative rounded-full px-2 py-0.5 text-[11px]"
                        style={
                          active
                            ? { background: LIME, color: INK }
                            : { background: "#f0f0f0", color: INK }
                        }
                      >
                        {counts[name] || 0}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* ---------- Right: search + cards ---------- */}
          <section>
            {/* page ke andar bhi search (navbar wale se synced) */}
            <div className="mb-5 flex items-center gap-3 rounded-full border border-neutral-300 bg-white px-4 py-3 focus-within:border-neutral-900">
              <Search className="h-5 w-5 shrink-0 text-neutral-500" />
              <input
                value={search}
                onChange={(e) => setParam("search", e.target.value)}
                placeholder="Search by product name…"
                className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-neutral-400"
              />
            </div>

            {loading && <p className="py-20 text-center text-sm text-neutral-500">Loading products…</p>}
            {!loading && error && <p className="py-20 text-center text-sm text-red-500">{error}</p>}

            {!loading && !error && filtered.length === 0 && (
              <div className="grid place-items-center gap-3 py-20 text-center">
                <SearchX className="h-12 w-12 text-neutral-300" />
                <p className="text-lg font-bold">Koi product nahi mila</p>
                <p className="text-sm text-neutral-500">Spelling check karein ya category badal kar dekhein.</p>
              </div>
            )}

            <motion.div layout className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {filtered.map((p) => (
                  <ProductCard key={p._id || p.title} product={p} onAddToCart={onAddToCart} />
                ))}
              </AnimatePresence>
            </motion.div>
          </section>
        </div>
      </div>
    </main>
  );
}

export default ProductList;