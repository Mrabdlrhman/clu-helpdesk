import express, { type Request, type Response, type NextFunction } from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import { requireAuth } from "./middleware/require-auth.js";
import { requireAdmin } from "./middleware/require-admin.js";
import { prisma } from "./lib/db.js";

const app = express();
const PORT = Number(process.env.PORT ?? 4000);

app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(express.json());

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

app.get("/api/me", requireAuth, (req: Request, res: Response) => {
  res.json({ user: req.user, session: req.session });
});

app.get(
  "/api/users",
  requireAuth,
  requireAdmin,
  async (_req: Request, res: Response) => {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ users });
  },
);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Not Found" });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
