import { Document, model, Schema, Types } from "mongoose";

export interface AnnouncementDocument extends Document {
  tenancyId: Types.ObjectId;
  title: string;
  message: string;

  createdAt: Date;
  updatedAt: Date;
}

const announcementSchema = new Schema<AnnouncementDocument>(
  {
    tenancyId: {
      type: Schema.Types.ObjectId,
      ref: "Tenancy",
      required: true,
    },
    title: { type: String, minLength: 10, required: true },
    message: { type: String, minLength: 20, required: true },
  },
  {
    timestamps: true,
  },
);

// Create index for announcement
announcementSchema.index({ tenancyId: 1, createdAt: -1 });

announcementSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform(_doc, ret: any) {
    ret.id = ret._id;
    delete ret._id;
  },
});

const Announcement = model<AnnouncementDocument>(
  "Announcement",
  announcementSchema,
);

export default Announcement;
