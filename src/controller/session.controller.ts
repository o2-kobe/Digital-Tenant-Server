import { Request, Response } from "express";
import { validatePassword } from "../service/user.service";
import {
  createSession,
  getSessions,
  reIssueAccessToken,
  updateSession,
} from "../service/session.service";
import config from "config";
import logger from "./../utils/logger";
import { signJwt } from "../utils/jwt.utils";
import { StringValue } from "ms";

const accessTokenTtl = config.get<StringValue>("accessTokenTtl");
const refreshTokenTtl = config.get<StringValue>("refreshTokenTtl");

export async function createSessionHandler(req: Request, res: Response) {
  try {
    // Validate the user's password
    const { email, password } = req.body;
    const user = await validatePassword({ email, password });

    if (!user) {
      return res.status(401).send("Invalid credentials");
    }

    // Create a session
    const { session, rawRefreshToken } = await createSession(
      String(user._id),
      req.get("user-agent") || "",
      req?.ip,
    );

    // Set secure httpOnly cookie
    res.cookie("refreshToken", rawRefreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/api/sessions/refresh",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    const accessToken = signJwt(
      { sub: user._id, role: user.role, session: session._id },
      { expiresIn: accessTokenTtl },
    );

    res.status(200).json({ accessToken });
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
    const userId = res.locals.user.sub;
    const sessions = await getSessions({ user: userId });
    res.status(200).json({ sessions });
  } catch (error) {
    res.status(500).send({ message: "Something went wrong" });
  }
}

export async function refreshAccessTokenHandler(req: Request, res: Response) {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        status: "error",
        message: "Refresh token missing",
      });
    }

    const result = await reIssueAccessToken({ refreshToken });

    if (!result) {
      res.clearCookie("refreshToken", {
        path: "/api/sessions/refresh",
      });

      return res.status(401).json({
        status: "error",
        message: "Invalid refresh token",
      });
    }

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/api/sessions/refresh",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    res.status(200).json({ accessToken: result.accessToken });
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      status: "error",
      message: "Could not refresh token",
    });
  }
}
