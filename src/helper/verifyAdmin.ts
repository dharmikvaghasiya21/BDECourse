// src/middlewares/adminAuth.ts
import { Request, Response, NextFunction } from "express";

export const verifyAdmin = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization;

  if (!token || token !== "admin-secret-token") {
    return res.status(403).json({ success: false, message: "Unauthorized admin" });
  }

  next();
};
