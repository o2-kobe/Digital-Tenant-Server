import { Document, model, Schema, Types } from "mongoose";

export interface BillDocument extends Document {
  tenancyId: Types.ObjectId;
  billType: "rent" | "electricity" | "water" | "other";
  description: string;
  amount: number;

  status: "pending" | "paid" | "completed";
  dueDate: Date;
  paidAt: Date | null;
  completedAt: Date | null;

  createdAt: Date;
  updatedAt: Date;
}

const billSchema = new Schema<BillDocument>(
  {
    tenancyId: {
      type: Schema.Types.ObjectId,
      ref: "Tenancy",
      required: true,
    },
    billType: {
      type: String,
      required: true,
      enum: ["rent", "electricity", "water", "other"],
    },
    description: { type: String, minLength: 10 },
    amount: { type: Number, min: 0, required: true },
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "paid", "completed"],
    },
    dueDate: { type: Date },
    paidAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  },
);

// Create index for billa
billSchema.index({ tenancyId: 1, status: 1 });

billSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform(_doc, ret: any) {
    ret.id = ret._id;
    delete ret._id;
  },
});

const Bill = model<BillDocument>("Bill", billSchema);

export default Bill;
