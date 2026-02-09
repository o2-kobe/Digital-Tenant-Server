import { Document, model, Schema, Types } from "mongoose";

export interface RoomDocument extends Document {
  propertyId: Types.ObjectId;
  roomLabel: string;
  rentAmount: number;
  isOccupied: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const roomSchema = new Schema<RoomDocument>(
  {
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    roomLabel: { type: String, required: true, minLength: 3, maxLength: 100 },
    rentAmount: { type: Number, required: true, default: 0, min: 0 },
    isOccupied: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);
roomSchema.index({ propertyId: 1, isOccupied: 1 });

roomSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform(_doc, ret: any) {
    ret.id = ret._id;
    delete ret._id;
  },
});

const Room = model<RoomDocument>("Room", roomSchema);

export default Room;
