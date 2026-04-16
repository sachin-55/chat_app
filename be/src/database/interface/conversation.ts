import mongoose, { Document } from "mongoose";

export interface IConversationType {
  participantIds: mongoose.Types.ObjectId[];
  lastMessageId: mongoose.Types.ObjectId;
  roomName?: string;
  unreadCounts?: Record<string, number>;
}

export interface IConversation extends Document, IConversationType {}
