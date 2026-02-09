import { Document, model, Schema, Types } from "mongoose";

export interface BookingDocument extends Document {
  roomId: Types.ObjectId;
  fullName: string;
  contactInfo: string;

  status: "requested" | "approved" | "rejected";
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
    fullName: { type: String, minLength: 5 },
    contactInfo: { type: String, minLength: 10 },
    status: { type: String, enum: ["requested", "approved", "rejected"] },
  },
  {
    timestamps: true,
  },
);

// Create index for booking
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
