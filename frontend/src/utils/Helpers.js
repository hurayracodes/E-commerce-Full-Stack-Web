export const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Shipping settings
export const SHIPPING_FEE = 200;
export const FREE_SHIPPING_OVER = 5000;

// Product image helper
// Multiple images hon to first image return karega
export const imgSrc = (img) => {
  const image = Array.isArray(img)
    ? img.find((candidate) => typeof candidate === "string" && candidate.trim())
    : img;

  if (typeof image !== "string" || !image.trim()) {
    return "/placeholder.png";
  }

  if (/^(https?:|data:|blob:)/i.test(image)) {
    return image;
  }

  if (image.startsWith("/")) {
    return `${BASE_URL}${image}`;
  }

  return `${BASE_URL}/uploads/${image}`;
};

// Product images helper
// Backend img ya images dono formats support karta hai
export const getProductImages = (product) => {
  const images = product?.images || product?.img;

  if (Array.isArray(images)) {
    return images.filter(
      (image) => typeof image === "string" && image.trim() !== "",
    );
  }

  if (typeof images === "string" && images.trim()) {
    return [images];
  }

  return [];
};

// Price formatting
export const money = (n) => `Rs. ${Number(n || 0).toLocaleString("en-PK")}`;

// Date formatting
export const formatDate = (d) =>
  new Date(d).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

// Order statuses
export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
];

// Order status styles
export const STATUS_STYLES = {
  pending: {
    label: "Pending",
    cls: "bg-amber-50 text-amber-700",
  },

  confirmed: {
    label: "Confirmed",
    cls: "bg-blue-50 text-blue-700",
  },

  shipped: {
    label: "Shipped",
    cls: "bg-indigo-50 text-indigo-700",
  },

  delivered: {
    label: "Delivered",
    cls: "bg-green-50 text-green-700",
  },

  cancelled: {
    label: "Cancelled",
    cls: "bg-red-50 text-red-600",
  },
};

// Backend error message
export const errMsg = (err, fallback = "Something went wrong") =>
  err?.response?.data?.error ||
  err?.response?.data?.message ||
  err?.message ||
  fallback;
