import { Request, Response } from "express";
import { TryCatch } from "../utils/tryCatch";
import {
  broadcastAnnouncement,
  createAnnouncement,
  deleteAnnouncement,
  getAnnouncementById,
  getAnnouncementOfProperty,
  getAnnouncementsByTenancy,
  getAnnouncementsForRoom,
  updateAnnouncement,
} from "../service/announcement.service";
import logger from "../utils/logger";
import { AppError } from "../utils/AppError";

export const createAnnouncementHandler = TryCatch(
  async (req: Request, res: Response) => {
    const landlordId = res.locals.user.sub;
    const tenancyId = req.params.id as string;

    const { title, message } = req.body;

    const announcement = await createAnnouncement(tenancyId, landlordId, {
      title,
      message,
    });

    return {
      status: 201,
      data: announcement,
    };
  },
  "CreateAnnouncementHandler",
);

export const findTenancyAnnouncementsHandler = TryCatch(
  async (req: Request, res: Response) => {
    const userId = res.locals.user.sub;
    const tenancyId = req.params.id as string;

    const announcements = await getAnnouncementsByTenancy(tenancyId, userId);

    return announcements;
  },
  "FindTenancyAnnouncementHandler",
);

export const findAnnouncementHandler = TryCatch(
  async (req: Request, res: Response) => {
    const userId = res.locals.user.sub;
    const announcementId = req.params.id as string;

    const announcement = await getAnnouncementById(announcementId, userId);

    return announcement;
  },
  "FindAnnouncementHandler",
);

export const updateAnnouncementHandler = TryCatch(
  async (req: Request, res: Response) => {
    const landlordId = res.locals.user.sub;
    const announcementId = req.params.id as string;
    const { title, message } = req.body;

    const updatedAnnouncement = await updateAnnouncement(
      announcementId,
      landlordId,
      { title, message },
    );

    return updatedAnnouncement;
  },
  "UpdateAnnouncementHandler",
);

export const deleteAnnouncementHandler = TryCatch(
  async (req: Request, res: Response) => {
    const landlordId = res.locals.user.sub;
    const announcementId = req.params.id as string;

    const deletedAnnouncement = await deleteAnnouncement(
      announcementId,
      landlordId,
    );

    return deletedAnnouncement;
  },
  "DeleteAnnouncementHandler",
);

export async function broadcastAnnouncementHandler(
  req: Request,
  res: Response,
) {
  try {
    const landlordId = res.locals.user.sub;
    const propertyId = req.params.id as string;
    const { title, message } = req.body;

    const result = await broadcastAnnouncement(propertyId, landlordId, {
      title,
      message,
    });

    res.status(201).json({
      status: "success",
      message: result.message,
    });
  } catch (error: any) {
    logger.error(`BroadCastAnnouncementHandler Error: ${error}`);

    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        status: error.status,
        message: error.message,
      });
    }

    res.status(500).json({
      status: "error",
      message: "Something went wrong. Please try again later.",
    });
  }
}

export const findRoomAnnouncementsHandler = TryCatch(
  async (req: Request, res: Response) => {
    const landlordId = res.locals.user.sub;
    const roomId = req.params.id as string;

    const announcements = await getAnnouncementsForRoom(roomId, landlordId);

    return announcements;
  },
  "FindRoomAnnouncementsHandler",
);

export const findPropertyAnnouncements = TryCatch(
  async (req: Request, res: Response) => {
    const landlordId = res.locals.user.sub;
    const propertyId = req.params.id as string;

    const announcements = await getAnnouncementOfProperty(
      landlordId,
      propertyId,
    );
  },
  "FindPropertyAnnouncementsHandler",
);
