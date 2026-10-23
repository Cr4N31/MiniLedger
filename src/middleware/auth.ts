import { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";

export interface AuthRequest extends Request {
  userId?: string;
}

export function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({
      message: "Authentication token required",
    });
  }

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    return res.status(500).json({
      message: "Server authentication is not configured",
    });
  }

  try {
    const payload = verify(token, secret);

    if (typeof payload === "string" || typeof payload.userId !== "string") {
      return res.status(401).json({
        message: "Invalid authentication token",
      });
    }

    req.userId = payload.userId;
    next();
  } catch {
    return res.status(401).json({
      message: "Invalid or expired authentication token",
    });
  }
}
