import { Request, Response } from "express";
import { TryCatch } from "../utils/tryCatch";
import {
  createTenancy,
  endTenancy,
  getTenanciesByRoom,
  getTenancyById,
} from "../service/tenancy.service";
import { CreateTenancyControllerInput } from "../schema/tenancy.schema";

export const createTenancyHandler = TryCatch(
  async (req: Request, res: Response) => {
    const landlordId = res.locals.user.sub;
    const { propertyId, roomId } = (
      req as unknown as CreateTenancyControllerInput
    ).params;

    const { tenantCode, startDate } = (
      req as unknown as CreateTenancyControllerInput
    ).body;

    const tenancy = await createTenancy(landlordId, propertyId, roomId, {
      tenantCode,
      startDate,
    });

    return {
      status: 201,
      data: tenancy,
    };
  },
  "CreateTenancyHandler",
);

export const findActiveTenanciesByRoomHandler = TryCatch(
  async (req: Request, res: Response) => {
    const landlordId = res.locals.user.sub;
    const roomId = req.params.id as string;

    const tenancies = await getTenanciesByRoom(roomId, landlordId);

    return tenancies;
  },
  "FindActiveTenanciesByRoomHandler",
);

export const findOneTenancyHandler = TryCatch(
  async (req: Request, res: Response) => {
    const tenancyId = req.params.id as string;
    const landlordId = res.locals.user.sub;

    const tenancy = await getTenancyById(tenancyId, landlordId);

    return tenancy;
  },
  "FindOneTenancyHandler",
);

export const endTenancyHandler = TryCatch(
  async (req: Request, res: Response) => {
    const tenancyId = req.params.id as string;
    const landlordId = res.locals.user.sub;

    const endedTenancy = await endTenancy(tenancyId, landlordId);

    return endedTenancy;
  },
  "EndTenancyHandler",
);
