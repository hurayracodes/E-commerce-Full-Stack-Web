import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { ShoppingBag, Check } from "lucide-react";

const ACCENT = "#d1fe17";
const API_URL = "http://localhost:3000/api/products";
const MIN_CARDS = 10; // ring poora bharne ke liye kam az kam itne cards

/* ------------------------------------------------------------------ */
/*  Round Carousel (aap ka design)                                     */
/*  - Hover par rotation ruk jati hai aur "Add to cart" button aata hai */
/* ------------------------------------------------------------------ */
export function RoundCarousel({
  items = [],
  cardWidth = 260,
  cardHeight = 340,
  spacing = 3,
  speed = 2,
  direction = "right",
  drag = true,
  sensitivity = 5,
  tilt = -7,
  perspective = 3000,
  cornerRadius = 22,
  innerDim = 3.5,
  background = "#000000",
  onAddToCart,
  style = {},
}) {
  const count = items.length;

  const ringRef = useRef(null);
  const rafRef = useRef(0);
  const rotYRef = useRef(0);
  const velRef = useRef(0);
  const lastRef = useRef(0);
  const speedFactorRef = useRef(1); // 1 = chal raha hai, 0 = ruka hua
  const hoverRef = useRef(null);
  const dragRef = useRef({ pressed: false, active: false, x: 0, startX: 0 });
  const addedTimer = useRef(0);

  const [hovered, setHovered] = useState(null); // index of hovered/selected card
  const [added, setAdded] = useState(null); // index of card jisme abhi add hua

  const angle = count ? 360 / count : 0;
  const factor = 1 + spacing * 0.15;
  const radius =
    count > 1 ? (cardWidth * factor) / (2 * Math.tan(Math.PI / count)) : 0;
  const degPerSec = speed * 6 * (direction === "left" ? -1 : 1);

  const setHover = (i) => {
    hoverRef.current = i;
    setHovered(i);
  };

  useEffect(() => () => clearTimeout(addedTimer.current), []);

  useEffect(() => {
    const ring = ringRef.current;
    if (!ring || !count) return;

    const apply = () => {
      ring.style.transform = `translateZ(${-radius}px) rotateY(${rotYRef.current}deg)`;
    };
    apply();

    const draw = (now) => {
      const dt = lastRef.current ? (now - lastRef.current) / 1000 : 0;
      lastRef.current = now;
      const f = Math.min(dt, 0.1);

      // hover par smoothly ruk jao, hat jane par wapas chalo
      const target = hoverRef.current !== null ? 0 : 1;
      speedFactorRef.current +=
        (target - speedFactorRef.current) * Math.min(1, f * 10);

      if (!dragRef.current.active) {
        if (Math.abs(velRef.current) > 0.01) {
          rotYRef.current += velRef.current * f;
          velRef.current *= hoverRef.current !== null ? 0.8 : 0.94;
        } else {
          rotYRef.current += degPerSec * f * speedFactorRef.current;
        }
      }
      apply();
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [radius, degPerSec, count]);

  /* ---------- drag (button par click kharab na ho is liye capture tab hota hai jab sach mein drag ho) ---------- */
  const onPointerDown = (e) => {
    if (!drag || e.target.closest("[data-no-drag]")) return;
    dragRef.current = {
      pressed: true,
      active: false,
      x: e.clientX,
      startX: e.clientX,
    };
    velRef.current = 0;
  };
  const onPointerMove = (e) => {
    const d = dragRef.current;
    if (!d.pressed) return;
    if (!d.active) {
      if (Math.abs(e.clientX - d.startX) < 5) return;
      d.active = true;
      d.x = e.clientX;
      e.currentTarget.setPointerCapture?.(e.pointerId);
    }
    const dx = e.clientX - d.x;
    d.x = e.clientX;
    const k = 0.3 * sensitivity;
    rotYRef.current += dx * k;
    velRef.current = dx * k * 60;
  };
  const onPointerUp = (e) => {
    if (dragRef.current.active)
      e.currentTarget.releasePointerCapture?.(e.pointerId);
    dragRef.current = { pressed: false, active: false, x: 0, startX: 0 };
  };

  const handleAdd = (e, item, i) => {
    e.stopPropagation();
    onAddToCart?.(item);
    setAdded(i);
    clearTimeout(addedTimer.current);
    addedTimer.current = setTimeout(() => setAdded(null), 1600);
  };

  const faceBase = {
    position: "absolute",
    inset: 0,
    borderRadius: cornerRadius,
    overflow: "hidden",
    backfaceVisibility: "hidden",
  };

  return (
    <div
      style={{
        ...style,
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        background,
        perspective: `${perspective}px`,
        cursor: drag ? "grab" : "default",
        touchAction: "pan-y",
        userSelect: "none",
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      // touch par: card ke bahar tap karo to selection khatam
      onClick={(e) => {
        if (!e.target.closest("[data-card]")) setHover(null);
      }}
    >
      <div
        style={{
          transformStyle: "preserve-3d",
          transform: `rotateX(${tilt}deg)`,
        }}
      >
        <div
          ref={ringRef}
          style={{
            position: "relative",
            width: cardWidth,
            height: cardHeight,
            transformStyle: "preserve-3d",
          }}
        >
          {items.map((item, i) => {
            const src = item.img || item.src;
            const isHovered = hovered === i;
            const isAdded = added === i;

            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  inset: 0,
                  transform: `rotateY(${i * angle}deg) translateZ(${radius}px)`,
                  transformStyle: "preserve-3d",
                }}
              >
                {/* ---------- Front face (product card) ---------- */}
                <div
                  data-card
                  onPointerEnter={(e) =>
                    e.pointerType === "mouse" && setHover(i)
                  }
                  onPointerLeave={(e) =>
                    e.pointerType === "mouse" && setHover(null)
                  }
                  onClick={() => setHover(i)}
                  style={{
                    ...faceBase,
                    backgroundColor: "#222",
                    boxShadow: isHovered
                      ? `0 18px 50px rgba(0,0,0,0.6), 0 0 0 1.5px ${ACCENT}`
                      : "0 10px 30px rgba(0,0,0,0.35)",
                    transform: isHovered ? "translateZ(26px)" : "translateZ(0)",
                    transition: "transform .35s ease, box-shadow .35s ease",
                  }}
                >
                  {src && (
                    <img
                      src={src}
                      alt={item.title || "Product"}
                      draggable={false}
                      style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        transform: isHovered ? "scale(1.06)" : "scale(1)",
                        transition: "transform .5s ease",
                      }}
                    />
                  )}

                  {/* rating */}
                  <div
                    style={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      padding: "2px 9px",
                      borderRadius: 999,
                      background: "rgba(0,0,0,.65)",
                      border: `1px solid ${ACCENT}40`,
                      color: ACCENT,
                      fontSize: 11,
                      fontWeight: 600,
                      backdropFilter: "blur(6px)",
                    }}
                  >
                    ⭐ {item.rating || "4.5"}
                  </div>

                  {/* bottom info */}
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      bottom: 0,
                      padding: "44px 14px 14px",
                      background:
                        "linear-gradient(to top, rgba(0,0,0,.92) 25%, rgba(0,0,0,.55) 65%, transparent)",
                      color: "#fff",
                    }}
                  >
                    <h3
                      style={{
                        margin: 0,
                        fontSize: 14,
                        fontWeight: 600,
                        lineHeight: 1.3,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {item.title}
                    </h3>

                    <div
                      style={{
                        marginTop: 6,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 8,
                      }}
                    >
                      <span
                        style={{
                          padding: "1px 8px",
                          borderRadius: 999,
                          border: `1px solid ${ACCENT}40`,
                          background: `${ACCENT}1a`,
                          color: ACCENT,
                          fontSize: 11,
                          fontWeight: 500,
                        }}
                      >
                        {item.Condition || "New"}
                      </span>
                      <span
                        style={{
                          color: ACCENT,
                          fontSize: 15,
                          fontWeight: 800,
                          whiteSpace: "nowrap",
                        }}
                      >
                        Rs. {item.price}
                      </span>
                    </div>

                    {/* Add to cart: sirf hover / tap par nazar aata hai */}
                    <button
                      type="button"
                      data-no-drag
                      onClick={(e) => handleAdd(e, item, i)}
                      tabIndex={isHovered ? 0 : -1}
                      style={{
                        marginTop: isHovered ? 12 : 0,
                        height: isHovered ? 40 : 0,
                        opacity: isHovered ? 1 : 0,
                        pointerEvents: isHovered ? "auto" : "none",
                        width: "100%",
                        overflow: "hidden",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        border: "none",
                        borderRadius: 999,
                        background: isAdded ? "#fff" : ACCENT,
                        color: "#10140a",
                        fontSize: 13,
                        fontWeight: 800,
                        cursor: "pointer",
                        transition: "all .3s ease",
                      }}
                    >
                      {isAdded ? (
                        <>
                          <Check size={16} /> Added
                        </>
                      ) : (
                        <>
                          <ShoppingBag size={16} /> Add to cart
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* ---------- Back face (ring ke andar ka dim nazara) ---------- */}
                <div
                  style={{
                    ...faceBase,
                    transform: "rotateY(180deg)",
                    backgroundColor: "#181818",
                    backgroundImage: src ? `url(${src})` : undefined,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    filter: `brightness(${innerDim / 10})`,
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Product List (aap ka logic: API se products)                       */
/* ------------------------------------------------------------------ */
function ProductList({ onAddToCart }) {
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
        if (!cancelled)
          setError("Products load nahi ho sake. Backend chal raha hai?");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Products kam hon to repeat kar do taake circle poora bhare
  const carouselItems = useMemo(() => {
    if (!products.length) return [];
    const repeats = Math.ceil(MIN_CARDS / products.length);
    return Array.from({ length: repeats }, () => products).flat();
  }, [products]);

  return (
    <div
      style={{ borderTopLeftRadius: "10px", borderTopRightRadius: "70px" }}
      className="flex min-h-screen flex-col items-center justify-center bg-black p-6 text-white"
    >
      <h2
        className="mb-2 text-center text-2xl font-black tracking-wide"
        style={{ color: ACCENT }}
      >
        Featured Products
      </h2>

      {loading && <p className="text-sm text-neutral-400">Loading products…</p>}
      {!loading && error && <p className="text-sm text-red-400">{error}</p>}
      {!loading && !error && carouselItems.length === 0 && (
        <p className="text-sm text-neutral-400">Abhi koi product nahi hai.</p>
      )}

      {carouselItems.length > 0 && (
        <section className="w-full max-w-6xl">
          <div className="relative h-[560px] w-full">
            <RoundCarousel items={carouselItems} onAddToCart={onAddToCart} />
          </div>
        </section>
      )}
    </div>
  );
}

export default ProductList;
