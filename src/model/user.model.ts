import { model, Schema, Document } from "mongoose";
import bcrypt from "bcrypt";
import config from "config";
import { generateRandomKey } from "../utils/helper";

export interface UserDocument extends Document {
  email: string;
  username: string;
  password: string;
  role: "tenant" | "landlord";
  tenantCode: string;

  comparePassword: (candidatePassword: string) => Promise<boolean>;

  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserDocument>(
  {
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true },
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
      default: "tenant",
      enum: ["tenant", "landlord"],
    },
    tenantCode: {
      type: String,
      unique: true,
      sparse: true, //  allows landlords to have null
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre("save", async function () {
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(config.get<number>("saltWorkFactor"));
    const hash = await bcrypt.hash(this.password, salt);

    this.password = hash;
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
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = model<UserDocument>("User", userSchema);

export default User;
