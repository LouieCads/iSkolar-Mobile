import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}

interface AuthenticatedUser extends JwtPayload {
  id: string;
  email: string;
}

interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];

  if (!token) {
    res.status(401).json({
      success: false,
      message: "Access token required",
    });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err || typeof decoded === "string" || !decoded) {
      res.status(403).json({
        success: false,
        message: "Invalid or expired token",
      });
      return;
    }

    req.user = decoded as AuthenticatedUser;
    next();
  });
};
