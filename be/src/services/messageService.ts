import { IConversation } from "@/database/interface/conversation";
import { IMessageType } from "@/database/interface/message";
import { Conversation, Message } from "@/database/models";
import { NotFoundError } from "@/utils";
import { UpdateQuery } from "mongoose";

export const createNewMessage = async (
  conversationId: string,
  message: Pick<
    IMessageType,
    "conversationId" | "text" | "images" | "files" | "replyTo"
  >,
  userId: string,
) => {
  const existedConversation = await Conversation.findById(conversationId);

  if (!existedConversation) {
    throw new NotFoundError("Conversation not found");
  }

  const { files, ...restMessages } = message;
  const filteredFiles = files
    ?.filter((x) => !!x.url)
    ?.map((x) => {
      return {
        url: x.url,
        name: x.name || "",
        size: x.size || 0,
        mimeType: x.mimeType || "",
      };
    });

  const receiverId = existedConversation.participants.find(
    (id) => id.toString() !== userId,
  );

  const newMessage = await Message.create({
    ...restMessages,
    files: filteredFiles,
    senderId: userId,
    receiverId,
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
    { new: true, lean: true },
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
    { new: true, lean: true },
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
      { new: true, lean: true },
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
