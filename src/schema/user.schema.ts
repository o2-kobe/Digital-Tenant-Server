import { z } from "zod";

// Body schema
const userBody = z
  .object({
    fullName: z.string().min(4, "FullName must be at least 4 characters"),
    role: z.enum(["tenant", "landlord"]),
    email: z.email(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(64, "Password cannot exceed 64 characters"),
    passwordConfirm: z.string(),
    phoneNumber: z.string().regex(/^\d{11}$/),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Passwords do not match",
    path: ["passwordConfirm"],
  });

// Route schemas
export const createUserSchema = z.object({
  body: userBody,
});

// Types
export type CreateUserRequest = z.infer<typeof userBody>;

export type CreateUserInput = Omit<z.infer<typeof userBody>, "passwordConfirm">;
