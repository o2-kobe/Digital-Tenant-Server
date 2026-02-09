import { object, z } from "zod";

export const createUserSchema = object({
  body: object({
    name: z
      .string()
      .nonempty("Name is required")
      .min(4, "Name must be at least 4 characters"),
    email: z.email(),
    password: z
      .string()
      .nonempty("Password is required")
      .min(8, "Password must be at least 8 characters"),
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
