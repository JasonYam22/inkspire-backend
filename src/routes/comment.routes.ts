import { Router } from "express";
import {
  getComment,
  createComment,
  updateComment,
  deleteComment,
} from "../controller/comment.controller.js";
import isAuthenticated from "../middleware/isAuthenticated.js";

const router = Router();

// Read or change comments after checking the login token.
router.get("/ideas/:ideaId/comments", isAuthenticated, getComment);
router.post("/ideas/:ideaId/comments", isAuthenticated, createComment);
router.put("/comments/:commentId", isAuthenticated, updateComment);
router.delete("/comments/:commentId", isAuthenticated, deleteComment);

export default router;
