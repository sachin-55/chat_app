import { IMessage, IMessageType } from "@/database/interface/message";
import { IUser } from "@/database/interface/user";
import { Conversation, User } from "@/database/models";
import { NotFoundError } from "@/utils";
import { UpdateQuery } from "mongoose";
import { Socket } from "socket.io";
import { createNewMessage, updateChatStatus } from "./messageService";
import { mainNamespace } from "@/socket";
import { IConversation } from "@/database/interface/conversation";
import webpush from "web-push";
import { config } from "@/config";

const OFFLINE_TIMEOUT_MS = 5 * 60 * 1000; // offline after 5 ,minutes of inactivity

const updateUserStatus = async (userId: string, socketId?: string) => {
  const updatePayload: UpdateQuery<IUser> = {
    isOnline: true,
    lastSeen: new Date(),
  };

  if (socketId) {
    updatePayload.socketId = socketId;
  } else {
    updatePayload.isOnline = false;
  }

  return User.findByIdAndUpdate(userId, updatePayload, {
    returnDocument: "after",
  });
};

export const updateUserOnlineStatus = async (
  socket: Socket,
  userId: string,
) => {
  try {
    const user = await User.findById(userId);

    if (user?.socketId) {
      const oldSocketId = user.socketId;
      const oldSocket = socket?.nsp?.sockets.get(oldSocketId);

      if (oldSocket) {
        oldSocket?.disconnect(true);
      }
    }

    const updatedUser = await updateUserStatus(userId, socket.id);

    if (!updatedUser) {
      throw new NotFoundError("User not found");
    }

    // Make user offline if user didn't ping within 5 minutes and update lastSeen
    let offlineTimer = setTimeout(() => {
      updateUserStatus(userId);
    }, OFFLINE_TIMEOUT_MS);

    // heartbeat to indicate user is online
    socket.on("heartbeat", async () => {
      try {
        await updateUserStatus(userId, socket.id);

        clearTimeout(offlineTimer);
        // Make user offline if user didn't ping within 5 minutes and update lastSeen
        offlineTimer = setTimeout(() => {
          void updateUserStatus(userId);
        }, OFFLINE_TIMEOUT_MS);
      } catch (error) {
        console.error("Error during heartbeat update:", error);
      }
    });

    socket.on("disconnect", async () => {
      await socket.leave(userId);
      void updateUserStatus(userId);
      clearTimeout(offlineTimer);
      for (const room of socket?.rooms ?? []) {
        await socket.leave(room);
      }
      console.log(`User ${userId} disconnected and left all rooms 🥺🥺🥺🥺`);
    });
  } catch (error) {
    console.error("Failed to update user online status :: ", error);

    socket.nsp.in(userId).emit("socket-error", {
      message: "Failed to update user online status",
      error: error,
    });
  }
};

export const checkIfHasJoinedRoom = (socket: Socket, room: string) => {
  const isConnectedToRoom = socket?.rooms?.has(room);
  return isConnectedToRoom;
};

export const getUserStatus = async (participantIds: string[]) => {
  const userStatus = await User.find({
    _id: { $in: participantIds },
  }).select("isOnline lastSeen _id");
  return userStatus;
};

export const handleGetUserOnlineStatus = async (
  socket: Socket,
  userId: string,
  data: any,
): Promise<void> => {
  const { participantIds } = data as {
    participantIds: string[];
  };

  if (
    participantIds &&
    Array.isArray(participantIds) &&
    participantIds.length > 0
  ) {
    try {
      const status = await getUserStatus(participantIds);

      socket.nsp.in(userId).emit("user-online-status", status);
    } catch (error) {
      console.error("Error fetching user status:", error);
      socket.nsp
        .in(userId)
        .emit("user-online-status", { error: "Error fetching status" });
    }
  } else {
    socket.nsp
      ?.in(userId)
      .emit("user-online-status", { message: "Please provide participants" });
  }
};

export const typingHandlers = (cSocket: Socket, userId: string) => {
  // Listen for typing events
  cSocket.on("start-typing", (room: string) => {
    const isConnectedToRoom = cSocket.rooms?.has(room);
    console.log({ isConnectedToRoom, room });

    if (isConnectedToRoom && room) {
      cSocket.nsp.in(room).emit("start-typing", {
        userId,
        conversationId: room,
      });
    }
  });

  cSocket.on("stop-typing", (room: string) => {
    const isConnectedToRoom = cSocket.rooms?.has(room);
    if (isConnectedToRoom && room) {
      cSocket.nsp.in(room).emit("stop-typing", {
        userId,
        conversationId: room,
      });
    }
  });
};

const checkRoomValidity = async ({
  cSocket,
  room,
  userId,
}: {
  cSocket?: Socket;
  room: string;
  userId: string;
}) => {
  const existedConversation = await Conversation.findById(room);

  if (!existedConversation) {
    cSocket?.emit("socket-error", {
      message: "Conversation room not available",
    });
    return false;
  }

  const isParticipant = existedConversation?.participantIds
    ?.map(String)
    ?.includes(userId);

  if (!isParticipant) {
    cSocket?.emit("socket-error", {
      message: "User is not a participant in the conversation.",
    });
    return false;
  }
  return true;
};

