import { JWT_SECRET } from "@repo/backend-common/config";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Extend Express Request type to include `userId`
export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export function middleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1]; // Expected format: "Bearer <token>"

  if (!token) {
    console.log("no token received");
    res.status(401).json({ success: false, message: "Invalid or missing token" });
    return;
  }

  try {
    console.log("token received");
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(403).json({ success: false, message: "Invalid or expired token" });
    return;
  }
}
