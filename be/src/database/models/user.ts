import { model, Schema } from "mongoose";
import { IUser } from "../interface/user";

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  avatar: { type: String },
  password: { type: String, required: true, select: false },
  lastSeen: { type: Date },
  isOnline: { type: Boolean, default: false },
  socketId: { type: String, select: false },
});

export const User = model<IUser>("User", userSchema);
