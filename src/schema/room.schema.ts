import { z } from "zod";

// Reusable Mongo ID validator
const objectId = z.string().regex(/^[0-9a-f]{24}$/, "Invalid MongoDB ID");

export const roomParamsSchema = z.object({
  params: z.object({
    id: objectId,
  }),
});

const roomTypeEnum = z.enum([
  "single",
  "self-contained",
  "chamber-and-hall",
  "apartment",
  "studio",
]);

// Body schema
const roomBody = z.object({
  roomLabel: z.string().min(3, "Room label must be at least 3 characters"),

  rentAmount: z
    .number({ message: "Rent amount must be a number" })
    .min(0, "Rent amount cannot be negative"),

  type: roomTypeEnum,

  bedrooms: z
    .number({ message: "Bedrooms must be a number" })
    .int("Bedrooms must be an integer")
    .min(0, "Bedrooms cannot be negative"),

  amenities: z
    .array(
      z
        .string()
        .min(1, "Amenity cannot be empty")
        .transform((val) => val.trim()),
    )
    .optional()
    .default([]),
});

// Route schemas
export const createRoomSchema = z.object({
  params: z.object({
    id: objectId,
  }),
  body: roomBody,
});

export const updateRoomSchema = z.object({
  body: roomBody.partial(),
  params: z.object({
    id: objectId,
  }),
});

// Types
export type CreateRoomInput = z.infer<typeof roomBody>;

const updateRoomBody = roomBody.partial();
export type UpdateRoomInput = z.infer<typeof updateRoomBody>;
