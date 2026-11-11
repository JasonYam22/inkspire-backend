import { Router } from "express";
import {
  uploadImage,
  getProfile,
  updateProfile,
  updateArtistBio,
  imageSearch,
} from "../controller/user.controller.js";
import { uploader } from "../config/cloudinary.js";
import isAuthenticated from "../middleware/isAuthenticated.js";

const router = Router();

// Profile and inspiration routes for signed-in users.
router.post("/upload", isAuthenticated, uploader.single("image"), uploadImage);
router.get("/user", isAuthenticated, getProfile);
router.put("/user", isAuthenticated, updateProfile);
router.patch("/user/artist-bio", isAuthenticated, updateArtistBio);
router.get("/inspiration", isAuthenticated, imageSearch);

export default router;
