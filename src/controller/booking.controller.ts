import { Request, Response } from "express";
import { TryCatch } from "../utils/tryCatch";
import {
  createBooking,
  getBookingsForLandlordProperties,
} from "../service/booking.service";

export const createBookingHandler = TryCatch(
  async (req: Request, res: Response) => {
    const tenantId = res.locals.user.sub;
    const roomId = req.params.id as string;

    const booking = await createBooking(roomId, tenantId);

    return {
      status: 201,
      data: booking,
    };
  },
  "CreateBookingHandler",
);

export const findLandlordBookingsHandler = TryCatch(
  async (req: Request, res: Response) => {
    const landlordId = res.locals.user.sub;

    const bookings = await getBookingsForLandlordProperties(landlordId);

    return bookings;
  },
  "FindLanlordBookings",
);
