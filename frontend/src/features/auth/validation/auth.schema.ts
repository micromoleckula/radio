import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .pipe(z.email({ error: "Enter a valid email address" }).max(254)),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72)
    .refine(
      (password) => new TextEncoder().encode(password).byteLength <= 72,
      "Password must not exceed 72 bytes",
    ),
});

export const registerSchema = loginSchema;

export type LoginType = z.infer<typeof loginSchema>;
export type RegisterType = z.infer<typeof registerSchema>;