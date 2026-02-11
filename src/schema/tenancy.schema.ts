import { z } from "zod";

// Reusable MongoDB ObjectId validator
const objectId = z.string().regex(/^[0-9a-f]{24}$/, "Invalid MongoDB ID");

// Body
const tenancyBody = z.object({
  tenantCode: z.string().min(1, "Tenant code is required"),
  startDate: z.coerce.date(),
});

// Full request schema (params + body)
export const createTenancySchema = z.object({
  params: z.object({
    propertyId: objectId,
    roomId: objectId,
  }),
  body: tenancyBody,
});

export type CreateTenancyServiceInput = z.infer<
  typeof createTenancySchema
>["body"];

export type CreateTenancyControllerInput = z.infer<typeof createTenancySchema>;
