import { Document, model, Schema, Types } from "mongoose";

export interface RoomDocument extends Document {
  propertyId: Types.ObjectId;
  roomLabel: string;
  rentAmount: number;
  isOccupied: boolean;

  type:
    | "single"
    | "self-contained"
    | "chamber-and-hall"
    | "apartment"
    | "studio";
  bedrooms: number;
  amenities: string[];

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

    roomLabel: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 100,
    },

    rentAmount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    isOccupied: {
      type: Boolean,
      default: false,
    },

    type: {
      type: String,
      enum: [
        "single",
        "self-contained",
        "chamber-and-hall",
        "apartment",
        "studio",
      ],
      required: true,
    },

    bedrooms: {
      type: Number,
      required: true,
      min: 0,
    },

    amenities: {
      type: [String],
      default: [],
      validate: {
        validator: function (arr: string[]) {
          return arr.every(
            (item) => typeof item === "string" && item.trim().length > 0,
          );
        },
        message: "Amenities must be a list of non-empty strings.",
      },
    },
  },
  {
    timestamps: true,
  },
);

roomSchema.index({ propertyId: 1, isOccupied: 1, type: 1 });

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
