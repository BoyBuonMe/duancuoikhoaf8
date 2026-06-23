import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z
  .object({
    firstName: z.string().trim(),
    lastName: z.string().trim(),
    dateOfBirth: z.string(),
    phone: z
      .string()
      .trim()
      .min(1, "Phone number is required")
      .max(32, "Phone number is too long"),
    email: z
      .string()
      .trim()
      .min(1, "Email is required")
      .email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    marketingOptIn: z.boolean(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
