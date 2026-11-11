import type { Request, Response, NextFunction } from "express";

// Reply with 404 when no route matches.
export const notFoundHandler = (_req: Request, res: Response) => {
  res.status(404).json({ message: "Route not found" });
};

type AppError = {
  name: string;
  message: string;
  code?: string;
};

// Turn backend errors into HTTP responses.
export const errorHandler = (
  error: AppError,
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  if (error.code === "LIMIT_FILE_SIZE") {
    res.status(413).json({ message: "Images must be 4 MB or smaller." });
    return;
  }

  if (error.code === "P2025") {
    res.status(404).json({ message: "Not found" });
    return;
  }

  if (error.code === "P2002") {
    res.status(409).json({ message: "Field already exists" });
    return;
  }

  if (error.name === "UnauthorizedError") {
    res.status(401).json({ message: "Unauthorized, please log in" });
    return;
  }
  console.error(error);
  res.status(500).json({ message: "Internal server error" });
};
