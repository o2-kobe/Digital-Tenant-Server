import { Request, Response } from "express";
import { TryCatch } from "../utils/tryCatch";
import {
  createBill,
  getBillsByTenancy,
  getBillsByTenant,
  markBillAsCompleted,
  updateBill,
  createBillForRoomsUnderProperty,
  getBillsForRoom,
  getPendingPayments,
  getBillsOfProperty,
  getTenantBills,
  markBillAsPaid,
} from "../service/bill.service";
import { AppError } from "../utils/AppError";
import logger from "../utils/logger";

export const createBillHandler = TryCatch(
  async (req: Request, res: Response) => {
    const landlordId = res.locals.user.sub;
    const roomId = req.params.id as string;
    const { billType, description, amount, dueDate } = req.body;

    const bill = await createBill(roomId, landlordId, {
      billType,
      description,
      amount,
      dueDate,
    });

    return { status: 201, data: bill };
  },
  "CreateBillHandler",
);

export async function createBillForRoomsUnderPropertyHandler(
  req: Request,
  res: Response,
) {
  try {
    const landlordId = res.locals.user.sub;
    const propertyId = req.params.id as string;
    const { billType, description, amount, dueDate } = req.body;

    const result = await createBillForRoomsUnderProperty(
      landlordId,
      propertyId,
      { billType, description, amount, dueDate },
    );

    res.status(201).json({
      status: "success",
      message: result,
    });
  } catch (error: any) {
    logger.error(`CreateBillForRoomsUnderPropertyHandler Error: ${error}`);

    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        status: error.status,
        message: error.message,
      });
    }

    res.status(500).json({
      status: "error",
      message: "Something went wrong. Please try again later.",
    });
  }
}

export const findBillsByTenancyHandler = TryCatch(
  async (req: Request, res: Response) => {
    const landlordId = res.locals.user.sub;
    const tenancyId = req.params.id as string;

    const bills = await getBillsByTenancy(tenancyId, landlordId);

    return bills;
  },
  "FindBillsByTenancyHandler",
);

export const findBillsByTenantHandler = TryCatch(
  async (req: Request, res: Response) => {
    const tenantId = res.locals.user.sub;

    const bills = await getBillsByTenant(tenantId);

    return bills;
  },
  "FindBillsByTenantHandler",
);

export const updateBillHandler = TryCatch(
  async (req: Request, res: Response) => {
    const landlordId = res.locals.user.sub;
    const billId = req.params.id as string;
    const { billType, description, amount, dueDate } = req.body;

    const updatedBill = await updateBill(landlordId, billId, {
      billType,
      description,
      amount,
      dueDate,
    });

    return updatedBill;
  },
  "UpdateBillHandler",
);

export const markBillAsPaidHandler = TryCatch(
  async (req: Request, res: Response) => {
    const tenantId = res.locals.user.sub;
    const billId = req.params.id as string;

    const paidBill = await markBillAsPaid(billId, tenantId);

    return paidBill;
  },
  "MarkBillAsPaidHandler",
);

export const completeBillHandler = TryCatch(
  async (req: Request, res: Response) => {
    const landlordId = res.locals.user.sub;
    const billId = req.params.id as string;

    const completedBill = await markBillAsCompleted(billId, landlordId);

    return completedBill;
  },
  "CompleteBillHandler",
);

export const findBillsForRoomHandler = TryCatch(
  async (req: Request, res: Response) => {
    const landlordId = res.locals.user.sub;
    const roomId = req.params.id as string;

    const bills = await getBillsForRoom(roomId, landlordId);

    return bills;
  },
  "FindBillsForRoomHandler",
);

export const findBillsForPropertyHandler = TryCatch(
  async (req: Request, res: Response) => {
    const landlordId = res.locals.user.sub;
    const propertyId = req.params.id as string;

    const bills = await getBillsOfProperty(landlordId, propertyId);

    return bills;
  },

  "FindBillsForPropertyHandler",
);

export const findPendingPaymentsHandler = TryCatch(
  async (req: Request, res: Response) => {
    const landlordId = await res.locals.user.sub;

    const pendingPayments = await getPendingPayments(landlordId);

    return pendingPayments?.length;
  },
  "FindPendingPaymentsHandler",
);

export const findTenantBillsHandler = TryCatch(
  async (req: Request, res: Response) => {
    const tenantId = res.locals.user.sub;

    const bills = await getTenantBills(tenantId);

    return bills;
  },
  "FindTenantBillsHandler",
);
