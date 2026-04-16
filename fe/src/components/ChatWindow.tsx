import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { Avatar, Flex, Input, Button } from "./Common";
import { useSocket } from "../context/socketProvider";

const ChatContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  height: calc(100vh - 80px);
`;

const ChatHeader = styled.div`
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border);
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
`;

const MessageList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const MessageBubble = styled.div<{ $isOwn: boolean }>`
  max-width: 60%;
  padding: 0.75rem 1rem;
  border-radius: 16px;
  font-size: 0.95rem;
  align-self: ${({ $isOwn }) => ($isOwn ? "flex-end" : "flex-start")};
  background: ${({ $isOwn }) =>
    $isOwn
      ? "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))"
      : "var(--bg-secondary)"};
  color: ${({ $isOwn }) => ($isOwn ? "white" : "var(--text-primary)")};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  animation: fadeIn 0.2s ease-out;
  border-bottom-right-radius: ${({ $isOwn }) => ($isOwn ? "4px" : "16px")};
  border-bottom-left-radius: ${({ $isOwn }) => ($isOwn ? "16px" : "4px")};
`;

const InputArea = styled.div`
  padding: 1.5rem;
  border-top: 1px solid var(--border);
`;

const StyledForm = styled.form`
  display: flex;
  gap: 0.75rem;
  background: var(--bg-secondary);
  padding: 0.5rem;
  border-radius: 16px;
  border: 1px solid var(--border);
`;

const EmptyState = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  text-align: center;
`;

const ChatWindow: React.FC = () => {
  const { activeConversation, messages } = useChatStore();
  const { user: currentUser } = useAuthStore();
  const [text, setText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { userStatus } = useSocket();
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      // await sendMessage(activeConversation._id, text);
      setText("");
    } catch (err) {
      console.error(err);
    }
  };

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
            {userStatus?.get(otherParticipant._id)?.isOnline ? (
              <span style={{ fontSize: "0.8rem", color: "var(--success)" }}>
                Online
              </span>
            ) : (
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                Offline &bull; {otherParticipant?.lastSeen}
              </span>
            )}
          </div>
        </Flex>
      </ChatHeader>

      <MessageList>
        {messages.map((msg) => (
          <MessageBubble
            key={msg._id}
            $isOwn={msg.senderId === currentUser?._id}
          >
            {msg.text}
          </MessageBubble>
        ))}
        <div ref={messagesEndRef} />
      </MessageList>

      <InputArea>
        <StyledForm onSubmit={handleSend}>
          <Input
            style={{ border: "none", background: "transparent" }}
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
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
