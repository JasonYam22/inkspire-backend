import type { Request, Response, NextFunction } from "express";
import prisma from "../prisma.js";

export const createComment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { content } = req.body;
    const ideaId = req.params.ideaId as string;
    const userId = req.payload!.id;
    if (!content || content.trim() === "") {
      return res.status(400).json({ message: "Comment content required" });
    }
    const newComment = await prisma.comment.create({
      data: {
        content,
        tattooIdeaId: ideaId,
        userId,
      },
        include: {
        user: true,
      },
    });
    return res.status(201).json(newComment);
  } catch (error) {
    next(error);
  }
};

export const getComment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const ideaId = req.params.ideaId as string;
    const comments = await prisma.comment.findMany({
      where: { tattooIdeaId: ideaId },
      include: { user: { select: { username: true } } },
      orderBy: { createdAt: "asc" },
    });
    return res.status(200).json(comments);
  } catch (error) {
    next(error);
  }
};

export const updateComment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const commentId = req.params.commentId as string;
    const { content } = req.body;
    const userId = req.payload!.id

    const updatedComment = await prisma.comment.update({
      where: { id: commentId, userId},
      data: { content }
    });

    return res.status(200).json(updatedComment);
  } catch (error) {
    next(error);
  }
};

export const deleteComment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
  const commentId = req.params.commentId as string;
    const userId = req.payload!.id

    await prisma.comment.delete({
      where: { id: commentId, userId },
    });

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};
