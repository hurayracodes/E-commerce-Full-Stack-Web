import { v2 as cloudinary } from "cloudinary";

// "https://res.cloudinary.com/x/image/upload/v123/msee/abc.jpg" -> "msee/abc"
const publicId = (url) => {
  const m = /\/upload\/(?:v\d+\/)?(.+)\.[a-z0-9]+$/i.exec(url || "");
  return m ? m[1] : null;
};

// purani local "/uploads/..." paths ko chhor deta hai (sirf Cloudinary URLs delete hote hain)
export const removeCloud = (urls = []) =>
  Promise.all(
    urls
      .map(publicId)
      .filter(Boolean)
      .map((id) => cloudinary.uploader.destroy(id).catch(() => {}))
  );