import { z } from "zod";

// Body schema
const billBody = z.object({
  billType: z.enum(["rent", "electricity", "water", "other"]),
  description: z
    .string()
    .trim()
    .min(10, "Bill description must be at least 10 characters"),
  amount: z.number().positive(),
  dueDate: z.coerce.date(),
});

// Route schemas
export const createBillSchema = z.object({
  body: billBody,
});

export const updateBillSchema = z.object({
  body: billBody.partial(),
  params: z.object({
    id: z.string().regex(/^[0-9a-f]{24}$/, "Invalid MongoDB ID"),
  }),
});

export const billParamsSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-f]{24}$/, "Invalid MongoDB ID"),
  }),
});

// Types
export type CreateBillInput = z.infer<typeof billBody>;

const updateBillBody = billBody.partial();
export type UpdateBillInput = z.infer<typeof updateBillBody>;
