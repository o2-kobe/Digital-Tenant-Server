import mongoose from "mongoose";
import Announcement from "../model/announcement.model";
import Bill from "../model/bill.model";
import Tenancy from "../model/tenancy.model";
import { CreateBillInput, UpdateBillInput } from "../schema/bill.schema";
import { Errors } from "../utils/factoryErrors";
import { convertToTitleCase } from "../utils/helper";

export async function createBill(
  tenancyId: string,
  landlordId: string,
  billData: CreateBillInput,
) {
  const session = await mongoose.startSession();

  try {
    let createdBill;

    await session.withTransaction(async () => {
      const tenancy = await Tenancy.findOne({
        _id: tenancyId,
        landlordId,
        isActive: true,
      }).session(session);

      if (!tenancy) {
        throw Errors.notFound(
          "The specified tenancy was not found or you do not have access to it.",
        );
      }

      // Prevent duplicate bills (same type + same due date)
      const existingBill = await Bill.findOne({
        tenancyId,
        billType: billData.billType,
        dueDate: billData.dueDate,
      }).session(session);

      if (existingBill) {
        throw Errors.badRequest(
          "A bill of this type already exists for the specified due date.",
        );
      }

      createdBill = await Bill.create(
        [
          {
            ...billData,
            tenancyId,
            status: "pending",
          },
        ],
        { session },
      );

      await Announcement.create(
        [
          {
            tenancyId,
            title: `New Bill: ${convertToTitleCase(billData.billType)}`,
            message: `A new ${billData.billType} bill of ${billData.amount} is due on ${billData.dueDate}`,
          },
        ],
        { session },
      );
    });

    return createdBill?.[0];
  } finally {
    session.endSession();
  }
}

// Create Bill for Rooms under Property
export async function createBillForRoomsUnderProperty(
  landlordId: string,
  propertyId: string,
  data: CreateBillInput,
) {
  const session = await mongoose.startSession();

  try {
    let result;

    await session.withTransaction(async () => {
      const tenancies = await Tenancy.find({
        propertyId,
        landlordId,
        isActive: true,
      }).session(session);

      if (!tenancies.length) {
        throw Errors.badRequest(
          "No active tenancies were found for this property.",
        );
      }

      const tenancyIds = tenancies.map((t) => t._id);

      // Prevent duplicates across all tenancies
      const existingBills = await Bill.find({
        tenancyId: { $in: tenancyIds },
        billType: data.billType,
        dueDate: data.dueDate,
      }).session(session);

      if (existingBills.length) {
        throw Errors.badRequest(
          "One or more tenants already have this bill for the specified due date.",
        );
      }

      const bills = tenancies.map((tenancy) => ({
        tenancyId: tenancy._id,
        billType: data.billType,
        description: data.description,
        amount: data.amount,
        dueDate: data.dueDate,
        status: "pending",
      }));

      const announcements = tenancies.map((tenancy) => ({
        tenancyId: tenancy._id,
        title: `New Bill: ${convertToTitleCase(data.billType)}`,
        message: `A new ${data.billType} bill of ${data.amount} is due on ${data.dueDate}`,
      }));

      await Promise.all([
        Bill.insertMany(bills, { session }),
        Announcement.insertMany(announcements, { session }),
      ]);

      return {
        message: `Bills successfully created for ${tenancies.length} tenant(s).`,
      };
    });
  } finally {
    session.endSession();
  }
}

// Get Bills By Tenancy
export async function getBillsByTenancy(tenancyId: string, landlordId: string) {
  const tenancy = await Tenancy.findOne({ _id: tenancyId, landlordId }).lean();

  if (!tenancy)
    throw Errors.notFound(
      "The requested tenancy was not found or you do not have access to it.",
    );

  return await Bill.find({ tenancyId });
}

