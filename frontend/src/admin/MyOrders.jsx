import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import { CheckCircle2, Package, Loader2 } from "lucide-react";
import { BASE_URL, STATUS_STYLES, formatDate, imgSrc, money, errMsg } from "../utils/Helpers";

const LIME = "#C5F24E";
const INK = "#10140a";

function MyOrders() {
  const location = useLocation();
  const placedId = location.state?.placed; // Cart se aate waqt order id

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

  const load = async () => {
    try {
      const { data } = await axios.get(`${BASE_URL}/api/orders/mine`);
      setOrders(data);
    } catch (err) {
      setError(errMsg(err, "Orders load nahi ho sake."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const cancel = async (id) => {
    if (!window.confirm("Ye order cancel karna hai?")) return;
    try {
      setBusyId(id);
      const { data } = await axios.patch(`${BASE_URL}/api/orders/${id}/cancel`);
      setOrders((prev) => prev.map((o) => (o._id === id ? data : o)));
    } catch (err) {
      alert(errMsg(err, "Cancel nahi ho saka."));
    } finally {
      setBusyId("");
    }
  };

  return (
    <main className="min-h-screen bg-white px-4 py-8 text-neutral-900 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">My Orders</h1>

        {placedId && (
          <div
            className="mt-5 flex items-start gap-3 rounded-2xl p-4"
            style={{ background: LIME, color: INK }}
          >
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-extrabold">Order place ho gaya!</p>
              <p className="text-sm">
                Order #{String(placedId).slice(-6).toUpperCase()} — hum jald aap se rabta karenge.
              </p>
            </div>
          </div>
        )}

        {loading && <p className="py-20 text-center text-sm text-neutral-500">Loading…</p>}
        {!loading && error && <p className="py-20 text-center text-sm text-red-500">{error}</p>}

        {!loading && !error && orders.length === 0 && (
          <div className="grid place-items-center gap-3 py-20 text-center">
            <Package className="h-12 w-12 text-neutral-300" />
            <p className="text-lg font-bold">Abhi koi order nahi hai</p>
            <Link
              to="/collection"
              className="rounded-full px-6 py-2.5 text-sm font-extrabold"
              style={{ background: INK, color: LIME }}
            >
              Shop now
            </Link>
          </div>
        )}

        <div className="mt-6 space-y-4">
          {orders.map((o) => {
            const st = STATUS_STYLES[o.status] || STATUS_STYLES.pending;
            return (
              <article
                key={o._id}
                className={`rounded-3xl border p-4 sm:p-5 ${
                  o._id === placedId ? "border-neutral-900" : "border-neutral-200"
                }`}
              >
                <header className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-extrabold">#{o._id.slice(-6).toUpperCase()}</p>
                    <p className="text-xs text-neutral-500">{formatDate(o.createdAt)}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-extrabold ${st.cls}`}>
                    {st.label}
                  </span>
                </header>

                <ul className="mt-4 divide-y divide-neutral-100">
                  {o.items.map((it, i) => (
                    <li key={i} className="flex items-center gap-3 py-2.5">
                      <span className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
                        {it.img && (
                          <img src={imgSrc(it.img)} alt="" className="h-full w-full object-cover" />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-sm font-bold">{it.title}</p>
                        <p className="text-xs text-neutral-500">
                          Qty {it.qty}
                          {it.size && ` • Size ${it.size}`}
                        </p>
                      </div>
                      <p className="text-sm font-black">{money(it.price * it.qty)}</p>
                    </li>
                  ))}
                </ul>

                <footer className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-100 pt-3">
                  <div className="text-xs text-neutral-500">
                    <p>
                      {o.shipping.fullName} • {o.shipping.phone}
                    </p>
                    <p>
                      {o.shipping.address}, {o.shipping.city}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-neutral-500">
                        Shipping {o.shippingFee ? money(o.shippingFee) : "Free"}
                      </p>
                      <p className="text-lg font-black">{money(o.total)}</p>
                    </div>
                    {o.status === "pending" && (
                      <button
                        onClick={() => cancel(o._id)}
                        disabled={busyId === o._id}
                        className="flex items-center gap-1.5 rounded-full border border-red-200 px-4 py-2 text-xs font-extrabold text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        {busyId === o._id && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                        Cancel
                      </button>
                    )}
                  </div>
                </footer>
              </article>
            );
          })}
        </div>
      </div>
    </main>
  );
}

export default MyOrders;