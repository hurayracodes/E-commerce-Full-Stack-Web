import express from 'express'
const app = express()
import dotenv from 'dotenv'
import database from "./config/dbConnection.js"
import productRoute from "./routes/ProductRoute.js"
import authRoute from "./routes/AuthRoutes.js"
import orderRoute from "./routes/OrderRoutes.js"
import cors from 'cors'
import path from "path";

dotenv.config()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors({ origin: process.env.CLIENT_URL }));

database()

app.use("/api/auth", authRoute)
app.use("/api/products", productRoute);
app.use("/api/orders", orderRoute);
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})