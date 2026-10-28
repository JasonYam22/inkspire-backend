import { Router } from "express";
import {
  createTattooIdea,
  getAllTattooIdeas,
  getExploreIdeas,
  getCollection,        // add this
  getTattooIdeaById,
  updateTattooIdea,
  deleteTattooIdea,
  togglePublicStatus,
} from "../controller/tattoo.controller.js";
import { isAuthenticated } from "../middleware/isAuthenticated.js"

const router = Router();

router.get("/explore", isAuthenticated, getExploreIdeas);
router.get("/:ideaId", isAuthenticated, getTattooIdeaById);
router.get("/", isAuthenticated, getAllTattooIdeas);
router.get("/", getAllTattooIdeas);
router.post("/", isAuthenticated, createTattooIdea);
router.put("/:ideaId", isAuthenticated, updateTattooIdea);
router.patch("/:ideaId/toggle-public", isAuthenticated, togglePublicStatus);
router.delete("/:ideaId", isAuthenticated, deleteTattooIdea);

export default router;