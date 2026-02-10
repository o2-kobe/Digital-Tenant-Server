import { QueryFilter } from "mongoose";
import User, { UserDocument } from "../model/user.model";
import { CreateUserInput } from "../schema/user.schema";
import { generateUniqueTenantCode } from "../utils/helper";

export async function createUser(input: CreateUserInput) {
  const userData: Partial<UserDocument> = {
    username: input.username,
    email: input.email,
    password: input.password,
    role: input.role,
  };

  if (input.role === "tenant") {
    userData.tenantCode = await generateUniqueTenantCode();
  }

  return await User.create(userData);
}

export async function findUser(query: QueryFilter<UserDocument>) {
  const user = await User.findOne(query);

  if (!user) {
    throw new Error("Invalid credentials");
  }

  return user;
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
  const user = await User.findOne({ email }).select("+password");

  if (!user) return false;

  const isValid = await user.comparePassword(password);

  if (!isValid) return false;

  return user;
}
