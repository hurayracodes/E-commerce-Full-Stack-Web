import express from "express";
import Product from "../models/ProductModel.js"; // apne model ka sahi path likhein

const router = express.Router();

// CREATE -> POST /api/products
router.post("/", async (req, res) => {
  try {
    // frontend se jo naam bhejte hain wahi schema ke naam hain: title, Condition, price, rating, img
    const { title, Condition, price, rating, img } = req.body;

    const product = new Product({ title, Condition, price, rating, img });
    await product.save();

    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// READ ALL -> GET /api/products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// READ ONE -> GET /api/products/:id
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product nahi mila" });
    }
    res.json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// UPDATE -> PUT /api/products/:id
router.put("/:id", async (req, res) => {
  try {
    const { title, Condition, price, rating, img } = req.body;

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { title, Condition, price, rating, img },
      { new: true, runValidators: true } // new: true => updated product wapis milega
    );

    if (!product) {
      return res.status(404).json({ error: "Product nahi mila" });
    }
    res.json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE -> DELETE /api/products/:id
router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product nahi mila" });
    }
    res.json({ message: "Product delete ho gaya" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;