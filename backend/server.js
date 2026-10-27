import express from 'express'
const app = express()
import dotenv from 'dotenv'
import database from "./config/dbConnection.js"
import productRoute from "./routes/ProductRoute.js"
import cors from 'cors'

app.use(cors())


dotenv.config()
database()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use("/api/products", productRoute);

app.listen(3000, () => {
  console.log('Server is running on port 3000')
})