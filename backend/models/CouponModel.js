import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Coupon code zaroori hai"],
      unique: true,
      uppercase: true, // "save10" bhi "SAVE10" ban jata hai
      trim: true,
      minlength: [3, "Code kam az kam 3 characters ka ho"],
      maxlength: [20, "Code 20 characters se zyada na ho"],
      match: [/^[A-Z0-9_-]+$/, "Code mein sirf A-Z, 0-9, - aur _ allowed hain"],
    },

    // "percent": value = % off (jaise 10)   |   "fixed": value = Rs. off (jaise 500)
    type: {
      type: String,
      enum: ["percent", "fixed"],
      required: [true, "Coupon ki type chunein"],
    },
    value: {
      type: Number,
      required: [true, "Coupon ki value zaroori hai"],
      min: [1, "Value kam az kam 1 ho"],
      validate: {
        validator(v) {
          return this.type !== "percent" || v <= 90; // percent coupon 90% se zyada nahi
        },
        message: "Percent coupon 90% se zyada nahi ho sakta",
      },
    },

    maxDiscount: { type: Number, min: 0, default: 0 }, // percent coupon par Rs. cap (0 = koi cap nahi)
    minOrder: { type: Number, min: 0, default: 0 }, // kam az kam subtotal (0 = koi shart nahi)
    maxUses: { type: Number, min: 0, default: 0 }, // kul kitni baar (0 = unlimited)
    usedCount: { type: Number, min: 0, default: 0 },
    perUserLimit: { type: Number, min: 0, default: 1 }, // aik user kitni baar (0 = unlimited)
    usedBy: { type: [mongoose.Schema.Types.ObjectId], default: [] }, // user ids (har use par aik entry)

    expiresAt: { type: Date, default: null }, // null = kabhi expire nahi
    active: { type: Boolean, default: true }, // admin band/chalu kar sakta hai
  },
  { timestamps: true }
);

// Subtotal par kitna discount banta hai (kabhi subtotal se zyada nahi, kabhi negative nahi)
couponSchema.methods.getDiscount = function (subtotal) {
  let d = this.type === "percent" ? (subtotal * this.value) / 100 : this.value;
  if (this.type === "percent" && this.maxDiscount > 0) d = Math.min(d, this.maxDiscount);
  return Math.max(0, Math.min(Math.round(d), subtotal));
};

// Is user ke liye coupon chal sakta hai? Masla ho to message (string) deta hai, theek ho to null
couponSchema.methods.validateFor = function (userId, subtotal) {
  if (!this.active) return "Ye coupon band hai";
  if (this.expiresAt && this.expiresAt < new Date()) return "Ye coupon expire ho chuka hai";
  if (this.maxUses > 0 && this.usedCount >= this.maxUses) return "Is coupon ki limit poori ho chuki hai";
  if (subtotal < this.minOrder) return `Is coupon ke liye kam az kam Rs. ${this.minOrder} ka order chahiye`;
  if (this.perUserLimit > 0 && userId) {
    const used = this.usedBy.filter((id) => String(id) === String(userId)).length;
    if (used >= this.perUserLimit) return "Aap ye coupon pehle istemal kar chuke hain";
  }
  return null;
};

export default mongoose.model("Coupon", couponSchema);