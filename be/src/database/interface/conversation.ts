import mongoose, { Document } from "mongoose";

export interface IConversationType {
  participants: mongoose.Types.ObjectId[];
  lastMessage: mongoose.Types.ObjectId;
  roomName?: string;
  unreadCounts?: Record<string, number>;
  lastCountSync?: Date;
}

export interface IConversation extends Document, IConversationType {}
