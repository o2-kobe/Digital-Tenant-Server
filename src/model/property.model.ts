import { Document, model, Schema, Types } from "mongoose";

export interface PropertyDocument extends Document {
  landlordId: Types.ObjectId;
  name: string;
  city: string;
  town: string;
  image: string;
  address: string;

  createdAt: Date;
  updatedAt: Date;
}

const propertySchema = new Schema<PropertyDocument>(
  {
    landlordId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true, minLength: 3 },
    city: { type: String, required: true, minLength: 3 },
    town: { type: String, required: true, minLength: 3 },
    image: { type: String, required: true, minLength: 3 },
    address: { type: String, required: true, minLength: 3 }, //make this optional
  },
  {
    timestamps: true,
  },
);

// Create index for document
propertySchema.index({ landlordId: 1, createdAt: -1 });

propertySchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform(_doc, ret: any) {
    ret.id = ret._id;
    delete ret._id;
  },
});

const Property = model<PropertyDocument>("Property", propertySchema);

export default Property;
