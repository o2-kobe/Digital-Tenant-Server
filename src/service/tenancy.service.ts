import Tenancy from "../model/tenancy.model";
import Room from "../model/room.model";
import Property from "../model/property.model";
import User from "../model/user.model";
import { Errors } from "../utils/factoryErrors";
import { CreateTenancyServiceInput } from "../schema/tenancy.schema";
import mongoose from "mongoose";
import { normalizeMongoArray } from "../utils/helper";

// Create Tenancy
export async function createTenancy(
  landlordId: string,
  propertyId: string,
  roomId: string,
  { tenantCode, startDate }: CreateTenancyServiceInput,
) {
  // Resolve tenant
  const tenant = await User.findOne({ tenantCode }).select("_id role");

  if (!tenant) {
    throw Errors.notFound("No tenant was found with the provided tenant code.");
  }

  if (tenant.role !== "tenant") {
    throw Errors.badRequest(
      "The specified user is not registered as a tenant.",
    );
  }

  // Prevent tenant having multiple active tenancies
  const existingTenantTenancy = await Tenancy.findOne({
    tenantId: tenant._id,
    isActive: true,
  });

  if (existingTenantTenancy) {
    throw Errors.badRequest("This tenant already has an active tenancy.");
  }

  // Verify property ownership
  const property = await Property.findOne({
    _id: propertyId,
    landlordId,
  });

  if (!property) {
    throw Errors.forbidden(
      "You are not authorized to create a tenancy for this property.",
    );
  }

  // Verify room belongs to property
  const room = await Room.findOne({
    _id: roomId,
    propertyId,
  });

  if (!room) {
    throw Errors.notFound(
      "The specified room was not found under this property.",
    );
  }

  // Prevent assigning already occupied room
  if (room.isOccupied) {
    throw Errors.badRequest(
      "This room is currently occupied and cannot be reassigned.",
    );
  }

  // Close any existing tenancy for the room (safety fallback)
  const existingRoomTenancy = await Tenancy.findOne({
    roomId,
    isActive: true,
  });

  if (existingRoomTenancy) {
    existingRoomTenancy.isActive = false;
    existingRoomTenancy.endDate = new Date();
    await existingRoomTenancy.save();
  }

  // Create new tenancy
  const newTenancy = await Tenancy.create({
    tenantId: tenant._id,
    landlordId,
    propertyId,
    roomId,
    startDate,
    endDate: null,
    isActive: true,
  });

  // Mark room as occupied
  room.isOccupied = true;
  await room.save();

  return newTenancy;
}

// Get tenancies by room
export async function getTenanciesByRoom(roomId: string, landlordId: string) {
  const room = await Room.findById(roomId).lean();

  if (!room) {
    throw Errors.notFound("The specified room was not found.");
  }

  const property = await Property.findOne({
    _id: room.propertyId,
    landlordId,
  }).lean();

  if (!property) {
    throw Errors.forbidden(
      "You are not authorized to view tenancies for this room.",
    );
  }

  // Return ALL tenancies (history matters)
  const tenancies = await Tenancy.find({ roomId })
    .sort({ createdAt: -1 })
    .populate({ path: "tenantId", select: "id fullName" })
    .lean();

  return normalizeMongoArray(tenancies);
}

// End tenancy
export async function endTenancy(tenancyId: string, landlordId: string) {
  const tenancy = await Tenancy.findOne({
    _id: tenancyId,
    landlordId,
  });

  if (!tenancy) {
    throw Errors.notFound("The specified tenancy was not found.");
  }

  if (!tenancy.isActive) {
    throw Errors.badRequest("This tenancy has already been ended.");
  }

  // End tenancy
  tenancy.isActive = false;
  tenancy.endDate = new Date();
  await tenancy.save();

  // Free the room
  const room = await Room.findById(tenancy.roomId);

  if (room) {
    room.isOccupied = false;
    await room.save();
  }

  return tenancy;
}

export async function getTenancyById(tenancyId: string, landlordId: string) {
  const tenancy = await Tenancy.findOne({ _id: tenancyId, landlordId });

  if (!tenancy)
    throw Errors.notFound(
      "The requested tenancy was not found or you do not have access to it.",
    );

  return tenancy;
}
