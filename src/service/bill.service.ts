import Bill from "../model/bill.model";
import Tenancy from "../model/tenancy.model";
import { createBillServiceType } from "../schema/bill.schema";
import { Errors } from "../utils/factoryErrors";

export async function createBill(
  tenancyId: string,
  landlordId: string,
  data: createBillServiceType,
) {
  // Validate tenancy
  const tenancy = await Tenancy.findOne({ _id: tenancyId, landlordId }).lean();

  if (!tenancy) throw Errors.notFound("No tenancy found");

  return await Bill.create({ ...data, tenancyId, status: "pending" });
}

export async function getBillsByTenancy(tenancyId: string, landlordId: string) {
  // Validate tenancy and ownership
  const tenancy = await Tenancy.findOne({ _id: tenancyId, landlordId }).lean();

  if (!tenancy) throw Errors.notFound("No tenancy found");

  return await Bill.find({ tenancyId });
}

export async function getBillsByTenant(tenantId: string) {
  const tenancies = await Tenancy.find({ tenantId, isActive: true }).lean();

  if (!tenancies.length) throw Errors.notFound("No active tenancies found");

  return await Bill.find({
    tenancyId: { $in: tenancies.map((t) => t._id) },
  });
}

export async function markBillAsPaid(
  billId: string,
  paidAt: Date,
  tenantId: string,
) {
  // We cannot pay for an inactive tenancy
  const tenancy = await Tenancy.findOne({ tenantId, isActive: true }).lean();

  if (!tenancy) throw Errors.notFound("No tenancy found");

  const bill = await Bill.findOneAndUpdate(
    { _id: billId, tenancyId: tenancy._id },
    { status: "paid", paidAt },
    { new: true },
  );

  if (!bill) throw Errors.notFound("Bill does not exist");

  return bill;
}

export async function markBillAsCompleted(billId: string, landlordId: string) {
  const bill = await Bill.findById(billId).lean();
  if (!bill) throw Errors.notFound("Bill does not exist");

  const tenancy = await Tenancy.findOne({
    _id: bill.tenancyId,
    landlordId,
    isActive: true,
  }).lean();

  if (!tenancy) {
    throw Errors.forbidden("You do not own this bill");
  }

  return await Bill.findByIdAndUpdate(
    billId,
    { status: "completed", completedAt: new Date() },
    { new: true },
  );
}
