import { Document, model, Schema, Types } from "mongoose";

export type BookingStatus = "requested" | "approved" | "rejected";

export interface BookingDocument extends Document {
  roomId: Types.ObjectId;
  tenantId: Types.ObjectId;
  propertyId: Types.ObjectId;

  status: BookingStatus;

  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<BookingDocument>(
  {
    roomId: {
      type: Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },

    propertyId: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },

    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    status: {
      type: String,
      enum: ["requested", "approved", "rejected"],
      default: "requested",
    },
  },
  {
    timestamps: true,
  },
);

bookingSchema.index({ roomId: 1, status: 1 });

bookingSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform(_doc, ret: any) {
    ret.id = ret._id;
    delete ret._id;
  },
});

const Booking = model<BookingDocument>("Booking", bookingSchema);

export default Booking;
