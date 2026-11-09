// Admin banane ki script. Chalane ka tareeqa:  node createAdmin.js
// .env mein ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD aur MONGO_URI honi chahiye
import "dotenv/config";
import mongoose from "mongoose";
import User from "./models/UserModel.js";

const { ADMIN_NAME = "Admin", ADMIN_EMAIL, ADMIN_PASSWORD, MONGO_URI } = process.env;

if (!ADMIN_EMAIL || !ADMIN_PASSWORD || !MONGO_URI) {
  console.error("ADMIN_EMAIL, ADMIN_PASSWORD aur MONGO_URI .env mein set karein");
  process.exit(1);
}

await mongoose.connect(MONGO_URI);

let user = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });
if (user) {
  user.role = "admin"; // pehle se account hai to usay admin bana do
  await user.save();
  console.log("Maujooda user admin bana diya:", user.email);
} else {
  user = await User.create({
    name: ADMIN_NAME,
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    role: "admin",
  });
  console.log("Admin ban gaya:", user.email);
}

await mongoose.disconnect();