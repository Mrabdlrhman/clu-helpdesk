import type { Request, Response, NextFunction } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth.js";
import { prisma } from "../lib/db.js";

type AuthSession = NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>;

declare global {
  namespace Express {
    interface Request {
      session?: AuthSession["session"];
      user?: AuthSession["user"];
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const result = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!result) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const fresh = await prisma.user.findUnique({
    where: { id: result.user.id },
    select: { deletedAt: true },
  });
  if (!fresh || fresh.deletedAt) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  req.session = result.session;
  req.user = result.user;
  next();
}
