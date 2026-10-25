import { Router } from "express";
import { 
  getComment,
  createComment,
  updateComment,
  deleteComment 
} from "../controller/comment.controller.js";

const router = Router();

router.get("ideas/:ideaId/comments", getComment);
router.post("ideas/:ideaId/comments", createComment);
router.put("/ideas/:ideaId", updateComment);
router.delete("/ideas/:ideaId", deleteComment);

export default router;