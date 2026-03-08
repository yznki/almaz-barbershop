import { z } from "zod";

export const authSignupSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required"),
  email: z.string().trim().email("Valid email is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type AuthSignupInput = z.infer<typeof authSignupSchema>;
