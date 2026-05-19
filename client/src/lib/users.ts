import type { Role } from "@helpdesk/core";

export type UserRow = {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
};
