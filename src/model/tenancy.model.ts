import { Document, model, Schema, Types } from "mongoose";

export interface TenancyDocument extends Document {
  tenantId: Types.ObjectId;
  landlordId: Types.ObjectId;
  propertyId: Types.ObjectId;
  roomId: Types.ObjectId;

  startDate: Date;
  endDate: Date | null;

  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const tenancySchema = new Schema<TenancyDocument>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    landlordId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    roomId: {
      type: Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },

    startDate: { type: Date, required: true },
    endDate: { type: Date, default: null },
    isActive: { type: Boolean, default: true, required: true },
  },
  {
    timestamps: true,
  },
);

// Creating compound indexes
tenancySchema.index({ roomId: 1, isActive: 1 }, { unique: true });
tenancySchema.index({ tenantId: 1, isActive: 1 });
tenancySchema.index({ landlordId: 1, isActive: 1 });

tenancySchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform(_doc, ret: any) {
    ret.id = ret._id;
    delete ret._id;
  },
});

const Tenancy = model<TenancyDocument>("Tenancy", tenancySchema);

export default Tenancy;
