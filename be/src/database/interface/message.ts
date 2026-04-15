import mongoose, { Document } from "mongoose";
import { IUser } from "./user";

export enum CHAT_STATUS {
  SENT = "SENT",
  DELIVERED = "DELIVERED",
  READ = "READ",
}

export interface IMessageType {
  conversationId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  text?: string;
  images?: string[];
  files?: {
    url: string;
    name?: string;
    size?: number;
    mimeType?: string;
  }[];
  replyTo?: mongoose.Types.ObjectId;
  status?: CHAT_STATUS;
  sentAt?: Date | string;
  deliveredAt?: Date | string;
  readAt?: Date | string;
  pushNotificationSent?: boolean;
  senderDetails?: Pick<IUser, "_id" | "name" | "avatar" | "email">;
}

export interface IMessage extends Document, IMessageType {}
