
import express from "express";
import fs from "fs";
import path from "path";
import Product from "../models/ProductModel.js";
import upload from "../Middleware/upload.js";

const router = express.Router();

// Parse sizes
const parseSizes = (value) => {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.map(String);
  }

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.map(String);
  } catch {
    // Comma separated sizes
  }

  return String(value)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
};

// Convert uploaded files into paths
const filePaths = (files = []) =>
  files.map((file) => `/uploads/${file.filename}`);

// Delete uploaded files
const removeFiles = (paths = []) => {
  paths.forEach((file) => {
    const filePath = path.join(process.cwd(), file.replace(/^\/+/, ""));
    fs.unlink(filePath, () => {});
  });
};

// CREATE PRODUCT
router.post("/", upload.array("images", 6), async (req, res) => {
  try {
    const {
      title,
      desc,
      category,
      price,
      condition,
      stock,
      sizes,
    } = req.body;

    const images = filePaths(req.files);

    if (!images.length) {
      return res.status(400).json({
        error: "At least one image is required",
      });
    }

    const product = new Product({
      title,
      desc,
      category,
      price,
      condition,
      stock,
      sizes: parseSizes(sizes),
      img: images, // All images save hongi
    });

    await product.save();

    res.status(201).json(product);
  } catch (error) {
    (req.files || []).forEach((file) =>
      fs.unlink(file.path, () => {})
    );

    res.status(400).json({ error: error.message });
  }
});

// READ ALL PRODUCTS
router.get("/", async (req, res) => {
  try {
    const filter = req.query.category
      ? { category: req.query.category }
      : {};

    const products = await Product.find(filter)
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// READ SINGLE PRODUCT
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        error: "Product nahi mila",
      });
    }

    res.json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// UPDATE PRODUCT
router.put("/:id", upload.array("images", 6), async (req, res) => {
  try {
    const {
      title,
      desc,
      category,
      price,
      condition,
      stock,
      sizes,
    } = req.body;

    const oldProduct = await Product.findById(req.params.id);

    if (!oldProduct) {
      (req.files || []).forEach((file) =>
        fs.unlink(file.path, () => {})
      );

      return res.status(404).json({
        error: "Product nahi mila",
      });
    }

    const update = {};

    if (title !== undefined) update.title = title;
    if (desc !== undefined) update.desc = desc;
    if (category !== undefined) update.category = category;
    if (price !== undefined) update.price = price;
    if (condition !== undefined) update.condition = condition;
    if (stock !== undefined) update.stock = stock;

    if (sizes !== undefined) {
      update.sizes = parseSizes(sizes);
    }

    // New images upload hui hain to purani replace hongi
    if (req.files?.length) {
      update.img = filePaths(req.files);
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      update,
      {
        new: true,
        runValidators: true,
      }
    );

    // Database update successful hone ke baad old images delete karo
    if (req.files?.length) {
      removeFiles(oldProduct.img || []);
    }

    res.json(product);
  } catch (error) {
    (req.files || []).forEach((file) =>
      fs.unlink(file.path, () => {})
    );

    res.status(400).json({ error: error.message });
  }
});

// DELETE PRODUCT
router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        error: "Product nahi mila",
      });
    }

    removeFiles(product.img || []);

    res.json({
      message: "Product delete ho gaya",
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
