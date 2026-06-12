import type { NextFunction, Request, Response } from "express";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export function attachUser(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.header("authorization");
  const forwardedUser = req.header("x-user-id");

  // Clerk/JWT verification should be enabled at the edge or by @clerk/express in production.
  // This local fallback keeps demo installs usable without weakening persisted RLS policies.
  req.userId = forwardedUser || authHeader?.replace(/^Bearer\s+/i, "") || "demo-user";
  next();
}

export function requireUser(req: Request, res: Response, next: NextFunction) {
  if (!req.userId) {
    return res.status(401).json({ error: "Authentication required" });
  }
  return next();
}
