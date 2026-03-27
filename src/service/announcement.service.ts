import mongoose from "mongoose";
import Announcement from "../model/announcement.model";
import Property from "../model/property.model";
import Room from "../model/room.model";
import Tenancy from "../model/tenancy.model";
import User from "../model/user.model";
import {
  CreateAnnouncementInput,
  UpdateAnnouncementInput,
} from "../schema/announcement.schema";
import { Errors } from "../utils/factoryErrors";
import { normalizeMongoArray } from "../utils/helper";

// Create Announcement
export async function createAnnouncement(
  roomId: string,
  landlordId: string,
  announcementData: CreateAnnouncementInput,
) {
  // Find active tenancy for the room
  const tenancy = await Tenancy.findOne({
    roomId,
    landlordId,
    isActive: true,
  }).lean();

  if (!tenancy) {
    throw Errors.notFound(
      "No active tenancy found for this room. Announcements can only be sent to occupied rooms.",
    );
  }

  return await Announcement.create({
    tenancyId: tenancy._id,
    ...announcementData,
  });
}

// Get Announcements By Tenancy
export async function getAnnouncementsByTenancy(
  tenancyId: string,
  userId: string,
) {
  let tenancy;

  const user = await User.findById(userId).lean();

  if (!user)
    throw Errors.forbidden(
      "User not found or you are not authorized to perform this operation.",
    );

  if (user.role === "landlord") {
    tenancy = await Tenancy.findOne({
      _id: tenancyId,
      landlordId: userId,
    }).lean();
  } else {
    tenancy = await Tenancy.findOne({
      _id: tenancyId,
      tenantId: userId,
    }).lean();
  }

  if (!tenancy)
    throw Errors.forbidden(
      "You do not have permission to view announcements for this tenancy.",
    );

  return await Announcement.find({ tenancyId }).lean();
}

// Get Single Announcement
export async function getAnnouncementById(
  announcementId: string,
  userId: string,
) {
  const announcement = await Announcement.findById(announcementId).lean();
  if (!announcement)
    throw Errors.notFound("The requested annoucement was not found.");

  let tenancy;

  const user = await User.findById(userId).lean();

  if (!user) throw Errors.forbidden("You cannot perform this action");

  if (user.role === "landlord") {
    tenancy = await Tenancy.findOne({
      _id: announcement.tenancyId,
      landlordId: userId,
    }).lean();
  } else {
    tenancy = await Tenancy.findOne({
      _id: announcement.tenancyId,
      tenantId: userId,
    }).lean();
  }

  if (!tenancy)
    throw Errors.forbidden(
      "You do not have permission to view this announcement.",
    );

  return announcement;
}

// Update Announcement
export async function updateAnnouncement(
  announcementId: string,
  landlordId: string,
  update: UpdateAnnouncementInput,
) {
  if (!Object.keys(update).length) {
    throw Errors.badRequest("No update fields were provided.");
  }

  const announcement = await Announcement.findById(announcementId).lean();
  if (!announcement)
    throw Errors.notFound(
      "The announcement you are trying to update was not found.",
    );

  const tenancy = await Tenancy.findOne({
    _id: announcement?.tenancyId,
    landlordId,
    isActive: true,
  }).lean();

  if (!tenancy)
    throw Errors.forbidden(
      "You are not authorized to update this announcement.",
    );

  const updatedAnnouncement = await Announcement.findByIdAndUpdate(
    announcementId,
    update,
    { returnDocument: "after" },
  );

  if (!updatedAnnouncement)
    throw Errors.notFound(
      "Announcement could not be updated because it no longer exists",
    );

  return updatedAnnouncement;
}

// Delete Announcement
export async function deleteAnnouncement(
  announcementId: string,
  landlordId: string,
) {
  const announcement = await Announcement.findById(announcementId).lean();
  if (!announcement)
    throw Errors.notFound(
      "The announcement you are trying to delete was not found.",
    );

  const tenancy = await Tenancy.findOne({
    _id: announcement?.tenancyId,
    landlordId,
    isActive: true,
  }).lean();

  if (!tenancy)
    throw Errors.forbidden(
      "You are not authorized to delete this announcement.",
    );

  const deleted = await Announcement.findByIdAndDelete(announcementId);

  if (!deleted) {
    throw Errors.notFound("The announcement no longer exists.");
  }
}

// Broadcast Announcement
export async function broadcastAnnouncement(
  propertyId: string,
  landlordId: string,
  announcementData: CreateAnnouncementInput,
) {
  // Verify property ownership
  const property = await Property.findOne({
    _id: propertyId,
    landlordId,
  }).lean();

  if (!property) {
    throw Errors.forbidden(
      "You are not authorized to send announcements for this property.",
    );
  }

  // Get all rooms under property
  const rooms = await Room.find({ propertyId }).lean();

  if (!rooms.length) {
    throw Errors.notFound("No rooms were found under this property.");
  }

  const roomIds = rooms.map((room) => room._id);

  // Get all active tenancies
  const tenancies = await Tenancy.find({
    roomId: { $in: roomIds },
    isActive: true,
  }).lean();

  if (!tenancies.length) {
    throw Errors.notFound(
      "There are no active tenants to receive this announcement.",
    );
  }

  // Prepare announcements
  const announcements = tenancies.map((tenancy) => ({
    tenancyId: tenancy._id,
    title: announcementData.title,
    message: announcementData.message,
  }));

  // Bulk insert
  await Announcement.insertMany(announcements);

  return {
    message: `Announcement successfully sent to ${announcements.length} tenant(s).`,
  };
}

// Get Announcements for Room
export async function getAnnouncementsForRoom(
  roomId: string,
  landlordId: string,
) {
  const tenancy = await Tenancy.findOne({ roomId, landlordId, isActive: true });

  if (!tenancy) return [];

  return await Announcement.find({ tenancyId: tenancy._id }).populate({
    path: "tenancyId",
    select: "roomId",
    populate: {
      path: "roomId",
      select: "roomLabel",
    },
  });
}

// Get Announcements for property
export async function getAnnouncementOfProperty(
  landlordId: string,
  propertyId: string,
) {
  const tenancies = await Tenancy.find({
    landlordId,
    propertyId,
  }).select("_id");

  const tenancyIds = tenancies.map((t) => t._id);

  const announcements = await Announcement.aggregate([
    {
      $match: {
        tenancyId: { $in: tenancyIds },
      },
    },

    // ✅ Join Tenancy
    {
      $lookup: {
        from: "tenancies", // ⚠️ confirm collection name
        localField: "tenancyId",
        foreignField: "_id",
        as: "tenancy",
      },
    },
    {
      $unwind: {
        path: "$tenancy",
        preserveNullAndEmptyArrays: true,
      },
    },

    // ✅ Join Room via tenancy.roomId
    {
      $lookup: {
        from: "rooms", // ⚠️ confirm collection name
        localField: "tenancy.roomId",
        foreignField: "_id",
        as: "room",
      },
    },
    {
      $unwind: {
        path: "$room",
        preserveNullAndEmptyArrays: true,
      },
    },

    // ✅ Add roomLabel field
    {
      $addFields: {
        roomLabel: "$room.roomLabel",
      },
    },

    // (optional cleanup)
    {
      $project: {
        tenancy: 0,
        room: 0,
      },
    },

    // Your grouping logic
    {
      $group: {
        _id: {
          title: "$title",
          message: "$message",
        },
        announcement: { $first: "$$ROOT" },
      },
    },
    {
      $replaceRoot: { newRoot: "$announcement" },
    },

    {
      $sort: { createdAt: -1 },
    },
  ]);

  return normalizeMongoArray(announcements);
}
