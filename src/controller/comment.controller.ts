import type { Request, Response, NextFunction } from "express";
import prisma from "../prisma.js";

// Add a comment to an idea.
export const createComment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const content = req.body?.content;
    const ideaId = req.params.ideaId as string;
    const userId = req.payload!.id;
    if (typeof content !== "string" || !content.trim()) {
      return res.status(400).json({ message: "Comment content required" });
    }
    const newComment = await prisma.comment.create({
      data: {
        content,
        user: { connect: { id: userId } },
        tattooIdea: {
          connect: { id: ideaId, OR: [{ isPublic: true }, { userId }] },
        },
      },
      include: {
        user: { select: { username: true, imageUrl: true } },
      },
    });
    return res.status(201).json(newComment);
  } catch (error) {
    next(error);
  }
};

// Load comments for an idea.
export const getComment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const ideaId = req.params.ideaId as string;
    const userId = req.payload!.id;
    const idea = await prisma.tattooIdea.findUnique({
      where: { id: ideaId, OR: [{ isPublic: true }, { userId }] },
      select: {
        comments: {
          include: { user: { select: { username: true } } },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!idea) {
      return res.status(404).json({ message: "No tattoo found" });
    }

    return res.status(200).json(idea.comments);
  } catch (error) {
    next(error);
  }
};

// Let users edit their own comments.
export const updateComment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const commentId = req.params.commentId as string;
    const content = req.body?.content;
    const userId = req.payload!.id;

    if (typeof content !== "string" || !content.trim()) {
      res.status(400).json({
        message: "Comment content required",
      });
      return;
    }

    const updatedComment = await prisma.comment.update({
      where: { id: commentId, userId },
      data: { content },
      include: {
        user: {
          select: {
            username: true,
            imageUrl: true,
          },
        },
      },
    });

    return res.status(200).json(updatedComment);
  } catch (error) {
    next(error);
  }
};

// Let users delete their own comments.
export const deleteComment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const commentId = req.params.commentId as string;
    const userId = req.payload!.id;

    await prisma.comment.delete({
      where: { id: commentId, userId },
    });

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};
