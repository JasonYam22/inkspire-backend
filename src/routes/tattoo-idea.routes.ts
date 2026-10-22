import { Router } from "express";
import { 
  createTattooIdea, 
  getAllTattooIdeas, 
  getTattooIdeaById, 
  updateTattooIdea, 
  deleteTattooIdea, 
  togglePublicStatus 
} from "../controller/tattoo.controller.js";

const router = Router();

router.get("/tattoos", getAllTattooIdeas);
router.get("/tattoos/:ideaId", getTattooIdeaById);
router.post("/tattoos", createTattooIdea);
router.put("/tattoos/:ideaId", updateTattooIdea);
router.patch("/tattoos/:ideaId/toggle-public", togglePublicStatus);
router.delete("/tattoos/:ideaId", deleteTattooIdea);

export default router;