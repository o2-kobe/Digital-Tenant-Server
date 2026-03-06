import { QueryFilter, UpdateQuery } from "mongoose";
import Session, { Session as SessionDocument } from "../model/session.model";
import { signJwt } from "../utils/jwt.utils";
import User from "../model/user.model";
import { StringValue } from "ms";
import config from "config";
import crypto from "crypto";
import { Errors } from "../utils/factoryErrors";

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function createSession(
  userId: string,
  userAgent: string,
  ip: string | undefined,
) {
  const rawRefreshToken = crypto.randomBytes(64).toString("hex");

  const session = await Session.create({
    user: userId,
    userAgent,
    ip,
    refreshToken: hashToken(rawRefreshToken),
  });

  return { session, rawRefreshToken };
}

export async function getSessions(query: QueryFilter<SessionDocument>) {
  const sessions = await Session.find(query).lean();

  return sessions;
}

export async function updateSession(
  query: QueryFilter<SessionDocument>,
  update: UpdateQuery<SessionDocument>,
) {
  return await Session.updateOne(query, update);
}

const accessTokenTtl = config.get<StringValue>("accessTokenTtl");

export async function reIssueAccessToken({
  refreshToken,
}: {
  refreshToken: string;
}) {
  const hashed = hashToken(refreshToken);

  const session = await Session.findOne({
    refreshToken: hashed,
    valid: true,
  }).lean();

  if (!session) throw Errors.unauthorized("Invalid tokens");

  const user = await User.findById(session.user);

  if (!user) return false;

  // Rotate refresh token
  const newRawRefreshToken = crypto.randomBytes(64).toString("hex");

  session.refreshToken = hashToken(newRawRefreshToken);
  await session.save();

  const accessToken = signJwt(
    {
      sub: user._id,
      role: user.role,
      session: session._id,
    },
    {
      expiresIn: accessTokenTtl,
    },
  );

  return { accessToken, refreshToken: newRawRefreshToken };
}
