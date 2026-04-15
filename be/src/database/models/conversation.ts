import { model, Schema } from "mongoose";
import { IConversation } from "../interface/conversation";

const conversationSchema = new Schema<IConversation>({
  participants: [{ type: Schema.Types.ObjectId, ref: "User" }],
  lastMessage: { type: Schema.Types.ObjectId, ref: "Message" },
  roomName: { type: String },
});

export const Conversation = model<IConversation>(
  "Conversation",
  conversationSchema,
);
