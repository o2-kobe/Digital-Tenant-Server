import { Request, Response } from "express";
import logger from "../utils/logger";
import { AppError } from "../utils/AppError";

export const TryCatch =
  (
    logicBlock: (req: Request, res: Response) => Promise<any>,
    context: string,
  ) =>
  async (req: Request, res: Response) => {
    try {
      const result = await logicBlock(req, res);

      if (res.headersSent) return;

      if (
        result &&
        typeof result === "object" &&
        !Array.isArray(result) &&
        "status" in result &&
        "data" in result
      ) {
        return res.status(result.status).json({
          status: "success",
          data: result.data,
        });
      }

      return res.status(200).json({
        status: "success",
        data: result,
      });
    } catch (error: any) {
      logger.error({
        context,
        message: error.message,
        stack: error.stack,
      });

      //AppError (Service / Business errors)
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          status: error.status,
          message: error.message,
        });
      }

      //  Mongoose / DB errors
      if (error.name === "CastError") {
        return res.status(400).json({
          status: "fail",
          message: "Invalid ID format",
        });
      }

      if (error.name === "ValidationError") {
        return res.status(400).json({
          status: "fail",
          message: error.message,
        });
      }

      // Duplicate Key Error
      if (error.code === 11000) {
        return res.status(409).json({
          status: "fail",
          message: "Duplicate field value entered",
        });
      }

      // JWT Errors
      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({
          status: "fail",
          message: "Invalid token",
        });
      }

      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          status: "fail",
          message: "Token expired",
        });
      }

      //  Unknown / Programming errors

      return res.status(500).json({
        status: "error",
        message: "Something went wrong. Please try again later.",
      });
    }
  };
