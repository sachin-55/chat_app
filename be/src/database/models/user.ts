import { model, Schema } from "mongoose";
import { IUser } from "../interface/user";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "@/config";
import { AppError } from "@/utils";

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  avatar: { type: String },
  password: { type: String, required: true, select: false },
  lastSeen: { type: Date },
  isOnline: { type: Boolean, default: false },
  socketId: { type: String, select: false },
});

userSchema.pre("save", async function () {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

userSchema.methods.validatePassword = async function (
  candidatePassword: string,
  hashedPassword: string,
) {
  return await bcrypt.compare(candidatePassword, hashedPassword);
};

userSchema.methods.generateAccessToken = function (this: IUser) {
  if (!config.ACCESS_TOKEN_SECRET) {
    throw new AppError("Access token secret is not defined", 500);
  }

  return jwt.sign(
    {
      id: this._id.toString(),
      type: "access",
    },
    config.ACCESS_TOKEN_SECRET,
    {
      expiresIn: config.ACCESS_TOKEN_EXPIRY,
    },
  );
};

export const User = model<IUser>("User", userSchema);
