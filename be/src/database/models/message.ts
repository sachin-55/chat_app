import { model, Schema } from "mongoose";
import { CHAT_STATUS, IMessage } from "../interface/message";

const messageSchema = new Schema<IMessage>({
  conversationId: { type: Schema.Types.ObjectId, ref: "Conversation" },
  senderId: { type: Schema.Types.ObjectId, ref: "User" },
  text: { type: String },
  images: { type: [String] },
  files: {
    type: [
      {
        url: { type: String },
        name: { type: String },
        size: { type: Number },
        mimeType: { type: String },
      },
    ],
  },
  replyTo: { type: Schema.Types.ObjectId, ref: "Message" },
  status: { type: String, enum: CHAT_STATUS, default: CHAT_STATUS.SENT },
  sentAt: { type: Date },
  deliveredAt: { type: Date },
  readAt: { type: Date },
  pushNotificationSent: { type: Boolean },
});

export const Message = model<IMessage>("Message", messageSchema);
