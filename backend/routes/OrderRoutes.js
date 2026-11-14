import express from "express";
import mongoose from "mongoose";
import Order, { ORDER_STATUSES } from "../models/OrderModel.js";
import Product from "../models/ProductModel.js";
import { protect, adminOnly } from "../Middleware/AuthMiddleware.js";

const router = express.Router();

// Frontend (Cart.jsx / helpers.js) mein bhi yehi values hain: sirf dikhane ke liye.
// Asli total hamesha yahin server par banta hai.
const SHIPPING_FEE = 200;
const FREE_SHIPPING_OVER = 5000;
const PHONE_RE = /^[0-9+\-\s]{10,15}$/;

const firstImage = (p) => {
  const pick = (v) => (Array.isArray(v) ? v[0] : v);
  return pick(p.images) || pick(p.img) || "";
};

const clean = (v, max) => String(v ?? "").trim().slice(0, max);

const restoreStock = (lines) =>
  Promise.all(
    lines.map((l) => Product.updateOne({ _id: l.product ?? l.id }, { $inc: { stock: l.qty } }))
  );

/* ------------------------------------------------------------------ */
/*  USER: order dena  ->  POST /api/orders                              */
/*  Client se sirf productId, size, qty aur address aata hai.           */
/*  Price/title/total server khud database se nikalta hai.              */
/* ------------------------------------------------------------------ */
router.post("/", protect, async (req, res) => {
  try {
    const rawItems = Array.isArray(req.body.items) ? req.body.items : [];
    if (!rawItems.length || rawItems.length > 50)
      return res.status(400).json({ error: "Cart khali hai" });

    const s = req.body.shipping || {};
    const shipping = {
      fullName: clean(s.fullName, 80),
      phone: clean(s.phone, 20),
      address: clean(s.address, 250),
      city: clean(s.city, 60),
      notes: clean(s.notes, 300),
    };
    if (shipping.fullName.length < 2) return res.status(400).json({ error: "Poora naam likhein" });
    if (!PHONE_RE.test(shipping.phone)) return res.status(400).json({ error: "Sahi phone number likhein" });
    if (shipping.address.length < 8) return res.status(400).json({ error: "Poora address likhein" });
    if (!shipping.city) return res.status(400).json({ error: "City likhein" });

    // same product + size dobara aaye to jama kar do
    const merged = new Map();
    for (const r of rawItems) {
      if (!r || typeof r !== "object" || Array.isArray(r))
        return res.status(400).json({ error: "Cart mein galat item hai" });

      const id = String(r.productId ?? "");
      const qty = Number(r.qty);
      if (!mongoose.isValidObjectId(id) || !Number.isInteger(qty) || qty < 1 || qty > 99)
        return res.status(400).json({ error: "Cart mein galat item hai" });
      const size = clean(r.size, 20);
      const key = `${id}__${size}`;
      const mergedQty = (merged.get(key)?.qty || 0) + qty;
      if (mergedQty > 99) return res.status(400).json({ error: "Cart mein galat item hai" });
      merged.set(key, { id, size, qty: mergedQty });
    }
    const lines = [...merged.values()];

    const ids = [...new Set(lines.map((l) => l.id))];
    const products = await Product.find({ _id: { $in: ids } });
    const byId = new Map(products.map((p) => [String(p._id), p]));

    const items = [];
    const qtyByProduct = new Map();
    for (const l of lines) {
      const p = byId.get(l.id);
      if (!p) return res.status(400).json({ error: "Cart ka koi product ab available nahi hai" });

      const hasSizes = p.sizes?.length > 0;
      if (hasSizes && !p.sizes.includes(l.size))
        return res.status(400).json({ error: `"${p.title}" ka size select karein` });

      items.push({
        product: p._id,
        title: p.title,
        price: p.price, // DB wali price, client ki nahi
        img: firstImage(p), // images[] ya purana img (string/array)
        size: hasSizes ? l.size : "",
        qty: l.qty,
      });
      qtyByProduct.set(l.id, (qtyByProduct.get(l.id) || 0) + l.qty);
    }

    // Stock ghatao: filter mein stock >= qty hai, is liye do log ek saath
    // aakhri piece nahi le sakte. Kuch fail ho to ab tak ghataya hua wapas.
    const done = [];
    for (const [id, qty] of qtyByProduct) {
      const r = await Product.updateOne({ _id: id, stock: { $gte: qty } }, { $inc: { stock: -qty } });
      if (r.modifiedCount === 0) {
        await restoreStock(done);
        return res
          .status(409)
          .json({ error: `"${byId.get(id).title}" ka itna stock available nahi hai` });
      }
      done.push({ id, qty });
    }

    const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
    const shippingFee = subtotal >= FREE_SHIPPING_OVER ? 0 : SHIPPING_FEE;

    try {
      const order = await Order.create({
        user: req.user._id,
        items,
        shipping,
        subtotal,
        shippingFee,
        total: subtotal + shippingFee,
      });
      res.status(201).json(order);
    } catch (err) {
      await restoreStock(done); // order save nahi hua to stock wapas
      throw err;
    }
  } catch (error) {
    console.error("Create order error", error);
    res.status(500).json({ error: "Order place nahi ho saka" });
  }
});

/* USER: apne orders -> GET /api/orders/mine */
router.get("/mine", protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* USER: apna pending order cancel -> PATCH /api/orders/:id/cancel */
router.patch("/:id/cancel", protect, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).json({ error: "Galat order id" });

    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return res.status(404).json({ error: "Order nahi mila" });
    if (order.status !== "pending")
      return res.status(400).json({ error: "Sirf pending order cancel ho sakta hai" });

    order.status = "cancelled";
    await order.save();
    await restoreStock(order.items);
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ------------------------------------------------------------------ */
/*  ADMIN                                                              */
/* ------------------------------------------------------------------ */

/* Dashboard ke numbers -> GET /api/orders/stats */
router.get("/stats", protect, adminOnly, async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [byStatus, revenueAgg, today] = await Promise.all([
      Order.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Order.aggregate([
        { $match: { status: "delivered" } },
        { $group: { _id: null, revenue: { $sum: "$total" } } },
      ]),
      Order.countDocuments({ createdAt: { $gte: startOfDay } }),
    ]);

    const counts = Object.fromEntries(ORDER_STATUSES.map((s) => [s, 0]));
    byStatus.forEach((r) => (counts[r._id] = r.count));

    res.json({
      counts,
      total: Object.values(counts).reduce((a, b) => a + b, 0),
      today,
      revenue: revenueAgg[0]?.revenue || 0, // sirf delivered orders
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* Saare orders -> GET /api/orders?status=pending */
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const filter = ORDER_STATUSES.includes(req.query.status) ? { status: req.query.status } : {};
    const orders = await Order.find(filter)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(200);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* Status badlo -> PATCH /api/orders/:id/status   body: { status } */
router.patch("/:id/status", protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).json({ error: "Galat order id" });
    if (!ORDER_STATUSES.includes(status)) return res.status(400).json({ error: "Galat status" });

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order nahi mila" });
    if (order.status === "cancelled")
      return res.status(400).json({ error: "Cancelled order ka status nahi badal sakta" });

    if (status === "cancelled") await restoreStock(order.items); // cancel par stock wapas
    order.status = status;
    await order.save();

    await order.populate("user", "name email");
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;