const handleJoinChatRoom = (cSocket: Socket, userId: string) => {
  cSocket.on("join-chat-room", async (room, ack) => {
    try {
      if (!room || typeof room !== "string") {
        cSocket.emit("socket-error", { message: "Room id not provided." });
        return;
      }

      const isConnectedToRoom = checkIfHasJoinedRoom(cSocket, room);

      if (isConnectedToRoom) {
        return;
      }

      const roomValidity = await checkRoomValidity({
        cSocket,
        room,
        userId,
      });

      if (!roomValidity) {
        return;
      }

      await cSocket.join(room);
      if (ack) {
        ack({ success: true });
      }
    } catch (error) {
      console.error("Error joining room:", error);
      if (ack) {
        ack({ success: false, message: "Failed to join room." });
      }
    }
  });
};
const updateConversationToOtherMember = (
  chat: IMessage,
  conversation: IConversation | null,
) => {
  const member = chat?.receiverId;

  if (member) {
    mainNamespace?.to(member.toString()).emit("update-conversation", {
      conversation: conversation,
      chat,
    });
  }
};

const handleNewMessage = (cSocket: Socket, userId: string) => {
  cSocket.on(
    "create-message",
    async (data: {
      message: Pick<IMessageType, "conversationId" | "text" | "replyTo">;
    }) => {
      const { message } = data;

      const room = message?.conversationId;

      if (!room || typeof room !== "string") {
        cSocket.emit("socket-error", { message: "Room id not provided." });
        return;
      }
      const isConnectedToRoom = cSocket.rooms?.has(room);

      if (!isConnectedToRoom && room) {
        cSocket.emit("socket-error", { message: "Not connected to room." });
        return;
      }

      try {
        const { message: newMessage, conversation } = await createNewMessage(
          room,
          message,
          userId,
        );

        cSocket.nsp
          .in(room)
          .emit("new-message", { message: newMessage, conversation });
        updateConversationToOtherMember(newMessage, conversation);

        // check if user is on the room or not if not then send Push Notifications
        const messageSenderSocketId = cSocket.id;

        // Get all sockets in the room
        const socketsInRoom = await cSocket.nsp.adapter.sockets(
          new Set([room]),
        );

        //  Filter out the sender's socket
        const otherParticipantsInRoom = Array.from(socketsInRoom).find(
          (socketId) => socketId !== messageSenderSocketId,
        );

        if (!otherParticipantsInRoom) {
          const user = await User.findById(newMessage.receiverId);
          const subscription = user?.pushSubscription;

          if (!subscription) return;

          const payload = JSON.stringify({
            title: "New Message",
            body: newMessage.text,
            url: `${config.FRONTEND_URL}/conversations?cid=${room}`,
          });

          try {
            await webpush.sendNotification(subscription, payload);
          } catch (err) {
            console.error("Push failed:", err);
          }
        }
      } catch (error: any) {
        if (error.message) {
          cSocket.emit("socket-error", { message: error.message });
          return;
        }
        cSocket.emit("socket-error", { message: "Failed to create message." });
      }
    },
  );
};

export const updateMessageStatus = (cSocket: Socket, userId: string) => {
  cSocket.on(
    "update-message-status",
    async (data: {
      conversationId: string;
      messageId: string;
      status: "DELIVERED" | "READ";
    }) => {
      try {
        if (!["DELIVERED", "READ"].includes(data.status)) {
          cSocket.emit("socket-error", {
            message: "Please provide valid message status.",
          });

          return;
        }
        const room = data?.conversationId;

        if (!room || typeof room !== "string") {
          cSocket.emit("socket-error", { message: "Room id not provided." });
          return;
        }

        const isConnectedToRoom = cSocket.rooms?.has(room);
        if (!isConnectedToRoom && room && data.status === "READ") {
          cSocket.emit("socket-error", {
            message: "Not connected. Please join again",
          });
          return;
        } else {
          const roomValidity = await checkRoomValidity({
            cSocket,
            room,
            userId,
          });
          if (!roomValidity) {
            return;
          }
        }

        const { message, conversation } = await updateChatStatus({
          messageId: data.messageId,
          status: data.status,
        });

        cSocket.nsp.in(room).emit("update-message-status", {
          message: {
            ...message,
            conversation: conversation,
          },
        });

        updateConversationToOtherMember(message, conversation);
      } catch (error) {
        console.error(error);
        cSocket.emit("error", {
          message: "Failed to update message status to delivered.",
        });
      }
    },
  );
};

export const chatHandlers = (cSocket: Socket, userId: string) => {
  handleJoinChatRoom(cSocket, userId);
  handleNewMessage(cSocket, userId);
  updateMessageStatus(cSocket, userId);
  cSocket.on("leave-chat-room", async (room: string) => {
    if (typeof room === "string" && !cSocket?.rooms?.has(room)) {
      cSocket.emit("socket-error", { message: `You are not part of ${room}` });
      return;
    }
    await cSocket.leave(room);
  });
};
