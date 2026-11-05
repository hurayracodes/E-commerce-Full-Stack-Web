import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:3000/api/products";
const CART_KEY = "msee_cart";

// Named export: `import { ShopContext } from "../context/ShopContext"`
export const ShopContext = createContext({
  products: [],
  loading: false,
  error: "",
  cart: {},
  cartCount: 0,
  addToCart: () => {},
  removeFromCart: () => {},
  updateQty: () => {},
  clearCart: () => {},
});

const loadCart = () => {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || {};
  } catch {
    return {};
  }
};

export function ShopProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cart, setCart] = useState(loadCart); // { [productId]: qty }

  // products backend se
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

  // cart ko browser mein save karo
  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch {
      /* ignore */
    }
  }, [cart]);

  // addToCart(id, qty, size)  -> size ho to key "id__size" banti hai
  // (ek hi product ke alag sizes alag lines banenge). Cart page par id aur size
  // ko key.split("__") se alag kar sakte ho.
  const addToCart = useCallback((id, qty = 1, size) => {
    const base = typeof id === "object" ? id?._id || id?.id : id;
    if (!base) return;
    const key = size ? `${base}__${size}` : base;
    setCart((prev) => ({ ...prev, [key]: (prev[key] || 0) + qty }));
  }, []);

  const updateQty = useCallback((id, qty) => {
    setCart((prev) => {
      const next = { ...prev };
      if (qty <= 0) delete next[id];
      else next[id] = qty;
      return next;
    });
  }, []);

  const removeFromCart = useCallback((id) => updateQty(id, 0), [updateQty]);
  const clearCart = useCallback(() => setCart({}), []);

  const cartCount = useMemo(
    () => Object.values(cart).reduce((sum, q) => sum + q, 0),
    [cart]
  );

  const value = useMemo(
    () => ({
      products,
      loading,
      error,
      cart,
      cartCount,
      addToCart,
      removeFromCart,
      updateQty,
      clearCart,
    }),
    [products, loading, error, cart, cartCount, addToCart, removeFromCart, updateQty, clearCart]
  );

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export default ShopProvider;