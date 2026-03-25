import { Response, Request } from "express";
import {
  createUser,
  deleteUser,
  getCurrentUser,
  getTenantsOfLandlord,
} from "../service/user.service";
import { TryCatch } from "../utils/tryCatch";

export const createUserHandler = TryCatch(
  async (req: Request, res: Response) => {
    const { passwordConfirm, ...userData } = req.body;
    const user = await createUser(userData);

    return { status: 201, data: user };
  },
  "CreateUserHandler",
);

export const getCurrentUserHandler = TryCatch(
  async (req: Request, res: Response) => {
    const userId = res.locals.user.sub;
    const user = await getCurrentUser(userId);

    return user;
  },
  "GetCurrentUserHandler",
);

export const findTenantsOfLandlordHandler = TryCatch(
  async (req: Request, res: Response) => {
    const landlordId = res.locals.user.sub;

    const tenants = await getTenantsOfLandlord(landlordId);

    return tenants;
  },
  "FindTenantsOfLandlordHandler",
);

export const deleteUserHandler = TryCatch(
  async (req: Request, res: Response) => {
    const userId = res.locals.user.sub;
    await deleteUser(userId);

    return null;
  },
  "DeleteUserHandler",
);
