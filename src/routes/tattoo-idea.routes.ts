import {
  Router,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import prisma from "../prisma.js";
import isAuthenticated from "../middleware/isAuthenticated.js";
import uploader from "../config/cloudinary.js";
import type { UpdateTattooIdeaBody } from "../types/tattoo.types.js";

const router = Router();

//get users own created ideas
router.get(
  "/",
  isAuthenticated,
  (req: Request, res: Response, next: NextFunction) => {
    const { genre } = req.query;

    prisma.tattooIdea
      .findMany({
        where: {
          userId: req.payload!.id,
          genre: genre ? String(genre) : undefined,
        },
      })
      .then((tattooIdea) => {
        res.status(200).json(tattooIdea);
      })
      .catch((error) => {
        next(error);
      });
  },
);

//create an idea
router.post(
  "/",
  isAuthenticated,
  uploader.single("image"),
  (req: Request, res: Response, next: NextFunction) => {
    const { title, genre, spot, notes, artist, social } = req.body;

    if (!title || title.trim() === "") {
      res.status(400).json({ message: "Title required" });
      return;
    }

    prisma.tattooIdea
      .create({
        data: {
          userId: req.payload!.id,
          title,
          genre,
          spot,
          artist,
          social,
          notes,
          imageUrl: req.file?.path ?? null,
        },
      })
      .then((tattooIdea) => {
        res.status(201).json(tattooIdea);
      })
      .catch((error) => {
        next(error);
      });
  },
);

//explore public ideas
router.get(
  "/explore",
  isAuthenticated,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.payload!.id;

      const tattooIdeas = await prisma.tattooIdea.findMany({
        include: {
          user: { select: { username: true, role: true } },
          savedBy: { where: { id: userId }, select: { id: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      // Check if current user saved each item
      const formattedIdeas = tattooIdeas.map((idea) => ({
        ...idea,
        isSaved: idea.savedBy.length > 0,
      }));

      return res.status(200).json(formattedIdeas);
    } catch (error) {
      next(error);
    }
  },
);

//get user collection
router.get(
  "/collection",
  isAuthenticated,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.payload!.id },
        include: {
          savedIdeas: {
            include: { user: { select: { username: true } } },
          },
        },
      });
      return res.json(user?.savedIdeas || []);
    } catch (error) {
      next(error);
    }
  },
);

//toggle heart
router.post(
  "/explore/:id/save",
  isAuthenticated,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.payload!.id; 
      const ideaId = req.params.id as string;

      const isSaved = await prisma.user.findFirst({
        where: { id: userId, savedIdeas: { some: { id: ideaId } } },
      });

      if (isSaved) {
        await prisma.user.update({
          where: { id: userId },
          data: { savedIdeas: { disconnect: { id: ideaId } } },
        });
        res.json({ isSaved: false });
        return;
      }

      await prisma.user.update({
        where: { id: userId },
        data: { savedIdeas: { connect: { id: ideaId } } },
      });
      res.json({ isSaved: true });
    } catch (error) {
      next(error);
    }
  },
);

//get idea details
router.get(
  "/:ideaId",
  isAuthenticated,
  (req: Request, res: Response, next: NextFunction) => {
    prisma.tattooIdea
      .findUnique({
        where: { id: req.params.ideaId as string },
        include: { user: { select: { username: true, role: true } } },
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
  },
);

//edit idea
router.put(
  "/:ideaId",
  isAuthenticated,
  uploader.single("image"),
  (req: Request, res: Response, next: NextFunction) => {
    const { title, genre, spot, artist, social, notes, isFavorite } =
      req.body as UpdateTattooIdeaBody;
    const imageUrl = req.file?.path;
    const isFavoriteValue =
      isFavorite === undefined ? undefined : String(isFavorite) === "true";

      
    if (title !== undefined && title.trim() === "") {
      res.status(400).json({ message: "Title required" });
      return;
    }
    
    prisma.tattooIdea
      .update({
        where: { id: req.params.ideaId as string, userId: req.payload!.id },
        data: {
          title,
          genre,
          spot,
          artist,
          social,
          imageUrl: imageUrl || undefined,
          notes,
          isFavorite: isFavoriteValue,
        },
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
  (req: Request, res: Response, next: NextFunction) => {
    prisma.tattooIdea
      .delete({
        where: { id: req.params.ideaId as string, userId: req.payload!.id },
      })
      .then((idea) => {
        res.status(200).json(idea);
      })
      .catch((error) => {
        next(error);
      });
  },
);

export default router;
