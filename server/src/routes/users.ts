import { Router, type Request, type Response, type NextFunction } from "express";
import { hashPassword } from "better-auth/crypto";
import { createUserSchema, updateUserSchema, Role } from "@helpdesk/core";
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
    where: { deletedAt: null },
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

usersRouter.patch(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ error: "Missing user id" });
      return;
    }

    const parsed = updateUserSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "Invalid input",
        issues: parsed.error.issues,
      });
      return;
    }

    const { name, email, password } = parsed.data;

    const target = await prisma.user.findUnique({ where: { id } });
    if (!target || target.deletedAt) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    if (email !== target.email) {
      const clash = await prisma.user.findUnique({ where: { email } });
      if (clash && clash.id !== id) {
        res.status(409).json({
          error: "A user with this email already exists",
        });
        return;
      }
    }

    try {
      await prisma.user.update({
        where: { id },
        data: { name, email },
      });

      if (password) {
        const account = await prisma.account.findFirst({
          where: { userId: id, providerId: "credential" },
        });
        if (!account) {
          res.status(400).json({
            error: "This user has no password to update",
          });
          return;
        }
        const hashed = await hashPassword(password);
        await prisma.account.update({
          where: { id: account.id },
          data: { password: hashed },
        });
      }
    } catch (err) {
      next(err);
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: userSelect,
    });

    res.json({ user });
  },
);

usersRouter.delete(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ error: "Missing user id" });
      return;
    }

    const target = await prisma.user.findUnique({ where: { id } });
    if (!target || target.deletedAt) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    if (target.role === Role.ADMIN) {
      res.status(403).json({ error: "Admin users cannot be deleted" });
      return;
    }

    try {
      await prisma.$transaction([
        prisma.user.update({
          where: { id },
          data: {
            email: `${target.email}.deleted.${id}`,
            deletedAt: new Date(),
          },
        }),
        prisma.session.deleteMany({ where: { userId: id } }),
      ]);
    } catch (err) {
      next(err);
      return;
    }

    res.status(204).end();
  },
);
