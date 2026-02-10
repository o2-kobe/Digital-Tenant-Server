import z from "zod";

const tenancyPayload = z.object({
  body: z.object({
    tenantCode: z.string(),
    startDate: z.coerce.date(),
  }),
});

const endTenancySchema = z.object({
  endDate: z.coerce.date(),
});

export type createTenancyServiceType = z.infer<typeof tenancyPayload>["body"];

export type endTenancyType = z.infer<typeof endTenancySchema>;
