import { Request, Response } from "express";
import { TryCatch } from "../utils/tryCatch";
import {
  createBill,
  getBillsByTenancy,
  getBillsByTenant,
  markBillAsCompleted,
  updateBill,
} from "../service/bill.service";

export const createBillHandler = TryCatch(
  async (req: Request, res: Response) => {
    const landlordId = res.locals.user._id;
    const tenancyId = req.params.id as string;
    const { billType, description, amount, dueDate } = req.body;

    const bill = await createBill(tenancyId, landlordId, {
      billType,
      description,
      amount,
      dueDate,
    });

    return { status: 201, data: bill };
  },
  "CreateBillHandler",
);

export const findBillsByTenancyHandler = TryCatch(
  async (req: Request, res: Response) => {
    const landlordId = res.locals.user._id;
    const tenancyId = req.params.id as string;

    const bills = await getBillsByTenancy(tenancyId, landlordId);

    return bills;
  },
  "FindBillsByTenancyHandler",
);

export const findBillsByTenantHandler = TryCatch(
  async (req: Request, res: Response) => {
    const tenantId = res.locals.user._id;

    const bills = await getBillsByTenant(tenantId);

    return bills;
  },
  "FindBillsByTenantHandler",
);

export const updateBillHandler = TryCatch(
  async (req: Request, res: Response) => {
    const landlordId = res.locals.user._id;
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

export const MarkBillAsPaidHandler = TryCatch(
  async (req: Request, res: Response) => {
    const tenantId = res.locals.user._id;
    const billId = req.params.id as string;

    const paidBill = await markBillAsCompleted(billId, tenantId);

    return paidBill;
  },
  "MarkBillAsPaidHandler",
);

export const completeBillHandler = TryCatch(
  async (req: Request, res: Response) => {
    const landlordId = res.locals.user._id;
    const billId = req.params.id as string;

    const completedBill = await markBillAsCompleted(billId, landlordId);

    return completedBill;
  },
  "CompleteBillHandler",
);
