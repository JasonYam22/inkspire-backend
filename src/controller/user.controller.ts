import type { Request, Response, NextFunction } from "express";
import prisma from "../prisma.js";
import { DEMO_EMAIL } from "../config/demo.js";

const profileFields = {
  id: true,
  email: true,
  username: true,
  imageUrl: true,
  role: true,
  artistBio: true,
  createdAt: true,
  updatedAt: true,
  isEmailVerified: true,
};

// Save the uploaded image link on the user's profile.
export const uploadImage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const imageUrl = req.file.path;

    const user = await prisma.user.update({
      where: { id: req.payload!.id },
      data: { imageUrl },
      select: profileFields,
    });

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

// Load the signed-in user's profile.
export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.payload!.id },
      select: profileFields,
    });
    return res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

// Save changes to the signed-in user's profile.
export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email, username, imageUrl } = req.body || {};
  const userId = req.payload!.id;

  try {
    if (email !== undefined && email !== DEMO_EMAIL) {
      const profile = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true },
      });

      if (profile?.email === DEMO_EMAIL) {
        return res
          .status(403)
          .json({ message: "The demo email cannot be changed." });
      }
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { email, username, imageUrl },
      select: profileFields,
    });
    return res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

// Let artists save a short bio on their own profile.
export const updateArtistBio = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const bio = req.body?.bio;

  if (typeof bio !== "string" || bio.trim().length > 500) {
    return res
      .status(400)
      .json({ message: "Enter a bio of up to 500 characters." });
  }

  const artistBio = bio.trim() || null;

  try {
    const result = await prisma.user.updateMany({
      where: { id: req.payload!.id, role: "ARTIST" },
      data: { artistBio },
    });

    if (result.count === 0) {
      return res
        .status(403)
        .json({ message: "Only artists can save an artist bio." });
    }

    return res.status(200).json({ artistBio });
  } catch (error) {
    next(error);
  }
};

// Search Pexels for inspiration photos.
export const imageSearch = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const q = req.query.q;
    const query = typeof q === "string" && q.trim() ? q : "tattoo";

    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=20`,
      { headers: { Authorization: process.env.PEXELS_API_KEY! } },
    );

    const data = await response.json();
    res.status(200).json(data.photos);
  } catch (error) {
    next(error);
  }
};
