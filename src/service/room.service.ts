import Room from "../model/room.model";
import Property from "../model/property.model";
import {
  createRoomServiceType,
  updateRoomServiceType,
} from "../schema/room.schema";
import { Errors } from "../utils/factoryErrors";

// Create a room under a property (ownership enforced)
export async function createRoom(
  landlordId: string,
  propertyId: string,
  data: createRoomServiceType,
) {
  const property = await Property.findOne({
    _id: propertyId,
    landlordId,
  });

  if (!property) {
    throw Errors.notFound("Property not found or access denied");
  }

  return Room.create({ propertyId, ...data });
}

// Get all rooms for a property (ownership enforced)

export async function getRoomsByProperty(
  landlordId: string,
  propertyId: string,
) {
  const property = await Property.findOne({
    _id: propertyId,
    landlordId,
  });

  if (!property) {
    throw Errors.notFound("Property not found or access denied");
  }

  return Room.find({ propertyId }).sort({ createdAt: 1 });
}

//  * Get a room by ID (ownership enforced via property)
export async function getRoomById(landlordId: string, roomId: string) {
  const room = await Room.findById(roomId);

  if (!room) {
    throw Errors.notFound("Room does not exist");
  }

  const property = await Property.findOne({
    _id: room.propertyId,
    landlordId,
  });

  if (!property) {
    throw Errors.notFound("Access denied");
  }

  return room;
}

// Update room details

export async function updateRoom(
  landlordId: string,
  roomId: string,
  update: updateRoomServiceType,
) {
  const room = await Room.findById(roomId);

  if (!room) {
    throw Errors.notFound("Room not found");
  }

  const property = await Property.findOne({
    _id: room.propertyId,
    landlordId,
  });

  if (!property) {
    throw Errors.notFound("Access denied");
  }

  Object.assign(room, update);
  await room.save();

  return room;
}

//  * Delete a room
export async function deleteRoom(landlordId: string, roomId: string) {
  const room = await Room.findById(roomId);

  if (!room) {
    throw Errors.notFound("Room does not exist");
  }

  const property = await Property.findOne({
    _id: room.propertyId,
    landlordId,
  });

  if (!property) {
    throw Errors.notFound("Access denied");
  }

  await room.deleteOne();
}
