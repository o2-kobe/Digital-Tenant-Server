import { Response, Request } from "express";
import { TryCatch } from "../utils/tryCatch";
import {
  createRoom,
  deleteRoom,
  getMonthlyRevenue,
  getRoomById,
  getRoomsByProperty,
  updateRoom,
} from "../service/room.service";

export const createRoomHandler = TryCatch(
  async (req: Request, res: Response) => {
    const landlordId = res.locals.user.sub;
    const propertyId = req.params.id as string;
    const { roomLabel, rentAmount, type, bedrooms, amenities } = req.body;

    const room = await createRoom(landlordId, propertyId, {
      roomLabel,
      rentAmount,
      type,
      bedrooms,
      amenities,
    });

    return {
      status: 201,
      data: room,
    };
  },
  "CreateRoomHandler",
);

export const findAllRoomsByPropertyHandler = TryCatch(
  async (req: Request, res: Response) => {
    const landlordId = res.locals.user.sub;
    const propertyId = req.params.id as string;

    const rooms = await getRoomsByProperty(landlordId, propertyId);

    return rooms;
  },
  "GetALlRoomsByPropertyHandler",
);

export const findOneRoomHandler = TryCatch(
  async (req: Request, res: Response) => {
    const landlordId = res.locals.user.sub;
    const roomId = req.params.id as string;

    const room = await getRoomById(landlordId, roomId);

    return room;
  },
  "FindOneRoomHandler",
);

export const updateRoomHandler = TryCatch(
  async (req: Request, res: Response) => {
    const landlordId = res.locals.user.sub;
    const roomId = req.params.id as string;

    const { roomLabel, rentAmount, type, bedrooms, amenities } = req.body;

    const updatedRoom = await updateRoom(landlordId, roomId, {
      roomLabel,
      rentAmount,
      type,
      bedrooms,
      amenities,
    });

    return updatedRoom;
  },
  "UpdateRoomHandler",
);

export const deleteRoomHandler = TryCatch(
  async (req: Request, res: Response) => {
    const landlordId = res.locals.user.sub;
    const roomId = req.params.id as string;

    await deleteRoom(landlordId, roomId);
    return {
      status: 204,
      data: null,
    };
  },
  "DeleteRoomHandler",
);

export const getMonthlyRevenueHandler = TryCatch(
  async (req: Request, res: Response) => {
    const landlordId = res.locals.user.sub;

    const monthlyRevenue = await getMonthlyRevenue(landlordId);

    return monthlyRevenue;
  },
  "GetMonthlyRevenueHandler",
);
