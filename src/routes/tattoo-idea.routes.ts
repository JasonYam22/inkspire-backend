import { Router } from "express";
import {
  createTattooIdea,
  checkIdeaOwner,
  getAllTattooIdeas,
  getExploreIdeas,
  getCollection,
  toggleSaveIdea,
  getTattooIdeaById,
  updateTattooIdea,
  deleteTattooIdea,
  togglePublicStatus,
} from "../controller/tattoo.controller.js";
import { isAuthenticated } from "../middleware/isAuthenticated.js";
import { uploader } from "../config/cloudinary.js";

const router = Router();

// Browse public ideas and manage saved ideas.
router.get("/explore", isAuthenticated, getExploreIdeas);
router.post("/explore/:ideaId/save", isAuthenticated, toggleSaveIdea);
router.get("/collection", isAuthenticated, getCollection);
// Read, create, and manage tattoo ideas.
router.get("/:ideaId", isAuthenticated, getTattooIdeaById);
router.get("/", isAuthenticated, getAllTattooIdeas);
router.post("/", isAuthenticated, uploader.single("image"), createTattooIdea);
router.put(
  "/:ideaId",
  isAuthenticated,
  checkIdeaOwner,
  uploader.single("image"),
  updateTattooIdea,
);
router.patch("/:ideaId/toggle-public", isAuthenticated, togglePublicStatus);
router.delete("/:ideaId", isAuthenticated, deleteTattooIdea);

export default router;
