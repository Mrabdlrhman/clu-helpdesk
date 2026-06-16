import type { Request, Response, NextFunction } from "express";
import { timingSafeEqual } from "node:crypto";

let warnedMissingSecret = false;

/**
 * Guards public webhook routes with a shared secret supplied in the
 * `x-webhook-secret` header. The expected secret is read from
 * `INBOUND_EMAIL_SECRET` and compared in constant time.
 */
export function requireWebhookSecret(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const expected = process.env.INBOUND_EMAIL_SECRET;
  if (!expected) {
    if (!warnedMissingSecret) {
      console.error(
        "[require-webhook-secret] INBOUND_EMAIL_SECRET is not set; rejecting all webhook requests.",
      );
      warnedMissingSecret = true;
    }
    res.status(500).json({ error: "Webhook secret not configured" });
    return;
  }

  const provided = req.header("x-webhook-secret");
  if (typeof provided !== "string" || provided.length === 0) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  next();
}
