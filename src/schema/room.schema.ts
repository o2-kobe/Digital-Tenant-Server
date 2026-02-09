import { z } from "zod";
const roomPayload = z.object({
  body: z.object({
    roomLabel: z.string().min(3, "Room label must be at least 3 characters"),
    rentAmount: z.number().min(0),
  }),
});

export const updateRoomSchema = z
  .object({
    ...roomPayload,
  })
  .partial();

export type createRoomServiceType = z.infer<typeof roomPayload>["body"];

export type updateRoomServiceType = z.infer<typeof updateRoomSchema>;
