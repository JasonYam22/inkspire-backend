import { Router } from "express";
import {
  uploadImage,
  getProfile,
  updateProfile,
  imageSearch,
} from "../controller/user.controller.js";
import { uploader } from "../config/cloudinary.js";
import isAuthenticated from "../middleware/isAuthenticated.js";

const router = Router();

router.post("/upload", isAuthenticated, uploader.single("image"), uploadImage);
router.get("/user", isAuthenticated, getProfile);
router.put("/user", isAuthenticated, updateProfile);
router.get("/inspiration", isAuthenticated, imageSearch);

export default router;