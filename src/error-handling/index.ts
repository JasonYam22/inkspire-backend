import type { Request, Response, NextFunction } from "express";

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ message: "Route not found" });
};

type appError = {
  name: string;
  message: string,
  code?: string
}
export const errorHandler = (error: appError, req: Request, res: Response, next: NextFunction) => {

if (error.code === "P2025") {
    res.status(404).json({message: "Not found"})
    return
}
if (error.name === "UnauthorizedError") {
  res.status(401).json({ message: "Unauthorized, please log in" });
  return;
}
  console.error(error);
  res.status(500).json({message: "Internal server error"})
};

