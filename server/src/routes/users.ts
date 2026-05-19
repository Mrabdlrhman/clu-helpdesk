import { Router, type Request, type Response, type NextFunction } from "express";
import { createUserSchema } from "@helpdesk/core";
import { auth } from "../lib/auth.js";
import { prisma } from "../lib/db.js";
import { requireAuth } from "../middleware/require-auth.js";
import { requireAdmin } from "../middleware/require-admin.js";

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
} as const;

export const usersRouter = Router();

usersRouter.use(requireAuth, requireAdmin);

usersRouter.get("/", async (_req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    select: userSelect,
    orderBy: { createdAt: "desc" },
  });
  res.json({ users });
});

usersRouter.post(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    const parsed = createUserSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "Invalid input",
        issues: parsed.error.issues,
      });
      return;
    }

    const { name, email, password } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({
        error: "A user with this email already exists",
      });
      return;
    }

    try {
      await auth.api.signUpEmail({ body: { name, email, password } });
    } catch (err) {
      next(err);
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: userSelect,
    });

    res.status(201).json({ user });
  },
);
