import { Request, Response } from "express";
import { TryCatch } from "../utils/tryCatch";
import {
  approveBooking,
  createBooking,
  getBookingsByLandlord,
  getBookingsByRoom,
  rejectBooking,
} from "../service/booking.service";

export const createBookingHandler = TryCatch(
  async (req: Request, res: Response) => {
    const roomId = req.params.id as string;
    const { fullName, contactInfo } = req.body;

    const booking = await createBooking(roomId, { fullName, contactInfo });

    return {
      status: 201,
      data: booking,
    };
  },
  "CreateBookingHandler",
);

export const findBookingsOfRoomHandler = TryCatch(
  async (req: Request, res: Response) => {
    const roomId = req.params.id as string;
    const landlordId = res.locals.user._id;

    const bookings = await getBookingsByRoom(roomId, landlordId);

    return bookings;
  },
  "FindBookingsOfRoomHandler",
);

export const findBookingsByLandlordHandler = TryCatch(
  async (req: Request, res: Response) => {
    const landlordId = res.locals.user._id;

    const bookings = await getBookingsByLandlord(landlordId);
    return bookings;
  },
  "FindBookingsByLandlordHandler",
);

export const approveBookingHandler = TryCatch(
  async (req: Request, res: Response) => {
    const bookingId = req.params.id as string;
    const landlordId = res.locals.user._id;

    const approvedBooking = await approveBooking(bookingId, landlordId);

    return approvedBooking;
  },
  "ApproveBookingHandler",
);

export const rejectBookingHandler = TryCatch(
  async (req: Request, res: Response) => {
    const bookingId = req.params.id as string;
    const landlordId = res.locals.user._id;

    const rejectdBooking = await rejectBooking(bookingId, landlordId);

    return rejectdBooking;
  },
  "RejectBookingHandler",
);