// Get Bills of Tenant
export async function getBillsByTenant(tenantId: string) {
  const tenancies = await Tenancy.find({
    tenantId,
    isActive: true,
  }).lean();

  if (!tenancies.length)
    throw Errors.notFound("No active tenancies were found for this tenant.");

  return await Bill.find({
    tenancyId: { $in: tenancies.map((t) => t._id) },
  });
}

// Update Bill
export async function updateBill(
  landlordId: string,
  billId: string,
  update: UpdateBillInput,
) {
  if (!Object.keys(update).length) {
    throw Errors.badRequest("No update fields were provided.");
  }

  const bill = await Bill.findById(billId).lean();

  if (!bill) {
    throw Errors.notFound("The bill you are trying to update was not found.");
  }

  // Prevent editing finalized bills
  if (bill.status === "completed") {
    throw Errors.badRequest("Completed bills cannot be modified.");
  }

  const tenancy = await Tenancy.findOne({
    _id: bill.tenancyId,
    landlordId,
    isActive: true,
  }).lean();

  if (!tenancy) {
    throw Errors.forbidden("You are not authorized to modify this bill.");
  }

  return await Bill.findByIdAndUpdate(billId, update, {
    returnDocument: "after",
  });
}

// Mark Bill As Paid
export async function markBillAsPaid(billId: string, tenantId: string) {
  const bill = await Bill.findById(billId);

  if (!bill) {
    throw Errors.notFound("The specified bill was not found.");
  }

  const tenancy = await Tenancy.findOne({
    _id: bill.tenancyId,
    tenantId,
    isActive: true,
  }).lean();

  if (!tenancy) {
    throw Errors.forbidden("You are not authorized to mark this bill as paid.");
  }

  // Status validation
  if (bill.status === "paid") {
    throw Errors.badRequest("This bill has already been marked as paid.");
  }

  if (bill.status === "completed") {
    throw Errors.badRequest("Completed bills cannot be modified.");
  }

  bill.status = "paid";
  bill.paidAt = new Date();

  await bill.save();

  return bill;
}

// Mark Bill as Completed
export async function markBillAsCompleted(billId: string, landlordId: string) {
  const bill = await Bill.findById(billId);

  if (!bill) {
    throw Errors.notFound("The bill you are trying to complete was not found.");
  }

  const tenancy = await Tenancy.findOne({
    _id: bill.tenancyId,
    landlordId,
    isActive: true,
  }).lean();

  if (!tenancy) {
    throw Errors.forbidden("You are not authorized to update this bill.");
  }

  // Enforce lifecycle: only paid → completed
  if (bill.status !== "paid") {
    throw Errors.badRequest("Only paid bills can be marked as completed.");
  }

  bill.status = "completed";
  bill.completedAt = new Date();

  await bill.save();

  return bill;
}

// Get Bills for Room
export async function getBillsForRoom(roomId: string, landlordId: string) {
  const tenancy = await Tenancy.findOne({
    roomId,
    landlordId,
    isActive: true,
  });

  if (!tenancy)
    throw Errors.notFound("No active tenancy was found for this room.");

  return await Bill.find({ tenancyId: tenancy._id });
}

// Get Bills of Property
export async function getBillsOfProperty(
  landlordId: string,
  propertyId: string,
) {
  const tenancies = await Tenancy.find({
    landlordId,
    propertyId,
  }).select("_id");

  if (!tenancies.length) {
    throw Errors.notFound("No tenancies were found for this property.");
  }

  const tenancyIds = tenancies.map((t) => t._id);

  const bills = await Bill.aggregate([
    {
      $match: {
        tenancyId: { $in: tenancyIds },
      },
    },
    {
      // Group by "unique bill identity"
      $group: {
        _id: {
          billType: "$billType",
          amount: "$amount",
          dueDate: "$dueDate",
          description: "$description",
        },
        bill: { $first: "$$ROOT" }, // pick one representative
      },
    },
    {
      $replaceRoot: { newRoot: "$bill" },
    },
    {
      $sort: { dueDate: -1 },
    },
  ]);

  return bills;
}
