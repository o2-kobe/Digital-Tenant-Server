import { Request, Response, NextFunction } from "express";
import { get } from "lodash";
import { verifyJwt } from "../utils/jwt.utils";
import Session from "../model/session.model";

export async function requireUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const accessToken = get(req, "headers.authorization", "").replace(
    /^Bearer\s/,
    "",
  );

  if (!accessToken) {
    return res.status(401).json({ message: "Access token required" });
  }

  const { decoded, valid, expired } = verifyJwt(accessToken);

  if (!valid || !decoded) {
    return res.status(401).json({
      message: expired ? "Access token expired" : "Invalid access token",
    });
  }

  // Validate session exists and is still valid
  const session = await Session.findById(decoded.session);

  if (!session || !session.valid) {
    return res.status(401).json({ message: "Session is invalid or expired" });
  }

  // Update last activity timestamp
  await Session.updateOne(
    { _id: session._id },
    { $set: { lastActiveAt: new Date() } },
  );

  // Attach user payload to response locals
  res.locals.user = decoded;

  return next();
}
