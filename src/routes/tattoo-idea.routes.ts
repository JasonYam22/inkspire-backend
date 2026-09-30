import { Router, type NextFunction } from "express";
import prisma from "../prisma.js";
import isAuthenticated from "../middleware/isAuthenticated.js";
import uploader from "../config/cloudinary.js"

const router = Router();

// get all ideas
router.get("/", isAuthenticated, (req: any, res: any, next: NextFunction) => {

const { genre } = req.query

  prisma.tattooIdea
    .findMany({where: genre ? String(genre) : {} })
    .then((tattooIdea) => {
      res.status(200).json(tattooIdea);
    })
    .catch((error) => {
      next(error);
    });
});

// create an idea
router.post("/", isAuthenticated, uploader.single("image"), (req: any, res: any, next: NextFunction) => {
  const { title, genre, spot, notes, artist, social } = req.body;

  if (!title) {
        return res.status(400).json({ message: "Title required" });
      }
  prisma.tattooIdea
    .create({
      data: {
        userId: req.payload.id,
        title,
        genre,
        spot,
        artist,
        social,
        notes,
        imageUrl: req.file?.path
      },
    })
    .then((tattooIdea) => {
      res.status(201).json(tattooIdea);
    })
    .catch((error) => {
      next(error);
    });
});

//get idea details
router.get(
  "/:ideaId",
  isAuthenticated,
  (req: any, res: any, next: NextFunction) => {
    prisma.tattooIdea
      .findUnique({ where: { id: req.params.ideaId, userId: req.payload.id } })
      .then((tattooIdea) => {
        if (!tattooIdea) {
          return res
            .status(404)
            .json({ message: "Tattoo idea not found or unauthorized" });
        }
        res.status(200).json(tattooIdea);
      })
      .catch((error) => {
        next(error);
      });
  },
);

//edit idea
router.put(
  "/:ideaId",
  isAuthenticated,
  (req: any, res: any, next: NextFunction) => {
    const { title, genre, spot, imageUrl, notes, isFavorite } = req.body;

    prisma.tattooIdea
      .update({
        where: { id: req.params.ideaId, userId: req.payload.id },
        data: { title, genre, spot, imageUrl, notes, isFavorite },
      })
      .then((tattooIdea) => {
        res.status(200).json(tattooIdea);
      })
      .catch((error) => {
        next(error);
      });
  },
);

//delete idea
router.delete(
  "/:ideaId",
  isAuthenticated,
  (req: any, res: any, next: NextFunction) => {    prisma.tattooIdea
      .delete({ where: { id: req.params.ideaId, userId: req.payload.id } })
      .then((idea) => {
        res.status(200).json(idea);
      })
      .catch((error) => {
        next(error);
      });
  },
);

export default router;
