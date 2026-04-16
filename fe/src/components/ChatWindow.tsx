import dayjs from "dayjs";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSocket } from "../context/socketProvider";
import { useIntersectionObserver } from "../hooks/useIntersectionObserver";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import type { Conversation, Message } from "../types";
import { debounce } from "../utils/debounce";
import { throttle } from "../utils/throttle";
import {
  ChatContainer,
  ChatHeader,
  EmptyState,
  InputArea,
  MessageList,
  MessageBubble,
  StyledForm,
} from "./ChatWindow.styles";
import { Avatar, Button, Flex, Input } from "./Common";
import IndividualMessage from "./IndividualMessage";

const ChatWindow: React.FC = () => {
  const {
    activeConversation,
    activeConversationId,
    messages,
    addMessage,
    updateMessage,
    updateConversation,
    fetchMessages,
    messagePagination,
    isLoading,
  } = useChatStore();
  const { user: currentUser } = useAuthStore();
  const [text, setText] = useState("");
  const [otherUserTyping, setOtherUserTyping] = useState(false);

  const { userStatus, mainSocket, isSocketConnected } = useSocket();
  const messageListRef = useRef<HTMLDivElement>(null);
  const { isIntersecting, targetRef } = useIntersectionObserver<HTMLDivElement>(
    {
      enabled: messagePagination?.hasMore && !isLoading?.messages,
      options: { rootMargin: "20px", threshold: 0.2 },
    },
  );

  useEffect(() => {
    if (!activeConversationId) return;
    const abortController = new AbortController();
    fetchMessages(
      activeConversationId,
      { cursor: null, limit: 10 },
      abortController.signal,
    );
    return () => {
      abortController.abort();
    };
  }, [activeConversationId, fetchMessages]);

  useEffect(() => {
    if (!isIntersecting) return;
    fetchMessages(activeConversationId, {
      cursor: messagePagination?.nextCursor,
      limit: 10,
    });
  }, [isIntersecting, activeConversationId, fetchMessages]);

  const emitStartTyping = useMemo(
    () =>
      throttle(
        () => mainSocket?.emit("start-typing", activeConversationId),
        2000,
      ),
    [mainSocket, activeConversationId],
  );

  const emitStopTyping = useMemo(
    () =>
      debounce(
        () => mainSocket?.emit("stop-typing", activeConversationId),
        1000,
      ),
    [mainSocket, activeConversationId],
  );

  useEffect(() => {
    return () => {
      emitStartTyping.cancel();
      emitStopTyping.cancel();
    };
  }, [emitStartTyping, emitStopTyping]);

  const updateChatStatus = useCallback(
    async (data: {
      conversationId: string;
      messageId: string;
      status: "DELIVERED" | "READ";
    }) => {
      mainSocket?.emit("update-message-status", data);
    },
    [mainSocket],
  );

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    emitStartTyping();
    emitStopTyping();
  };

  const handleNewMessage = useCallback(
    (data: { conversation: Conversation; message: Message }) => {
      addMessage(data.message);
      if (data.message.senderId !== currentUser?._id) {
        updateChatStatus({
          conversationId: data.conversation._id,
          messageId: data.message._id,
          status: "DELIVERED",
        });
      }
      updateConversation({
        ...data.conversation,
        lastMessageId: data.message._id,
        lastMessage: data.message,
      });
    },
    [addMessage, updateConversation, updateChatStatus, currentUser],
  );

  const handleUpdateMessageStatus = useCallback(
    (data: {
      message: Message & {
        conversation: Conversation;
      };
    }) => {
      const { message } = data;

      if (message.senderId !== currentUser?._id) return;
      updateMessage(message);
    },
    [updateMessage, currentUser],
  );

  useEffect(() => {
    if (!isSocketConnected || !activeConversationId) return;

    mainSocket?.emit(
      "join-chat-room",
      activeConversationId,
      (success, message) => {
        console.log("joined chat room", { success, message });
      },
    );

    const handleStartTyping = (data: {
      userId: string;
      conversationId: string;
    }) => {
      if (data.userId !== currentUser?._id) {
        setOtherUserTyping(true);
      }
    };

    const handleStopTyping = (data: {
      userId: string;
      conversationId: string;
    }) => {
      if (data.userId !== currentUser?._id) {
        setOtherUserTyping(false);
      }
    };
    const handleError = (error) => {
      console.info("Socket error:", error);
    };
    mainSocket?.on("start-typing", handleStartTyping);
    mainSocket?.on("stop-typing", handleStopTyping);
    mainSocket.on("new-message", handleNewMessage);
    mainSocket.on("update-message-status", handleUpdateMessageStatus);
    mainSocket.on("socket-error", handleError);

    return () => {
      mainSocket?.emit("leave-chat-room", activeConversationId);
      mainSocket?.off("start-typing", handleStartTyping);
      mainSocket?.off("stop-typing", handleStopTyping);
      mainSocket?.off("new-message", handleNewMessage);
      mainSocket?.off("update-message-status", handleUpdateMessageStatus);
      mainSocket?.off("socket-error", handleError);
    };
  }, [activeConversationId, isSocketConnected, currentUser?._id]);

  if (!activeConversation) {
    return (
      <EmptyState>
        <Avatar $size="80px" style={{ marginBottom: "1.5rem", opacity: 0.5 }}>
          ?
        </Avatar>
        <h2>Select a conversation to start chatting</h2>
        <p>Your premium chat experience awaits</p>
      </EmptyState>
    );
  }

  const otherParticipant =
    activeConversation &&
    (activeConversation?.participants?.find(
      (p) => p._id !== currentUser?._id,
    ) ||
      activeConversation?.participants?.[0]);

  const sendMessage = async (conversationId: string, text: string) => {
    mainSocket?.emit("create-message", {
      message: { conversationId, text },
    });
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      await sendMessage(activeConversation._id, text);
      setText("");
      if (messageListRef.current) {
        setTimeout(() => {
          messageListRef.current.scrollTo({
            top: 0,
            behavior: "smooth",
          });
        }, 500);
      }
    } catch (err) {
      console.error(err);
    }
  };
  const userOnlineStatus = userStatus?.get(otherParticipant._id);
  const reversedMessages = [...messages].reverse();
  return (
    <ChatContainer>
      <ChatHeader>
        <Flex $align="center" $gap="1rem">
          <Avatar $size="40px">
            {otherParticipant.avatar ? (
              <img src={otherParticipant.avatar} alt={otherParticipant.name} />
            ) : (
              otherParticipant.name[0].toUpperCase()
            )}
          </Avatar>
          <div>
            <h4 style={{ margin: 0 }}>{otherParticipant.name}</h4>
            {userOnlineStatus?.isOnline ? (
              <span style={{ fontSize: "0.8rem", color: "var(--success)" }}>
                Online
              </span>
            ) : (
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                Offline &bull; Last seen{" "}
                {dayjs(userOnlineStatus?.lastSeen).format("YYYY-MM-DD HH:mm")}
              </span>
            )}
          </div>
        </Flex>
      </ChatHeader>

      <MessageList ref={messageListRef}>
        {otherUserTyping && (
          <MessageBubble $isOwn={false}>Typing...</MessageBubble>
        )}
        {isLoading?.messages && (
          <MessageBubble $isOwn={false}>Loading...</MessageBubble>
        )}
        {reversedMessages.map((msg, i) => {
          const isOwn = msg.senderId === currentUser?._id;

          const currentDate = dayjs(msg.sentAt);
          const prevDate =
            i < reversedMessages.length - 1
              ? dayjs(reversedMessages[i + 1].sentAt)
              : null;
          const isNewDay = !prevDate || !currentDate.isSame(prevDate, "day");

          return (
            <IndividualMessage
              key={msg._id}
              message={msg}
              isOwn={isOwn}
              isNewDay={isNewDay}
              markAsRead={() => {
                if (msg.readAt) return;
                console.log("marking as read");

                updateChatStatus({
                  conversationId: activeConversationId,
                  messageId: msg._id,
                  status: "READ",
                });
              }}
            />
          );
        })}
        <div ref={targetRef} />
      </MessageList>

      <InputArea>
        <StyledForm onSubmit={handleSend}>
          <Input
            style={{ border: "none", background: "transparent" }}
            placeholder="Type a message..."
            value={text}
            onChange={handleTyping}
          />
          <Button type="submit" style={{ padding: "0.5rem 1.25rem" }}>
            Send
          </Button>
        </StyledForm>
      </InputArea>
    </ChatContainer>
  );
};

export default ChatWindow;
