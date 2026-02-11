import { z } from "zod";

// Body schema
const sessionBody = z.object({
  email: z.email(),
  password: z.string().nonempty("Password is required"),
});

// Route schema
export const createSessionSchema = z.object({
  body: sessionBody,
});

