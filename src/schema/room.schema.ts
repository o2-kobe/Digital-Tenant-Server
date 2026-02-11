import { z } from "zod";

// Body schema
const roomBody = z.object({
  roomLabel: z.string().min(3, "Room label must be at least 3 characters"),
  rentAmount: z.number().min(0),
});

// Route schemas
export const createRoomSchema = z.object({
  body: roomBody,
});

export const updateRoomSchema = z.object({
  body: roomBody.partial(),
  params: z.object({
    id: z.string().regex(/^[0-9a-f]{24}$/, "Invalid MongoDB ID"),
  }),
});

export const roomParamsSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-f]{24}$/, "Invalid MongoDB ID"),
  }),
});

// Types
export type CreateRoomInput = z.infer<typeof roomBody>;

const updateRoomBody = roomBody.partial();
export type UpdateRoomInput = z.infer<typeof updateRoomBody>;
