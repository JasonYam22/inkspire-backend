import { type Request, type Response, type NextFunction } from "express";
import prisma from "../prisma.js";

export const uploadImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const imageUrl = req.file.path; 

    const user = await prisma.user.update({
      where: { id: req.payload!.id },
      data: { imageUrl },
      omit: { password: true },
    });

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const getProfile = (req: Request, res: Response, next: NextFunction) => {
  prisma.user
    .findUnique({
      where: { id: req.payload!.id },
      omit: { password: true },
    })
    .then((user) => {
      res.status(200).json(user);
    })
    .catch((error) => {
      next(error);
    });
};

export const updateProfile = (req: Request, res: Response, next: NextFunction) => {
  const { email, username, imageUrl } = req.body || {};

  prisma.user
    .update({
      where: { id: req.payload!.id },
      data: { email, username, imageUrl },
      omit: { password: true },
    })
    .then((user) => {
      res.status(200).json(user);
    })
    .catch((error) => {
      next(error);
    });
};

export const imageSearch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const q = req.query.q;
    const query = typeof q === "string" && q.trim() ? q : "tattoo";

    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=20`,
      { headers: { Authorization: process.env.PEXELS_API_KEY! } }
    );

    const data = await response.json();
    res.status(200).json(data.photos);
  } catch (error) {
    next(error);
  }
};