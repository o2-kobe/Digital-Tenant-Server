import { Request, Response } from "express";
import { TryCatch } from "../utils/tryCatch";
import {
  createProperty,
  deleteProperty,
  getPropertiesByLandlord,
  getPropertyById,
  updateProperty,
} from "../service/property.service";

export const createPropertyHandler = TryCatch(
  async (req: Request, res: Response) => {
    const landlordId = res.locals.user._id;
    const { name, city, town, address } = req.body;

    const property = await createProperty(landlordId, {
      name,
      city,
      town,
      address,
    });

    return {
      status: 201,
      data: property,
    };
  },
  "CreatePropertyhandler",
);

export const getAllPropertiesByLanlordHandler = TryCatch(
  async (req: Request, res: Response) => {
    const landlordId = res.locals.user._id;
    const properties = await getPropertiesByLandlord(landlordId);

    return properties;
  },
  "GetPropertiesByLandlordHandler",
);

export const getOnePropertyByLandlord = TryCatch(
  async (req: Request, res: Response) => {
    const landlordId = res.locals.user._id;
    const propertyId = req.params.id as string;

    const property = await getPropertyById(propertyId, landlordId);
    return property;
  },
  "GetOnePropertyByLandlord",
);

export const getOnePropertyHandler = TryCatch(
  async (req: Request, res: Response) => {
    const propertyId = req.params.id as string;

    const property = await getPropertyById(propertyId);
    return property;
  },
  "GetOnePropertyHandler",
);

export const updatePropertyHandler = TryCatch(
  async (req: Request, res: Response) => {
    const propertyId = req.params.id as string;
    const landlordId = res.locals.user._id;

    const { name, city, town, address } = req.body;

    const updatedProperty = await updateProperty(propertyId, landlordId, {
      name,
      city,
      town,
      address,
    });

    return updatedProperty;
  },
  "UpdatePropertyHandler",
);

export const deletePropertyHandler = TryCatch(
  async (req: Request, res: Response) => {
    const propertyId = req.params.id as string;
    const landlordId = res.locals.user._id;

    await deleteProperty(propertyId, landlordId);

    return { status: 204, data: null };
  },
  "DeletePropertyHandler",
);
