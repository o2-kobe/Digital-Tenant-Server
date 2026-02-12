import { z } from "zod";

// Body schema
const bookingBody = z.object({
  fullName: z.string().trim().min(3).max(20),
  contactInfo: z.string().trim().min(5).max(20),
});

// Route schemas
export const createBookingSchema = z.object({
  body: bookingBody,
  params: z.object({
    id: z.string().regex(/^[0-9a-f]{24}$/, "Invalid MongoDB ID"),
  }),
});

export const bookingParamsSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-f]{24}$/, "Invalid MongoDB ID"),
  }),
});

// Types
export type CreateBookingInput = z.infer<typeof bookingBody>;
