import { QueryFilter, UpdateQuery } from "mongoose";
import Session, { Session as SessionDocument } from "../model/session.model";
import { signJwt, verifyJwt } from "../utils/jwt.utils";
import { get } from "lodash";
import User from "../model/user.model";
import config from "config";

export async function createSession(userId: string, userAgent: string) {
  const session = await Session.create({ user: userId, userAgent });

  return session;
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

export async function deleteAllSessions() {
  return await Session.deleteMany({});
}

const accessTokenTtl = config.get<string>("accessTokenTtl");

export async function reIssueAccessToken({
  refreshToken,
}: {
  refreshToken: string;
}): Promise<string | false> {
  // Extract decoded from the verifiedJWT
  const { decoded } = verifyJwt(refreshToken);

  const sessionId = get(decoded, "session");

  // If there is not decoded or sessionId, then return
  if (!decoded || !sessionId) return false;

  // Find session using sessionId
  const session = await Session.findById(sessionId).lean();

  // if no session as such return
  if (!session || !session.valid) return false;

  // Find user with session.user
  const user = await User.findById(session.user).lean();

  if (!user) return false;

  const accessToken = signJwt(
    { ...user, session: session._id },
    { expiresIn: Number(accessTokenTtl) },
  );

  return accessToken;
}
