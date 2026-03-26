import { z } from "zod";

const objectId = z.string().regex(/^[0-9a-f]{24}$/, "Invalid MongoDB ID");

export const announcementParamsSchema = z.object({
  params: z.object({
    id: objectId,
  }),
});

// Body schema
const announcementBody = z.object({
  title: z
    .string()
    .trim()
    .min(5, "Announcement title must be at least 5 characters")
    .max(30, "Announcement title cannot exceed 30 characters"),
  message: z
    .string()
    .trim()
    .min(10, "Announcement message must be at least 10 characters")
    .max(200, "Announcement message cannot exceed 200 characters"),
});

// Route schemas
export const createAnnouncementSchema = z.object({
  body: announcementBody,
  params: z.object({
    id: objectId,
  }),
});

export const updateAnnouncementSchema = z.object({
  body: announcementBody.partial(),
  params: z.object({
    id: z.string().regex(/^[0-9a-f]{24}$/, "Invalid MongoDB ID"),
  }),
});

// Types
export type CreateAnnouncementInput = z.infer<typeof announcementBody>;

const updateAnnouncementBody = announcementBody.partial();
export type UpdateAnnouncementInput = z.infer<typeof updateAnnouncementBody>;
