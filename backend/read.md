1-> All installed packages
npm i express mongoose dotenv cors hpp multer axios bcryptjs jsonwebtoken express-validator morgan helmet xss-clean express-rate-limit  cookie-parser  uuid dayjs compression
npm i nodemon -D

All installation frontend packages
2-> npm i react-router-dom axios js-cookie react-icons react-hot-toast react-hook-form zustand clsx date-fns framer-motion
npm i tailwindcss postcss autoprefixer
before copying you need to install -> npm install
Read Here i want to use import like find package.json file open it find script after script -> object{}, add "type":"module" ok now you can use import ok done back to the project
tu phir main server file main server starting basic code likha aur .env file create ki usmain MONGO_URI="mongodb://localhost:27017/todo" Ya add karna k baad main na backend main he ak folder create kiya jis k name hai config usmain file create ki db.js code -> import mongoose from 'mongoose'
 
export const dbconection = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI)
        console.log('db conection successfuly working');
        
    } catch (error) {
        console.log(error);
        process.exit(1)
    }
}
aur phir server file ya do ko import kiya
 import dotenv from 'dotenv'
 dotenv.config()
import { dbconection } from './config/db.js';

uska baad lis jaha karawa raha tha waha par dbconection() kardiya like this ->app.listen('5000', function () {
    dbconection()
    console.log("Server is runnnig on http://localhost:5000");
    
    
})
