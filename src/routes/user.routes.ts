import { Router, type NextFunction } from "express";
import multer from "multer";
import prisma from "../prisma.js";
import supabase from "../supabase.js";
import isAuthenticated from "../middleware/isAuthenticated.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

//upload image file
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

//get profile
router.get("/user", isAuthenticated, (req: any, res: any, next: NextFunction) => {
    prisma.user.findUnique({ where: {id: req.payload.id}})
    .then((user) => {
        res.status(200).json(user)
    })
    .catch((error) => {
        next(error)
    })
})

//edit profile
router.put(
  "/user",
  isAuthenticated,
  (req: any, res: any, next: NextFunction) => {
    const { email, username, imageUrl } = req.body || {};

    prisma.user
      .update({
        where: { id: req.payload.id },
        data: { email, username, imageUrl },
      })
      .then((user) => {
        res.status(200).json(user);
      })
      .catch((error) => {
        next(error);
      });
  },
);

//image search
router.get(
  "/inspiration",
  isAuthenticated,
  async (req: any, res: any, next: NextFunction) => {
    try {
      const query = req.query.q || "tattoo";

      const response = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(query as string)}&per_page=20`,
        { headers: { Authorization: process.env.PEXELS_API_KEY! } }
      );

      const data = await response.json();
      res.status(200).json(data.photos);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
