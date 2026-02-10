import Tenancy from "../model/tenancy.model";
import Room from "../model/room.model";
import Property from "../model/property.model";
import User from "../model/user.model";
import { Errors } from "../utils/factoryErrors";

type CreateTenancyInput = {
  landlordId: string; // from auth
  propertyId: string; // from params
  roomId: string; // from params
  tenantCode: string; // from payload
  startDate: Date;
};

export async function createTenancy({
  landlordId, //from the user which is the landlord
  propertyId, //from params
  roomId, //from params
  tenantCode, //from payload
  startDate, //fro, payload
}: CreateTenancyInput) {
  // Resolve tenant
  const tenant = await User.findOne({ tenantCode }).select("_id role").lean();
  if (!tenant) {
    throw Errors.notFound("Tenant not found");
  }

  if (tenant.role !== "tenant") {
    throw Errors.badRequest("User is not a tenant");
  }

  // Verify property ownership
  const property = await Property.findOne({
    _id: propertyId,
    landlordId,
  }).lean();

  if (!property) {
    throw Errors.forbidden("You do not own this property");
  }

  // Verify room belongs to property
  const room = await Room.findOne({
    _id: roomId,
    propertyId,
  }).lean();

  if (!room) {
    throw Errors.notFound("Room does not belong to this property");
  }

  // Ensure room is vacant
  const activeTenancy = await Tenancy.findOne({
    roomId,
    isActive: true,
  }).lean();

  if (activeTenancy) {
    throw Errors.conflict("Room already has an active tenancy");
  }

  // Create tenancy
  return await Tenancy.create({
    tenantId: tenant._id,
    landlordId,
    propertyId,
    roomId,
    startDate,
    endDate: null,
    isActive: true,
  });
}

export async function getActiveTenancyByRoom(
  roomId: string,
  landlordId: string,
) {
  return await Tenancy.findOne({ roomId, landlordId, isActive: true }).lean();
}

export async function endTenancy(tenancyId: string, landlordId: string) {
  const tenancy = await Tenancy.findOneAndUpdate(
    { _id: tenancyId, landlordId },
    { isActive: false, endDate: new Date() },
    { new: true },
  );

  if (!tenancy) throw Errors.notFound("Tenancy does not exist");

  return tenancy;
}

export async function getTenancyById(tenancyId: string, landlordId: string) {
  const tenancy = await Tenancy.findOne({ _id: tenancyId, landlordId });

  if (!tenancy) throw Errors.notFound("Tenancy does not exist");

  return tenancy;
}
