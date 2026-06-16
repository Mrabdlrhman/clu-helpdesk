import { Router, type Request, type Response, type NextFunction } from "express";
import { inboundEmailSchema, TicketSource, TicketStatus } from "@helpdesk/core";
import { prisma } from "../lib/db.js";
import { requireWebhookSecret } from "../middleware/require-webhook-secret.js";

const ticketSelect = {
  id: true,
  subject: true,
  body: true,
  senderEmail: true,
  senderName: true,
  category: true,
  status: true,
  source: true,
  messageId: true,
  assignedToId: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
} as const;

export const webhooksRouter = Router();

webhooksRouter.use(requireWebhookSecret);

webhooksRouter.post(
  "/inbound-email",
  async (req: Request, res: Response, next: NextFunction) => {
    const parsed = inboundEmailSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "Invalid input",
        issues: parsed.error.issues,
      });
      return;
    }

    const { from, fromName, subject, text, category, messageId } = parsed.data;
    const normalizedSubject = subject.trim() || "(no subject)";

    try {
      if (messageId) {
        const existing = await prisma.ticket.findUnique({
          where: { messageId },
          select: ticketSelect,
        });
        if (existing) {
          res.status(200).json({ ticket: existing, deduped: true });
          return;
        }
      }

      const ticket = await prisma.ticket.create({
        data: {
          subject: normalizedSubject,
          body: text,
          senderEmail: from,
          senderName: fromName,
          category,
          source: TicketSource.EMAIL,
          status: TicketStatus.OPEN,
          messageId,
        },
        select: ticketSelect,
      });

      res.status(201).json({ ticket, deduped: false });
    } catch (err) {
      // Handle race on the messageId unique constraint: two simultaneous
      // requests with the same id can both miss the dedupe lookup. Convert
      // the resulting P2002 into a dedupe 200 by re-fetching.
      if (
        messageId &&
        typeof err === "object" &&
        err !== null &&
        (err as { code?: string }).code === "P2002"
      ) {
        const existing = await prisma.ticket.findUnique({
          where: { messageId },
          select: ticketSelect,
        });
        if (existing) {
          res.status(200).json({ ticket: existing, deduped: true });
          return;
        }
      }
      next(err);
    }
  },
);
