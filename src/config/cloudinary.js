import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
});
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "inkspire",
        allowed_formats: ["jpg", "png", "jpeg"],
    },
});
const uploader = multer({ storage });
export default uploader;
//# sourceMappingURL=cloudinary.js.map