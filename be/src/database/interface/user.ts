import { Document } from "mongoose";

export interface IUserType {
  name: string;
  email: string;
  avatar?: string;
  password: string;
  lastSeen?: string;
  isOnline: boolean;
  socketId?: string;
}

export interface IUser extends Document, IUserType {}
