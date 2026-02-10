import { object, z } from "zod";

export const createUserSchema = object({
  body: object({
    username: z
      .string()
      .nonempty("Username is required")
      .min(4, "Userame must be at least 4 characters"),
    role: z.enum(["tenant", "landlord"]),
    email: z.email(),
    password: z
      .string()
      .nonempty("Password is required")
      .min(8, "Password must be at least 8 characters")
      .max(64, "Password cannot exceed 64 characters"),
    passwordConfirm: z.string().nonempty("Please confirm password"),
  }).refine((data) => data.password === data.passwordConfirm, {
    message: "Passwords do not match",
    path: ["passwordConfirm"],
  }),
});

export type createUserRequest = z.infer<typeof createUserSchema>["body"];

export type CreateUserInput = Omit<
  z.infer<typeof createUserSchema>["body"],
  "passwordConfirm"
>;
