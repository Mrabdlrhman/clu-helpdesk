import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { ROLES, Role } from "@helpdesk/core";
import { prisma } from "./db.js";

const trustedOrigins = (process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

if (trustedOrigins.length === 0) {
  throw new Error("BETTER_AUTH_TRUSTED_ORIGINS must list at least one origin");
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  user: {
    additionalFields: {
      role: {
        type: [...ROLES],
        required: false,
        defaultValue: Role.AGENT,
        input: false,
      },
    },
  },
  trustedOrigins,
});
