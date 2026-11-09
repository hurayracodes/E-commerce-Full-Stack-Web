import multer from "multer";
import { v2 as cloudinary } from "cloudinary";

// .env / Render mein: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const memory = multer({
  storage: multer.memoryStorage(), // pehle RAM mein, phir Cloudinary par
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Sirf image allowed hai"), false);
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

const uploadOne = (file) =>
  new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: "msee", resource_type: "image" }, (err, result) =>
        err ? reject(err) : resolve(result)
      )
      .end(file.buffer);
  });

// multer ke baad: har file Cloudinary par bhejo.
// Phir file.path = image ka poora https URL (database mein yahi save hota hai)
const toCloudinary = async (req, res, next) => {
  try {
    for (const f of req.files || []) {
      const r = await uploadOne(f);
      f.path = r.secure_url;
      f.filename = r.public_id;
      delete f.buffer;
    }
    next();
  } catch (err) {
    next(err);
  }
};

// Routes mein pehle jaisa hi: upload.array("images", 6)
const upload = {
  array: (field, max) => [memory.array(field, max), toCloudinary],
};

export default upload;