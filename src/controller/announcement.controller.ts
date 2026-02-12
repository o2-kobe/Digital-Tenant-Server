import { Request, Response } from "express";
import { TryCatch } from "../utils/tryCatch";
import {
  createAnnouncement,
  deleteAnnouncement,
  getAnnouncementById,
  getAnnouncementsByTenancy,
  updateAnnouncement,
} from "../service/announcement.service";

export const createAnnouncementHandler = TryCatch(
  async (req: Request, res: Response) => {
    const landlordId = res.locals.user._id;
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
    const userId = res.locals.user._id;
    const tenancyId = req.params.id as string;

    const announcements = await getAnnouncementsByTenancy(tenancyId, userId);

    return announcements;
  },
  "FindTenancyAnnouncementHandler",
);

export const findAnnouncementHandler = TryCatch(
  async (req: Request, res: Response) => {
    const userId = res.locals.user._id;
    const announcementId = req.params.id as string;

    const announcement = await getAnnouncementById(announcementId, userId);

    return announcement;
  },
  "FindAnnouncementHandler",
);

export const updateAnnouncementHandler = TryCatch(
  async (req: Request, res: Response) => {
    const landlordId = res.locals.user._id;
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
    const landlordId = res.locals.user._id;
    const announcementId = req.params.id as string;

    const deletedAnnouncement = await deleteAnnouncement(
      announcementId,
      landlordId,
    );

    return deletedAnnouncement;
  },
  "DeleteAnnouncementHandler",
);
