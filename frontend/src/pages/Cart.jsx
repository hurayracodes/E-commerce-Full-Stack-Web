import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "motion/react";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  Truck,
  Loader2,
  AlertCircle,
  Package,
  ArrowRight,
} from "lucide-react";
import { ShopContext } from "../context/ShopContext";
import { AuthContext } from "../context/AuthContext";
import {
  BASE_URL,
  FREE_SHIPPING_OVER,
  SHIPPING_FEE,
  imgSrc,
  getProductImages,
  money,
  errMsg,
} from "../utils/Helpers";

const LIME = "#C5F24E";
const INK = "#10140a";
const PHONE_RE = /^[0-9+\-\s]{10,15}$/;

const inputClass =
  "w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-sm font-medium text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-neutral-900";

function Cart() {
  const { cartItems, cartCount, cartSubtotal, updateQty, removeFromCart, clearCart, refreshProducts } =
    useContext(ShopContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({ fullName: "", phone: "", city: "", address: "", notes: "" });
  const [error, setError] = useState("");
  const [placing, setPlacing] = useState(false);

  // taza stock lene ke liye products dobara load
  useEffect(() => {
    refreshProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // login ke baad naam pehle se bhar do
  useEffect(() => {
    if (user?.name) setForm((f) => (f.fullName ? f : { ...f, fullName: user.name }));
  }, [user]);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const shippingFee = cartSubtotal === 0 || cartSubtotal >= FREE_SHIPPING_OVER ? 0 : SHIPPING_FEE;
  const total = cartSubtotal + shippingFee;
  const toFree = Math.max(0, FREE_SHIPPING_OVER - cartSubtotal);

  // koi item stock se zyada ya out of stock?
  const problems = cartItems.filter((i) => i.qty > (Number(i.product.stock) || 0));

  const placeOrder = async (e) => {
    e.preventDefault();
    setError("");

    if (!user) {
      navigate("/login", { state: { from: "/cart" } });
      return;
    }

    if (problems.length) return setError("Stock se zyada ya out of stock items cart se theek karein.");
    if (form.fullName.trim().length < 2) return setError("Poora naam likhein.");
    if (!PHONE_RE.test(form.phone.trim())) return setError("Sahi phone number likhein.");
    if (!form.city.trim()) return setError("City likhein.");
    if (form.address.trim().length < 8) return setError("Poora address likhein.");

    try {
      setPlacing(true);
      const { data } = await axios.post(`${BASE_URL}/api/orders`, {
        items: cartItems.map((i) => ({ productId: i.id, size: i.size, qty: i.qty })),
        shipping: form,
      });
      clearCart();
      refreshProducts();
      navigate("/my-orders", { state: { placed: data._id } });
    } catch (err) {
      setError(errMsg(err, "Order place nahi ho saka. Backend chal raha hai?"));
      refreshProducts(); // stock badla ho sakta hai
    } finally {
      setPlacing(false);
    }
  };

  /* ---------------- empty ---------------- */
  if (!cartItems.length) {
    return (
      <main className="grid min-h-[70vh] place-items-center bg-white px-4 text-center">
        <div className="space-y-4">
          <span
            className="mx-auto grid h-20 w-20 place-items-center rounded-full"
            style={{ background: LIME, color: INK }}
          >
            <ShoppingBag className="h-9 w-9" />
          </span>
          <h1 className="text-2xl font-black text-neutral-900">Aap ka cart khali hai</h1>
          <p className="text-sm text-neutral-500">Kuch pasand aaye to cart mein add karein.</p>
          <Link
            to="/collection"
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-extrabold"
            style={{ background: INK, color: LIME }}
          >
            Shop now <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white px-4 py-8 text-neutral-900 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Your Cart</h1>
            <p className="mt-1 text-sm text-neutral-500">
              {cartCount} item{cartCount !== 1 && "s"}
            </p>
          </div>
          <button
            onClick={clearCart}
            className="text-sm font-bold text-neutral-500 underline underline-offset-4 hover:text-red-600"
          >
            Clear cart
          </button>
        </header>

        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* ---------- Items ---------- */}
          <section className="space-y-3">
            <AnimatePresence initial={false}>
              {cartItems.map(({ key, id, size, qty, product }) => {
                const stock = Number(product.stock) || 0;
                const img = getProductImages(product)[0];
                const over = qty > stock;
                return (
                  <motion.article
                    key={key}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    className={`flex gap-4 rounded-3xl border p-3 sm:p-4 ${
                      over ? "border-red-300 bg-red-50/40" : "border-neutral-200"
                    }`}
                  >
                    <Link
                      to={`/product/${id}`}
                      className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-neutral-100 sm:h-28 sm:w-28"
                    >
                      {img ? (
                        <img src={imgSrc(img)} alt={product.title} className="h-full w-full object-cover" />
                      ) : (
                        <span className="grid h-full w-full place-items-center text-neutral-300">
                          <Package className="h-8 w-8" />
                        </span>
                      )}
                    </Link>

                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <Link to={`/product/${id}`} className="line-clamp-1 font-extrabold hover:underline">
                            {product.title}
                          </Link>
                          <p className="mt-0.5 text-xs text-neutral-500">
                            {product.category}
                            {size && (
                              <span
                                className="ml-2 rounded-md px-1.5 py-0.5 font-bold"
                                style={{ background: LIME, color: INK }}
                              >
                                Size {size}
                              </span>
                            )}
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromCart(key)}
                          aria-label="Remove"
                          className="rounded-full p-2 text-neutral-400 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-3">
                        <div className="flex items-center rounded-full border border-neutral-300">
                          <button
                            onClick={() => updateQty(key, qty - 1)}
                            aria-label="Decrease"
                            className="grid h-9 w-9 place-items-center rounded-full hover:bg-neutral-100"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-8 text-center text-sm font-extrabold">{qty}</span>
                          <button
                            onClick={() => updateQty(key, Math.min(stock, qty + 1))}
                            disabled={qty >= stock}
                            aria-label="Increase"
                            className="grid h-9 w-9 place-items-center rounded-full hover:bg-neutral-100 disabled:opacity-30"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <p className="text-lg font-black">{money(product.price * qty)}</p>
                      </div>

                      {over && (
                        <p className="mt-2 flex items-center gap-1.5 text-xs font-bold text-red-600">
                          <AlertCircle className="h-3.5 w-3.5" />
                          {stock > 0 ? `Sirf ${stock} available hain` : "Out of stock"} — quantity kam karein
                          ya remove karein
                        </p>
                      )}
                    </div>
                  </motion.article>
                );
              })}
            </AnimatePresence>
          </section>

          {/* ---------- Summary + checkout ---------- */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-5">
              <h2 className="text-lg font-black">Order summary</h2>

              {/* free shipping progress */}
              <div className="mt-4 rounded-2xl bg-white p-3">
                <p className="flex items-center gap-2 text-xs font-bold">
                  <Truck className="h-4 w-4" />
                  {toFree > 0
                    ? `${money(toFree)} aur lein, shipping free!`
                    : "Aap ki shipping free hai 🎉"}
                </p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-neutral-200">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: INK }}
                    animate={{ width: `${Math.min(100, (cartSubtotal / FREE_SHIPPING_OVER) * 100)}%` }}
                  />
                </div>
              </div>

              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-neutral-600">Subtotal</dt>
                  <dd className="font-bold">{money(cartSubtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-600">Shipping</dt>
                  <dd className="font-bold">{shippingFee ? money(shippingFee) : "Free"}</dd>
                </div>
                <div className="flex justify-between border-t border-neutral-200 pt-3 text-base">
                  <dt className="font-extrabold">Total</dt>
                  <dd className="font-black">{money(total)}</dd>
                </div>
              </dl>

              {/* login nahi hai */}
              {!user ? (
                <Link
                  to="/login"
                  state={{ from: "/cart" }}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-extrabold"
                  style={{ background: INK, color: LIME }}
                >
                  Login karke checkout karein
                </Link>
              ) : (
                <form onSubmit={placeOrder} className="mt-5 space-y-3" noValidate>
                  <h3 className="text-sm font-extrabold">Delivery details</h3>
                  <input name="fullName" value={form.fullName} onChange={onChange} placeholder="Full name" className={inputClass} />
                  <div className="grid grid-cols-2 gap-3">
                    <input name="phone" value={form.phone} onChange={onChange} placeholder="Phone" className={inputClass} />
                    <input name="city" value={form.city} onChange={onChange} placeholder="City" className={inputClass} />
                  </div>
                  <textarea
                    name="address"
                    value={form.address}
                    onChange={onChange}
                    rows={2}
                    placeholder="Poora address"
                    className={`${inputClass} resize-none`}
                  />
                  <input name="notes" value={form.notes} onChange={onChange} placeholder="Note (optional)" className={inputClass} />

                  <p className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-neutral-600">
                    Payment: <b>Cash on Delivery</b> — saman milne par payment karein.
                  </p>

                  {error && (
                    <p className="flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-600">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={placing || problems.length > 0}
                    className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-extrabold disabled:opacity-50"
                    style={{ background: INK, color: LIME }}
                  >
                    {placing && <Loader2 className="h-4 w-4 animate-spin" />}
                    {placing ? "Placing order…" : `Place order • ${money(total)}`}
                  </button>
                </form>
              )}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default Cart;