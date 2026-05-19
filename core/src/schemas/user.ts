import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z
    .string()
    .transform((v) => (v === "" ? undefined : v))
    .pipe(
      z
        .string()
        .min(8, "Password must be at least 8 characters")
        .optional(),
    )
    .optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
