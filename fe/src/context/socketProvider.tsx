import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import type { Conversation, Message } from "../types";

interface ParticipantStatus {
  isOnline: boolean;
  lastSeen: string;
  _id: string;
}

interface SocketContextType {
  mainSocket: Socket | null;
  userStatus: Map<string, ParticipantStatus>;
  unreadMessageCount: number;

  isSocketConnected: boolean;
  refreshSocketConnection: VoidFunction;
}

const SocketContext = createContext<SocketContextType | null>(null);
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  const [userStatus, setUserStatus] = useState<Map<
    string,
    { isOnline: boolean; lastSeen: string; _id: string }
  > | null>(null);
  const [isSocketConnected, setIsSocketConnected] = useState<boolean>(false);
  const [activeParticipants, setActiveParticipants] = useState<string[]>([]);
  const { conversations, updateConversation, activeConversationId } =
    useChatStore();

  const socketRef = useRef<Socket | null>(null);
  const eventQueue = useRef<{ event: string; data: unknown }[]>([]);

  // Emit event with queue support
  const emitEvent = useCallback((event: string, data: unknown) => {
    if (!socketRef.current?.connected) {
      eventQueue.current.push({ event, data });
      return;
    }
    socketRef.current.emit(event, data);
  }, []);

  const connect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current.off();
    }
    const transports = ["websocket", "polling"];

    socketRef.current = io(`${API_URL}`, {
      transports: transports,
      reconnection: true,
      reconnectionAttempts: 20,
      reconnectionDelay: 3000,
      timeout: 10000,
      withCredentials: true,
    });

    socketRef.current.on("connect", () => {
      console.info(`Socket connected: 😁💃🕺😎`);

      setIsSocketConnected(true);

      // Emit queued events
      eventQueue.current.forEach(({ event, data }) => {
        socketRef.current?.emit(event, data);
      });
      eventQueue.current = [];
    });
    socketRef.current.on("disconnect", () => {
      setIsSocketConnected(false);
    });
    const socket = socketRef?.current;

    socket.on("socket-error", (error) => {
      console.error(`Socket error ❌ : `, error);
    });

    return socketRef.current;
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      connect();
    }
    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
      eventQueue.current = [];
    };
  }, [connect, isAuthenticated]);

  useEffect(() => {
    if (!socketRef.current || !isAuthenticated) return;
    socketRef?.current?.emit("get-user-online-status", {
      participantIds: activeParticipants,
    });
  }, [activeParticipants, isAuthenticated]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !isAuthenticated) return;

    const handleUserStatus = (status: ParticipantStatus[]) => {
      if (Array.isArray(status)) {
        setUserStatus(new Map(status.map((s) => [s._id, s])));
      }
    };

    socket.off("user-online-status").on("user-online-status", handleUserStatus);

    return () => {
      socket.off("user-online-status", handleUserStatus);
    };
  }, [isAuthenticated]);

  const sortParticipantIds = (participantIds: string[]) => {
    return participantIds.sort((a, b) => a.localeCompare(b));
  };

  const checkParticipantsStatus = useCallback(
    (participantIds: string[]) => {
      setActiveParticipants((prev) => {
        if (
          JSON.stringify(sortParticipantIds(prev)) !==
          JSON.stringify(sortParticipantIds(participantIds))
        ) {
          return [...participantIds];
        }
        return prev;
      });

      emitEvent("get-user-online-status", {
        participantIds,
      });
    },
    [emitEvent],
  );

  // useEffect(() => {
  //   if (!socketRef.current || !isAuthenticated) return;

  //   const participantIds = activeParticipants?.length
  //     ? activeParticipants
  //     : Array.from(
  //         new Set(
  //           conversations.flatMap((conversation) => {
  //             return conversation.participantIds;
  //           }),
  //         ),
  //       );
  //   const interval = setInterval(() => {
  //     checkParticipantsStatus(participantIds);
  //   }, 5000); // every 5s

  //   return () => clearInterval(interval);
  // }, [
  //   activeParticipants,
  //   checkParticipantsStatus,
  //   isAuthenticated,
  //   conversations,
  // ]);

  // // Function to handle heartbeat
  // useEffect(() => {
  //   const socket = socketRef.current;
  //   if (!socket || !isAuthenticated) return;

  //   const interval = setInterval(() => {
  //     if (socket.connected) {
  //       socket.emit("heartbeat");
  //     }
  //   }, 15000);

  //   return () => clearInterval(interval);
  // }, [isAuthenticated]);

  const updateChatStatus = useCallback(
    async (data: {
      conversationId: string;
      messageId: string;
      status: "DELIVERED" | "READ";
    }) => {
      socketRef?.current?.emit("update-message-status", data);
    },
    [],
  );
  useEffect(() => {
    if (!isSocketConnected) return;
    const handleUpdateConversation = (data: {
      conversation: Conversation;
      chat: Message;
    }) => {
      if (data.conversation._id !== activeConversationId) {
        updateConversation({
          ...data.conversation,
          lastMessageId: data.chat._id,
          lastMessage: data.chat,
        });
        if (data?.chat?.status === "SENT") {
          updateChatStatus({
            conversationId: data.conversation._id,
            messageId: data.chat._id,
            status: "DELIVERED",
          });
        }
      }
    };
    socketRef?.current?.on("update-conversation", handleUpdateConversation);
    return () => {
      socketRef?.current?.off("update-conversation", handleUpdateConversation);
    };
  }, [updateConversation, isSocketConnected]);

  return (
    <SocketContext.Provider
      // eslint-disable-next-line react-hooks/refs
      value={{
        // eslint-disable-next-line react-hooks/refs
        mainSocket: socketRef?.current,
        userStatus,
        unreadMessageCount: 0,
        isSocketConnected,
        refreshSocketConnection: connect,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
