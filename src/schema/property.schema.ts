import { z } from "zod";

const propertyPayload = z.object({
  body: z.object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    city: z.string().min(3, "City must be at least 3 characters"),
    town: z.string().min(3, "Town must be at least 3 characters"),
    address: z
      .string()
      .min(7, "Address must be at least 3 characters")
      .optional(),
  }),
});

export const propertyParams = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-f]{24}$/, "Invalid MongoDB ID"),
  }),
});

const updatePropertySchema = z
  .object({
    ...propertyPayload,
  })
  .partial();

export type createPropertyServiceType = z.infer<typeof propertyPayload>["body"];

export type updatePropertyServiceType = z.infer<typeof updatePropertySchema>;
