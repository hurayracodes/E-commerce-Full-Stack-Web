import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/UserModel.js";
import { protect } from "../Middleware/AuthMiddleware.js";

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

const publicUser = (u) => ({
  id: u._id,
  name: u.name,
  email: u.email,
  role: u.role,
});

// REGISTER -> POST /api/auth/register
// role body se KABHI nahi li jati: naya account hamesha "user" hota hai
router.post("/register", async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (name.length < 2) return res.status(400).json({ error: "Naam kam az kam 2 harf ka ho" });
    if (!EMAIL_RE.test(email)) return res.status(400).json({ error: "Sahi email likhein" });
    if (password.length < 6)
      return res.status(400).json({ error: "Password kam az kam 6 characters ka ho" });

    if (await User.findOne({ email }))
      return res.status(409).json({ error: "Is email se account pehle se hai" });

    const user = await User.create({ name, email, password, role: "user" });
    res.status(201).json({ token: signToken(user._id), user: publicUser(user) });
  } catch (error) {
    res.status(500).json({ error: "Register nahi ho saka" });
  }
});

// LOGIN -> POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    const user = await User.findOne({ email }).select("+password");
    // same message dono surat mein: email ka andaza lagana mushkil rahe
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ error: "Email ya password galat hai" });

    res.json({ token: signToken(user._id), user: publicUser(user) });
  } catch (error) {
    res.status(500).json({ error: "Login nahi ho saka" });
  }
});

// ME -> GET /api/auth/me  (page refresh par user wapas lene ke liye)
router.get("/me", protect, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

export default router;