import { z } from "zod";

const billPayload = z.object({
  body: z.object({
    billType: z.enum(["rent", "electricity", "water", "other"]),
    description: z
      .string()
      .trim()
      .min(10, "Bill description must be at least 10 characters"),
    amount: z.number().min(0).positive(),
    dueDate: z.coerce.date(),
  }),
});

export type createBillServiceType = z.infer<typeof billPayload>["body"];
