import type { Request, Response, NextFunction } from "express";

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ message: "Route not found" });
};

export const errorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {

if (error.code === "P2025") {
    res.status(404).json({message: "Not found"})
    return
}
  console.error(error);
  res.status(500).json({message: "Internal server error"})
};

