import mongoose from 'mongoose';
const { Schema } = mongoose;

const productSchema = new Schema({
  title:{
    type:String,
    required:[true, "Title tu hona chahiya bhi"]
  },
  Condition:{
    type:String,
    required:[true, "Condition tu hona chahiya bhi"]
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
  }
});

export default mongoose.model('Product', productSchema);