import { QueryFilter } from "mongoose";
import User, { UserDocument } from "../model/user.model";
import { CreateUserInput } from "../schema/user.schema";
import { generateUniqueTenantCode } from "../utils/helper";
import { Errors } from "../utils/factoryErrors";
import Tenancy from "../model/tenancy.model";

export async function createUser(input: CreateUserInput) {
  const userData: Partial<UserDocument> = {
    fullName: input.fullName,
    email: input.email,
    password: input.password,
    role: input.role,
    phoneNumber: input.phoneNumber,
  };

  if (input.role === "tenant") {
    userData.tenantCode = await generateUniqueTenantCode();
  }

  return await User.create(userData);
}

export async function findUser(query: QueryFilter<UserDocument>) {
  const user = await User.findOne(query);

  if (!user) {
    throw Errors.forbidden("Invalid credentials");
  }

  return user;
}

export async function getCurrentUser(userId: string) {
  const user = await User.findById(userId)
    .select({
      email: 1,
      role: 1,
      fullName: 1,
      tenantCode: 1,
      phoneNumber: 1,
      _id: 0,
    })
    .lean();

  if (!user) throw Errors.forbidden("Invalid credentials");

  return user;
}

export async function getActiveTenantsOfLandlord(landlordId: string) {
  const user = await User.findById(landlordId).lean();

  if (!user || user.role === "tenant") {
    throw Errors.badRequest("You cannot perform this action");
  }

  return await Tenancy.find({ landlordId, isActive: true })
    .select({
      tenantId: 1,
      roomId: 1,
      property: 1,
    })
    .populate([
      {
        path: "tenantId",
        select: "id fullName tenantCode phoneNumber",
      },
      {
        path: "roomId",
        select: "id roomLabel",
      },
      {
        path: "propertyId",
        select: "id name",
      },
    ]);
}

export async function deleteUser(userId: string) {
  return await User.findByIdAndDelete(userId);
}

export async function validatePassword({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select(
    "+password",
  );

  if (!user) return false;

  const isValid = await user.comparePassword(password);

  if (!isValid) return false;

  return user;
}
