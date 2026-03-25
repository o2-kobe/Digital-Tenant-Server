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

export function convertToTitleCase(word: string | undefined) {
  return (
    word &&
    word
      .split(" ")
      .map((word) => word.replace(word[0], word[0].toUpperCase()))
      .join(" ")
  );
}

export function normalizeMongoArray<T extends { _id: any }>(docs: T[]) {
  return docs.map(({ _id, ...rest }) => ({
    id: _id.toString(),
    ...rest,
  }));
}
