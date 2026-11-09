import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/products`;
const CART_KEY = "msee_cart";

export const ShopContext = createContext({
  products: [],
  loading: false,
  error: "",
  cart: {},
  cartItems: [],
  cartCount: 0,
  cartSubtotal: 0,
  addToCart: () => {},
  removeFromCart: () => {},
  updateQty: () => {},
  clearCart: () => {},
  refreshProducts: async () => {},
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
  const [cart, setCart] = useState(loadCart); // { "productId" | "productId__size": qty }

  const refreshProducts = useCallback(async () => {
    try {
      const res = await axios.get(API_URL);
      setProducts(Array.isArray(res.data) ? res.data : []);
      setError("");
    } catch (err) {
      console.error("Error in getting Product", err);
      setError("Products load nahi ho sake. Backend chal raha hai?");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProducts();
  }, [refreshProducts]);

  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch {
      /* ignore */
    }
  }, [cart]);

  // addToCart(id, qty, size) -> size ho to key "id__size"
  const addToCart = useCallback((id, qty = 1, size) => {
    const base = typeof id === "object" ? id?._id || id?.id : id;
    if (!base) return;
    const key = size ? `${base}__${size}` : base;
    setCart((prev) => ({ ...prev, [key]: (prev[key] || 0) + qty }));
  }, []);

  // key = cart ki key ("id" ya "id__size")
  const updateQty = useCallback((key, qty) => {
    setCart((prev) => {
      const next = { ...prev };
      if (qty <= 0) delete next[key];
      else next[key] = qty;
      return next;
    });
  }, []);

  const removeFromCart = useCallback((key) => updateQty(key, 0), [updateQty]);
  const clearCart = useCallback(() => setCart({}), []);

  const cartCount = useMemo(() => Object.values(cart).reduce((sum, q) => sum + q, 0), [cart]);

  // cart ki keys ko product data se jodo (jo product delete ho gaya wo hat jata hai)
  const cartItems = useMemo(
    () =>
      Object.entries(cart)
        .map(([key, qty]) => {
          const [id, size = ""] = key.split("__");
          const product = products.find((p) => String(p._id) === id);
          return product ? { key, id, size, qty, product } : null;
        })
        .filter(Boolean),
    [cart, products]
  );

  const cartSubtotal = useMemo(
    () => cartItems.reduce((sum, i) => sum + i.product.price * i.qty, 0),
    [cartItems]
  );

  const value = useMemo(
    () => ({
      products,
      loading,
      error,
      cart,
      cartItems,
      cartCount,
      cartSubtotal,
      addToCart,
      removeFromCart,
      updateQty,
      clearCart,
      refreshProducts,
    }),
    [
      products,
      loading,
      error,
      cart,
      cartItems,
      cartCount,
      cartSubtotal,
      addToCart,
      removeFromCart,
      updateQty,
      clearCart,
      refreshProducts,
    ]
  );

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export default ShopProvider;