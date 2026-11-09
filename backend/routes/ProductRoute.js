import express from "express";
import Product from "../models/ProductModel.js";
import upload from "../Middleware/upload.js";
import { removeCloud } from "../Middleware/cloudinaryDelete.js";
import { protect, adminOnly } from "../Middleware/AuthMiddleware.js";

const router = express.Router();

// Parse sizes from FormData
const parseSizes = (value) => {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.map(String);
  }

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.map(String);
    }
  } catch {
    // Comma-separated format
  }

  return String(value)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
};

// Image URLs (Cloudinary upload middleware file.path mein https URL rakhta hai)
const filePaths = (files = []) => files.map((file) => file.path);

// Cloudinary se purani images delete (purani local "/uploads/..." paths ko chhor deta hai)
const removeFiles = (urls = []) => removeCloud(urls);

// CREATE PRODUCT (Admin only)
router.post(
  "/",
  protect,
  adminOnly,
  upload.array("images", 6),
  async (req, res) => {
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

      const product = new Product({
        title,
        desc,
        category,
        price,
        condition,
        stock,
        sizes: parseSizes(sizes),
        images,
        img: images[0] || "",
      });

      await product.save();

      res.status(201).json(product);
    } catch (error) {
      removeFiles(filePaths(req.files));

      res.status(400).json({ error: error.message });
    }
  }
);

// GET ALL PRODUCTS (Public)
router.get("/", async (req, res) => {
  try {
    const filter = req.query.category
      ? { category: req.query.category }
      : {};

    const products = await Product.find(filter).sort({
      createdAt: -1,
    });

    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET SINGLE PRODUCT (Public)
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

// UPDATE PRODUCT (Admin only)
router.put(
  "/:id",
  protect,
  adminOnly,
  upload.array("images", 6),
  async (req, res) => {
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

      const update = {
        title,
        desc,
        category,
        price,
        condition,
        stock,
      };

      if (sizes !== undefined) {
        update.sizes = parseSizes(sizes);
      }

      const old = await Product.findById(req.params.id);

      if (!old) {
        removeFiles(filePaths(req.files));

        return res.status(404).json({
          error: "Product nahi mila",
        });
      }

      // Replace old images if new images are uploaded
      if (req.files?.length) {
        update.images = filePaths(req.files);
        update.img = update.images[0] || "";

        removeFiles(
          old.images?.length
            ? old.images
            : old.img
              ? [old.img]
              : []
        );
      }

      const product = await Product.findByIdAndUpdate(
        req.params.id,
        update,
        {
          new: true,
          runValidators: true,
        }
      );

      res.json(product);
    } catch (error) {
      removeFiles(filePaths(req.files));

      res.status(400).json({ error: error.message });
    }
  }
);

// DELETE PRODUCT (Admin only)
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        error: "Product nahi mila",
      });
    }

    removeFiles(
      product.images?.length
        ? product.images
        : product.img
          ? [product.img]
          : []
    );

    res.json({
      message: "Product delete ho gaya",
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;