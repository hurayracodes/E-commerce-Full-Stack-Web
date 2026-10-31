import express from "express";
import fs from "fs";
import path from "path";
import Product from "../models/ProductModel.js";
import upload from "../Middleware/upload.js";

const router = express.Router();

// CREATE -> POST /api/products
// upload.single("img") frontend ke formData.append("img", ...) se match karta hai
router.post("/", upload.single("img"), async (req, res) => {
  try {
    const { title, desc, category, price } = req.body;

    const product = new Product({
      title,
      desc,
      category,
      price,
      img: req.file ? `/uploads/${req.file.filename}` : "",
    });
    await product.save();

    res.status(201).json(product);
  } catch (error) {
    // validation fail ho to uploaded file delete kar do
    if (req.file) fs.unlink(req.file.path, () => {});
    res.status(400).json({ error: error.message });
  }
});

// READ ALL -> GET /api/products  (?category=Tech se filter)
router.get("/", async (req, res) => {
  try {
    const filter = req.query.category ? { category: req.query.category } : {};
    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// READ ONE -> GET /api/products/:id
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product nahi mila" });
    res.json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// UPDATE -> PUT /api/products/:id
router.put("/:id", upload.single("img"), async (req, res) => {
  try {
    const { title, desc, category, price } = req.body;
    const update = { title, desc, category, price };
    if (req.file) update.img = `/uploads/${req.file.filename}`; // nayi image aayi to hi badlo

    const product = await Product.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });

    if (!product) return res.status(404).json({ error: "Product nahi mila" });
    res.json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE -> DELETE /api/products/:id
router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: "Product nahi mila" });

    // product ki image bhi disk se hata do
    if (product.img) fs.unlink(path.join(process.cwd(), product.img), () => {});

    res.json({ message: "Product delete ho gaya" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;