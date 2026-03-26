import Property from "../model/property.model";
import Room from "../model/room.model";
import Tenancy from "../model/tenancy.model";
import {
  CreatePropertyInput,
  UpdatePropertyInput,
} from "../schema/property.schema";
import { Errors } from "../utils/factoryErrors";

// Create Property
export async function createProperty(
  landlordId: string,
  data: CreatePropertyInput,
) {
  const existingProperty = await Property.findOne({
    landlordId,
    name: data.name,
  }).lean();

  if (existingProperty) {
    throw Errors.badRequest(
      "A property with this name already exists under your account.",
    );
  }

  return await Property.create({ landlordId, ...data });
}

// Get Properties By Landlord
export async function getPropertiesByLandlord(landlordId: string) {
  return await Property.find({ landlordId }).sort({ createdAt: -1 });
}

// Get One Property by PropertyId
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

// Update Property
export async function updateProperty(
  propertyId: string,
  landlordId: string,
  update: UpdatePropertyInput,
) {
  if (!Object.keys(update).length) {
    throw Errors.badRequest("No update fields were provided.");
  }

  // Prevent creating properties with the same name
  if (update.name) {
    const existingProperty = await Property.findOne({
      landlordId,
      name: update.name,
      _id: { $ne: propertyId },
    }).lean();

    if (existingProperty) {
      throw Errors.badRequest(
        "A property with this name already exists under your account.",
      );
    }
  }

  const updatedProperty = await Property.findOneAndUpdate(
    { _id: propertyId, landlordId },
    update,
    { returnDocument: "after" },
  );

  if (!updatedProperty) {
    throw Errors.notFound("Property not found or access denied");
  }

  return updatedProperty;
}

// Delete Property
export async function deleteProperty(propertyId: string, landlordId: string) {
  const property = await Property.findOne({
    _id: propertyId,
    landlordId,
  });

  if (!property) {
    throw Errors.notFound(
      "The property was not found or you are not authorized to delete it.",
    );
  }

  // Prevent deletion if rooms exist
  const existingRooms = await Room.findOne({ propertyId }).lean();

  if (existingRooms) {
    throw Errors.badRequest(
      "This property cannot be deleted because it has associated rooms.",
    );
  }

  // Prevent deletion if tenancies exist
  const existingTenancies = await Tenancy.findOne({
    propertyId,
    isActive: true,
  }).lean();

  if (existingTenancies) {
    throw Errors.badRequest(
      "This property cannot be deleted because it has active tenancies.",
    );
  }

  await property.deleteOne();
}
