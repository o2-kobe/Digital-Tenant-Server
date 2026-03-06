import { Document, model, Schema, Types } from "mongoose";

export interface Session extends Document {
  user: Types.ObjectId;
  userAgent: string;
  valid: boolean;
  ip: string;
  lastActiveAt: Date;
  refreshToken: string;
  createdAt: Date;
  updatedAt: Date;
}

const sessionSchema = new Schema<Session>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    userAgent: { type: String, required: true },
    valid: { type: Boolean, default: true, required: true },
    ip: { type: String },
    lastActiveAt: { type: Date, default: Date.now },
    refreshToken: { type: String, required: true },
  },
  {
    timestamps: true,
  },
);

sessionSchema.set("toJSON", {
  versionKey: false,
  transform(_doc, ret: any) {
    ret.id = ret._id;
    delete ret._id;
  },
});

const Session = model("Session", sessionSchema);

export default Session;
