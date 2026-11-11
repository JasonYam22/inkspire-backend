import type { Request, Response, NextFunction } from "express";
import prisma from "../prisma.js";
import { Prisma } from "@prisma/client";

const exploreAuthor = {
  select: { username: true, imageUrl: true, role: true },
};

// Only copy fields that users are allowed to edit.
const getIdeaFields = (req: Request) => {
  const {
    title,
    genre,
    spot,
    notes,
    artist,
    social,
    isFavorite,
    isPublic,
    imageUrl,
  } = req.body ?? {};
  return {
    title,
    genre,
    spot,
    notes,
    artist,
    social,
    isFavorite,
    isPublic,
    imageUrl: req.file?.path ?? imageUrl,
  };
};

// List public ideas and mark the ones this user saved.
export const getExploreIdeas = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.payload!.id;
    const ideas = await prisma.tattooIdea.findMany({
      where: { isPublic: true },
      orderBy: { createdAt: "desc" },
      include: {
        user: exploreAuthor,
        savedBy: { where: { id: userId }, select: { id: true } },
      },
    });
    return res
      .status(200)
      .json(
        ideas.map(({ savedBy, ...idea }) => ({
          ...idea,
          isSaved: savedBy.length > 0,
        })),
      );
  } catch (error) {
    next(error);
  }
};

// List public ideas this user saved.
export const getCollection = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const ideas = await prisma.tattooIdea.findMany({
      where: { isPublic: true, savedBy: { some: { id: req.payload!.id } } },
      orderBy: { createdAt: "desc" },
      include: { user: exploreAuthor },
    });
    return res
      .status(200)
      .json(ideas.map((idea) => ({ ...idea, isSaved: true })));
  } catch (error) {
    next(error);
  }
};

// Save an idea or remove it from the user's collection.
export const toggleSaveIdea = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userId = req.payload!.id;
  const ideaId = req.params.ideaId as string;

  try {
    for (let attempt = 0; ; attempt += 1) {
      try {
        const isSaved = await prisma.$transaction(
          async (tx) => {
            const idea = await tx.tattooIdea.findUnique({
              where: { id: ideaId, isPublic: true },
              select: {
                savedBy: { where: { id: userId }, select: { id: true } },
              },
            });

            if (!idea) return null;

            const alreadySaved = idea.savedBy.length > 0;
            await tx.tattooIdea.update({
              where: { id: ideaId },
              data: {
                savedBy: alreadySaved
                  ? { disconnect: { id: userId } }
                  : { connect: { id: userId } },
              },
            });
            return !alreadySaved;
          },
          { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
        );

        if (isSaved === null) {
          return res.status(404).json({ message: "No tattoo found" });
        }
        return res.status(200).json({ isSaved });
      } catch (error) {
        // Try again if another database change happened at the same time.
        if (
          !(error instanceof Prisma.PrismaClientKnownRequestError) ||
          error.code !== "P2034" ||
          attempt >= 2
        ) {
          throw error;
        }
      }
    }
  } catch (error) {
    next(error);
  }
};

// Create an idea for the signed-in user.
export const createTattooIdea = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = getIdeaFields(req);
    const userId = req.payload!.id;

    if (typeof data.title !== "string" || !data.title.trim()) {
      return res.status(400).json({ message: "Title is required" });
    }

    const newTattoo = await prisma.tattooIdea.create({
      data: { ...data, userId },
    });
    return res.status(201).json(newTattoo);
  } catch (error) {
    next(error);
  }
};

// List ideas created by the signed-in user.
export const getAllTattooIdeas = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.payload!.id;
    const tattoos = await prisma.tattooIdea.findMany({
      where: { userId },
    });
    return res.status(200).json(tattoos);
  } catch (error) {
    next(error);
  }
};

// Show a public idea or a private idea owned by this user.
export const getTattooIdeaById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.payload!.id;
    const tattoo = await prisma.tattooIdea.findUnique({
      where: { id: req.params.ideaId as string },
      include: {
        user: { select: { username: true, imageUrl: true } },
        comments: {
          include: {
            user: { select: { username: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!tattoo || (!tattoo.isPublic && tattoo.userId !== userId)) {
      return res.status(404).json({ message: "No tattoo found" });
    }

    return res.status(200).json(tattoo);
  } catch (error) {
    next(error);
  }
};

// Check ownership before accepting an image upload for an edit.
export const checkIdeaOwner = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.ideaId as string;
    const userId = req.payload!.id;

    const idea = await prisma.tattooIdea.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!idea) {
      return res.status(404).json({ message: "No tattoo found" });
    }
    if (idea.userId !== userId) {
      return res.status(403).json({ message: "Not allowed" });
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Save the owner's changes.
export const updateTattooIdea = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.ideaId as string;
    const userId = req.payload!.id;
    const updated = await prisma.tattooIdea.update({
      where: { id, userId },
      data: getIdeaFields(req),
    });
    return res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

// Let the owner switch their idea between public and private.
export const togglePublicStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const tattooIdeaId = req.params.ideaId as string;
    const userId = req.payload!.id;

    const tattooIdea = await prisma.tattooIdea.findUnique({
      where: { id: tattooIdeaId },
    });

    if (!tattooIdea || tattooIdea.userId !== userId) {
      return res.status(404).json({ message: "No tattoo found" });
    }

    const updatedTattoo = await prisma.tattooIdea.update({
      where: { id: tattooIdeaId, userId },
      data: { isPublic: !tattooIdea.isPublic },
    });

    return res.status(200).json(updatedTattoo);
  } catch (error) {
    next(error);
  }
};

// Let owners delete their ideas and admins remove public ideas.
export const deleteTattooIdea = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const tattooIdeaId = req.params.ideaId as string;
    const userId = req.payload!.id;

    const idea = await prisma.tattooIdea.findUnique({
      where: { id: tattooIdeaId },
      select: { userId: true, isPublic: true },
    });

    if (!idea) {
      return res.status(404).json({ message: "No tattoo found" });
    }
    const isOwner = idea.userId === userId;
    if (!isOwner && !idea.isPublic) {
      return res.status(403).json({ message: "Not allowed" });
    }

    if (!isOwner) {
      // Read the current role so an old login token can't keep admin access.
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });

      if (user?.role !== "ADMIN") {
        return res.status(403).json({ message: "Not allowed" });
      }
    }

    const where = isOwner
      ? { id: tattooIdeaId, userId }
      : { id: tattooIdeaId, isPublic: true };

    await prisma.tattooIdea.delete({ where });

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};
