import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME!,
  api_key: process.env.CLOUDINARY_KEY!,
  api_secret: process.env.CLOUDINARY_SECRET!,
});

// Defined separately because the package's types don't list `folder`
const params = {
  folder: "inkspire",
  allowed_formats: ["jpg", "png", "jpeg", "webp"],
};

const storage = new CloudinaryStorage({
  cloudinary,
  params,
});

const uploader = multer({ storage });

export default uploader;