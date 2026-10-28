import { Router } from "express";
import { 
  getComment,
  createComment,
  updateComment,
  deleteComment 
} from "../controller/comment.controller.js";
import isAuthenticated from "../middleware/isAuthenticated.js";

const router = Router();

router.get("ideas/:ideaId/comments", isAuthenticated, getComment);
router.post("ideas/:ideaId/comments", isAuthenticated, createComment);
router.put("/ideas/:ideaId", isAuthenticated, updateComment);
router.delete("/ideas/:ideaId", isAuthenticated, deleteComment);

export default router;