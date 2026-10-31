import mongoose from 'mongoose';
const { Schema } = mongoose;

const productSchema = new Schema({
  title:{
    type:String,
    required:[true, "Title tu hona chahiya bhi"]
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
  price:{
    type:Number,
    required:[true, "Price tu hona chahiya bhi"]
  },
  rating:{
    type:Number,
    min: 0,
    max: 5
  },
  img:{
    type:String,
    required:[true, "image is also required bhi"]
  },
  
},{timestamps:true});

export default mongoose.model('Product', productSchema);