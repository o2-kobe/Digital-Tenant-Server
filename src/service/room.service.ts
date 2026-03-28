import Room from "../model/room.model";
import Property from "../model/property.model";
import { CreateRoomInput, UpdateRoomInput } from "../schema/room.schema";
import { Errors } from "../utils/factoryErrors";
import Tenancy from "../model/tenancy.model";

// Create Room
export async function createRoom(
  landlordId: string,
  propertyId: string,
  data: CreateRoomInput,
) {
  const property = await Property.findOne({
    _id: propertyId,
    landlordId,
  });

  if (!property) {
    throw Errors.notFound("Property not found or access denied");
  }

  // Prevent duplicate room labels within same property
  const existingRoom = await Room.findOne({
    propertyId,
    roomLabel: data.roomLabel,
  }).lean();

  if (existingRoom) {
    throw Errors.badRequest(
      "A room with this label already exists for this property.",
    );
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
  const room = await Room.findById(roomId).populate({
    path: "propertyId",
    select: "id name",
  });

  if (!room) {
    throw Errors.notFound("Room does not exist");
  }

  const property = await Property.findOne({
    _id: room.propertyId,
    landlordId,
  }).lean();

  if (!property) {
    throw Errors.notFound("You are not authorized to access this room.");
  }

  return room;
}

// Update room details
export async function updateRoom(
  landlordId: string,
  roomId: string,
  update: UpdateRoomInput,
) {
  if (!Object.keys(update).length) {
    throw Errors.badRequest("No update fields were provided.");
  }

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

  // Prevent Duplicate labels on Update
  if (update.roomLabel) {
    const existingRoom = await Room.findOne({
      propertyId: room.propertyId,
      roomLabel: update.roomLabel,
      _id: { $ne: roomId },
    }).lean();

    if (existingRoom) {
      throw Errors.badRequest(
        "A room with this label already exists for this property.",
      );
    }
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

  // Prevent deleting rooms which are occupied
  if (room.isOccupied) {
    throw Errors.badRequest(
      "This room cannot be deleted because it is currently occupied.",
    );
  }

  //  Prevent deleting room with active tenancy (extra safety)
  const activeTenancy = await Tenancy.findOne({
    roomId,
    isActive: true,
  }).lean();

  if (activeTenancy) {
    throw Errors.badRequest(
      "This room cannot be deleted because it has an active tenancy.",
    );
  }

  await room.deleteOne();
}

export async function getMonthlyRevenue(landlordId: string) {
  const tenancies = await Tenancy.find({ landlordId, isActive: true }).lean();

  if (!tenancies.length) return 0;

  const roomIds = tenancies.map((tenancy) => tenancy.roomId);

  const rooms = await Room.find({ _id: { $in: roomIds } }).lean();

  const monthlyRevenue = rooms.reduce((acc, room) => acc + room.rentAmount, 0);

  return monthlyRevenue;
}

export async function getAvailableRooms() {
  return await Room.find({ isOccupied: false }).populate({
    path: "propertyId",
    select: "city town address name",
  });
}

export async function getTenantRooms(tenantId: string) {
  const tenancies = await Tenancy.find({
    tenantId,
    isActive: true,
  }).lean();

  const roomIds = tenancies.map((t) => t.roomId);

  if (!roomIds.length) return [];

  return await Room.find({ _id: { $in: roomIds } }).populate({
    path: "propertyId",
    select: "city town address name",
  });
}
