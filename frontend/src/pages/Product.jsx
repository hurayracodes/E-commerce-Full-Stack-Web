import { useContext, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "motion/react";
import {
  ShoppingBag,
  Check,
  Star,
  Minus,
  Plus,
  Truck,
  ShieldCheck,
  RotateCcw,
  ChevronRight,
  Package,
  ArrowLeft,
} from "lucide-react";
import { ShopContext } from "../context/ShopContext";

const LIME = "#C5F24E";
const INK = "#10140a";
const BASE_URL = "http://localhost:3000";
const API_URL = `${BASE_URL}/api/products`;
const LOW_STOCK = 5;
const imgSrc = (img) => {
  const image = Array.isArray(img) ? img[0] : img;

  if (typeof image !== "string" || !image.trim()) {
    return "";
  }

  if (/^(https?:|data:|blob:)/i.test(image)) {
    return image;
  }

  if (image.startsWith("/")) {
    return BASE_URL + image;
  }

  return `${BASE_URL}/uploads/${image}`;
};

// naye products: images[], purane products: sirf img
const getImages = (p) => (p?.images?.length ? p.images : p?.img ? [p.img] : []);
const sameId = (p, id) => String(p?._id ?? p?.id) === String(id);

function Product({ onAddToCart }) {
  const { productId } = useParams();
  const ctx = useContext(ShopContext);
  const ctxProducts = Array.isArray(ctx?.products) ? ctx.products : [];

  const [all, setAll] = useState(ctxProducts);
  const [loading, setLoading] = useState(!ctxProducts.length);
  const [error, setError] = useState("");
  const [qty, setQty] = useState(1);
  const [size, setSize] = useState("");
  const [sizeError, setSizeError] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await axios.get(API_URL);
        if (!cancelled && Array.isArray(res.data)) setAll(res.data);
      } catch (err) {
        console.error("Error in getting Product", err);
        if (!cancelled && !ctxProducts.length)
          setError("Product load nahi ho saka. Backend chal raha hai?");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // naya product khulne par sab reset
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setQty(1);
    setSize("");
    setSizeError(false);
    setActiveImg(0);
    setAdded(false);
  }, [productId]);

  const product = useMemo(() => all.find((p) => sameId(p, productId)), [all, productId]);

  const related = useMemo(() => {
    if (!product) return [];
    return all
      .filter(
        (p) =>
          !sameId(p, productId) &&
          String(p.category).toLowerCase() === String(product.category).toLowerCase()
      )
      .slice(0, 4);
  }, [all, product, productId]);

  /* ---------------- states ---------------- */
  if (loading) {
    return (
      <div className="grid min-h-[60vh] place-items-center bg-white text-sm text-neutral-500">
        Loading product…
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="grid min-h-[60vh] place-items-center bg-white px-4 text-center">
        <div className="space-y-3">
          <Package className="mx-auto h-12 w-12 text-neutral-300" />
          <p className="text-lg font-bold text-neutral-900">{error || "Product nahi mila"}</p>
          <Link
            to="/collection"
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold"
            style={{ background: INK, color: LIME }}
          >
            <ArrowLeft className="h-4 w-4" /> Back to collection
          </Link>
        </div>
      </div>
    );
  }

  const images = getImages(product);
  const sizes = Array.isArray(product.sizes) ? product.sizes : [];
  const rating = Number(product.rating) || 0;

  // stock: field na ho (purana product) to limit nahi lagti
  const hasStock = product.stock !== undefined && product.stock !== null;
  const stock = Number(product.stock) || 0;
  const outOfStock = hasStock && stock <= 0;
  const lowStock = hasStock && stock > 0 && stock <= LOW_STOCK;
  const maxQty = hasStock ? stock : 99;

  const handleAdd = () => {
    if (outOfStock) return;
    if (sizes.length && !size) {
      setSizeError(true);
      return;
    }
    if (typeof onAddToCart === "function") {
      for (let i = 0; i < qty; i++) onAddToCart({ ...product, size });
    } else if (typeof ctx?.addToCart === "function") {
      ctx.addToCart(product._id, qty, size || undefined);
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  return (
    <main className="min-h-screen bg-white text-neutral-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
        {/* breadcrumb */}
        <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-neutral-500">
          <Link to="/" className="hover:text-neutral-900">Home</Link>
          <ChevronRight className="h-4 w-4" />
          <Link to="/collection" className="hover:text-neutral-900">Collection</Link>
          <ChevronRight className="h-4 w-4" />
          <Link
            to={`/collection?category=${encodeURIComponent(product.category || "Others")}`}
            className="hover:text-neutral-900"
          >
            {product.category || "Others"}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="line-clamp-1 font-semibold text-neutral-900">{product.title}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-2">
          {/* ---------- Gallery: thumbnails (side) + main image ---------- */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col-reverse gap-3 lg:flex-row"
          >
            {/* thumbnails: mobile par neeche row, desktop par left column */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto lg:max-h-[560px] lg:flex-col lg:overflow-y-auto lg:overflow-x-visible">
                {images.map((src, i) => (
                  <button
                    key={src + i}
                    onClick={() => setActiveImg(i)}
                    onMouseEnter={() => setActiveImg(i)}
                    aria-label={`Image ${i + 1}`}
                    className={`h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 bg-neutral-100 transition-all ${
                      activeImg === i
                        ? "scale-105"
                        : "border-neutral-200 opacity-70 hover:opacity-100"
                    }`}
                    style={activeImg === i ? { borderColor: INK } : undefined}
                  >
                    <img src={imgSrc(src)} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* main image */}
            <div className="relative flex-1 overflow-hidden rounded-[32px] border border-neutral-200 bg-neutral-100">
              {images.length ? (
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeImg}
                    src={imgSrc(images[activeImg])}
                    alt={product.title}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="aspect-square w-full object-cover"
                  />
                </AnimatePresence>
              ) : (
                <div className="grid aspect-square w-full place-items-center text-neutral-300">
                  <Package className="h-20 w-20" />
                </div>
              )}
              <span
                className="absolute left-4 top-4 rounded-full px-4 py-1.5 text-xs font-extrabold"
                style={{ background: LIME, color: INK }}
              >
                {product.category || "Others"}
              </span>
              {outOfStock && (
                <span className="absolute right-4 top-4 rounded-full bg-red-600 px-4 py-1.5 text-xs font-extrabold text-white">
                  Out of stock
                </span>
              )}
            </div>
          </motion.div>

          {/* ---------- Details ---------- */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col"
          >
            <h1 className="text-3xl font-black leading-tight tracking-tight sm:text-4xl">
              {product.title}
            </h1>

            <div className="mt-3 flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`h-5 w-5 ${
                      s <= Math.round(rating)
                        ? "fill-amber-400 text-amber-400"
                        : "fill-neutral-200 text-neutral-200"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-semibold text-neutral-600">
                {rating.toFixed(1)}
                {!rating && <span className="ml-1 font-normal text-neutral-400">(no ratings yet)</span>}
              </span>
            </div>

            <p className="mt-5 text-4xl font-black">Rs. {product.price}</p>

            {/* stock status */}
            {hasStock && (
              <p
                className={`mt-2 inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-sm font-bold ${
                  outOfStock
                    ? "bg-red-50 text-red-600"
                    : lowStock
                    ? "bg-amber-50 text-amber-700"
                    : "bg-green-50 text-green-700"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    outOfStock ? "bg-red-500" : lowStock ? "bg-amber-500" : "bg-green-500"
                  }`}
                />
                {outOfStock
                  ? "Out of stock"
                  : lowStock
                  ? `Only ${stock} left`
                  : `${stock} available`}
              </p>
            )}

            <div className="my-6 h-px bg-neutral-200" />

            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-500">Description</h2>
            <p className="mt-2 whitespace-pre-line leading-relaxed text-neutral-700">
              {product.desc || product.description || "Is product ki koi description nahi hai."}
            </p>

            <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-neutral-100 p-3">
                <dt className="text-neutral-500">Category</dt>
                <dd className="font-bold">{product.category || "Others"}</dd>
              </div>
              <div className="rounded-2xl bg-neutral-100 p-3">
                <dt className="text-neutral-500">Condition</dt>
                <dd className="font-bold">{product.condition || product.Condition || "New"}</dd>
              </div>
            </dl>

            {/* sizes */}
            {sizes.length > 0 && (
              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-500">
                    Size
                  </h2>
                  {sizeError && (
                    <span className="text-xs font-bold text-red-600">Pehle size select karein</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((s) => {
                    const on = size === s;
                    return (
                      <button
                        key={s}
                        onClick={() => {
                          setSize(s);
                          setSizeError(false);
                        }}
                        className={`min-w-12 rounded-xl border-2 px-4 py-2 text-sm font-bold transition-colors ${
                          on
                            ? "border-transparent"
                            : sizeError
                            ? "border-red-300 hover:border-neutral-900"
                            : "border-neutral-200 hover:border-neutral-900"
                        }`}
                        style={on ? { background: INK, color: LIME } : undefined}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* qty + add */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <div
                className={`flex items-center rounded-full border border-neutral-300 ${
                  outOfStock ? "pointer-events-none opacity-40" : ""
                }`}
              >
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="Decrease"
                  className="grid h-12 w-12 place-items-center rounded-full hover:bg-neutral-100"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-10 text-center font-extrabold">{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                  disabled={qty >= maxQty}
                  aria-label="Increase"
                  className="grid h-12 w-12 place-items-center rounded-full hover:bg-neutral-100 disabled:opacity-30"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <motion.button
                whileHover={outOfStock ? undefined : { scale: 1.03 }}
                whileTap={outOfStock ? undefined : { scale: 0.96 }}
                onClick={handleAdd}
                disabled={outOfStock}
                className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full px-8 text-sm font-extrabold disabled:cursor-not-allowed sm:flex-none"
                style={
                  outOfStock
                    ? { background: "#e5e5e5", color: "#8a8a8a" }
                    : { background: added ? LIME : INK, color: added ? INK : LIME }
                }
              >
                {outOfStock ? (
                  "Out of stock"
                ) : added ? (
                  <>
                    <Check className="h-5 w-5" /> Added to cart
                  </>
                ) : (
                  <>
                    <ShoppingBag className="h-5 w-5" /> Add to cart
                  </>
                )}
              </motion.button>
            </div>

            <ul className="mt-8 grid gap-3 text-sm font-semibold text-neutral-700 sm:grid-cols-3">
              {[
                { icon: Truck, text: "Free shipping" },
                { icon: ShieldCheck, text: "Secure payment" },
                { icon: RotateCcw, text: "30-day returns" },
              ].map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-2">
                  <span
                    className="grid h-9 w-9 place-items-center rounded-full"
                    style={{ background: LIME, color: INK }}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* ---------- Related ---------- */}
        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="mb-5 text-2xl font-black">More in {product.category}</h2>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {related.map((p) => (
                <Link
                  key={p._id || p.id}
                  to={`/product/${p._id || p.id}`}
                  className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white transition-shadow hover:shadow-lg"
                >
                  <div className="aspect-square overflow-hidden bg-neutral-100">
                    {getImages(p)[0] && (
                      <img
                        src={imgSrc(getImages(p)[0])}
                        alt={p.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    )}
                  </div>
                  <div className="p-3">
                    <p className="line-clamp-1 text-sm font-bold">{p.title}</p>
                    <p className="text-sm font-black">Rs. {p.price}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

export default Product;