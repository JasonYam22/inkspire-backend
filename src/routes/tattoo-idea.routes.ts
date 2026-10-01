import { Router, type NextFunction } from "express";
import prisma from "../prisma.js";
import isAuthenticated from "../middleware/isAuthenticated.js";
import uploader from "../config/cloudinary.js"

const router = Router();

// get all ideas
router.get("/", isAuthenticated, (req: any, res: any, next: NextFunction) => {

const { genre } = req.query

prisma.tattooIdea
  .findMany({
    where: {
      userId: req.payload.id,
      genre: genre ? String(genre) : undefined,
    } as any,
  })
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

//exlore public ideas
router.get("/explore", isAuthenticated, (req: any, res: any, next: NextFunction) => {
  prisma.tattooIdea
    .findMany({
      include: { user: { select: { username: true, role: true } } },
      orderBy: { createdAt: "desc" },
    })
    .then((tattooIdeas) => {
      res.status(200).json(tattooIdeas);
    })
    .catch((error) => {
      next(error);
    });
});

//explore details
router.get("/explore/:ideaId", isAuthenticated, (req: any, res: any, next: NextFunction) => {
  prisma.tattooIdea
    .findUnique({
      where: { id: req.params.ideaId },
      include: { user: { select: { username: true } } },
    })
    .then((tattooIdea) => {
      if (!tattooIdea) {
        return res.status(404).json({ message: "Tattoo idea not found" });
      }
      res.status(200).json(tattooIdea);
    })
    .catch((error) => {
      next(error);
    });
});

router.post("/explore/:ideaId/save", isAuthenticated, (req: any, res: any, next: NextFunction) => {
  prisma.tattooIdea
    .findUnique({ where: { id: req.params.ideaId } })
    .then((original) => {
      if (!original) {
        return res.status(404).json({ message: "Tattoo idea not found" });
      }

      if (original.userId === req.payload.id) {
        return res.status(400).json({ message: "This idea is already yours" });
      }

      return prisma.tattooIdea
        .findFirst({
          where: {
            userId: req.payload.id,
            title: original.title,
            imageUrl: original.imageUrl,
            isSaved: true,
          },
        })
        .then((existing) => {
          if (existing) {
            return res.status(409).json({ message: "Already saved" });
          }

          return prisma.tattooIdea
            .create({
              data: {
                userId: req.payload.id,
                title: original.title,
                genre: original.genre,
                spot: original.spot,
                artist: original.artist,
                social: original.social,
                notes: original.notes,
                imageUrl: original.imageUrl,
                isSaved: true,
              },
            })
            .then((saved) => {
              res.status(201).json(saved);
            });
        });
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
  uploader.single("image"), 
  (req: any, res: any, next: NextFunction) => {
    const { title, genre, spot, artist, social, notes, isFavorite } = req.body;
    const imageUrl = req.file?.path;

    prisma.tattooIdea
      .update({
        where: { id: req.params.ideaId, userId: req.payload.id },
        data: { title, genre, spot, artist, social, imageUrl, notes, isFavorite },
      })
      .then((tattooIdea) => {
        res.status(200).json(tattooIdea);
      })
      .catch((error) => {
        next(error);
      });
  }
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
