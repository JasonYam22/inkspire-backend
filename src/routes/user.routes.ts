import { Router, type NextFunction } from "express";
import multer from "multer";
import prisma from "../prisma.js";
import supabase from "../supabase.js";
import isAuthenticated from "../middleware/isAuthenticated.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post(
  "/upload",
  isAuthenticated,
  upload.single("image"),
  async (req: any, res: any, next: NextFunction) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const fileName = `${req.payload.id}-${Date.now()}-${req.file.originalname}`;

      const { error } = await supabase.storage
        .from("avatars")
        .upload(fileName, req.file.buffer, { contentType: req.file.mimetype });

      if (error) throw error;

      const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);

      const user = await prisma.user.update({
        where: { id: req.payload.id },
        data: { imageUrl: data.publicUrl },
      });

      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  },
);

export default router;
