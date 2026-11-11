import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

// Choose where uploaded images go and which file types are allowed.
const storage = new CloudinaryStorage({
  cloudinary,
  params: async () => ({
    folder: "inkspire",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  }),
});

export const uploader = multer({
  storage,
  limits: { fileSize: 4 * 1024 * 1024 },
});
export default cloudinary;
