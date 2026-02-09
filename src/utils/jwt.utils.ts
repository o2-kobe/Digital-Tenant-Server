import jwt from "jsonwebtoken";
import config from "config";

const privateKey = config.get<string>("privateKey");
const publicKey = config.get<string>("publicKey");

export function signJwt(object: Object, options?: jwt.SignOptions) {
  return jwt.sign(object, privateKey, {
    ...(options && options),
    algorithm: "RS256",
  });
}

export function verifyJwt(token: string) {
  try {
    const decoded = jwt.verify(token, publicKey);
    return {
      decoded,
      valid: true,
      expired: false,
    };
  } catch (error: any) {
    return {
      decoded: null,
      expired: (error.message = "JWT expired"),
      valid: false,
    };
  }
}
