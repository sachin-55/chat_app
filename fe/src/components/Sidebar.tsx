import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { useChatStore } from "../store/useChatStore";
import { Avatar, Flex, Input } from "./Common";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/socketProvider";
import type { Message } from "../types";
import { debounce } from "../utils/debounce";
import { useIntersectionObserver } from "../hooks/useIntersectionObserver";

const SidebarContainer = styled.div`
  width: 350px;
  height: 100vh;
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
`;

const SearchWrapper = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid var(--border);
`;

const ListWrapper = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
  padding-bottom: 100px;
`;

const ItemCard = styled.div<{ $active?: boolean }>`
  padding: 0.75rem 1rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: ${({ $active }) =>
    $active ? "rgba(56, 189, 248, 0.1)" : "transparent"};
  border: 1px solid
    ${({ $active }) => ($active ? "var(--accent-primary)" : "transparent")};

  &:hover {
    background-color: var(--bg-secondary);
  }
`;

const UserName = styled.p`
  font-weight: 600;
  font-size: 0.95rem;
`;

const LastMsg = styled.p<{ $isRead?: boolean }>`
  font-size: ${({ $isRead }) => ($isRead ? "0.8rem" : "0.9rem")};
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: ${({ $isRead }) => ($isRead ? "normal" : "bold")};
`;

const Status = styled.div<{ $online?: boolean }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${({ $online }) =>
    $online ? "var(--success)" : "var(--text-muted)"};
  border: 2px solid var(--bg-primary);
  position: absolute;
  bottom: 0;
  right: 0;
`;

const AvatarWrapper = styled.div`
  position: relative;
`;

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const {
    conversations,
    activeConversationId,
    fetchConversations,
    isLoading,
    conversationPagination,
  } = useChatStore();
  const { user } = useAuthStore();
  const { userStatus } = useSocket();

  const { isIntersecting, targetRef } = useIntersectionObserver<HTMLDivElement>(
    {
      enabled: conversationPagination.hasMore && !isLoading.conversation,
      options: { rootMargin: "20px", threshold: 0.5 },
    },
  );

  useEffect(() => {
    const abortController = new AbortController();
    fetchConversations({ limit: 10, page: 1 }, abortController.signal);
    return () => {
      abortController.abort();
    };
  }, []);

  useEffect(() => {
    if (
      isIntersecting &&
      conversationPagination?.hasMore &&
      !isLoading.conversation
    ) {
      fetchConversations({ limit: 10, page: conversationPagination.page + 1 });
    }
  }, [isIntersecting]);

  const delayedFetchConversations = useMemo(
    () =>
      debounce((query: string) => {
        fetchConversations({ limit: 20, page: 1, search: query });
      }, 500),
    [fetchConversations],
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearch(query);
    delayedFetchConversations(query);
  };
  const getStatusIcon = (message: Message) => {
    if (message?.senderId !== user._id) return null;
    switch (message.status) {
      case "SENT":
        return "✓";
      case "DELIVERED":
        return "✓✓";
      case "READ":
        return "✓✓✓";
      default:
        return "✓";
    }
  };

  return (
    <SidebarContainer>
      <SearchWrapper>
        <Input
          placeholder="Search users..."
          value={search}
          onChange={handleSearch}
        />
      </SearchWrapper>

      <ListWrapper>
        {isLoading?.conversation && (
          <p style={{ textAlign: "center", padding: "1rem" }}>Loading...</p>
        )}

        {conversations?.length === 0 ? (
          <p style={{ textAlign: "center", padding: "1rem" }}>
            No conversations found
          </p>
        ) : (
          conversations.map((conversation) => {
            const receiverUser = conversation?.participants?.find(
              (p) => p._id !== user?._id,
            );
            const myUnreadCounts = conversation?.unreadCounts?.[user?._id];
            return (
              <ItemCard
                key={conversation._id}
                onClick={() => {
                  // Create or set conversation logic here
                  // For simplicity, find if a conversation already exists
                  navigate(`/conversations?cid=${conversation._id}`);
                }}
                $active={activeConversationId === conversation._id}
              >
                <Flex $gap="0.75rem" $align="center">
                  <AvatarWrapper>
                    <Avatar $size="45px">
                      {receiverUser.avatar ? (
                        <img
                          src={receiverUser.avatar}
                          alt={receiverUser.name}
                        />
                      ) : (
                        receiverUser.name[0].toUpperCase()
                      )}
                    </Avatar>
                    <Status
                      $online={userStatus?.get(receiverUser?._id)?.isOnline}
                    />
                  </AvatarWrapper>
                  <div style={{ flex: 1, maxWidth: "70%" }}>
                    <UserName>{receiverUser?.name}</UserName>
                    <LastMsg
                      $isRead={
                        conversation?.lastMessage?.senderId === user?._id
                          ? true
                          : conversation?.lastMessage?.status === "READ"
                      }
                    >
                      {conversation.lastMessage?.text}
                    </LastMsg>
                    <span style={{ marginRight: "4px" }}>
                      {getStatusIcon(conversation.lastMessage)}
                    </span>
                  </div>
                  {myUnreadCounts > 0 && (
                    <Flex
                      $align="center"
                      $justify="center"
                      style={{
                        backgroundColor: "var(--error)",
                        color: "var(--text-primary)",
                        borderRadius: "50%",
                        flexShrink: 0,
                        fontSize: "0.75rem",
                        height: "30px",
                        width: "30px",
                      }}
                    >
                      {myUnreadCounts}
                    </Flex>
                  )}
                </Flex>
              </ItemCard>
            );
          })
        )}
        <div ref={targetRef} />
      </ListWrapper>
    </SidebarContainer>
  );
};

export default Sidebar;
