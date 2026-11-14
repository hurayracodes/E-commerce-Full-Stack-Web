import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "motion/react";
import {
  ClipboardList,
  Clock,
  CalendarDays,
  Wallet,
  PlusCircle,
  ChevronDown,
  RefreshCw,
  Bell,
  Inbox,
} from "lucide-react";
import {
  BASE_URL,
  ORDER_STATUSES,
  STATUS_STYLES,
  formatDate,
  imgSrc,
  money,
  errMsg,
} from "../utils/Helpers";

const LIME = "#C5F24E";
const INK = "#10140a";
const POLL_MS = 5000;

function StatCard({ icon: Icon, label, value, dark }) {
  return (
    <div
      className="rounded-3xl p-5"
      style={dark ? { background: INK, color: LIME } : { background: "#f5f5f5", color: INK }}
    >
      <Icon className="h-5 w-5 opacity-80" />
      <p className="mt-3 text-3xl font-black tracking-tight">{value}</p>
      <p className="text-xs font-bold uppercase tracking-wider opacity-70">{label}</p>
    </div>
  );
}

function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState("all");
  const [openId, setOpenId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newCount, setNewCount] = useState(0); // naye aaye orders ka banner
  const [highlight, setHighlight] = useState(new Set());
  const [busyId, setBusyId] = useState("");

  const knownIds = useRef(null); // pehli load ke baad jitne orders pata the

  const load = useCallback(async () => {
    try {
      const params = filter === "all" ? {} : { status: filter };
      const [o, s] = await Promise.all([
        axios.get(`${BASE_URL}/api/orders`, { params }),
        axios.get(`${BASE_URL}/api/orders/stats`),
      ]);

      // naye orders pehchano (pehli load par banner nahi)
      const ids = new Set(o.data.map((x) => x._id));
      if (knownIds.current && filter === "all") {
        const fresh = o.data.filter((x) => !knownIds.current.has(x._id)).map((x) => x._id);
        if (fresh.length) {
          setNewCount((n) => n + fresh.length);
          setHighlight((h) => new Set([...h, ...fresh]));
        }
      }
      if (filter === "all") knownIds.current = ids;

      setOrders(o.data);
      setStats(s.data);
      setError("");
    } catch (err) {
      setError(errMsg(err, "Orders load nahi ho sake."));
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    setLoading(true);
    load();
    const poll = setInterval(() => {
      if (!document.hidden) load();
    }, POLL_MS);
    const refreshWhenVisible = () => {
      if (!document.hidden) load();
    };
    document.addEventListener("visibilitychange", refreshWhenVisible);
    window.addEventListener("focus", refreshWhenVisible);
    return () => {
      clearInterval(poll);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
      window.removeEventListener("focus", refreshWhenVisible);
    };
  }, [load]);

  const changeStatus = async (id, status) => {
    try {
      setBusyId(id);
      const { data } = await axios.patch(`${BASE_URL}/api/orders/${id}/status`, { status });
      setOrders((prev) => prev.map((o) => (o._id === id ? data : o)));
      const s = await axios.get(`${BASE_URL}/api/orders/stats`);
      setStats(s.data);
    } catch (err) {
      alert(errMsg(err, "Status badal nahi saka."));
    } finally {
      setBusyId("");
    }
  };

  const clearNew = () => {
    setNewCount(0);
    setHighlight(new Set());
  };

  const tabs = ["all", ...ORDER_STATUSES];

  return (
    <main className="min-h-screen bg-white px-4 py-8 text-neutral-900 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        {/* header */}
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Admin Dashboard</h1>
            <p className="mt-1 text-sm text-neutral-500">
              Naye orders har 5 seconds mein automatically dikhte hain — browser refresh ki zaroorat nahi.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={load}
              className="flex items-center gap-2 rounded-full border border-neutral-300 px-4 py-2.5 text-sm font-bold hover:bg-neutral-50"
            >
              <RefreshCw className="h-4 w-4" /> Refresh
            </button>
            <Link
              to="/create-product"
              className="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-extrabold"
              style={{ background: INK, color: LIME }}
            >
              <PlusCircle className="h-4 w-4" /> Create product
            </Link>
          </div>
        </header>

        {/* naye orders ka banner */}
        <AnimatePresence>
          {newCount > 0 && (
            <motion.button
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              onClick={clearNew}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-extrabold"
              style={{ background: LIME, color: INK }}
            >
              <Bell className="h-4 w-4" />
              {newCount} naya order aaya hai — click karke dismiss karein
            </motion.button>
          )}
        </AnimatePresence>

        {/* stats */}
        <section className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard icon={ClipboardList} label="Total orders" value={stats?.total ?? "—"} />
          <StatCard icon={Clock} label="Pending" value={stats?.counts.pending ?? "—"} dark />
          <StatCard icon={CalendarDays} label="Aaj ke orders" value={stats?.today ?? "—"} />
          <StatCard icon={Wallet} label="Revenue (delivered)" value={stats ? money(stats.revenue) : "—"} dark />
        </section>

        {/* filter tabs */}
        <nav className="mt-8 flex gap-2 overflow-x-auto pb-1">
          {tabs.map((t) => {
            const active = filter === t;
            const count = t === "all" ? stats?.total : stats?.counts[t];
            return (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className="shrink-0 rounded-full px-4 py-2 text-sm font-bold capitalize transition-colors"
                style={
                  active
                    ? { background: INK, color: LIME }
                    : { background: "#f5f5f5", color: INK }
                }
              >
                {t}
                {count !== undefined && <span className="ml-1.5 opacity-70">{count}</span>}
              </button>
            );
          })}
        </nav>

        {/* orders */}
        <section className="mt-4 space-y-3">
          {loading && <p className="py-16 text-center text-sm text-neutral-500">Loading orders…</p>}
          {!loading && error && <p className="py-16 text-center text-sm text-red-500">{error}</p>}

          {!loading && !error && orders.length === 0 && (
            <div className="grid place-items-center gap-3 py-16 text-center text-neutral-500">
              <Inbox className="h-12 w-12 text-neutral-300" />
              <p className="font-bold">Is filter mein koi order nahi</p>
            </div>
          )}

          {orders.map((o) => {
            const st = STATUS_STYLES[o.status] || STATUS_STYLES.pending;
            const open = openId === o._id;
            const isNew = highlight.has(o._id);
            const locked = o.status === "cancelled"; // cancelled ka status nahi badalta
            return (
              <article
                key={o._id}
                className="overflow-hidden rounded-3xl border"
                style={{ borderColor: isNew ? INK : "#e5e5e5", borderWidth: isNew ? 2 : 1 }}
              >
                {/* row */}
                <button
                  onClick={() => setOpenId(open ? "" : o._id)}
                  className="grid w-full grid-cols-[1fr_auto] items-center gap-3 p-4 text-left hover:bg-neutral-50 sm:grid-cols-[1.2fr_1fr_auto_auto_auto]"
                >
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 font-extrabold">
                      #{o._id.slice(-6).toUpperCase()}
                      {isNew && (
                        <span
                          className="rounded-full px-2 py-0.5 text-[10px] font-black"
                          style={{ background: LIME, color: INK }}
                        >
                          NEW
                        </span>
                      )}
                    </p>
                    <p className="line-clamp-1 text-xs text-neutral-500">
                      {o.user?.name || "Deleted user"} • {formatDate(o.createdAt)}
                    </p>
                  </div>
                  <p className="hidden text-sm text-neutral-600 sm:block">
                    {o.items.reduce((s, i) => s + i.qty, 0)} items • {o.shipping.city}
                  </p>
                  <p className="hidden font-black sm:block">{money(o.total)}</p>
                  <span className={`rounded-full px-3 py-1 text-xs font-extrabold ${st.cls}`}>
                    {st.label}
                  </span>
                  <ChevronDown
                    className={`hidden h-5 w-5 transition-transform sm:block ${open ? "rotate-180" : ""}`}
                  />
                </button>

                {/* details */}
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="grid gap-5 border-t border-neutral-100 p-4 md:grid-cols-2">
                        {/* items */}
                        <div>
                          <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-neutral-500">
                            Items
                          </h3>
                          <ul className="space-y-2">
                            {o.items.map((it, i) => (
                              <li key={i} className="flex items-center gap-3">
                                <span className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
                                  {it.img && (
                                    <img src={imgSrc(it.img)} alt="" className="h-full w-full object-cover" />
                                  )}
                                </span>
                                <div className="min-w-0 flex-1">
                                  <p className="line-clamp-1 text-sm font-bold">{it.title}</p>
                                  <p className="text-xs text-neutral-500">
                                    {money(it.price)} × {it.qty}
                                    {it.size && ` • Size ${it.size}`}
                                  </p>
                                </div>
                                <p className="text-sm font-black">{money(it.price * it.qty)}</p>
                              </li>
                            ))}
                          </ul>
                          <dl className="mt-3 space-y-1 border-t border-neutral-100 pt-3 text-sm">
                            <div className="flex justify-between">
                              <dt className="text-neutral-500">Subtotal</dt>
                              <dd className="font-bold">{money(o.subtotal)}</dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="text-neutral-500">Shipping</dt>
                              <dd className="font-bold">{o.shippingFee ? money(o.shippingFee) : "Free"}</dd>
                            </div>
                            <div className="flex justify-between text-base">
                              <dt className="font-extrabold">Total (COD)</dt>
                              <dd className="font-black">{money(o.total)}</dd>
                            </div>
                          </dl>
                        </div>

                        {/* customer + status */}
                        <div>
                          <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-neutral-500">
                            Customer & delivery
                          </h3>
                          <div className="rounded-2xl bg-neutral-50 p-3 text-sm">
                            <p className="text-xs font-bold uppercase tracking-wide text-neutral-500">
                              Account
                            </p>
                            <p className="font-bold">{o.user?.name || "Deleted user"}</p>
                            {o.user?.email && <p className="text-neutral-600">{o.user.email}</p>}
                            <p className="mb-2 mt-3 border-t border-neutral-200 pt-2 text-xs font-bold uppercase tracking-wide text-neutral-500">
                              Delivery
                            </p>
                            <p className="font-bold">{o.shipping.fullName}</p>
                            <p>{o.shipping.phone}</p>
                            <p className="text-neutral-600">
                              {o.shipping.address}, {o.shipping.city}
                            </p>
                            {o.shipping.notes && (
                              <p className="mt-2 text-xs italic text-neutral-600">“{o.shipping.notes}”</p>
                            )}
                          </div>

                          <h3 className="mb-2 mt-4 text-xs font-bold uppercase tracking-wider text-neutral-500">
                            Status badlein
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {ORDER_STATUSES.map((s) => (
                              <button
                                key={s}
                                disabled={locked || o.status === s || busyId === o._id}
                                onClick={() => {
                                  if (s === "cancelled" && !window.confirm("Order cancel karna hai? Stock wapas ho jayega."))
                                    return;
                                  changeStatus(o._id, s);
                                }}
                                className="rounded-full px-4 py-1.5 text-xs font-extrabold capitalize transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
                                style={
                                  o.status === s
                                    ? { background: INK, color: LIME }
                                    : { background: "#f0f0f0", color: INK }
                                }
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                          {locked && (
                            <p className="mt-2 text-xs text-neutral-500">Cancelled order ka status nahi badal sakta.</p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </article>
            );
          })}
        </section>
      </div>
    </main>
  );
}

export default AdminDashboard;