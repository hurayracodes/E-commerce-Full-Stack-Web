import jwt from "jsonwebtoken";
import User from "../models/UserModel.js";

// Login zaroori: Authorization: Bearer <token>
export const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: "Pehle login karein" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ error: "User maujood nahi" });

    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: "Session expire ho gaya, dobara login karein" });
  }
};

// protect ke BAAD lagayein: sirf admin
export const adminOnly = (req, res, next) => {
  if (req.user?.role === "admin") return next();
  res.status(403).json({ error: "Ye kaam sirf admin kar sakta hai" });
};