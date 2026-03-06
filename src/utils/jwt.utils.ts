import jwt, { SignOptions, JwtPayload } from "jsonwebtoken";
import config from "config";

const JWT_SECRET = config.get<string>("JWT_SECRET");
const issuer = config.get<string>("issuer");
const audience = config.get<string>("audience");

export interface AccessTokenPayload extends JwtPayload {
  sub: string;
  role: string;
  session: string;
}

export function signJwt(payload: object, options?: SignOptions): string {
  return jwt.sign(payload, JWT_SECRET, {
    algorithm: "HS256",
    issuer,
    audience,
    ...options,
  });
}

export function verifyJwt(token: string): {
  decoded: AccessTokenPayload | null;
  valid: boolean;
  expired: boolean;
} {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ["HS256"],
      issuer,
      audience,
    }) as AccessTokenPayload;

    return {
      decoded,
      valid: true,
      expired: false,
    };
  } catch (error: any) {
    return {
      decoded: null,
      valid: false,
      expired: error.name === "TokenExpiredError",
    };
  }
}
