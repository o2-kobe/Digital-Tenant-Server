import { Response, Request } from "express";
import { TryCatch } from "../utils/tryCatch";
import {
  createRoom,
  deleteRoom,
  getRoomById,
  getRoomsByProperty,
  updateRoom,
} from "../service/room.service";

export const createRoomHandler = TryCatch(
  async (req: Request, res: Response) => {
    const landlordId = res.locals.user._id;
    const propertyId = req.params.id as string;
    const { roomLabel, rentAmount } = req.body;

    const room = await createRoom(landlordId, propertyId, {
      roomLabel,
      rentAmount,
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
    const landlordId = res.locals.user._id;
    const propertyId = req.params.id as string;

    const rooms = await getRoomsByProperty(landlordId, propertyId);

    return rooms;
  },
  "GetALlRoomsByPropertyHandler",
);

export const findOneRoomHandler = TryCatch(
  async (req: Request, res: Response) => {
    const landlordId = res.locals.user._id;
    const roomId = req.params.id as string;

    const room = await getRoomById(landlordId, roomId);

    return room;
  },
  "FindOneRoomHandler",
);

export const updateRoomHandler = TryCatch(
  async (req: Request, res: Response) => {
    const landlordId = res.locals.user._id;
    const roomId = req.params.id as string;

    const { roomLabel, rentAmount } = req.body;

    const updatedRoom = await updateRoom(landlordId, roomId, {
      roomLabel,
      rentAmount,
    });

    return updatedRoom;
  },
  "",
);

export const deleteRoomHandler = TryCatch(
  async (req: Request, res: Response) => {
    const landlordId = res.locals.user._id;
    const roomId = req.params.id as string;

    await deleteRoom(landlordId, roomId);
    return {
      status: 204,
      data: null,
    };
  },
  "",
);
