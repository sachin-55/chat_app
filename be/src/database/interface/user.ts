import { Document } from "mongoose";

export interface IUserType {
  name: string;
  email: string;
  avatar?: string;
  password: string;
}

export interface IUser extends Document, IUserType {}
