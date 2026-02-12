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

// modify schema to match type and params
export async function createAnnouncement(
  tenancyId: string,
  landlordId: string,
  announcementData: CreateAnnouncementInput,
) {
  // Verify tenancy
  const tenancy = await Tenancy.findOne({
    _id: tenancyId,
    landlordId,
    isActive: true,
  }).lean();

  if (!tenancy)
    throw Errors.forbidden(
      "You are not allowed to create an announcement for this tenancy",
    );

  return await Announcement.create({ tenancyId, ...announcementData });
}

// What will be the use case of this function?
export async function getAnnouncementsByTenancy(
  tenancyId: string,
  userId: string,
) {
  let tenancy;

  const user = await User.findById(userId).lean();

  if (!user) throw Errors.forbidden("You cannot perform this action");

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
    throw Errors.forbidden("You are not allowed to view these announcements");

  return await Announcement.find({ tenancyId }).lean();
}

export async function getAnnouncementById(
  announcementId: string,
  userId: string,
) {
  const announcement = await Announcement.findById(announcementId).lean();
  if (!announcement) throw Errors.notFound("Announcement does not exist");

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
    throw Errors.forbidden("You are not allowed to view this announcement");

  return announcement;
}

export async function updateAnnouncement(
  announcementId: string,
  landlordId: string,
  update: UpdateAnnouncementInput,
) {
  const announcement = await Announcement.findById(announcementId).lean();
  if (!announcement) throw Errors.notFound("Announcement does not exist");

  const tenancy = await Tenancy.findOne({
    _id: announcement?.tenancyId,
    landlordId,
    isActive: true,
  }).lean();

  if (!tenancy) throw Errors.forbidden("You cannot update this announcement");

  const updatedAnnouncement = await Announcement.findByIdAndUpdate(
    announcementId,
    update,
    { new: true },
  );

  if (!updatedAnnouncement)
    throw Errors.notFound(
      "Announcement could not be updated because it no longer exists",
    );

  return updatedAnnouncement;
}

export async function deleteAnnouncement(
  announcementId: string,
  landlordId: string,
) {
  const announcement = await Announcement.findById(announcementId).lean();
  if (!announcement) throw Errors.notFound("Announcement does not exist");

  const tenancy = await Tenancy.findOne({
    _id: announcement?.tenancyId,
    landlordId,
    isActive: true,
  }).lean();

  if (!tenancy) throw Errors.forbidden("You cannot delete this announcement");

  await Announcement.findByIdAndDelete(announcementId);
}

// Function to send multiple announcements to the tenants
export async function broadcastAnnouncement(
  propertyId: string,
  landlordId: string,
  announcementData: CreateAnnouncementInput,
) {
  //  Verify property ownership
  const property = await Property.findOne({
    _id: propertyId,
    landlordId,
  }).lean();

  if (!property) throw Errors.forbidden("You do not own this property");

  // Get all rooms under property
  const rooms = await Room.find({ propertyId }).lean();

  if (!rooms.length) throw Errors.notFound("No rooms found for this property");

  const roomIds = rooms.map((room) => room._id);

  // Get all active tenancies in those rooms
  const tenancies = await Tenancy.find({
    roomId: { $in: roomIds },
    isActive: true,
  }).lean();

  if (!tenancies.length) throw Errors.notFound("No active tenants to notify");

  //  Prepare bulk announcements
  const announcements = tenancies.map((tenancy) => ({
    tenancyId: tenancy._id,
    title: announcementData.title,
    message: announcementData.message,
  }));

  // Insert all at once (efficient)
  await Announcement.insertMany(announcements);

  return {
    message: `Announcement sent to ${announcements.length} tenants`,
  };
}
