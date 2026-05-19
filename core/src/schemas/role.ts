import { z } from "zod";

export const ROLES = ["ADMIN", "AGENT"] as const;

export const roleSchema = z.enum(ROLES);

export type Role = z.infer<typeof roleSchema>;

export const Role = {
  ADMIN: "ADMIN",
  AGENT: "AGENT",
} as const satisfies Record<Role, Role>;
