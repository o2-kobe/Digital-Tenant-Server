import Property from "../model/property.model";
import {
  createPropertyServiceType,
  updatePropertyServiceType,
} from "../schema/property.schema";
import { Errors } from "../utils/factoryErrors";

export async function createProperty(
  landlordId: string,
  data: createPropertyServiceType,
) {
  return await Property.create({ landlordId, ...data });
}

export async function getPropertiesByLandlord(landlordId: string) {
  return await Property.find({ landlordId }).sort({ createdAt: -1 });
}

export async function getPropertyById(propertyId: string, landlordId?: string) {
  const query: any = { _id: propertyId };

  if (landlordId) {
    query.landlordId = landlordId;
  }

  const property = await Property.findOne(query);

  if (!property) {
    throw Errors.notFound("Property does not exist");
  }

  return property;
}

export async function updateProperty(
  propertyId: string,
  landlordId: string,
  update: updatePropertyServiceType,
) {
  const updatedProperty = await Property.findOneAndUpdate(
    { _id: propertyId, landlordId },
    update,
    { new: true },
  );

  if (!updatedProperty) {
    throw Errors.notFound("Property not found or access denied");
  }

  return updatedProperty;
}

export async function deleteProperty(propertyId: string, landlordId: string) {
  const result = await Property.deleteOne({
    _id: propertyId,
    landlordId,
  });

  if (!result.deletedCount) {
    throw Errors.notFound("Property not found or access denied");
  }
}
