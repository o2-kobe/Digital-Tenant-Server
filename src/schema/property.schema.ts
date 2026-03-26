import { z } from "zod";

export const propertyParamsSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-f]{24}$/, "Invalid MongoDB ID"),
  }),
});

// Body schema only
const propertyBody = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  city: z.string().min(3, "City must be at least 3 characters"),
  town: z.string().min(3, "Town must be at least 3 characters"),
  address: z
    .string()
    .min(7, "Address must be at least 7 characters")
    .optional(),
});

// Route validation schemas
export const createPropertySchema = z.object({
  body: propertyBody,
});

export const updatePropertySchema = z.object({
  body: propertyBody.partial(),
  params: z.object({
    id: z.string().regex(/^[0-9a-f]{24}$/, "Invalid MongoDB ID"),
  }),
});

export type CreatePropertyInput = z.infer<typeof propertyBody>;

const updatePropertyBody = propertyBody.partial();
export type UpdatePropertyInput = z.infer<typeof updatePropertyBody>;
