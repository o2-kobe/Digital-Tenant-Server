import { NextFunction, Request, Response } from "express";
import { ZodError, ZodType, z } from "zod";

const validateResource =
  <T extends ZodType<any, any, any>>(schema: T) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      }) as z.infer<T>;

      // Now properly typed
      if (parsed.body) req.body = parsed.body;
      if (parsed.query) req.query = parsed.query;
      if (parsed.params) req.params = parsed.params;

      next();
    } catch (error: any) {
      if (error instanceof ZodError) {
        const formatted = error.issues.map((e) => ({
          path: e.path.join("."), // convert path array to string
          message: e.message,
        }));

        return res.status(400).json({
          status: "fail",
          message: "Validation failed",
          errors: formatted,
        });
      }

      // Fallback for unexpected errors
      return res.status(500).json({
        status: "error",
        message: "Something went wrong",
      });
    }
  };

export default validateResource;
