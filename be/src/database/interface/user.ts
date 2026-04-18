import { Document } from "mongoose";

export interface IPushSubscription {
  endpoint: string;
  expirationTime: DOMHighResTimeStamp | null;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface IUserType {
  name: string;
  email: string;
  avatar?: string;
  password: string;
  lastSeen?: string;
  isOnline: boolean;
  socketId?: string;
  pushSubscription?: IPushSubscription;

  generateAccessToken: () => string;
  validatePassword: (
    password: string,
    hashedPassword: string,
  ) => Promise<boolean>;
}

export interface IUser extends Document, IUserType {}
