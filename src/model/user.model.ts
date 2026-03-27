import { model, Schema, Document } from "mongoose";
import { generateRandomKey } from "../utils/helper";
import argon2 from "argon2";

export interface UserDocument extends Document {
  email: string;
  fullName: string;
  password: string;
  role: "tenant" | "landlord";
  tenantCode: string;

  phoneNumber: string;

  comparePassword: (candidatePassword: string) => Promise<boolean>;

  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    fullName: { type: String, required: true },
    password: {
      type: String,
      required: true,
      minLength: 8,
      maxLength: 64,
      select: false,
    },
    role: {
      type: String,
      required: true,
      enum: ["tenant", "landlord"],
    },
    tenantCode: {
      type: String,
      unique: true,
      sparse: true, //  allows landlords to have null
      index: true,
    },
    phoneNumber: { type: String, length: 10 },
  },
  {
    timestamps: true,
  },
);

userSchema.pre("save", async function () {
  if (this.isModified("password")) {
    this.password = await argon2.hash(this.password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      timeCost: 3,
      parallelism: 1,
    });
  }
});

userSchema.pre("save", async function () {
  if (this.role === "tenant" && !this.tenantCode && this.isNew) {
    this.tenantCode = generateRandomKey(6);
  }
});

userSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret: any) => {
    ret.id = ret._id;
    delete ret._id;
  },
});

userSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  return await argon2.verify(this.password, candidatePassword);
};

const User = model<UserDocument>("User", userSchema);

export default User;
