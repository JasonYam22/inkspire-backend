import type { Request, Response, NextFunction } from "express";
import prisma from "../prisma.js";

export const createTattooIdea = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;
    const newTattoo = await prisma.tattooIdea.create({ data });
    return res.status(201).json(newTattoo);
  } catch (error) {
    next(error);
  }
};

export const getAllTattooIdeas = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tattoos = await prisma.tattooIdea.findMany();
    return res.status(200).json(tattoos);
  } catch (error) {
    next(error);
  }
};

export const getTattooIdeaById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tattooIdeaId = req.params.ideaId as string;
    const tattoo = await prisma.tattooIdea.findUnique({
      where: { id: tattooIdeaId }
    });

    if (!tattoo) {
      return res.status(404).json({ message: "No tattoo found" });
    }

    return res.status(200).json(tattoo);
  } catch (error) {
    next(error);
  }
};

export const updateTattooIdea = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tattooIdeaId = req.params.ideaId as string;
    const data = req.body;

    const updatedTattoo = await prisma.tattooIdea.update({
      where: { id: tattooIdeaId },
      data
    });

    return res.status(200).json(updatedTattoo);
  } catch (error) {
    next(error);
  }
};

export const togglePublicStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tattooIdeaId = req.params.ideaId as string;

    const tattooIdea = await prisma.tattooIdea.findUnique({
      where: { id: tattooIdeaId }
    });

    if (!tattooIdea) {
      return res.status(404).json({ message: "No tattoo found" });
    }

    const updatedTattoo = await prisma.tattooIdea.update({
      where: { id: tattooIdeaId },
      data: { isPublic: !tattooIdea.isPublic }
    });

    return res.status(200).json(updatedTattoo);
  } catch (error) {
    next(error);
  }
};

export const deleteTattooIdea = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tattooIdeaId = req.params.ideaId as string;

    await prisma.tattooIdea.delete({
      where: { id: tattooIdeaId }
    });

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};