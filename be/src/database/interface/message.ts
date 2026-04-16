import mongoose, { Document } from "mongoose";

export enum CHAT_STATUS {
  SENT = "SENT",
  DELIVERED = "DELIVERED",
  READ = "READ",
}

export interface IMessageType {
  conversationId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  text?: string;
  replyTo?: mongoose.Types.ObjectId;
  status?: CHAT_STATUS;
  sentAt?: Date | string;
  deliveredAt?: Date | string;
  readAt?: Date | string;
}

export interface IMessage extends Document, IMessageType {}
