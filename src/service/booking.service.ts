import Booking from "../model/booking.model";
import Property from "../model/property.model";
import Room from "../model/room.model";
import { CreateBookingInput } from "../schema/booking.schema";
import { Errors } from "../utils/factoryErrors";

export async function createBooking(
  roomId: string,
  bookingDetails: CreateBookingInput,
) {
  return await Booking.create({
    roomId,
    ...bookingDetails,
    status: "requested",
  });
}

// Used by landlord to retrieve all bookings
export async function getBookingsByRoom(roomId: string, landlordId: string) {
  // Find property related to room
  const property = await Property.findOne({ landlordId }).lean();

  if (!property) throw Errors.forbidden("You do not own this property");

  // Find whether the room exists
  const room = await Room.findOne({
    _id: roomId,
    propertyId: property._id,
  }).lean();

  if (!room) throw Errors.notFound("Room does not exist");

  // Find the relating bookings to rooms
  return await Booking.find({ roomId }).lean();
}

export async function getBookingsByLandlord(landlordId: string) {
  const properties = await Property.find({ landlordId }).lean();
  if (!properties.length)
    throw Errors.forbidden("You do not own any properties");

  const propertyIds = properties.map((p) => p._id);

  const rooms = await Room.find({
    propertyId: { $in: propertyIds },
  }).lean();

  if (!rooms.length) return [];

  const roomIds = rooms.map((r) => r._id);

  const bookings = await Booking.find({
    roomId: { $in: roomIds },
  }).lean();

  return bookings;
}

export async function approveBooking(bookingId: string, landlordId: string) {
  const booking = await Booking.findById(bookingId);
  if (!booking) throw Errors.notFound("Booking not found");

  const room = await Room.findById(booking.roomId).lean();
  if (!room) throw Errors.notFound("Room does not exist");

  const property = await Property.findOne({
    _id: room.propertyId,
    landlordId,
  }).lean();

  if (!property) throw Errors.forbidden("You do not own this property");

  if (booking.status !== "requested")
    throw Errors.badRequest("Booking is not in a request state");

  booking.status = "approved";
  await booking.save();

  return booking;
}

export async function rejectBooking(bookingId: string, landlordId: string) {
  const booking = await Booking.findById(bookingId);
  if (!booking) throw Errors.notFound("Booking not found");

  const room = await Room.findById(booking.roomId).lean();
  if (!room) throw Errors.notFound("Room does not exist");

  const property = await Property.findOne({
    _id: room.propertyId,
    landlordId,
  }).lean();

  if (!property) throw Errors.forbidden("You do not own this property");

  if (booking.status !== "requested")
    throw Errors.badRequest("Booking is not in a request state");

  booking.status = "rejected";
  await booking.save();

  return booking;
}
