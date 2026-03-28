import Booking from "../model/booking.model";
import Property from "../model/property.model";
import Room from "../model/room.model";
import { Errors } from "../utils/factoryErrors";

export async function createBooking(roomId: string, tenantId: string) {
  const room = await Room.findById(roomId).lean();

  if (!room) throw Errors.notFound("Room does not exist");

  if (room.isOccupied) {
    throw Errors.badRequest("Room is already occupied");
  }

  const existing = await Booking.findOne({
    roomId,
    tenantId,
    status: "requested",
  });

  if (existing) {
    throw Errors.badRequest("You already expressed interest");
  }

  return Booking.create({
    roomId,
    tenantId,
    propertyId: room.propertyId,
    status: "requested",
  });
}

export async function getBookingsForLandlordProperties(landlordId: string) {
  const properties = await Property.find({ landlordId }).lean();

  const propertyIds = properties.map((p) => p._id);

  if (!propertyIds.length) return [];

  return Booking.find({ propertyId: { $in: propertyIds } }).populate([
    {
      path: "tenantId",
      select: "fullName phoneNumber",
    },
    {
      path: "roomId",
      select: "roomLabel ",
    },
    {
      path: "propertyId",
      select: "name",
    },
  ]);
}
