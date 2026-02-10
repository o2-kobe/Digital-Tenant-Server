import crypto from "crypto";
import User from "../model/user.model";

export function generateRandomKey(length: number) {
  return crypto
    .randomBytes(length)
    .toString("hex")
    .slice(0, length)
    .toUpperCase();
}

export async function generateUniqueTenantCode() {
  let code;
  let exists = true;

  while (exists) {
    code = generateRandomKey(6);
    exists = !!(await User.exists({ tenantCode: code }));
  }

  return code;
}
