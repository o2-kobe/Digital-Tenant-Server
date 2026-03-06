import { AppError } from "./AppError";

export const Errors = {
  notFound: (msg: string) => new AppError(msg, 404),
  badRequest: (msg: string) => new AppError(msg, 400),
  conflict: (msg: string) => new AppError(msg, 409),
  forbidden: (msg: string) => new AppError(msg, 403),
  unauthorized: (msg: string) => new AppError(msg, 401),
};
