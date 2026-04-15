import mongoose, { Document } from "mongoose";

export interface IConversationType {
  participants: mongoose.Types.ObjectId[];
  lastMessage: mongoose.Types.ObjectId;
  roomName?: string;
}

export interface IConversation extends Document, IConversationType {}
