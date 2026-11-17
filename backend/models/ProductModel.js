import mongoose from 'mongoose';
const { Schema } = mongoose;

const productSchema = new Schema({
  title:{
    type:String,
    required:[true, "Title tu hona chahiya bhi"]
  },
  size:{
    type:String,
    enum: ["S", "M", "L", "XL", "XXL",41,42,43],
  },
    sizes: { type: [String], default: [] },
  stock:{
    type:Number,
    required:[true, "Stock tu hona chahiya bhi"]
  },
  desc:{
    type:String,
    required:[true, "Description tu hona chahiya bhi"]
  },
  category:{
    type:String,
    enum: ["Clothes", "Tech", "Shoes", "Watches", "Others"],
    required:[true, "Category tu hona chahiya bhi"]
  },
    discountPercentage:{
    type:Number,
    min: [0, "Discount 0 se kam nahi ho sakta"],
    max: [90, "Discount 90% se zyada nahi ho sakta"],
    default: 0
  },
  saleEndsAt:{
    type: Date,
    default: null
  },
  price:{
    type:Number,
    required:[true, "Price tu hona chahiya bhi"]
  },
  condition: {
  type: String,
  enum: ["New", "Like New", "Used"],
  default: "New",
},
  rating:{
    type:Number,
    min: 0,
    max: 5
  },
   images: { type: [String], default: [] }, // NAYI: saari images (Cloudinary URLs)
    img: { type: [String], default: [] }, // aapka purana field jaisa tha waisa (array) — purane products ke liye
  },
  
{timestamps:true});

export default mongoose.model('Product', productSchema);