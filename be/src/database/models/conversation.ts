import { model, Schema } from "mongoose";
import { IConversation } from "../interface/conversation";

const conversationSchema = new Schema<IConversation>(
  {
    participantIds: [{ type: Schema.Types.ObjectId, ref: "User" }],
    lastMessageId: { type: Schema.Types.ObjectId, ref: "Message" },
    roomName: { type: String },
    unreadCounts: { type: Map, of: Number, default: {} },
  },
  { timestamps: true },
);

export const Conversation = model<IConversation>(
  "Conversation",
  conversationSchema,
);
