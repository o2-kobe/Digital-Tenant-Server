import { z } from "zod";

const bookingPayload = z.object({
  body: z.object({
    fullName: z.string().trim().min(3).max(20),
    contactInfo: z.string().trim().min(5).max(20),
  }),
});

export type createBookingType = z.infer<typeof bookingPayload>["body"];
