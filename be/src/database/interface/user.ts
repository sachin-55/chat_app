import { Document } from "mongoose";

export interface IUserType {
  name: string;
  email: string;
  avatar?: string;
  password: string;
  lastSeen?: string;
  isOnline: boolean;
  socketId?: string;

  generateAccessToken: () => string;
  validatePassword: (
    password: string,
    hashedPassword: string,
  ) => Promise<boolean>;
}

export interface IUser extends Document, IUserType {}
