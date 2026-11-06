import type { Request, Response, NextFunction } from "express";
import prisma from "../prisma.js";

export const getExploreIdeas = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const ideas = await prisma.tattooIdea.findMany({
      where: { isPublic: true },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { username: true, imageUrl: true } },
      },
    });
    return res.status(200).json(ideas);
  } catch (error) {
    next(error);
  }
};

export const getCollection = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const ideas = await prisma.tattooIdea.findMany({
      where: { userId: req.payload!.id },
      orderBy: { createdAt: "desc" },
    });
    return res.status(200).json(ideas);
  } catch (error) {
    next(error);
  }
};

export const createTattooIdea = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = req.body;
    const userId = req.payload!.id;
    const newTattoo = await prisma.tattooIdea.create({
      data: { ...req.body, userId: req.payload!.id },
    });
    return res.status(201).json(newTattoo);
  } catch (error) {
    next(error);
  }
};

export const getAllTattooIdeas = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.payload!.id;
    const tattoos = await prisma.tattooIdea.findMany({ 
      where: { userId: req.payload!.id },
     });
    return res.status(200).json(tattoos);
  } catch (error) {
    next(error);
  }
};

export const getTattooIdeaById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.payload!.id;
    const tattoo = await prisma.tattooIdea.findUnique({
      where: { id: req.params.ideaId as string},
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

export const updateTattooIdea = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.ideaId as string;
    const userId = req.payload!.id;

    const idea = await prisma.tattooIdea.findUnique({ where: { id } });

    if (!idea) {
      return res.status(404).json({ message: "No tattoo found" });
    }
    if (idea.userId !== userId) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const updated = await prisma.tattooIdea.update({
      where: { id },
      data: { ...req.body, userId },
    });

    return res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

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
      where: { id: tattooIdeaId },
      data: { isPublic: !tattooIdea.isPublic },
    });

    return res.status(200).json(updatedTattoo);
  } catch (error) {
    next(error);
  }
};

export const deleteTattooIdea = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tattooIdeaId = req.params.ideaId as string;
    const userId = req.payload!.id;

    const idea = await prisma.tattooIdea.findUnique({
      where: { id: tattooIdeaId },
    });

    if (!idea) {
      return res.status(404).json({ message: "No tattoo found" });
    }
    if (idea.userId !== userId) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await prisma.tattooIdea.delete({
      where: { id: tattooIdeaId },
    });

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};
