import { IConversation } from "@/database/interface/conversation";
import { IMessageType } from "@/database/interface/message";
import { Conversation, Message } from "@/database/models";
import { NotFoundError } from "@/utils";
import { UpdateQuery } from "mongoose";

export const createNewMessage = async (
  conversationId: string,
  message: Pick<IMessageType, "conversationId" | "text" | "replyTo">,
  userId: string,
) => {
  const existedConversation = await Conversation.findById(conversationId);

  if (!existedConversation) {
    throw new NotFoundError("Conversation not found");
  }

  const receiverId = existedConversation.participantIds.find(
    (id) => id.toString() !== userId,
  );

  const newMessage = await Message.create({
    ...message,
    senderId: userId,
    receiverId,
    sentAt: Date.now(),
    status: "SENT",
  });

  const incFields = {
    [`unreadCounts.${receiverId}`]: 1,
  };
  const updatedConversation = await Conversation.findByIdAndUpdate(
    conversationId,
    {
      $set: { lastMessageId: newMessage._id },
      $inc: incFields,
    },
    { returnDocument: "after", lean: true },
  );

  return { message: newMessage, conversation: updatedConversation };
};

export const updateChatStatus = async ({
  messageId,
  status,
}: {
  messageId: string;
  status: "DELIVERED" | "READ";
}) => {
  const now = Date.now();
  const update: UpdateQuery<IMessageType> = {};
  if (["DELIVERED", "READ"].includes(status)) {
    update.deliveredAt = now;
  }

  if (status === "READ") {
    update.readAt = now;
  }
  update.status = status;
  const chat = await Message.findByIdAndUpdate(
    messageId,
    { $set: update },
    { returnDocument: "after", lean: true },
  )
    .populate("conversationId")
    .lean();
  if (!chat) {
    throw new Error("Chat not found");
  }
  const receiverId = chat.receiverId?.toString();
  let conversation = chat.conversationId as unknown as IConversation;

  if (status === "READ") {
    const updatedConversation = await Conversation.findOneAndUpdate(
      {
        _id: chat.conversationId,
        [`unreadCounts.${receiverId}`]: { $gt: 0 },
      },
      {
        $inc: { [`unreadCounts.${receiverId}`]: -1 },
      },
      { returnDocument: "after", lean: true },
    );

    if (updatedConversation) {
      conversation = updatedConversation;
    }
  }

  return {
    message: chat,
    conversation,
  };
};
