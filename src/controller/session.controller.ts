import { Request, Response } from "express";
import { validatePassword } from "../service/user.service";
import {
  createSession,
  getSessions,
  updateSession,
} from "../service/session.service";
import config from "config";
import logger from "./../utils/logger";
import { signJwt } from "../utils/jwt.utils";

const accessTokenTtl = config.get<string>("accessTokenTtl");
const refreshTokenTtl = config.get<string>("refreshTokenTtl");

export async function createSessionHandler(req: Request, res: Response) {
  try {
    // Validate the user's password
    const { email, password } = req.body;
    const user = await validatePassword({ email, password });

    if (!user) {
      return res.status(401).send("Invalid credentials");
    }

    // Create a session
    const session = await createSession(
      String(user._id),
      req.get("user-Agent") || "",
    );

    const accessToken = signJwt(
      { ...user, session: session._id },
      { expiresIn: Number(accessTokenTtl) },
    );

    const refreshToken = signJwt(
      { session: session._id },
      { expiresIn: Number(refreshTokenTtl) },
    );

    res.status(200).send({ accessToken, refreshToken });
  } catch (error) {
    logger.error(error);
    res.status(401).json({ status: "error", message: "Failed to log in" });
  }
}

export async function deleteSessionHandler(req: Request, res: Response) {
  try {
    const sessionId = res.locals.user.session;
    await updateSession({ _id: sessionId }, { $set: { valid: false } });
    res.status(204).send({ accessToken: null, refreshToken: null });
  } catch (error) {
    logger.error(error);
    res.sendStatus(500).send({ message: "Something went wrong" });
  }
}

export async function getSessionsHandler(req: Request, res: Response) {
  try {
    const userId = res.locals.user._id;
    const sessions = await getSessions({ user: userId, valid: true });
    res.send(sessions);
  } catch (error) {
    res.status(500).send({ message: "Something went wrong" });
  }
}
